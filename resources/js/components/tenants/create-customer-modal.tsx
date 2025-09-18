import { Customer, CustomerResponse, DocumentType } from '@/common/interfaces/tenant/customers.interface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Api from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ApiError, ApiResponse, DocumentValidationData, DniValidationData, RucValidationData } from '@/common/interfaces/tenant/document-validation.interface';
import axios from 'axios';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '../ui/select';


interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer;
    documentTypes: DocumentType[];
    onSuccess?: (customer: Customer) => void;
}

export default function CustomerModal({ isOpen, onClose, customer, documentTypes, onSuccess }: CustomerModalProps) {
    const isEditMode = !!customer;
    const [processing, setProcessing] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const [formData, setFormData] = useState({
        business_name: '',
        trade_name: '',
        identification_type: '04',
        identification: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        province: '',
        department: '',
        ubigeo: '',
        special_taxpayer: false,
        accounting_required: false,
        credit_limit: 0,
        active: true,
    });

    // Cargar datos si es edición
    useEffect(() => {
        if (customer) {
            setFormData({
                business_name: customer.business_name || '',
                trade_name: customer.trade_name || '',
                identification_type: customer.identification_type || '04',
                identification: customer.identification || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
                district: customer.district || '',
                province: customer.province || '',
                department: customer.department || '',
                ubigeo: customer.ubigeo || '',
                special_taxpayer: customer.special_taxpayer || false,
                accounting_required: customer.accounting_required || false,
                credit_limit: customer.credit_limit || 0,
                active: customer.active !== undefined ? customer.active : true,
            });
        } else {
            setFormData(prev => ({ ...prev, identification_type: '04' }));
        }
    }, [customer, isOpen]);

    // Type guards para validación de documento
    const isDniValidation = (data: DocumentValidationData): data is DniValidationData => 'dni' in data;
    const isRucValidation = (data: DocumentValidationData): data is RucValidationData => 'ruc' in data;

    const parseAddress = (addressString) => {
        if (!addressString) {
            return {
                province: '',
                department: '',
                district: ''
            };
        }

        // Dividir por "/" y limpiar espacios
        const parts = addressString.split('/').map(part => part.trim()).filter(part => part.length > 0);

        // Función para limpiar texto (capitalizar correctamente)
        const cleanText = (text) => {
            if (!text) return '';
            return text.toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        // Función para limpiar nombres entre paréntesis
        const removeParentheses = (text) => {
            return text.replace(/\([^)]*\)/g, '').trim();
        };

        return {
            province: parts[0] ? cleanText(parts[0]) : '',
            department: parts[1] ? cleanText(parts[1]) : '',
            district: parts[2] ? cleanText(removeParentheses(parts[2])) : ''
        };
    };

    // Validar documento
    const validateDocument = useCallback(async () => {
        const { identification, identification_type } = formData;

        if (!identification || isEditMode) return;

        // Validar longitud
        if (identification_type === '05' && identification.length !== 10) return; // Cédula
        if (identification_type === '04' && identification.length !== 13) return; // RUC

        setValidating(true);
        // Limpiar error de identificación
        setValidationErrors(prev => {
            const { identification, ...rest } = prev;
            return rest;
        });

        try {
            if (identification_type === '04') {
                // Validar RUC contra SRI
                const response = await axios.get(`/v1/sris/${identification}`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
                });

                const result = response.data;
                if (result.success && result.data) {
                    const addressData = parseAddress(result.data?.address ?? result.data?.head_office_address);
                    setFormData(prev => ({
                        ...prev,
                        identification,
                        business_name: result.data.business_name ?? '',
                        trade_name: result.data.tradeName ?? result.data.business_name ?? '',
                        address: result.data.address ?? result.data.head_office_address ?? '',
                        district: addressData.district,
                        province: addressData.province,
                        department: addressData.department,
                        ubigeo: result.data.ubigeo ?? '',
                    }));
                    toast.success('RUC validado correctamente');
                } else {
                    setValidationErrors(prev => ({
                        ...prev,
                        identification: result.error || 'RUC no válido',
                    }));
                }
            } else {
                // Validar Cédula o Pasaporte
                const response = await Api.post<ApiResponse<DocumentValidationData>>('/v1/documents/validate', {
                    document_type: identification_type,
                    document_number: identification,
                });

                const data = response.data;
                if (data.success) {
                    if (isDniValidation(data)) {
                        const fullName = `${data.firstName || ''} ${data.lastName || ''} ${data.motherLastName || ''}`.trim();
                        setFormData(prev => ({ ...prev, business_name: fullName }));
                    }
                    toast.success('Documento validado correctamente');
                } else {
                    setValidationErrors(prev => ({
                        ...prev,
                        identification: 'No se pudo validar el documento',
                    }));
                }
            }
        } catch (error) {
            console.error('Error validando documento:', error);
            let message = 'Error al validar el documento';
            if (axios.isAxiosError(error)) message = error.response?.data?.message || message;
            setValidationErrors(prev => ({
                ...prev,
                identification: message,
            }));
        } finally {
            setValidating(false);
        }
    }, [formData.identification, formData.identification_type, isEditMode]);


    useEffect(() => {
        if ((formData.identification_type === '05' && formData.identification.length === 10) ||
            (formData.identification_type === '04' && formData.identification.length === 13)) {
            validateDocument();
        }
    }, [formData.identification, formData.identification_type, validateDocument]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setValidationErrors({});

        try {
            let response;
            if (isEditMode && customer) {
                response = await Api.put<ApiResponse<CustomerResponse>>(`/v1/customer/${customer.id}`, formData);
            } else {
                response = await Api.post<ApiResponse<CustomerResponse>>('/v1/customer', formData);
            }

            if (response.data.success) {
                toast.success(response.data.message);
                if (onSuccess) onSuccess(response.data.data);
                handleClose();
            }
        } catch (error) {
            const apiError = error as ApiError;
            if (apiError.response?.data?.errors) {
                const errors: { [key: string]: string } = {};
                Object.entries(apiError.response.data.errors).forEach(([key, value]) => {
                    errors[key] = Array.isArray(value) ? value[0] : value;
                });
                setValidationErrors(errors);
                toast.error(Object.values(errors)[0] || 'Error en formulario');
            } else {
                toast.error(apiError.response?.data?.message || 'Error al procesar solicitud');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setFormData({
            business_name: '',
            trade_name: '',
            identification_type: '04',
            identification: '',
            email: '',
            phone: '',
            address: '',
            district: '',
            province: '',
            department: '',
            ubigeo: '',
            special_taxpayer: false,
            accounting_required: false,
            credit_limit: 0,
            active: true,
        });
        setValidationErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Actualiza los datos del cliente.' : 'Completa la información para registrar un nuevo cliente.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 min-h-96 overflow-y-auto">

                    {/* Identificación */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2 col-span-1">
                            <Label htmlFor="identification_type">Tipo de Identificación <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.identification_type}
                                onValueChange={(value: string) =>
                                    setFormData({
                                        ...formData,
                                        identification_type: value as "04" | "05" | "06" | "07",
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un tipo de identificación" />
                                </SelectTrigger>
                                <SelectContent>
                                    {documentTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {validationErrors.identification_type && <p className="text-sm text-red-500">{validationErrors.identification_type}</p>}
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="identification">Número de Identificación</Label>
                            <div className="relative">
                                <Input
                                    id="identification"
                                    value={formData.identification}
                                    onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                                    placeholder="Número de identificación"
                                    className={`${validationErrors.identification ? 'border-red-500' : ''} ${validating ? 'pr-10' : ''}`}
                                    disabled={isEditMode}
                                />
                                {validating && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                            {validationErrors.identification && <p className="text-sm text-red-500">{validationErrors.identification}</p>}
                        </div>
                    </div>
                    {/* Información básica */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="business_name">Razón Social <span className="text-red-500">*</span></Label>
                            <Input
                                id="business_name"
                                value={formData.business_name}
                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                placeholder="Razón social del cliente"
                                className={validationErrors.business_name ? 'border-red-500' : ''}
                            />
                            {validationErrors.business_name && <p className="text-sm text-red-500">{validationErrors.business_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="trade_name">Nombres</Label>
                            <Input
                                id="trade_name"
                                value={formData.trade_name}
                                onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                                placeholder="Nombre Completo"
                                className={validationErrors.trade_name ? 'border-red-500' : ''}
                            />
                            {validationErrors.trade_name && <p className="text-sm text-red-500">{validationErrors.trade_name}</p>}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="correo@ejemplo.com"
                                className={validationErrors.email ? 'border-red-500' : ''}
                            />
                            {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Número de teléfono"
                                className={validationErrors.phone ? 'border-red-500' : ''}
                            />
                            {validationErrors.phone && <p className="text-sm text-red-500">{validationErrors.phone}</p>}
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Dirección completa"
                            className={validationErrors.address ? 'border-red-500' : ''}
                        />
                        {validationErrors.address && <p className="text-sm text-red-500">{validationErrors.address}</p>}
                    </div>

                    {/* Ubicación */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="district">Distrito</Label>
                            <Input
                                id="district"
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                placeholder="Distrito"
                                className={validationErrors.district ? 'border-red-500' : ''}
                            />
                            {validationErrors.district && <p className="text-sm text-red-500">{validationErrors.district}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="province">Provincia</Label>
                            <Input
                                id="province"
                                value={formData.province}
                                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                placeholder="Provincia"
                                className={validationErrors.province ? 'border-red-500' : ''}
                            />
                            {validationErrors.province && <p className="text-sm text-red-500">{validationErrors.province}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Departamento</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                placeholder="Departamento"
                                className={validationErrors.department ? 'border-red-500' : ''}
                            />
                            {validationErrors.department && <p className="text-sm text-red-500">{validationErrors.department}</p>}
                        </div>
                    </div>

                    {/* Otros campos */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="special_taxpayer"
                                checked={formData.special_taxpayer}
                                onCheckedChange={(checked) => setFormData({ ...formData, special_taxpayer: !!checked })}
                            />
                            <Label htmlFor="special_taxpayer">Contribuyente Especial</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="accounting_required"
                                checked={formData.accounting_required}
                                onCheckedChange={(checked) => setFormData({ ...formData, accounting_required: !!checked })}
                            />
                            <Label htmlFor="accounting_required">Contabilidad Obligatoria</Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="credit_limit">Límite de Crédito</Label>
                        <Input
                            id="credit_limit"
                            type="number"
                            value={formData.credit_limit}
                            onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                            className={validationErrors.credit_limit ? 'border-red-500' : ''}
                        />
                        {validationErrors.credit_limit && <p className="text-sm text-red-500">{validationErrors.credit_limit}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="active"
                            checked={formData.active}
                            onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                        />
                        <Label htmlFor="active">Activo</Label>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || validating}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isEditMode ? 'Actualizar Cliente' : 'Crear Cliente'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

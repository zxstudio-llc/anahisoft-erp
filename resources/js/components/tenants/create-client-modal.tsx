import { Client, ClientResponse } from '@/common/interfaces/tenant/clients.interface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Api from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ApiError, ApiResponse, ClientFormData, DocumentValidationData, DniValidationData, RucValidationData } from '@/common/interfaces/tenant/document-validation.interface';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client?: Client;
    documentTypes: Array<{ value: string; label: string }>;
    onSuccess?: (client: Client) => void;
}

export default function ClientModal({ isOpen, onClose, client, documentTypes, onSuccess }: ClientModalProps) {
    const isEditMode = !!client;
    const [processing, setProcessing] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        document_type: '01',
        document_number: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        province: '',
        department: '',
        country: 'PE',
        ubigeo: '',
        is_active: true,
    });

    // Actualizar los datos del formulario cuando cambia el cliente
    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                document_type: client.document_type || '01',
                document_number: client.document_number || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                district: client.district || '',
                province: client.province || '',
                department: client.department || '',
                country: client.country || 'PE',
                ubigeo: client.ubigeo || '',
                is_active: client.is_active !== undefined ? client.is_active : true,
            });
        } else {
            setFormData({
                name: '',
                document_type: '01',
                document_number: '',
                email: '',
                phone: '',
                address: '',
                district: '',
                province: '',
                department: '',
                country: 'PE',
                ubigeo: '',
                is_active: true,
            });
        }
    }, [client, isOpen]);

    // Type guards para validar el tipo de documento
    const isDniValidation = (data: DocumentValidationData): data is DniValidationData => {
        return 'dni' in data;
    };

    const isRucValidation = (data: DocumentValidationData): data is RucValidationData => {
        return 'ruc' in data;
    };

    // Validar documento cuando se completan los dígitos requeridos
    const validateDocument = useCallback(async () => {
        if (!formData.document_number || isEditMode) {
            return;
        }

        // Validar longitud según tipo de documento
        if (formData.document_type === '01' && formData.document_number.length !== 8) {
            return;
        }

        if (formData.document_type === '06' && formData.document_number.length !== 11) {
            return;
        }

        setValidating(true);
        try {
            const response = await Api.post<ApiResponse<DocumentValidationData>>('/v1/documents/validate', {
                document_type: formData.document_type,
                document_number: formData.document_number,
            });
            
            if (response.data.success) {
                const data = response.data;

                if (isRucValidation(data)) {
                    // Datos de RUC
                    setFormData(prev => ({
                        ...prev,
                        name: data.businessName || '',
                        address: data.address || '',
                        ubigeo: data.ubigeo || '',
                        department: data.department || '',
                        province: data.province || '',
                        district: data.district || '',
                    }));
                } else if (isDniValidation(data)) {
                    // Datos de DNI
                    const fullName = `${data.firstName || ''} ${data.lastName || ''} ${data.motherLastName || ''}`.trim();
                    setFormData(prev => ({
                        ...prev,
                        name: fullName || '',
                    }));
                }
                toast.success('Datos validados correctamente');
            } else {
                toast.error('No se pudo validar el documento');
            }
        } catch (error) {
            console.error('Error al validar documento:', error);
            toast.error('Error al validar el documento');
        } finally {
            setValidating(false);
        }
    }, [formData.document_type, formData.document_number, isEditMode]);

    // Validar automáticamente cuando se completa el número de documento
    useEffect(() => {
        const validateOnComplete = async () => {
            const documentNumber = formData.document_number;
            const documentType = formData.document_type;

            if (
                (documentType === '01' && documentNumber.length === 8) || // DNI
                (documentType === '06' && documentNumber.length === 11) // RUC
            ) {
                await validateDocument();
            }
        };

        validateOnComplete();
    }, [formData.document_number, formData.document_type, validateDocument]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setValidationErrors({});

        try {
            let response;
            if (isEditMode && client) {
                response = await Api.put<ApiResponse<ClientResponse>>(`/v1/clients/${client.id}`, formData);
                if (response.data.success) {
                    toast.success(response.data.message);
                    if (onSuccess) {
                        onSuccess(response.data.data);
                    }
                }
            } else {
                response = await Api.post<ApiResponse<ClientResponse>>('/v1/clients', formData);
                if (response.data.success) {
                    toast.success(response.data.message);
                    if (onSuccess) {
                        onSuccess(response.data.data);
                    }
                }
            }
            handleClose();
        } catch (error) {
            console.error('Error:', error);
            const apiError = error as ApiError;
            if (apiError.response?.data?.errors) {
                const errors: { [key: string]: string } = {};
                Object.entries(apiError.response.data.errors).forEach(([key, value]) => {
                    errors[key] = Array.isArray(value) ? value[0] : value;
                });
                setValidationErrors(errors);
                // Mostrar el primer error de validación
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Error al procesar el formulario');
            } else {
                toast.error(apiError.response?.data?.message || 'Error al procesar la solicitud');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            document_type: '01',
            document_number: '',
            email: '',
            phone: '',
            address: '',
            district: '',
            province: '',
            department: '',
            country: 'PE',
            ubigeo: '',
            is_active: true,
        });
        setValidationErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Actualice los datos del cliente.'
                            : 'Complete la información para crear un nuevo cliente.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nombre <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nombre completo"
                                className={validationErrors.name ? 'border-red-500' : ''}
                            />
                            {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
                        </div>

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
                    </div>

                    {/* Documento */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="document_type">
                                Tipo de Documento <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="document_type"
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                                    validationErrors.document_type ? 'border-red-500' : ''
                                }`}
                                value={formData.document_type}
                                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                disabled={isEditMode}
                            >
                                {documentTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.document_type && (
                                <p className="text-sm text-red-500">{validationErrors.document_type}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="document_number">
                                Número de Documento <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="document_number"
                                    value={formData.document_number}
                                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                                    placeholder="Número de documento"
                                    className={`${validationErrors.document_number ? 'border-red-500' : ''} ${validating ? 'pr-10' : ''}`}
                                    disabled={isEditMode}
                                />
                                {validating && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                            {validationErrors.document_number && (
                                <p className="text-sm text-red-500">{validationErrors.document_number}</p>
                            )}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                        <div className="space-y-2">
                            <Label htmlFor="ubigeo">Ubigeo</Label>
                            <Input
                                id="ubigeo"
                                value={formData.ubigeo}
                                onChange={(e) => setFormData({ ...formData, ubigeo: e.target.value })}
                                placeholder="Código de ubigeo"
                                className={validationErrors.ubigeo ? 'border-red-500' : ''}
                            />
                            {validationErrors.ubigeo && <p className="text-sm text-red-500">{validationErrors.ubigeo}</p>}
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
                            {validationErrors.district && (
                                <p className="text-sm text-red-500">{validationErrors.district}</p>
                            )}
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
                            {validationErrors.province && (
                                <p className="text-sm text-red-500">{validationErrors.province}</p>
                            )}
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
                            {validationErrors.department && (
                                <p className="text-sm text-red-500">{validationErrors.department}</p>
                            )}
                        </div>
                    </div>

                    {/* Estado (solo en modo edición) */}
                    {isEditMode && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
                            />
                            <Label htmlFor="is_active" className="text-sm font-normal">
                                Cliente activo
                            </Label>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditMode ? 'Actualizando...' : 'Creando...'}
                                </>
                            ) : (
                                <>{isEditMode ? 'Actualizar' : 'Crear'} Cliente</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

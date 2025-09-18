import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Upload, TestTube, Shield, Settings, FileText, Printer, X, Save, RotateCcw, Eye, EyeOff, Loader2 } from 'lucide-react';
import { SriService } from '@/services/sri.service';

interface Props {
    settings: {
        company_name?: string;
        legal_name: string;
        commercial_name: string;
        tax_identification_number: string;
        main_address: string;
        branch_address?: string;
        province: string;
        canton: string;
        parish: string;
        company_phone?: string;
        company_email?: string;
        logo_path?: string;
        sri_mode: string;
        certificate_path?: string;
        certificate_password?: string;
        electronic_signature?: string;
        establishment_code: string;
        emission_point_code: string;
        environment_type: string;
        emission_type: string;
        requires_electronic_signature: boolean;
        endpoint_recepcion: string;
        endpoint_autorizacion: string;
        endpoint_consultas: string;
        invoice_series: string;
        receipt_series: string;
        credit_note_series: string;
        debit_note_series: string;
        withholding_receipt_series: string;
        liquidation_series: string;
        invoice_footer: string;
        receipt_footer: string;
        note_footer: string;
        report_header?: string;
        report_footer?: string;
        company_status: string;
        company_type: string;
        registration_date?: string;
        economic_activity_code?: string;
        tax_responsibility_code?: string;
        special_taxpayer_number?: string;
        special_taxpayer_date?: string;
        withholding_agent_number?: string;
        withholding_agent_date?: string;
    };
    modes: { value: string; label: string }[];
    environment_types: { value: string; label: string }[];
    emission_types: { value: string; label: string }[];
    company_statuses: { value: string; label: string }[];
    company_types: { value: string; label: string }[];
    provinces: { value: string; label: string }[];
}

interface CertificateInfo {
    exists: boolean;
    size?: number;
    last_modified?: number;
    valid?: boolean;
    type?: string;
}

interface ConnectionStatus {
    connected: boolean;
    environment?: string;
    timestamp?: string;
    message?: string;
}

export default function Index({ 
    settings, 
    modes, 
    environment_types, 
    emission_types, 
    company_statuses, 
    company_types, 
    provinces 
}: Props) {
    const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
    const [testingConnection, setTestingConnection] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.logo_path ? `/${settings.logo_path}` : null
    );
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showCertificatePassword, setShowCertificatePassword] = useState(false);
    const [showElectronicSignature, setShowElectronicSignature] = useState(false);
    const [validatingRuc, setValidatingRuc] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const { data, setData, post, processing, errors } = useForm({
        // Company information
        company_name: settings.company_name || '',
        legal_name: settings.legal_name || '',
        commercial_name: settings.commercial_name || '',
        tax_identification_number: settings.tax_identification_number || '',
        main_address: settings.main_address || '',
        branch_address: settings.branch_address || '',
        province: settings.province || '',
        canton: settings.canton || '',
        parish: settings.parish || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        company_status: settings.company_status || 'ACTIVE',
        company_type: settings.company_type || '',
        
        // SRI configuration
        sri_mode: settings.sri_mode || 'test',
        certificate: null as File | null,
        certificate_password: settings.certificate_password || '',
        electronic_signature: settings.electronic_signature || '',
        establishment_code: settings.establishment_code || '001',
        emission_point_code: settings.emission_point_code || '001',
        environment_type: settings.environment_type || 'test',
        emission_type: settings.emission_type || 'normal',
        requires_electronic_signature: settings.requires_electronic_signature || true,
        
        // SRI endpoints
        endpoint_recepcion: settings.endpoint_recepcion || '',
        endpoint_autorizacion: settings.endpoint_autorizacion || '',
        endpoint_consultas: settings.endpoint_consultas || '',
        
        // Document series (SRI Ecuador format: 001-001-000000001)
        invoice_series: settings.invoice_series || '001-001-000000001',
        receipt_series: settings.receipt_series || '001-001-000000001',
        credit_note_series: settings.credit_note_series || '001-001-000000001',
        debit_note_series: settings.debit_note_series || '001-001-000000001',
        withholding_receipt_series: settings.withholding_receipt_series || '001-001-000000001',
        liquidation_series: settings.liquidation_series || '001-001-000000001',
        
        // Additional SRI fields
        registration_date: settings.registration_date || '',
        economic_activity_code: settings.economic_activity_code || '',
        tax_responsibility_code: settings.tax_responsibility_code || '',
        special_taxpayer_number: settings.special_taxpayer_number || '',
        special_taxpayer_date: settings.special_taxpayer_date || '',
        withholding_agent_number: settings.withholding_agent_number || '',
        withholding_agent_date: settings.withholding_agent_date || '',
        
        // Printing settings
        invoice_footer: settings.invoice_footer || '',
        receipt_footer: settings.receipt_footer || '',
        note_footer: settings.note_footer || '',
        report_header: settings.report_header || '',
        report_footer: settings.report_footer || '',
        
        // Logo
        logo: null as File | null,
    });

    useEffect(() => {
        if (settings.certificate_path) {
            loadCertificateInfo();
        }
    }, []);

    const extractEconomicActivityCode = (activity: string): string => {
        // Esto es un ejemplo - ajusta según el formato real de tu data
        const match = activity.match(/\((\d+)\)/);
        return match ? match[1] : '';
    };

    const validateRuc = async () => {
        const { tax_identification_number } = data;
        
        if (!tax_identification_number || tax_identification_number.length !== 13) {
            return;
        }
    
        setValidatingRuc(true);
        setValidationErrors(prev => {
            const { tax_identification_number, ...rest } = prev;
            return rest;
        });
    
        try {
            const result = await SriService.validateRuc(tax_identification_number);
            
            if (result.success && result.data) {
                const razonSocial = result.data!.legal_name || result.data!.business_name;
                
                setData(prev => ({
                    ...prev,
                    legal_name: razonSocial, // ← Para el campo legal_name
                    company_name: razonSocial, // ← También actualiza company_name
                    commercial_name: result.data!.commercial_name || razonSocial,
                    main_address: result.data!.address,
                    province: result.data!.province,
                    canton: result.data!.canton,
                    parish: result.data!.parish,
                    establishment_code: result.data!.establishment_code,
                    emission_point_code: result.data!.emission_point_code,
                    company_status: result.data!.company_status,
                    company_type: result.data!.company_type,
                    economic_activity_code: extractEconomicActivityCode(result.data!.main_activity),
                }));
                
                toast.success('RUC validado correctamente con SRI');
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    tax_identification_number: result.error || 'RUC no válido en el SRI',
                }));
                toast.error(result.error || 'Error al validar el RUC');
            }
        } catch (error) {
            console.error('Error validating RUC:', error);
            setValidationErrors(prev => ({
                ...prev,
                tax_identification_number: 'Error al consultar el RUC en el SRI',
            }));
            toast.error('Error al consultar el RUC en el SRI');
        } finally {
            setValidatingRuc(false);
        }
    };

    // Efecto para validar automáticamente cuando el RUC tiene 13 dígitos
    useEffect(() => {
        if (data.tax_identification_number.length === 13) {
            const timeoutId = setTimeout(() => {
                validateRuc();
            }, 1000); // Debounce de 1 segundo

            return () => clearTimeout(timeoutId);
        }
    }, [data.tax_identification_number]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings', {
            onSuccess: () => {
                toast.success('Configuración actualizada correctamente');
                if (data.certificate) {
                    loadCertificateInfo();
                }
            },
            onError: () => {
                toast.error('Error al actualizar la configuración');
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'certificate') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData(field, file);
            
            if (field === 'certificate') {
                setCertificateInfo(null);
            } else if (field === 'logo') {
                // Crear preview del logo
                const reader = new FileReader();
                reader.onload = (e) => {
                    setLogoPreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
                
                // Subir automáticamente el logo
                uploadLogo(file);
            }
        }
    };

    const uploadLogo = async (file: File) => {
        setUploadingLogo(true);
        setUploadProgress(0);
        
        const formData = new FormData();
        formData.append('logo', file);
        formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
        
        try {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(percentComplete);
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        toast.success('Logo actualizado correctamente');
                        setData('logo', null);
                    } else {
                        toast.error(response.message || 'Error al subir el logo');
                        setLogoPreview(settings.logo_path ? `/storage/${settings.logo_path}` : null);
                    }
                } else {
                    toast.error('Error al subir el logo');
                    setLogoPreview(settings.logo_path ? `/storage/${settings.logo_path}` : null);
                }
                setUploadingLogo(false);
                setUploadProgress(0);
            });
            
            xhr.addEventListener('error', () => {
                toast.error('Error de red al subir el logo');
                setLogoPreview(settings.logo_path ? `/storage/${settings.logo_path}` : null);
                setUploadingLogo(false);
                setUploadProgress(0);
            });
            
            xhr.open('POST', '/settings/upload-logo');
            xhr.send(formData);
            
        } catch {
            toast.error('Error al subir el logo');
            setLogoPreview(settings.logo_path ? `/storage/${settings.logo_path}` : null);
            setUploadingLogo(false);
            setUploadProgress(0);
        }
    };

    const removeLogo = async () => {
        try {
            const response = await fetch('/settings/remove-logo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const result = await response.json();
            if (result.success) {
                setLogoPreview(null);
                setData('logo', null);
                toast.success('Logo eliminado correctamente');
            } else {
                toast.error(result.message || 'Error al eliminar el logo');
            }
        } catch {
            toast.error('Error al eliminar el logo');
        }
    };

    const testSriConnection = async () => {
        if (!data.tax_identification_number || !data.certificate_password) {
            toast.error('Por favor complete las credenciales SRI');
            return;
        }

        setTestingConnection(true);
        try {
            const response = await fetch('/settings/test-sri-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    tax_identification_number: data.tax_identification_number,
                    certificate_password: data.certificate_password,
                    sri_mode: data.sri_mode,
                }),
            });

            const result = await response.json();
            
            if (result.success) {
                setConnectionStatus({
                    connected: true,
                    environment: result.data.environment,
                    timestamp: result.data.timestamp,
                    message: result.message
                });
                toast.success('Conexión exitosa con SRI Ecuador');
            } else {
                setConnectionStatus({
                    connected: false,
                    message: result.message
                });
                toast.error('Error en la conexión: ' + result.message);
            }
        } catch {
            setConnectionStatus({
                connected: false,
                message: 'Error de red al conectar con SRI'
            });
            toast.error('Error de red al conectar con SRI');
        } finally {
            setTestingConnection(false);
        }
    };

    const loadCertificateInfo = async () => {
        try {
            const response = await fetch('/settings/certificate-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            
            if (result.success) {
                setCertificateInfo({
                    exists: result.data.exists,
                    size: result.data.size,
                    last_modified: result.data.last_modified,
                    type: result.data.type,
                    valid: true
                });
            } else {
                setCertificateInfo({
                    exists: false,
                    valid: false
                });
            }
        } catch {
            setCertificateInfo({
                exists: false,
                valid: false
            });
        }
    };

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getSriModeColor = (mode: string) => {
        switch (mode) {
            case 'production': return 'bg-green-100 text-green-800';
            case 'test': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppSidebarLayout>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Settings className="h-8 w-8" />
                            Configuración de Facturación Electrónica SRI
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Configure su sistema de facturación electrónica para SRI Ecuador
                        </p>
                    </div>
                    <Badge className={getSriModeColor(data.sri_mode)}>
                        {modes.find(m => m.value === data.sri_mode)?.label || 'No configurado'}
                    </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos de la Empresa */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Datos de la Empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Campo RUC con validación */}
                                <div>
                                    <Label htmlFor="tax_identification_number">RUC *</Label>
                                    <div className="relative">
                                        <Input
                                            id="tax_identification_number"
                                            value={data.tax_identification_number}
                                            onChange={(e) => setData('tax_identification_number', e.target.value)}
                                            placeholder="1234567890123"
                                            maxLength={13}
                                            className={`${errors.tax_identification_number ? 'border-red-500' : ''} ${validatingRuc ? 'pr-10' : ''}`}
                                        />
                                        {validatingRuc && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.tax_identification_number && (
                                        <p className="text-sm text-red-500 mt-1">{errors.tax_identification_number}</p>
                                    )}
                                    {validationErrors.tax_identification_number && (
                                        <p className="text-sm text-red-500 mt-1">{validationErrors.tax_identification_number}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Ingrese los 13 dígitos del RUC para validar automáticamente con SRI
                                    </p>
                                    
                                    {/* Botón para validar manualmente */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={validateRuc}
                                        disabled={validatingRuc || data.tax_identification_number.length !== 13}
                                        className="mt-2"
                                    >
                                        {validatingRuc ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <TestTube className="h-4 w-4 mr-2" />
                                        )}
                                        Validar RUC
                                    </Button>
                                </div>

                                {/* Campo Company Name (Nombre de la Empresa) */}
                                <div>
                                    <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Nombre de la empresa"
                                        className={errors.company_name ? 'border-red-500' : ''}
                                    />
                                    {errors.company_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.company_name}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="legal_name">Razón Social *</Label>
                                    <Input
                                        id="legal_name"
                                        value={data.legal_name}
                                        onChange={(e) => setData('legal_name', e.target.value)}
                                        placeholder="Razón social según SRI"
                                        className={errors.legal_name ? 'border-red-500' : ''}
                                    />
                                    {errors.legal_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.legal_name}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="commercial_name">Nombre Comercial</Label>
                                    <Input
                                        id="commercial_name"
                                        value={data.commercial_name}
                                        onChange={(e) => setData('commercial_name', e.target.value)}
                                        placeholder="Nombre comercial de la empresa"
                                        className={errors.commercial_name ? 'border-red-500' : ''}
                                    />
                                    {errors.commercial_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.commercial_name}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="company_email">Email</Label>
                                    <Input
                                        id="company_email"
                                        type="email"
                                        value={data.company_email}
                                        onChange={(e) => setData('company_email', e.target.value)}
                                        placeholder="empresa@ejemplo.com"
                                        className={errors.company_email ? 'border-red-500' : ''}
                                    />
                                    {errors.company_email && (
                                        <p className="text-sm text-red-500 mt-1">{errors.company_email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="main_address">Dirección Matriz *</Label>
                                <Input
                                    id="main_address"
                                    value={data.main_address}
                                    onChange={(e) => setData('main_address', e.target.value)}
                                    placeholder="Dirección completa según SRI"
                                    className={errors.main_address ? 'border-red-500' : ''}
                                />
                                {errors.main_address && (
                                    <p className="text-sm text-red-500 mt-1">{errors.main_address}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="branch_address">Dirección Sucursal</Label>
                                <Input
                                    id="branch_address"
                                    value={data.branch_address}
                                    onChange={(e) => setData('branch_address', e.target.value)}
                                    placeholder="Dirección de sucursal (opcional)"
                                    className={errors.branch_address ? 'border-red-500' : ''}
                                />
                                {errors.branch_address && (
                                    <p className="text-sm text-red-500 mt-1">{errors.branch_address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <Label htmlFor="province">Provincia *</Label>
                                    <Select 
                                        value={data.province} 
                                        onValueChange={(value) => setData('province', value)}
                                    >
                                        <SelectTrigger className={errors.province ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Seleccione provincia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map((province) => (
                                                <SelectItem key={province.value} value={province.value}>
                                                    {province.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.province && (
                                        <p className="text-sm text-red-500 mt-1">{errors.province}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="canton">Cantón *</Label>
                                    <Input
                                        id="canton"
                                        value={data.canton}
                                        onChange={(e) => setData('canton', e.target.value)}
                                        placeholder="Cantón"
                                        className={errors.canton ? 'border-red-500' : ''}
                                    />
                                    {errors.canton && (
                                        <p className="text-sm text-red-500 mt-1">{errors.canton}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="parish">Parroquia *</Label>
                                    <Input
                                        id="parish"
                                        value={data.parish}
                                        onChange={(e) => setData('parish', e.target.value)}
                                        placeholder="Parroquia"
                                        className={errors.parish ? 'border-red-500' : ''}
                                    />
                                    {errors.parish && (
                                        <p className="text-sm text-red-500 mt-1">{errors.parish}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="company_phone">Teléfono</Label>
                                    <Input
                                        id="company_phone"
                                        value={data.company_phone}
                                        onChange={(e) => setData('company_phone', e.target.value)}
                                        placeholder="+593 2 123 4567"
                                        className={errors.company_phone ? 'border-red-500' : ''}
                                    />
                                    {errors.company_phone && (
                                        <p className="text-sm text-red-500 mt-1">{errors.company_phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="company_status">Estado de la Empresa</Label>
                                    <Select 
                                        value={data.company_status} 
                                        onValueChange={(value) => setData('company_status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {company_statuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="company_type">Tipo de Empresa</Label>
                                    <Select 
                                        value={data.company_type} 
                                        onValueChange={(value) => setData('company_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {company_types.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="logo">Logo de la Empresa</Label>
                                <div className="space-y-4">
                                    {logoPreview && (
                                        <div className="relative inline-block">
                                            <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                {uploadingLogo && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <div className="text-white text-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                                                            <div className="text-sm">{Math.round(uploadProgress)}%</div>
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={removeLogo}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                                    disabled={uploadingLogo}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {uploadingLogo && (
                                        <div className="space-y-2">
                                            <Progress value={uploadProgress} className="w-full" />
                                            <div className="text-center text-sm text-muted-foreground">
                                                Subiendo logo... {Math.round(uploadProgress)}%
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'logo')}
                                            className={`flex-1 ${errors.logo ? 'border-red-500' : ''}`}
                                            disabled={uploadingLogo}
                                        />
                                        {uploadingLogo && (
                                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                                <Upload className="h-4 w-4 animate-pulse" />
                                                Subiendo...
                                            </div>
                                        )}
                                    </div>
                                    
                                    {errors.logo && (
                                        <p className="text-sm text-red-500 mt-1">{errors.logo}</p>
                                    )}
                                    
                                    <p className="text-sm text-muted-foreground">
                                        Formatos soportados: JPG, PNG, GIF (máx. 2MB)
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuración SRI Ecuador */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Configuración SRI Ecuador
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <Label htmlFor="sri_mode">Modo de Operación *</Label>
                                    <Select value={data.sri_mode} onValueChange={(value) => setData('sri_mode', value)}>
                                        <SelectTrigger className={errors.sri_mode ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Seleccione modo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modes.map((mode) => (
                                                <SelectItem key={mode.value} value={mode.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${mode.value === 'production' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                        {mode.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.sri_mode && (
                                        <p className="text-sm text-red-500 mt-1">{errors.sri_mode}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="environment_type">Ambiente</Label>
                                    <Select value={data.environment_type} onValueChange={(value) => setData('environment_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione ambiente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {environment_types.map((env) => (
                                                <SelectItem key={env.value} value={env.value}>
                                                    {env.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="emission_type">Tipo de Emisión</Label>
                                    <Select value={data.emission_type} onValueChange={(value) => setData('emission_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {emission_types.map((emission) => (
                                                <SelectItem key={emission.value} value={emission.value}>
                                                    {emission.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch
                                        id="requires_electronic_signature"
                                        checked={data.requires_electronic_signature}
                                        onCheckedChange={(checked) => setData('requires_electronic_signature', checked)}
                                    />
                                    <Label htmlFor="requires_electronic_signature">Firma Electrónica</Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="establishment_code">Código de Establecimiento *</Label>
                                    <Input
                                        id="establishment_code"
                                        value={data.establishment_code}
                                        onChange={(e) => setData('establishment_code', e.target.value)}
                                        placeholder="001"
                                        maxLength={3}
                                        className={errors.establishment_code ? 'border-red-500' : ''}
                                    />
                                    {errors.establishment_code && (
                                        <p className="text-sm text-red-500 mt-1">{errors.establishment_code}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="emission_point_code">Punto de Emisión *</Label>
                                    <Input
                                        id="emission_point_code"
                                        value={data.emission_point_code}
                                        onChange={(e) => setData('emission_point_code', e.target.value)}
                                        placeholder="001"
                                        maxLength={3}
                                        className={errors.emission_point_code ? 'border-red-500' : ''}
                                    />
                                    {errors.emission_point_code && (
                                        <p className="text-sm text-red-500 mt-1">{errors.emission_point_code}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Estado de Conexión SRI</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={testSriConnection}
                                        disabled={testingConnection}
                                        className="flex items-center gap-2"
                                    >
                                        <TestTube className="h-4 w-4" />
                                        {testingConnection ? 'Probando...' : 'Probar Conexión'}
                                    </Button>
                                    {connectionStatus && (
                                        <div className="flex items-center gap-1">
                                            {connectionStatus.connected ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className={`text-sm ${connectionStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                                                {connectionStatus.connected ? 'Conectado' : 'Error'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {connectionStatus?.message && (
                                    <p className="text-sm text-muted-foreground">{connectionStatus.message}</p>
                                )}
                            </div>

                            {/* Certificado Digital */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="certificate">Certificado Digital (.p12) *</Label>
                                    <Input
                                        id="certificate"
                                        type="file"
                                        accept=".p12"
                                        onChange={(e) => handleFileChange(e, 'certificate')}
                                        className={errors.certificate ? 'border-red-500' : ''}
                                    />
                                    {errors.certificate && (
                                        <p className="text-sm text-red-500 mt-1">{errors.certificate}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Certificado digital .p12 para SRI Ecuador
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="certificate_password">Contraseña del Certificado</Label>
                                    <div className="relative">
                                        <Input
                                            id="certificate_password"
                                            type={showCertificatePassword ? "text" : "password"}
                                            value={data.certificate_password}
                                            onChange={(e) => setData('certificate_password', e.target.value)}
                                            placeholder="Contraseña del certificado"
                                            className={errors.certificate_password ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowCertificatePassword(!showCertificatePassword)}
                                        >
                                            {showCertificatePassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.certificate_password && (
                                        <p className="text-sm text-red-500 mt-1">{errors.certificate_password}</p>
                                    )}
                                </div>

                                {data.requires_electronic_signature && (
                                    <div>
                                        <Label htmlFor="electronic_signature">Firma Electrónica</Label>
                                        <div className="relative">
                                            <Input
                                                id="electronic_signature"
                                                type={showElectronicSignature ? "text" : "password"}
                                                value={data.electronic_signature}
                                                onChange={(e) => setData('electronic_signature', e.target.value)}
                                                placeholder="Firma electrónica"
                                                className={errors.electronic_signature ? 'border-red-500 pr-10' : 'pr-10'}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                onClick={() => setShowElectronicSignature(!showElectronicSignature)}
                                            >
                                                {showElectronicSignature ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.electronic_signature && (
                                            <p className="text-sm text-red-500 mt-1">{errors.electronic_signature}</p>
                                        )}
                                    </div>
                                )}

                                {certificateInfo && (
                                    <Alert>
                                        <Shield className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Estado del certificado:</span>
                                                    {certificateInfo.exists ? (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Cargado
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-red-600 border-red-600">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            No encontrado
                                                        </Badge>
                                                    )}
                                                </div>
                                                {certificateInfo.size && (
                                                    <p className="text-sm">
                                                        <strong>Tamaño:</strong> {formatFileSize(certificateInfo.size)}
                                                    </p>
                                                )}
                                                {certificateInfo.type && (
                                                    <p className="text-sm">
                                                        <strong>Tipo:</strong> {certificateInfo.type}
                                                    </p>
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Endpoints SRI */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Endpoints SRI</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="endpoint_recepcion">Endpoint Recepción</Label>
                                        <Input
                                            id="endpoint_recepcion"
                                            value={data.endpoint_recepcion}
                                            onChange={(e) => setData('endpoint_recepcion', e.target.value)}
                                            placeholder="https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl"
                                            className={errors.endpoint_recepcion ? 'border-red-500' : ''}
                                        />
                                        {errors.endpoint_recepcion && (
                                            <p className="text-sm text-red-500 mt-1">{errors.endpoint_recepcion}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="endpoint_autorizacion">Endpoint Autorización</Label>
                                        <Input
                                            id="endpoint_autorizacion"
                                            value={data.endpoint_autorizacion}
                                            onChange={(e) => setData('endpoint_autorizacion', e.target.value)}
                                            placeholder="https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl"
                                            className={errors.endpoint_autorizacion ? 'border-red-500' : ''}
                                        />
                                        {errors.endpoint_autorizacion && (
                                            <p className="text-sm text-red-500 mt-1">{errors.endpoint_autorizacion}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="endpoint_consultas">Endpoint Consultas</Label>
                                        <Input
                                            id="endpoint_consultas"
                                            value={data.endpoint_consultas}
                                            onChange={(e) => setData('endpoint_consultas', e.target.value)}
                                            placeholder="https://celcer.sri.gob.ec/comprobantes-electronicos-ws/ConsultaLote?wsdl"
                                            className={errors.endpoint_consultas ? 'border-red-500' : ''}
                                        />
                                        {errors.endpoint_consultas && (
                                            <p className="text-sm text-red-500 mt-1">{errors.endpoint_consultas}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Series de Documentos SRI */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Series de Documentos SRI
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <Label htmlFor="invoice_series">Serie Facturas</Label>
                                    <Input
                                        id="invoice_series"
                                        value={data.invoice_series}
                                        onChange={(e) => setData('invoice_series', e.target.value)}
                                        placeholder="001-001-000000001"
                                        maxLength={17}
                                        className={errors.invoice_series ? 'border-red-500' : ''}
                                    />
                                    {errors.invoice_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.invoice_series}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">Formato: 001-001-000000001</p>
                                </div>
                                <div>
                                    <Label htmlFor="receipt_series">Serie Recibos</Label>
                                    <Input
                                        id="receipt_series"
                                        value={data.receipt_series}
                                        onChange={(e) => setData('receipt_series', e.target.value)}
                                        placeholder="001-001-000000001"
                                        maxLength={17}
                                        className={errors.receipt_series ? 'border-red-500' : ''}
                                    />
                                    {errors.receipt_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.receipt_series}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="credit_note_series">Serie Notas de Crédito</Label>
                                    <Input
                                        id="credit_note_series"
                                        value={data.credit_note_series}
                                        onChange={(e) => setData('credit_note_series', e.target.value)}
                                        placeholder="001-001-000000001"
                                        maxLength={17}
                                        className={errors.credit_note_series ? 'border-red-500' : ''}
                                    />
                                    {errors.credit_note_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.credit_note_series}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="debit_note_series">Serie Notas de Débito</Label>
                                    <Input
                                        id="debit_note_series"
                                        value={data.debit_note_series}
                                        onChange={(e) => setData('debit_note_series', e.target.value)}
                                        placeholder="001-001-000000001"
                                        maxLength={17}
                                        className={errors.debit_note_series ? 'border-red-500' : ''}
                                    />
                                    {errors.debit_note_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.debit_note_series}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="withholding_receipt_series">Serie Comprobantes Retención</Label>
                                    <Input
                                        id="withholding_receipt_series"
                                        value={data.withholding_receipt_series}
                                        onChange={(e) => setData('withholding_receipt_series', e.target.value)}
                                        placeholder="001-001-000000001"
                                        maxLength={17}
                                        className={errors.withholding_receipt_series ? 'border-red-500' : ''}
                                    />
                                    {errors.withholding_receipt_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.withholding_receipt_series}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="liquidation_series">Serie Liquidaciones</Label>
                                    <Input
                                        id="liquidation_series"
                                        value={data.liquidation_series}
                                        onChange={(e) => setData('liquidation_series', e.target.value)}
                                        placeholder="001-001-000000001"
                                        maxLength={17}
                                        className={errors.liquidation_series ? 'border-red-500' : ''}
                                    />
                                    {errors.liquidation_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.liquidation_series}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuración de Reportes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Printer className="h-5 w-5" />
                                Configuración de Reportes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="report_header">Encabezado de Reportes</Label>
                                <Textarea
                                    id="report_header"
                                    value={data.report_header}
                                    onChange={(e) => setData('report_header', e.target.value)}
                                    placeholder="Texto que aparecerá en el encabezado de los reportes"
                                    rows={3}
                                    className={errors.report_header ? 'border-red-500' : ''}
                                />
                                {errors.report_header && (
                                    <p className="text-sm text-red-500 mt-1">{errors.report_header}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="report_footer">Pie de Página de Reportes</Label>
                                <Textarea
                                    id="report_footer"
                                    value={data.report_footer}
                                    onChange={(e) => setData('report_footer', e.target.value)}
                                    placeholder="Texto que aparecerá en el pie de página de los reportes"
                                    rows={3}
                                    className={errors.report_footer ? 'border-red-500' : ''}
                                />
                                {errors.report_footer && (
                                    <p className="text-sm text-red-500 mt-1">{errors.report_footer}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuración de Impresión */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Printer className="h-5 w-5" />
                                Configuración de Impresión de Documentos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="invoice_footer">Pie de Página Facturas</Label>
                                <Textarea
                                    id="invoice_footer"
                                    value={data.invoice_footer}
                                    onChange={(e) => setData('invoice_footer', e.target.value)}
                                    placeholder="Texto que aparecerá en el pie de página de las facturas"
                                    rows={2}
                                    className={errors.invoice_footer ? 'border-red-500' : ''}
                                />
                                {errors.invoice_footer && (
                                    <p className="text-sm text-red-500 mt-1">{errors.invoice_footer}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="receipt_footer">Pie de Página Recibos</Label>
                                <Textarea
                                    id="receipt_footer"
                                    value={data.receipt_footer}
                                    onChange={(e) => setData('receipt_footer', e.target.value)}
                                    placeholder="Texto que aparecerá en el pie de página de los recibos"
                                    rows={2}
                                    className={errors.receipt_footer ? 'border-red-500' : ''}
                                />
                                {errors.receipt_footer && (
                                    <p className="text-sm text-red-500 mt-1">{errors.receipt_footer}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="note_footer">Pie de Página Notas</Label>
                                <Textarea
                                    id="note_footer"
                                    value={data.note_footer}
                                    onChange={(e) => setData('note_footer', e.target.value)}
                                    placeholder="Texto que aparecerá en el pie de página de las notas"
                                    rows={2}
                                    className={errors.note_footer ? 'border-red-500' : ''}
                                />
                                {errors.note_footer && (
                                    <p className="text-sm text-red-500 mt-1">{errors.note_footer}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones flotantes */}
                    <div className="fixed bottom-6 right-6 z-50">
                        <div className="flex flex-col gap-3">
                            {uploadingLogo && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                        <div className="text-sm text-blue-700">
                                            Subiendo logo... {Math.round(uploadProgress)}%
                                        </div>
                                    </div>
                                    <Progress value={uploadProgress} className="w-full mt-2" />
                                </div>
                            )}
                            
                            <div className="flex gap-3 bg-white rounded-xl shadow-xl border border-gray-200 p-4 backdrop-blur-sm">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => window.location.reload()}
                                    className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                                    disabled={processing || uploadingLogo}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing || uploadingLogo} 
                                    className="min-w-[160px] flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Guardar Configuración
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pb-20"></div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
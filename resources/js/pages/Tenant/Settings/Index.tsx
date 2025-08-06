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
import { CheckCircle, XCircle, Upload, TestTube, Shield, Settings, FileText, Printer, X, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface Props {
    settings: {
        company_name?: string;
        business_name: string;
        trade_name: string;
        ruc: string;
        address: string;
        ubigeo: string;
        department: string;
        province: string;
        district: string;
        company_phone?: string;
        company_email?: string;
        logo_path?: string;
        sunat_mode: string;
        certificate_path?: string;
        certificate_password?: string;
        sol_user: string;
        sol_pass: string;
        endpoint_fe?: string;
        endpoint_guia?: string;
        endpoint_retenciones?: string;
        invoice_series: string;
        receipt_series: string;
        credit_note_series: string;
        debit_note_series: string;
        invoice_footer: string;
        receipt_footer: string;
        note_footer: string;
        report_header?: string;
        report_footer?: string;
        document_series?: Record<string, unknown>;
    };
    modes: { value: string; label: string }[];
    document_types: { value: string; label: string }[];
    unit_types: { value: string; label: string }[];
    igv_types: { value: string; label: string }[];
}

interface CertificateInfo {
    exists: boolean;
    size?: number;
    last_modified?: number;
    valid?: boolean;
    expires_at?: string;
    issued_to?: string;
}

interface ConnectionStatus {
    connected: boolean;
    environment?: string;
    timestamp?: string;
    message?: string;
}

export default function Index({ settings, modes }: Props) {
    const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
    const [testingConnection, setTestingConnection] = useState(false);
    const [useCustomEndpoints, setUseCustomEndpoints] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.logo_path ? `/${settings.logo_path}` : null
    );
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [certificateType, setCertificateType] = useState<'pem' | 'pfx' | null>(null);
    const [showSolPassword, setShowSolPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        company_name: settings.company_name || '',
        business_name: settings.business_name || '',
        trade_name: settings.trade_name || '',
        ruc: settings.ruc || '',
        address: settings.address || '',
        ubigeo: settings.ubigeo || '',
        department: settings.department || '',
        province: settings.province || '',
        district: settings.district || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        logo: null as File | null,
        sunat_mode: settings.sunat_mode || 'beta',
        certificate: null as File | null,
        certificate_password: settings.certificate_password || '',
        sol_user: settings.sol_user || '',
        sol_pass: settings.sol_pass || '',
        endpoint_fe: settings.endpoint_fe || '',
        endpoint_guia: settings.endpoint_guia || '',
        endpoint_retenciones: settings.endpoint_retenciones || '',
        invoice_series: settings.invoice_series || 'F001',
        receipt_series: settings.receipt_series || 'B001',
        credit_note_series: settings.credit_note_series || 'FC01',
        debit_note_series: settings.debit_note_series || 'FD01',
        invoice_footer: settings.invoice_footer || '',
        receipt_footer: settings.receipt_footer || '',
        note_footer: settings.note_footer || '',
        report_header: settings.report_header || '',
        report_footer: settings.report_footer || '',
    });

    useEffect(() => {
        if (settings.certificate_path) {
            loadCertificateInfo();
            // Detectar tipo de certificado existente
            const certPath = settings.certificate_path.toLowerCase();
            if (certPath.endsWith('.pem') || certPath.endsWith('.crt')) {
                setCertificateType('pem');
            } else if (certPath.endsWith('.pfx') || certPath.endsWith('.p12')) {
                setCertificateType('pfx');
            }
        }
        if (settings.endpoint_fe || settings.endpoint_guia || settings.endpoint_retenciones) {
            setUseCustomEndpoints(true);
        }
    }, []);

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
                // Detectar tipo de certificado por extensión
                const fileName = file.name.toLowerCase();
                if (fileName.endsWith('.pem') || fileName.endsWith('.crt')) {
                    setCertificateType('pem');
                    setData('certificate_password', ''); // Limpiar contraseña para PEM
                } else if (fileName.endsWith('.pfx') || fileName.endsWith('.p12')) {
                    setCertificateType('pfx');
                } else {
                    setCertificateType(null);
                }
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
                        // Actualizar la configuración con la nueva ruta del logo
                        setData('logo', null); // Limpiar el archivo temporal
                        // Actualizar la configuración para reflejar el nuevo logo
                        window.location.reload(); // Recargar para obtener la nueva configuración
                    } else {
                        toast.error(response.message || 'Error al subir el logo');
                        setLogoPreview(settings.logo_path ? `/storage/${settings.logo_path}` : null); // Revertir preview
                    }
                } else {
                    toast.error('Error al subir el logo');
                    setLogoPreview(settings.logo_path ? `/storage/${settings.logo_path}` : null); // Revertir preview
                }
                setUploadingLogo(false);
                setUploadProgress(0);
            });
            
            xhr.addEventListener('error', () => {
                toast.error('Error de red al subir el logo');
                setLogoPreview(settings.logo_path ? `/storage/${settings.logo_path}` : null); // Revertir preview
                setUploadingLogo(false);
                setUploadProgress(0);
            });
            
            xhr.open('POST', '/settings/upload-logo');
            xhr.send(formData);
            
        } catch {
            toast.error('Error al subir el logo');
            setLogoPreview(settings.logo_path ? `/storage/${settings.logo_path}` : null); // Revertir preview
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

    const testSunatConnection = async () => {
        if (!data.ruc || !data.sol_user || !data.sol_pass) {
            toast.error('Por favor complete las credenciales SUNAT');
            return;
        }

        setTestingConnection(true);
        try {
            const response = await fetch('/settings/test-sunat-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ruc: data.ruc,
                    sol_user: data.sol_user,
                    sol_pass: data.sol_pass,
                    sunat_mode: data.sunat_mode,
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
                toast.success('Conexión exitosa con SUNAT');
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
                message: 'Error de red al conectar con SUNAT'
            });
            toast.error('Error de red al conectar con SUNAT');
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
                    valid: true // Aquí se podría validar el certificado
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

    const getSunatModeColor = (mode: string) => {
        switch (mode) {
            case 'production': return 'bg-green-100 text-green-800';
            case 'beta': return 'bg-yellow-100 text-yellow-800';
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
                            Configuración de Facturación Electrónica
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Configure su sistema de facturación electrónica para SRI
                        </p>
                    </div>
                    <Badge className={getSunatModeColor(data.sunat_mode)}>
                        {modes.find(m => m.value === data.sunat_mode)?.label || 'No configurado'}
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
                                <div>
                                    <Label htmlFor="business_name">Razón Social *</Label>
                                    <Input
                                        id="business_name"
                                        value={data.business_name}
                                        onChange={(e) => setData('business_name', e.target.value)}
                                        placeholder="Razón social según SRI"
                                        className={errors.business_name ? 'border-red-500' : ''}
                                    />
                                    {errors.business_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.business_name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="trade_name">Nombre Comercial</Label>
                                    <Input
                                        id="trade_name"
                                        value={data.trade_name}
                                        onChange={(e) => setData('trade_name', e.target.value)}
                                        placeholder="Nombre comercial de la empresa"
                                        className={errors.trade_name ? 'border-red-500' : ''}
                                    />
                                    {errors.trade_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.trade_name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="ruc">RUC *</Label>
                                    <Input
                                        id="ruc"
                                        value={data.ruc}
                                        onChange={(e) => setData('ruc', e.target.value)}
                                        placeholder="20123456789"
                                        maxLength={13}
                                        className={errors.ruc ? 'border-red-500' : ''}
                                    />
                                    {errors.ruc && (
                                        <p className="text-sm text-red-500 mt-1">{errors.ruc}</p>
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
                                <Label htmlFor="address">Dirección Fiscal *</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Dirección completa según SRI"
                                    className={errors.address ? 'border-red-500' : ''}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <Label htmlFor="ubigeo">Cod Postal *</Label>
                                    <Input
                                        id="ubigeo"
                                        value={data.ubigeo}
                                        onChange={(e) => setData('ubigeo', e.target.value)}
                                        placeholder="150101"
                                        maxLength={6}
                                        className={errors.ubigeo ? 'border-red-500' : ''}
                                    />
                                    {errors.ubigeo && (
                                        <p className="text-sm text-red-500 mt-1">{errors.ubigeo}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="department">Provincia *</Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        placeholder="LIMA"
                                        className={errors.department ? 'border-red-500' : ''}
                                    />
                                    {errors.department && (
                                        <p className="text-sm text-red-500 mt-1">{errors.department}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="province">Canton *</Label>
                                    <Input
                                        id="province"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        placeholder="LIMA"
                                        className={errors.province ? 'border-red-500' : ''}
                                    />
                                    {errors.province && (
                                        <p className="text-sm text-red-500 mt-1">{errors.province}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="district">Ciudad *</Label>
                                    <Input
                                        id="district"
                                        value={data.district}
                                        onChange={(e) => setData('district', e.target.value)}
                                        placeholder="LIMA"
                                        className={errors.district ? 'border-red-500' : ''}
                                    />
                                    {errors.district && (
                                        <p className="text-sm text-red-500 mt-1">{errors.district}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="logo">Logo de la Empresa</Label>
                                <div className="space-y-4">
                                    {/* Preview del logo */}
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
                                    
                                    {/* Barra de progreso */}
                                    {uploadingLogo && (
                                        <div className="space-y-2">
                                            <Progress value={uploadProgress} className="w-full" />
                                            <div className="text-center text-sm text-muted-foreground">
                                                Subiendo logo... {Math.round(uploadProgress)}%
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Input de archivo */}
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
                                        El logo se guardará automáticamente al seleccionar un archivo. 
                                        Formatos soportados: JPG, PNG, GIF (máx. 2MB)
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuración SRI */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Configuración SRI
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="sunat_mode">Modo de Operación *</Label>
                                    <Select value={data.sunat_mode} onValueChange={(value) => setData('sunat_mode', value)}>
                                        <SelectTrigger className={errors.sunat_mode ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Seleccione el modo de operación" />
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
                                    {errors.sunat_mode && (
                                        <p className="text-sm text-red-500 mt-1">{errors.sunat_mode}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {data.sunat_mode === 'production' 
                                            ? 'Modo producción: facturas válidas ante SRI' 
                                            : 'Modo pruebas: para desarrollo y testing'
                                        }
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Estado de Conexión</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={testSunatConnection}
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
                            </div>

                            {/* Certificado Digital */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="certificate">Certificado Digital (.pfx, .p12) *</Label>
                                    <Input
                                        id="certificate"
                                        type="file"
                                        accept=".pfx,.p12,.pem,.cer,.cert,.crt"
                                        onChange={(e) => handleFileChange(e, 'certificate')}
                                        className={errors.certificate ? 'border-red-500' : ''}
                                    />
                                    {errors.certificate && (
                                        <p className="text-sm text-red-500 mt-1">{errors.certificate}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Certificado digital emitido por una entidad certificadora autorizada por SRI
                                    </p>
                                </div>

                                {certificateType === 'pfx' && (
                                    <div>
                                        <Label htmlFor="certificate_password">Contraseña del Certificado</Label>
                                        <Input
                                            id="certificate_password"
                                            type="password"
                                            value={data.certificate_password}
                                            onChange={(e) => setData('certificate_password', e.target.value)}
                                            placeholder="Contraseña del certificado PFX/P12"
                                            className={errors.certificate_password ? 'border-red-500' : ''}
                                        />
                                        {errors.certificate_password && (
                                            <p className="text-sm text-red-500 mt-1">{errors.certificate_password}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Solo requerido para certificados PFX/P12
                                        </p>
                                    </div>
                                )}
                                {certificateType === 'pem' && (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Los certificados PEM no requieren contraseña
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Información del Certificado */}
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
                                                {certificateInfo.last_modified && (
                                                    <p className="text-sm">
                                                        <strong>Última modificación:</strong> {new Date(certificateInfo.last_modified * 1000).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Endpoints Personalizados */}
                            {/* <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="use-custom-endpoints"
                                        checked={useCustomEndpoints}
                                        onCheckedChange={setUseCustomEndpoints}
                                    />
                                    <Label htmlFor="use-custom-endpoints">Usar endpoints personalizados</Label>
                                </div>

                                {useCustomEndpoints && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label htmlFor="endpoint_fe">Endpoint Facturación Electrónica</Label>
                                            <Input
                                                id="endpoint_fe"
                                                value={data.endpoint_fe}
                                                onChange={(e) => setData('endpoint_fe', e.target.value)}
                                                placeholder="https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService"
                                                className={errors.endpoint_fe ? 'border-red-500' : ''}
                                            />
                                            {errors.endpoint_fe && (
                                                <p className="text-sm text-red-500 mt-1">{errors.endpoint_fe}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="endpoint_guia">Endpoint Guías de Remisión</Label>
                                            <Input
                                                id="endpoint_guia"
                                                value={data.endpoint_guia}
                                                onChange={(e) => setData('endpoint_guia', e.target.value)}
                                                placeholder="https://e-beta.sunat.gob.pe/ol-ti-itemision-guia-gem-beta/billService"
                                                className={errors.endpoint_guia ? 'border-red-500' : ''}
                                            />
                                            {errors.endpoint_guia && (
                                                <p className="text-sm text-red-500 mt-1">{errors.endpoint_guia}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="endpoint_retenciones">Endpoint Retenciones</Label>
                                            <Input
                                                id="endpoint_retenciones"
                                                value={data.endpoint_retenciones}
                                                onChange={(e) => setData('endpoint_retenciones', e.target.value)}
                                                placeholder="https://e-beta.sunat.gob.pe/ol-ti-itemision-otroscpe-gem-beta/billService"
                                                className={errors.endpoint_retenciones ? 'border-red-500' : ''}
                                            />
                                            {errors.endpoint_retenciones && (
                                                <p className="text-sm text-red-500 mt-1">{errors.endpoint_retenciones}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div> */}
                        </CardContent>
                    </Card>

                    {/* Series de Documentos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Series de Documentos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <Label htmlFor="invoice_series">Serie Facturas</Label>
                                    <Input
                                        id="invoice_series"
                                        value={data.invoice_series}
                                        onChange={(e) => setData('invoice_series', e.target.value)}
                                        placeholder="F001"
                                        maxLength={4}
                                        className={errors.invoice_series ? 'border-red-500' : ''}
                                    />
                                    {errors.invoice_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.invoice_series}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">Ejemplo: F001</p>
                                </div>
                                <div>
                                    <Label htmlFor="receipt_series">Serie Boletas</Label>
                                    <Input
                                        id="receipt_series"
                                        value={data.receipt_series}
                                        onChange={(e) => setData('receipt_series', e.target.value)}
                                        placeholder="B001"
                                        maxLength={4}
                                        className={errors.receipt_series ? 'border-red-500' : ''}
                                    />
                                    {errors.receipt_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.receipt_series}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">Ejemplo: B001</p>
                                </div>
                                <div>
                                    <Label htmlFor="credit_note_series">Serie Notas de Crédito</Label>
                                    <Input
                                        id="credit_note_series"
                                        value={data.credit_note_series}
                                        onChange={(e) => setData('credit_note_series', e.target.value)}
                                        placeholder="FC01"
                                        maxLength={4}
                                        className={errors.credit_note_series ? 'border-red-500' : ''}
                                    />
                                    {errors.credit_note_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.credit_note_series}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">Ejemplo: FC01</p>
                                </div>
                                <div>
                                    <Label htmlFor="debit_note_series">Serie Notas de Débito</Label>
                                    <Input
                                        id="debit_note_series"
                                        value={data.debit_note_series}
                                        onChange={(e) => setData('debit_note_series', e.target.value)}
                                        placeholder="FD01"
                                        maxLength={4}
                                        className={errors.debit_note_series ? 'border-red-500' : ''}
                                    />
                                    {errors.debit_note_series && (
                                        <p className="text-sm text-red-500 mt-1">{errors.debit_note_series}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">Ejemplo: FD01</p>
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

                    {/* Configuración de Impresión (Legacy) */}
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
                                <Label htmlFor="receipt_footer">Pie de Página Boletas</Label>
                                <Textarea
                                    id="receipt_footer"
                                    value={data.receipt_footer}
                                    onChange={(e) => setData('receipt_footer', e.target.value)}
                                    placeholder="Texto que aparecerá en el pie de página de las boletas"
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
                                    placeholder="Texto que aparecerá en el pie de página de las notas de crédito/débito"
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
                            {/* Indicador de subida de logo */}
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
                    
                    {/* Espaciado para los botones flotantes */}
                    <div className="pb-20"></div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
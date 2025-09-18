import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Building2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth/auth-split-layout';

type LoginForm = {
    ruc: string;
};

interface TenantInfo {
    id: string;
    company_name: string;
    trade_name: string;
    ruc: string;
    domain: string;
    login_url: string;
    subscription_status: string;
    trial_ends_at: string | null;
    subscription_ends_at: string | null;
}

interface ValidationResponse {
    success: boolean;
    message: string;
    tenant: TenantInfo | null;
    errors?: Record<string, string[]>;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, errors } = useForm<Required<LoginForm>>({
        ruc: '',
    });

    const [validating, setValidating] = useState(false);
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationSuccess, setValidationSuccess] = useState(false);

    // Validar RUC en tiempo real cuando cambie y tenga 13 dígitos
    useEffect(() => {
        const validateRuc = async () => {
            if (data.ruc.length === 13) {
                setValidating(true);
                setValidationError(null);
                setTenantInfo(null);
                setValidationSuccess(false);

                try {
                    const response = await axios.get<ValidationResponse>(`/validate-ruc?ruc=${data.ruc}`, {
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });

                    if (response.data.success && response.data.tenant) {
                        setTenantInfo(response.data.tenant);
                        setValidationSuccess(true);
                        toast.success(`Empresa encontrada: ${response.data.tenant.company_name}`);
                    } else {
                        setValidationError(response.data.message);
                        toast.error(response.data.message);
                    }
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Error validando RUC';
                    setValidationError(errorMessage);
                    toast.error(errorMessage);
                } finally {
                    setValidating(false);
                }
            } else {
                // Reset state si el RUC no tiene 13 dígitos
                setTenantInfo(null);
                setValidationError(null);
                setValidationSuccess(false);
            }
        };

        // Debounce la validación
        const timeoutId = setTimeout(validateRuc, 500);
        return () => clearTimeout(timeoutId);
    }, [data.ruc]);

    const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
        setData('ruc', value);
    };

    const handleTenantLogin = () => {
        if (tenantInfo) {
            window.open(tenantInfo.login_url, '_blank');
        }
    };

    return (
        <AuthLayout
            title="Iniciar sesión en su cuenta"
            description="Ingrese el RUC de su empresa para iniciar sesión en su panel administrativo"
            backgroundImage="/images/ANAHISOFT-02.jpg"
        >
            <Head title="Iniciar sesión" />

            <div className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="ruc">RUC de la Empresa</Label>
                        <div className="relative">
                            <Input
                                id="ruc"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                value={data.ruc}
                                onChange={handleRucChange}
                                placeholder="Ingrese el RUC de su empresa (13 dígitos)"
                                maxLength={13}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                className={`bg-white/50 backdrop-blur-sm dark:bg-gray-900/50 pr-10 ${
                                    validationSuccess ? 'border-green-500' : validationError ? 'border-red-500' : ''
                                }`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {validating ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                                ) : validationSuccess ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : validationError && data.ruc.length === 13 ? (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                ) : null}
                            </div>
                        </div>
                        <InputError message={errors.ruc || validationError} />
                        <p className="text-xs text-muted-foreground">
                            Ingrese el RUC de su empresa para acceder al panel administrativo correspondiente.
                        </p>
                    </div>

                    {/* Información del tenant encontrado */}
                    {tenantInfo && (
                        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                                        <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="font-semibold text-green-900 dark:text-green-100">
                                            Empresa Encontrada
                                        </h3>
                                        <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                                            <p><span className="font-medium">Empresa:</span> {tenantInfo.company_name}</p>
                                            <p><span className="font-medium">RUC:</span> {tenantInfo.ruc}</p>
                                            <p><span className="font-medium">Dominio:</span> {tenantInfo.domain}</p>
                                            <p>
                                                <span className="font-medium">Estado:</span> 
                                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                                    tenantInfo.subscription_status === 'active' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    {tenantInfo.subscription_status === 'active' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </p>
                                        </div>
                                        <Button 
                                            onClick={handleTenantLogin}
                                            className="mt-3 w-full"
                                            variant="default"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Acceder al Panel de {tenantInfo.company_name}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mensaje de error si no se encuentra */}
                    {validationError && data.ruc.length === 13 && (
                        <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
                                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                            RUC no válido
                                        </h3>
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                            {validationError}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="text-center text-sm text-muted-foreground space-y-2 mt-4">
                    <div>
                        ¿No tiene una cuenta?{' '}
                        <TextLink href={route('register')} tabIndex={7}>
                            Registrarse
                        </TextLink>
                    </div>
                    <div>
                        <TextLink href={route('admin.login')} tabIndex={8} className="text-xs">
                            Acceso para administradores →
                        </TextLink>
                    </div>
                </div>
            </div>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
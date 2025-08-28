import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-split-layout';

type LoginForm = {
    ruc: string;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        ruc: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validar que el RUC tenga 13 dígitos
        if (data.ruc.length !== 13) {
            toast.error('El RUC debe tener 13 dígitos');
            return;
        }

        // Post al controlador central
        post(route('validate'), {
            onSuccess: (page) => {
                // Si el backend envía un URL en el response
                const tenantUrl = page.props?.redirect ?? null;
                if (tenantUrl) {
                    window.location.href = tenantUrl; // fuerza redirección cross-domain
                    return;
                }
        
                toast.success('RUC válido. Redirigiendo al login de su empresa...');
            },
            onError: (errs) => {
                if (errs.ruc) toast.error(errs.ruc);
            },
            onFinish: () => reset('ruc'),
        });
        
    };

    return (
        <AuthLayout
            title="Iniciar sesión en su cuenta"
            description="Ingrese el RUC de su empresa para iniciar sesión en su panel administrativo"
            backgroundImage="/images/ANAHISOFT-02.jpg"
        >
            <Head title="Iniciar sesión" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="ruc">RUC de la Empresa</Label>
                        <Input
                            id="ruc"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            value={data.ruc}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
                                setData('ruc', value);
                            }}
                            placeholder="Ingrese el RUC de su empresa (13 dígitos)"
                            maxLength={13}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                        />
                        <InputError message={errors.ruc} />
                        <p className="text-xs text-muted-foreground">
                            Ingrese el RUC de su empresa para acceder al panel administrativo correspondiente.
                        </p>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Continuar
                    </Button>
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
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}

import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-split-layout';

type LoginForm = {
    email: string;
    password: string;
    ruc: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        ruc: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Iniciar sesión en su cuenta" description="Ingrese el RUC de su empresa, su correo y contraseña para iniciar sesión" backgroundImage="/images/ANAHISOFT-02.jpg">
            <Head title="Log in" />

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

                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Contraseña</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={6}>
                                    ¿Olvidó su contraseña?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Contraseña"
                            className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={4}
                        />
                        <Label htmlFor="remember">Recordarme</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Iniciar Sesión
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    ¿No tiene una cuenta?{' '}
                    <TextLink href={route('register')} tabIndex={7}>
                        Registrarse
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}

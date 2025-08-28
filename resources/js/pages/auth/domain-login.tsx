import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-split-layout';

type DomainLoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface DomainLoginProps {
    status?: string;
    canResetPassword: boolean;
    tenantData?: {
        trade_name?: string;
        ruc?: string;
    };
}

export default function DomainLogin({ status, canResetPassword, tenantData }: DomainLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<DomainLoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    // Pre-fill email from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const remember = urlParams.get('remember');
        
        if (email) {
            setData(prev => ({ ...prev, email }));
        }
        if (remember === '1') {
            setData(prev => ({ ...prev, remember: true }));
        }
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Bienvenido de nuevo"
            description="Ingrese su correo y contraseña de su empresa para iniciar sesión en su panel administrativo"
            backgroundImage="/images/ANAHISOFT-02.jpg"
        >
            <Head title="Iniciar sesión" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Contraseña</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    ¿Olvidó su contraseña?
                                </TextLink>
                            )}
                        </div>
                        <div className="flex w-full">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Contraseña"
                                className="rounded-none rounded-l-md border-r-0 border border-input focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="rounded-none rounded-r-md border-l-0 border border-input text-muted-foreground hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </Button>
                        </div>

                        <InputError message={errors.password} />
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Recordarme</Label>
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Iniciar Sesión
                    </Button>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}

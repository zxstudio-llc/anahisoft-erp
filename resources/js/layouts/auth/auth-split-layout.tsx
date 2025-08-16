import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import CookieConsent from '@/components/cookie-consent';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    backgroundImage?: string;
}

export default function AuthSplitLayout({ children, title, description, backgroundImage }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-screen grid-cols-1 lg:grid-cols-2">
            {/* Panel izquierdo con imagen de fondo y contenido */}
            <div className="relative hidden h-full flex-col overflow-hidden bg-muted lg:flex dark:border-r">
                {/* Fondo con efecto de gradiente y superposición */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/40 to-purple-500/40 mix-blend-multiply" />
                    {backgroundImage && (
                        <img
                            src={backgroundImage}
                            alt="Background"
                            className="h-full w-full object-cover opacity-85 transition-all duration-500 hover:scale-105"
                        />
                    )}
                    {/* Patrón de puntos decorativo */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                    {/* Capa de oscurecimiento adicional */}
                    <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Contenido del panel izquierdo */}
                <div className="relative z-20 flex h-full flex-col p-8">
                    {/* Logo y nombre */}
                    <Link 
                        href={route('home')} 
                        className="group flex items-center gap-3 text-lg font-medium text-white transition-colors"
                    >
                        <div className="p-2">
                        	<img
                                className="h-8 w-auto"
                                src="/logo.png"
                                alt="Logo"
                            />
			</div>
                    </Link>

                    {/* Cita */}
                    {quote && (
                        <div className="relative mt-auto">
                            <div className="absolute -left-4 -top-4 text-5xl text-white/20 drop-shadow-lg">"</div>
                            <blockquote className="space-y-4 rounded-xl bg-black/20 p-6 backdrop-blur-md ring-1 ring-white/20">
                                <p className="text-base font-normal leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] tracking-wide">
                                    {quote.message}
                                </p>
                                <footer className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-white/30" />
                                    <cite className="not-italic">
                                        <span className="block text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                            {quote.author}
                                        </span>
                                    </cite>
                                </footer>
                            </blockquote>
                        </div>
                    )}
                </div>
            </div>

            {/* Panel derecho con formulario */}
            <div className="flex h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
                <div className="relative w-full max-w-sm space-y-6">
                    {/* Logo móvil */}
                    <Link 
                        href={route('home')} 
                        className="relative z-20 flex items-center justify-center gap-3 lg:hidden"
                    >
                        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-2 shadow-lg">
                            <AppLogoIcon className="size-8 fill-current text-white drop-shadow sm:size-10" />
                        </div>
                    </Link>

                    {/* Encabezado */}
                    <div className={cn(
                        "flex flex-col gap-3 text-center",
                        "before:mx-auto before:mb-4 before:h-1 before:w-16 before:rounded-full before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500 before:shadow-lg"
                    )}>
                        <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent drop-shadow-sm">
                            {title}
                        </h1>
                        <p className="text-sm text-balance text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Contenido del formulario */}
                    <div className="rounded-xl border bg-white/50 dark:bg-gray-950/50 p-4 shadow-lg backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10">
                        {children}
                    </div>
                </div>
            </div>

            {/* Banner de cookies */}
            <CookieConsent />
        </div>
    );
}

// resources/js/Pages/Admin/Themes/Index.tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

interface Theme {
    id: number;
    name: string;
    type: 'web' | 'dashboard';
    colors: Record<string, string>;
    is_active: boolean;
}

export default function ThemesIndex({ themes }: { themes: Theme[] }) {
    return (
        <AppLayout>
            <Head title="Configuración del Sitio" />
            <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h1 className="text-2xl font-bold mb-6">Gestión de Temas</h1>
                        <p className="text-muted-foreground">
                            Configura la información del sitio web
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.themes.create')}>Crear Nuevo Tema</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {themes.map((theme) => (
                        <Card key={theme.id}>
                            <CardHeader>
                                <CardTitle>{theme.name}</CardTitle>
                                <CardDescription>
                                    Tipo: {theme.type === 'web' ? 'Web Pública' : 'Dashboard Admin'}
                                    {theme.is_active && (
                                        <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                                            Activo
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {Object.entries(theme.colors).map(([key, value]) => (
                                        <div
                                            key={key}
                                            title={`${key}: ${value}`}
                                            className="w-6 h-6 rounded-full border"
                                            style={{ backgroundColor: value }}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" asChild>
                                        <Link href={route('admin.themes.edit', theme.id)}>Editar</Link>
                                    </Button>
                                    {!theme.is_active && (
                                        <Button asChild>
                                            <Link
                                                method="post"
                                                href={route('admin.themes.activate', theme.id)}
                                            >
                                                Activar
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
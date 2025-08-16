import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@inertiajs/react";

interface Theme {
    id: number;
    name: string;
    type: 'web' | 'dashboard';
    is_active: boolean;
}

export default function ThemesIndex({ themes }: { themes: Theme[] }) {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Temas</h1>
                <div className="space-x-2">
                    <Button asChild>
                        <Link href={route('admin.themes.create')}>Nuevo Tema</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {themes.map((theme) => (
                    <Card key={theme.id}>
                        <CardHeader>
                            <CardTitle>{theme.name}</CardTitle>
                            <CardDescription>Tipo: {theme.type}</CardDescription>
                            {theme.is_active && (
                                <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                                    Activo
                                </span>
                            )}
                        </CardHeader>
                        <CardContent className="flex justify-end space-x-2">
                            <Button variant="outline" asChild>
                                <Link href={route('admin.themes.edit', theme.id)}>Editar</Link>
                            </Button>
                            {!theme.is_active && (
                                <Button asChild>
                                    <Link method="post" href={route('admin.themes.activate', theme.id)}>
                                        Activar
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
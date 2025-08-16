import { TenantStatusListener } from '@/components/tenant-status-listener';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CreditCard, Mail } from 'lucide-react';

export default function Expired() {
    return (
        <>
            <TenantStatusListener />
            <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
                <Head title="Suscripción Expirada" />

                <div className="w-full max-w-md">
                    <div className="mb-6 text-center">
                        <AlertTriangle className="mx-auto mb-2 h-12 w-12 text-amber-500" />
                        <h1 className="text-2xl font-bold">Suscripción Expirada</h1>
                        <p className="text-muted-foreground">Su suscripción ha expirado o no está activa.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Renueve su suscripción</CardTitle>
                            <CardDescription>Para continuar utilizando todos los servicios, por favor renueve su suscripción.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-4 rounded-md bg-muted/50 p-4">
                                <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="font-medium">Renovar ahora</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Renueve su suscripción para seguir utilizando todas las funcionalidades.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 rounded-md bg-muted/50 p-4">
                                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="font-medium">Contactar soporte</h3>
                                    <p className="text-sm text-muted-foreground">
                                        ¿Tiene problemas con su suscripción? Contáctenos para obtener ayuda.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                            <Button className="w-full" asChild>
                                <Link href={route('subscription.upgrade')}>Renovar Suscripción</Link>
                            </Button>
                            <Button variant="outline" className="w-full" asChild>
                                <a href="mailto:soporte@ejemplo.com">Contactar Soporte</a>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}

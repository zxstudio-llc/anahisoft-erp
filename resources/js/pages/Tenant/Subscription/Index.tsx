import { Props } from '@/common/interfaces/subscription-plan.interface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Calendar, Check, FileText } from 'lucide-react';

export default function Index({ currentPlan, availablePlans, subscriptionStatus, invoiceUsage }: Props) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusBadge = () => {
        if (!subscriptionStatus.isActive) {
            return <Badge variant="destructive">Inactiva</Badge>;
        }
        if (subscriptionStatus.onTrial) {
            return <Badge>En Prueba</Badge>;
        }
        return <Badge variant="outline">Activa</Badge>;
    };

    const getDaysRemaining = () => {
        const endDate = subscriptionStatus.onTrial ? subscriptionStatus.trialEndsAt : subscriptionStatus.subscriptionEndsAt;

        if (!endDate) return null;

        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    };

    const daysRemaining = getDaysRemaining();

    return (
        <AppLayout>
            <Head title="Suscripción" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header con días restantes */}
                {subscriptionStatus.onTrial && daysRemaining !== null && (
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {daysRemaining} días de prueba gratuita restantes
                        </p>
                    </div>
                )}

                <h1 className="text-2xl font-bold">Detalles del Plan</h1>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Card Principal - Detalles del Plan */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-primary p-3">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm text-muted-foreground font-black">Suscripción</CardTitle>
                                        <CardTitle className="text-md">Anahisoft ERP + Facturación</CardTitle>
                                        <CardDescription className="mt-1">
                                            {subscriptionStatus.isActive ? 'Su suscripción está activa' : 'Su suscripción no está activa'}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className='flex flex-col justify-end items-end'>
                                    <div>
                                    {getStatusBadge()}
                                    </div>
                                    <div>
                                        {subscriptionStatus.onTrial && (
                                            <Button variant="link" className="flex-1 no-underline hover:no-underline focus:no-underline cursor-pointer p-0" onClick={() => router.get('/subscription/upgrade')}>
                                                Gestionar Prueba
                                            </Button>
                                        )}
                                        <Button variant="link" className="font-black text-md flex-1 no-underline hover:no-underline focus:no-underline cursor-pointer p-0" onClick={() => router.get('/subscription/upgrade')}>
                                            {currentPlan ? 'Cambiar Plan' : 'Comprar Plan'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {currentPlan ? (
                                <>
                                    {/* Información del Plan */}
                                    <div className="space-y-12">
                                        <div>
                                            <div className='flex items-center'>
                                                <p className="text-sm text-muted-foreground font-black">Plan Actual</p>
                                                <div>
                                                    {subscriptionStatus.onTrial && (
                                                        <Button variant="link" className="flex-1 no-underline hover:no-underline focus:no-underline cursor-pointer" onClick={() => router.get('/subscription/upgrade')}>
                                                            Gestionar Prueba
                                                        </Button>
                                                    )}
                                                    <Button variant="link" className="flex-1 no-underline hover:no-underline focus:no-underline cursor-pointer" onClick={() => router.get('/subscription/upgrade')}>
                                                        {currentPlan ? 'Cambiar Plan' : 'Comprar Plan'}
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold">{currentPlan.name}</p>
                                        </div>

                                        {/* Features del Plan */}
                                        <div className="space-y-2">
                                            <div className='flex items-center'>
                                                <p className="text-sm text-muted-foreground font-black">Características del Plan</p>
                                            </div>
                                            <ul className="space-y-2">
                                                <li className="flex items-center text-sm">
                                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                                    <span>
                                                        {currentPlan.invoice_limit === 0
                                                            ? 'Facturas ilimitadas'
                                                            : `${currentPlan.invoice_limit} facturas/mes`}
                                                    </span>
                                                </li>
                                                {currentPlan.features?.map((feature, index) => (
                                                    <li key={index} className="flex items-center text-sm">
                                                        <Check className="mr-2 h-4 w-4 text-primary" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {daysRemaining !== null && (
                                            <div className="rounded-lg border bg-muted/50 p-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                                                        <span className="text-sm font-medium">
                                                            {subscriptionStatus.onTrial ? 'Periodo de prueba' : 'Suscripción'} expira en:
                                                        </span>
                                                    </div>
                                                    <span className="font-bold">{daysRemaining} días</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className="h-2 rounded-full bg-primary"
                                                        style={{ width: `${Math.min((daysRemaining / 30) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Fecha de expiración:{' '}
                                                    {formatDate(
                                                        subscriptionStatus.onTrial
                                                            ? subscriptionStatus.trialEndsAt
                                                            : subscriptionStatus.subscriptionEndsAt,
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
                                    <AlertTriangle className="mr-3 h-5 w-5 text-amber-500" />
                                    <p className="text-sm">No tiene un plan de suscripción activo. Por favor, seleccione un plan.</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-3">
                            {subscriptionStatus.onTrial && (
                                <Button variant="outline" className="flex-1" onClick={() => router.get('/subscription/upgrade')}>
                                    Gestionar Prueba
                                </Button>
                            )}
                            <Button className="flex-1" onClick={() => router.get('/subscription/upgrade')}>
                                {currentPlan ? 'Cambiar Plan' : 'Comprar Plan'}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Card Secundaria - Uso de Facturas */}
                    <Card className='h-2/4'>
                        <CardHeader>
                            <CardTitle>Uso de Facturas</CardTitle>
                            <CardDescription>Periodo actual</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Este mes</span>
                                    <span className="text-2xl font-bold">
                                        {invoiceUsage.monthly}
                                    </span>
                                </div>
                                {invoiceUsage.limit > 0 && (
                                    <>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>de {invoiceUsage.limit} disponibles</span>
                                            <span>{invoiceUsage.percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className="h-2 rounded-full bg-primary transition-all"
                                                style={{ width: `${Math.min(invoiceUsage.percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </>
                                )}
                                {invoiceUsage.limit === 0 && (
                                    <p className="text-xs text-muted-foreground">Facturas ilimitadas</p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total emitidas</span>
                                    <span className="font-medium">{invoiceUsage.total}</span>
                                </div>
                            </div>
                        </CardContent>
                        {currentPlan && (
                            <CardFooter>
                                <Button variant="outline" className="w-full" size="sm">
                                    Ver facturas
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
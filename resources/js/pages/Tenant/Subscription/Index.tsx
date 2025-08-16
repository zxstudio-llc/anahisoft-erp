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
            return <Badge>Periodo de Prueba</Badge>;
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
                <h1 className="mb-6 text-2xl font-bold">Suscripción</h1>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        {/* Estado de la suscripción */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Estado de la Suscripción</CardTitle>
                                    {getStatusBadge()}
                                </div>
                                <CardDescription>
                                    {subscriptionStatus.isActive ? 'Su suscripción está activa' : 'Su suscripción no está activa'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentPlan ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Plan Actual</p>
                                                <p className="text-lg font-medium">{currentPlan.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Precio</p>
                                                <p className="text-lg font-medium">
                                                    {currentPlan.price.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                                                    <span className="text-sm text-muted-foreground">
                                                        /{currentPlan.billing_period === 'monthly' ? 'mes' : 'año'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {daysRemaining !== null && (
                                            <div className="rounded-md bg-muted p-4">
                                                <div className="mb-2 flex items-center justify-between">
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
                                    </>
                                ) : (
                                    <div className="flex items-center rounded-md bg-amber-50 p-4 dark:bg-amber-950/20">
                                        <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                                        <p className="text-sm">No tiene un plan de suscripción activo. Por favor, seleccione un plan.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => router.get('/subscription/upgrade')}>
                                    {currentPlan ? 'Cambiar Plan' : 'Seleccionar Plan'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Uso de facturas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Uso de Facturas</CardTitle>
                                <CardDescription>Seguimiento del uso de facturas en el periodo actual</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="mr-2 h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Facturas emitidas este mes:</span>
                                    </div>
                                    <span className="font-bold">
                                        {invoiceUsage.monthly} / {invoiceUsage.limit === 0 ? '∞' : invoiceUsage.limit}
                                    </span>
                                </div>
                                {invoiceUsage.limit > 0 && (
                                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-primary"
                                            style={{ width: `${Math.min(invoiceUsage.percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">Total de facturas emitidas: {invoiceUsage.total}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Planes disponibles */}
                    <div>
                        <h2 className="mb-4 text-lg font-medium">Planes Disponibles</h2>
                        <div className="space-y-4">
                            {availablePlans.map((plan) => (
                                <Card key={plan.id} className={plan.is_featured ? 'border-primary' : ''}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{plan.name}</CardTitle>
                                            {plan.is_featured && <Badge>Recomendado</Badge>}
                                        </div>
                                        <CardDescription>
                                            {plan.price.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                                            <span className="text-xs">/{plan.billing_period === 'monthly' ? 'mes' : 'año'}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <ul className="space-y-1 text-sm">
                                            <li className="flex items-center">
                                                <Check className="mr-2 h-4 w-4 text-primary" />
                                                {plan.invoice_limit === 0 ? 'Facturas ilimitadas' : `${plan.invoice_limit} facturas/mes`}
                                            </li>
                                            {plan.features?.map((feature, index) => (
                                                <li key={index} className="flex items-center">
                                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant={currentPlan?.id === plan.id ? 'outline' : 'default'}
                                            className="w-full"
                                            disabled={currentPlan?.id === plan.id}
                                            onClick={() => router.get('/subscription/upgrade')}
                                        >
                                            {currentPlan?.id === plan.id ? 'Plan Actual' : 'Seleccionar'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

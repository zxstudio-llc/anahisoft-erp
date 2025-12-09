import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Check, CreditCard, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Props } from '@/common/interfaces/tenant/subscription.interface';
import { toast } from 'sonner';
import { Table, TableBody, TableHead, TableCell, TableRow, TableHeader } from '@/components/ui/table';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function Upgrade({ currentPlan, availablePlans = [], subscriptionStatus, userAccount }: Props) {
    const [selectedBillingPeriod, setSelectedBillingPeriod] = useState('monthly');
    const [mercadoPago, setMercadoPago] = useState<any>(null);
    const [preferenceId, setPreferenceId] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        plan_id: currentPlan?.id || '',
        payment_method: 'credit_card',
        billing_period: 'monthly',
    });

    useEffect(() => {
        // Cargar el script de Mercado Pago
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        script.onload = () => {
            const mp = new window.MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
            setMercadoPago(mp);
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePlanSelect = (planId: string) => {
        setData('plan_id', Number(planId));
    };

    const handleBillingPeriodChange = (value: string) => {
        setData('billing_period', value);
        setSelectedBillingPeriod(value);
    };

    const createPreference = async () => {
        try {
            const response = await fetch('/payment/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: data.plan_id,
                    billing_period: data.billing_period,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.preference_id;
        } catch (error) {
            console.error('Error creating preference:', error);
            toast.error('Error al procesar el pago. Por favor intente nuevamente.');
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedPlan = availablePlans.find(plan => plan.id === Number(data.plan_id));
        if (!selectedPlan) {
            toast.error('Por favor seleccione un plan');
            return;
        }

        // Si el plan tiene precio, crear preferencia de pago
        if (selectedPlan.price > 0) {
            const preferenceId = await createPreference();
            if (!preferenceId) return;

            setPreferenceId(preferenceId);

            // Iniciar el checkout de Mercado Pago
            if (mercadoPago) {
                mercadoPago.checkout({
                    preference: {
                        id: preferenceId,
                    },
                    render: {
                        container: '#payment-form',
                        label: 'Pagar',
                    },
                });
            }
            return;
        }

        // Si el plan es gratuito, actualizar directamente
        post('/subscription/process-payment');
    };

    const calculatePrice = (basePrice: number, billingPeriod: string) => {
        if (billingPeriod === 'yearly') {
            // Calcular precio anual con 15% de descuento
            const annualPrice = basePrice * 12;
            const discount = annualPrice * 0.15;
            return annualPrice - discount;
        }
        return basePrice;
    };

    const formatPrice = (price: number, billingPeriod: string) => {
        const finalPrice = calculatePrice(price, billingPeriod);
        return `${finalPrice.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}`;
    };

    const getNextChargeDate = () => {
        const today = new Date();
        if (data.billing_period === 'monthly') {
            today.setMonth(today.getMonth() + 1);
        } else {
            today.setFullYear(today.getFullYear() + 1);
        }
        return today.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const selectedPlan = availablePlans.find(p => p.id === Number(data.plan_id));

    return (
        <AppLayout>
            <Head title="Actualizar Suscripción" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-bold">Actualizar Suscripción</h1>

                {subscriptionStatus?.onTrial && subscriptionStatus.trialEndsAt && (
                    <div className="mb-6 rounded-md bg-blue-50 p-4 dark:bg-blue-950/20">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Estás en periodo de prueba. Termina en {new Date(subscriptionStatus.trialEndsAt).toLocaleDateString('es-ES')}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-3">
                        <Card  className='py-4'>
                            <CardContent>
                            <div className='flex items-center justify-between'>
                                    <Label>
                                        Detalles de la cuenta:
                                    </Label>
                                    <div>
                                        <Button variant="link" className="flex-1 no-underline hover:no-underline focus:no-underline cursor-pointer items-end p-0" onClick={() => router.get('/settings/profile')}>
                                            Editar
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <Label>Email:</Label>
                                    <span className="font-medium">{userAccount.email || 'No disponible'}</span>
                                </div>
                            </CardContent>
                        </Card>
                        {Array.isArray(availablePlans) && availablePlans.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Seleccione un Plan</CardTitle>
                                    <CardDescription>
                                        {data.billing_period === 'yearly'
                                            ? 'Planes anuales con 15% de descuento'
                                            : 'Planes con facturación mensual'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Plan</TableHead>
                                                <TableHead className="w-[100px]">Ciclo de facturación</TableHead>
                                                <TableHead >Detalles</TableHead>
                                                <TableHead className="text-right">Monto</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-medium">
                                                    <Select
                                                        value={String(data.plan_id)}
                                                        onValueChange={handlePlanSelect}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Seleccionar plan" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {availablePlans.map((plan) => (
                                                                    <SelectItem key={plan.id} value={String(plan.id)}>
                                                                        <div className="flex items-center gap-2">
                                                                            <span>{plan.name}</span>
                                                                            {plan.is_featured && (
                                                                                <Badge className="ml-1 text-xs">Recomendado</Badge>
                                                                            )}
                                                                            {currentPlan?.id === plan.id && (
                                                                                <Badge variant="outline" className="ml-1 text-xs">Actual</Badge>
                                                                            )}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.plan_id && (
                                                        <p className="mt-1 text-xs text-red-500">{errors.plan_id}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={data.billing_period}
                                                        onValueChange={handleBillingPeriodChange}
                                                    >
                                                        <SelectTrigger className="w-[150px]">
                                                            <SelectValue placeholder="Seleccionar periodo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="monthly">
                                                                    <span>Mensual</span>
                                                                </SelectItem>
                                                                <SelectItem value="yearly">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span>Anual</span>
                                                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs">
                                                                            -15%
                                                                        </Badge>
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    {selectedPlan ? (
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                {selectedPlan.invoice_limit === 0
                                                                    ? 'Facturas ilimitadas'
                                                                    : `${selectedPlan.invoice_limit} facturas/mes`}
                                                            </p>
                                                            {selectedPlan.features && selectedPlan.features.length > 0 && (
                                                                <ul className="space-y-0.5">
                                                                    {selectedPlan.features.slice(0, 2).map((feature, index) => (
                                                                        <li key={index} className="flex items-center text-xs text-muted-foreground">
                                                                            <Check className="mr-1 h-3 w-3 text-primary" />
                                                                            {feature}
                                                                        </li>
                                                                    ))}
                                                                    {selectedPlan.features.length > 3 && (
                                                                        <li className="text-xs text-muted-foreground">
                                                                            +{selectedPlan.features.length - 3} más
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">Seleccione un plan</p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {selectedPlan ? (
                                                        <>
                                                            <div className="flex items-baseline justify-end">
                                                                <p className="font-semibold">
                                                                    {formatPrice(selectedPlan.price, data.billing_period)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    /{data.billing_period === 'monthly' ? 'mes' : 'año'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                {data.billing_period === 'yearly' && (
                                                                    <p className="text-xs text-green-600">
                                                                        ~{formatPrice(selectedPlan.price * 0.85, 'monthly')}/mes
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">-</p>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>

                                    {/* Información adicional del plan seleccionado */}
                                    {selectedPlan && selectedPlan.features && selectedPlan.features.length > 3 && (
                                        <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                                            <p className="mb-2 text-sm font-medium">Características completas:</p>
                                            <ul className="grid grid-cols-2 gap-2">
                                                {selectedPlan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center text-sm">
                                                        <Check className="mr-2 h-3 w-3 text-primary" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No hay planes disponibles</CardTitle>
                                    <CardDescription>
                                        Por favor, intente más tarde o contacte con el administrador.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Método de Pago</CardTitle>
                                <CardDescription>Seleccione su método de pago preferido</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div id="payment-form" className="w-full"></div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Resumen de la Suscripción</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {data.plan_id && selectedPlan ? (
                                    <>
                                        {/* Nombre del Plan */}
                                        <div className='flex justify-between'>
                                            <div>
                                                <p className="text-lg font-semibold">{selectedPlan.name}</p>

                                                {data.billing_period === 'yearly' && (
                                                    <p className="text-xs text-green-600">Ahorro del 15% aplicado</p>
                                                )}
                                            </div>
                                            <div>
                                                {selectedPlan.is_featured && (
                                                    <Badge className="mt-1">Recomendado</Badge>
                                                )}
                                                {currentPlan?.id === selectedPlan.id && (
                                                    <Badge variant="default" className="mt-1 ml-2">Plan Actual</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <Item variant={'outline'} className='bg-muted/50'>
                                            <ItemContent>
                                                <ItemTitle className="font-black">Características</ItemTitle>
                                                <div className="text-sm text-muted-foreground">
            <ul className="space-y-1 mt-2">
                {selectedPlan.features && Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 ? (
                    selectedPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-center font-medium">
                            <Check className="mr-1 h-4 w-4 text-primary" />
                            <span className="text-primary">{feature}</span>
                        </li>
                    ))
                ) : (
                    <li className="text-xs italic">
                        No hay características adicionales disponibles
                    </li>
                )}
            </ul>
        </div>
                                            </ItemContent>
                                        </Item>
                                        <Separator className='mt-12'/>
                                        {/* Detalles de Facturación */}
                                        <div >
                                            <div className="flex justify-between text-sm">
                                                <div>
                                                    <p className="font-medium">{selectedPlan.name}</p>
                                                    {data.billing_period === 'monthly' ? 'Mensual' : 'Anual'} <span>con </span>
                                                    {data.payment_method === 'credit_card' ? 'Tarjeta' : 'Transferencia'}
                                                </div>
                                                <span className="font-medium text-right">
                                                    <span>
                                                        {formatPrice(selectedPlan.price, data.billing_period)}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span className="font-medium text-right">
                                                    {formatPrice(selectedPlan.price, data.billing_period)}
                                                </span>
                                            </div>
                                        </div>
                                        <Separator/>
                                        {/* Total */}
                                        <div >
                                            <div className="flex justify-between">
                                                <span className="text-xl font-bold">Total</span>
                                                <div className="text-right">
                                                    <span className="text-xl font-bold">
                                                        {formatPrice(selectedPlan.price, data.billing_period)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Separator />
                                        {/* Próximo cargo */}
                                        <div className="flex flex-row">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-primary break-words text-sm font-medium">
                                                    Próximo cargo el {getNextChargeDate()}
                                                </p>
                                            </div>
                                            <div className="mt-0 text-sm font-medium text-right whitespace-nowrap min-w-[9rem] text-primary">
                                                {formatPrice(selectedPlan.price, data.billing_period)}
                                            </div>
                                        </div>

                                        {/* Términos y condiciones */}
                                        <div className="rounded-md bg-muted/50">
                                            <p className="text-xs text-muted-foreground">
                                                Al hacer clic en 'Pagar y Suscribirse', aceptas nuestros{' '}
                                                <a href="#" className="text-primary underline">
                                                    Términos y Condiciones
                                                </a>{' '}
                                                y{' '}
                                                <a href="#" className="text-primary underline">
                                                    Política de Privacidad
                                                </a>
                                                .
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center rounded-md bg-amber-50 p-4 dark:bg-amber-950/20">
                                        <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                                        <p className="text-sm">Por favor, seleccione un plan para continuar.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Button
                                    className="w-full"
                                    onClick={handleSubmit}
                                    disabled={!data.plan_id || processing}
                                >
                                    {processing ? 'Procesando...' : `Pagar ${selectedPlan ? formatPrice(selectedPlan.price, data.billing_period) : ''} y Suscribirse`}
                                </Button>
                                <div className="text-start text-xs text-muted-foreground flex items-center gap-2">
                                    <Info size={'20'}/>
                                    <p >
                                        Puede ser redirigido a la página de su banco para verificación 3D Secure.
                                    </p>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
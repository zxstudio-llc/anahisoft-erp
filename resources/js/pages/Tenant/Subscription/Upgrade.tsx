import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, Check, CreditCard } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Props } from '@/common/interfaces/tenant/subscription.interface';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function Upgrade({ currentPlan, availablePlans = [], subscriptionStatus }: Props) {
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

    const handlePlanSelect = (planId: number) => {
        setData('plan_id', planId);
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
        return `${finalPrice.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}/${billingPeriod === 'monthly' ? 'mes' : 'año'}`;
    };

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
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Opciones de Facturación</CardTitle>
                                <CardDescription>Primero, seleccione su periodo de facturación preferido</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={data.billing_period}
                                    onValueChange={(value) => {
                                        setData('billing_period', value);
                                        setSelectedBillingPeriod(value);
                                    }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div
                                        className={`flex items-center justify-between rounded-md border p-4 ${
                                            data.billing_period === 'monthly' ? 'border-primary bg-primary/5' : 'border-border'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="monthly" id="monthly" />
                                            <div>
                                                <Label htmlFor="monthly" className="text-base font-medium">
                                                    Mensual
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Facturación cada mes</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`flex items-center justify-between rounded-md border p-4 ${
                                            data.billing_period === 'yearly' ? 'border-primary bg-primary/5' : 'border-border'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="yearly" id="yearly" />
                                            <div>
                                                <Label htmlFor="yearly" className="text-base font-medium">
                                                    Anual
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Facturación cada año</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                            Ahorro 15%
                                        </Badge>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {Array.isArray(availablePlans) && availablePlans.length > 0 ? (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Seleccione un Plan</CardTitle>
                                    <CardDescription>
                                        {data.billing_period === 'yearly' 
                                            ? 'Planes anuales con 15% de descuento' 
                                            : 'Planes con facturación mensual'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <RadioGroup value={String(data.plan_id)} onValueChange={(value) => handlePlanSelect(Number(value))}>
                                            {availablePlans.map((plan) => (
                                                <div
                                                    key={plan.id}
                                                    className={`flex items-center justify-between rounded-md border p-4 ${
                                                        data.plan_id === plan.id ? 'border-primary bg-primary/5' : 'border-border'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <RadioGroupItem value={String(plan.id)} id={`plan-${plan.id}`} />
                                                        <div>
                                                            <Label htmlFor={`plan-${plan.id}`} className="flex items-center text-base font-medium">
                                                                {plan.name}
                                                                {plan.is_featured && <Badge className="ml-2">Recomendado</Badge>}
                                                                {currentPlan?.id === plan.id && <Badge variant="outline" className="ml-2">Plan Actual</Badge>}
                                                            </Label>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {plan.invoice_limit === 0 ? 'Facturas ilimitadas' : `${plan.invoice_limit} facturas/mes`}
                                                            </p>
                                                            <ul className="mt-2 space-y-1">
                                                                {plan.features?.map((feature, index) => (
                                                                    <li key={index} className="flex items-center text-sm">
                                                                        <Check className="mr-2 h-3 w-3 text-primary" />
                                                                        {feature}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">{formatPrice(plan.price, selectedBillingPeriod)}</p>
                                                        {selectedBillingPeriod === 'yearly' && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Precio mensual: {formatPrice(plan.price, 'monthly')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>

                                        {errors.plan_id && <div className="text-sm text-red-500">{errors.plan_id}</div>}
                                    </div>
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

                        <Card className="mt-6">
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
                            <CardContent className="space-y-4">
                                {data.plan_id ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Plan:</span>
                                            <span className="font-medium">
                                                {availablePlans.find((p) => p.id === Number(data.plan_id))?.name || 'Plan seleccionado'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Periodo:</span>
                                            <span className="font-medium">{data.billing_period === 'monthly' ? 'Mensual' : 'Anual'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Método de pago:</span>
                                            <span className="font-medium">{data.payment_method === 'credit_card' ? 'Tarjeta' : 'Transferencia'}</span>
                                        </div>
                                        <div className="mt-4 border-t pt-4">
                                            <div className="flex justify-between">
                                                <span className="font-medium">Total a pagar:</span>
                                                <div className="text-right">
                                                    <span className="font-bold">
                                                        {formatPrice(
                                                            availablePlans.find((p) => p.id === Number(data.plan_id))?.price || 0,
                                                            data.billing_period,
                                                        )}
                                                    </span>
                                                    {data.billing_period === 'yearly' && (
                                                        <p className="text-xs text-green-600">Ahorro del 15% aplicado</p>
                                                    )}
                                                </div>
                                            </div>
                                                    {data.billing_period === 'yearly' && (
                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            Equivalente a {formatPrice(
                                                                (availablePlans.find((p) => p.id === Number(data.plan_id))?.price || 0) * 0.85,
                                                                'monthly'
                                                            )} por mes
                                                        </p>
                                                    )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center rounded-md bg-amber-50 p-4 dark:bg-amber-950/20">
                                        <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                                        <p className="text-sm">Por favor, seleccione un plan para continuar.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    onClick={handleSubmit} 
                                    disabled={!data.plan_id || processing}
                                >
                                    {processing ? 'Procesando...' : 'Confirmar y Pagar'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

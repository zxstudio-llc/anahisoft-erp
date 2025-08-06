import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { RucValidationData } from '@/common/interfaces/ruc.interface';
import { SubscriptionPlan } from '@/common/interfaces/subscription-plan.interface';
import InputError from '@/components/app/input-error';
import PaymentModal from '@/components/app/payment-modal';
import TextLink from '@/components/app/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-split-layout';
import Api from '@/lib/api';
import { PlanSelector } from '@/components/app/plan-selector';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    company_name: string;
    ruc: string;
    domain: string;
    plan_id: number | undefined;
    billing_period: string;
    status?: string;
    condition?: string;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
    registration_date?: string;
    trade_name?: string;
    emission_system?: string;
    accounting_system?: string;
    foreign_trade_activity?: string;
    economic_activities?: string[];
    payment_vouchers?: string[];
    electronic_systems?: string[];
    electronic_emission_date?: string;
    electronic_vouchers?: string[];
    ple_date?: string;
    registries?: string[];
    withdrawal_date?: string;
    profession?: string;
    ubigeo?: string;
    capital?: number;
    // Campos de pago
    card_number: string;
    card_expiry: string;
    card_cvv: string;
};

interface RegisterProps {
    plans: SubscriptionPlan[];
    plan_id: string;
    selectedPlanId: number | null;
    app_domain: string;
    billing_period: 'monthly' | 'yearly';
}

export default function Register({ plans, selectedPlanId, app_domain, billing_period = 'monthly' }: RegisterProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        ruc: '',
        domain: '',
        plan_id: selectedPlanId?.toString() ?? plans.find(p => p.price === 0)?.id.toString() ?? '',
        billing_period: billing_period ?? 'monthly',
        // Initialize additional fields
        status: '',
        condition: '',
        address: '',
        department: '',
        province: '',
        district: '',
        registration_date: '',
        trade_name: '',
        emission_system: '',
        accounting_system: '',
        foreign_trade_activity: '',
        economic_activities: [],
        payment_vouchers: [],
        electronic_systems: [],
        electronic_emission_date: '',
        electronic_vouchers: [],
        ple_date: '',
        registries: [],
        withdrawal_date: '',
        profession: '',
        ubigeo: '',
        capital: 0,
        // Campos de pago
        card_number: '',
        card_expiry: '',
        card_cvv: '',
    });

    const [validatingRuc, setValidatingRuc] = useState(false);
    const [rucValidated, setRucValidated] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const selectedPlan = plans.find(p => p.id === Number(data.plan_id));


    const calculatePrice = (basePrice: number, billingPeriod: string) => {
        if (billingPeriod === 'yearly') {
            const annualPrice = basePrice * 12;
            const discount = annualPrice * 0.15;
            return annualPrice - discount;
        }
        return basePrice;
    };

    const handleRegistration = (paymentId: string) => {
        if (!data.plan_id) {
            toast.error('Debe seleccionar un plan.');
            return;
        }
        
        const formData = {
            ...data,
            payment_id: paymentId,
        };

        post(route('register'), {
            preserveScroll: true,
            onSuccess: (page: any) => {
              const tenantUrl = page.props?.tenant_url ?? page?.tenant_url;
              if (tenantUrl) {
                window.location.href = tenantUrl;
              } else {
                toast.error('No se pudo redirigir al tenant');
              }
            },
          });
    };

    const handlePaymentSuccess = (paymentId: string) => {
        setShowPaymentModal(false);
        handleRegistration(paymentId);
    };

    const handlePaymentError = (error: Error) => {
        console.error('Error al procesar el pago:', error);
        toast.error('Error al procesar el pago. Por favor intente nuevamente.');
    };

    const validateRuc = async (ruc: string) => {
        if (ruc.length !== 13) return;
    
        setValidatingRuc(true);
        setRucValidated(false);
        clearErrors('ruc');
    
        try {
            const result = await Api.validateRuc(ruc);
    
            if (!result.success) {
                throw new Error(result.message || 'No se pudo validar el RUC');
            }
    
            setData(prev => ({
                ...prev,
                ruc,
                company_name: result.data.businessName,
                status: result.data.status,
                condition: result.data.condition,
                address: result.data.address,
                department: result.data.department,
                province: result.data.province,
                district: result.data.district,
                registration_date: result.data.registrationDate,
                trade_name: result.data.tradeName,
                accounting_system: result.data.accountingSystem,
                economic_activities: result.data.economicActivities,
                // ... otros campos
            }));
            
            setRucValidated(true);
        } catch (error) {
            setError('ruc', error instanceof Error ? error.message : 'Error validando RUC');
            setRucValidated(false);
        } finally {
            setValidatingRuc(false);
        }
    };

    const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);

        clearErrors('ruc');

        setData((prevData) => ({
            ...prevData,
            ruc: value,
            company_name: value.length === 13 ? prevData.company_name : '',
        }));

        setRucValidated(false);

        if (value.length === 13) {
            validateRuc(value);
        }
    };

    const handleRucPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData
            .getData('text')
            .replace(/[^0-9]/g, '')
            .slice(0, 13);

        setData((data) => ({
            ...data,
            ruc: pastedText,
        }));

        if (pastedText.length === 13) {
            validateRuc(pastedText);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
            if (currentStep < 3) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

        if (currentStep === 1) {
            if (!data.ruc || !data.company_name || !data.domain) {
                toast.error('Por favor complete todos los campos obligatorios');
                scrollToTop();
                return;
            }
            if (!rucValidated) {
                toast.error('Por favor valide el RUC antes de continuar');
                scrollToTop();
                return;
            }
        }

        if (currentStep === 4) {
            if (!data.name || !data.email || !data.password || !data.password_confirmation) {
                toast.error('Por favor complete todos los campos obligatorios');
                scrollToTop();
                return;
            }

            if (selectedPlan && selectedPlan.price > 0) {
                setShowPaymentModal(true);
                return;
            }

            handleRegistration('');
        } else {
            nextStep();
        }
    };

    const formatPrice = (price: number, billingPeriod: string) => {
        const finalPrice = calculatePrice(price, billingPeriod);
        return `USD ${finalPrice.toLocaleString('es-US')}/${billingPeriod === 'monthly' ? 'mes' : 'año'}`;
    };

    const renderStep1 = () => (
        <>
            <div className="grid gap-2">
                <Label htmlFor="ruc">
                    RUC <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <Input
                        id="ruc"
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        value={data.ruc}
                        onChange={handleRucChange}
                        onPaste={handleRucPaste}
                        disabled={processing || validatingRuc}
                        placeholder="Número de RUC"
                        maxLength={13}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        className={`bg-white/50 backdrop-blur-sm dark:bg-gray-900/50 ${
                            rucValidated ? 'border-green-500 pr-20' : 'pr-10'
                        } ${validatingRuc ? 'border-yellow-500' : ''}`}
                    />
                    <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
                        {validatingRuc && (
                            <>
                                <LoaderCircle className="h-4 w-4 animate-spin text-yellow-500" />
                                <span className="text-xs text-yellow-500">Validando...</span>
                            </>
                        )}
                        {rucValidated && (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-500">RUC Válido</span>
                            </>
                        )}
                    </div>
                </div>
                <InputError message={errors.ruc} />
                <p className="text-xs text-muted-foreground">Ingrese el RUC de su empresa para validar los datos automáticamente.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="company_name">
                    Razón Social <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="company_name"
                    type="text"
                    required
                    tabIndex={2}
                    value={data.company_name}
                    onChange={(e) => setData('company_name', e.target.value)}
                    disabled={processing || validatingRuc || rucValidated}
                    placeholder="Razón social de la empresa"
                    className={`bg-white/50 backdrop-blur-sm dark:bg-gray-900/50 ${rucValidated ? 'bg-green-50 dark:bg-green-950/10' : ''}`}
                />
                <InputError message={errors.company_name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="domain">
                    Subdominio <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="domain"
                        type="text"
                        required
                        tabIndex={3}
                        value={data.domain}
                        onChange={(e) => setData('domain', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        disabled={processing || !rucValidated}
                        placeholder="miempresa"
                        className="flex-1 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{app_domain}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Este será el dominio donde accederá a su sistema de facturación.</p>
                <InputError message={errors.domain} />
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <div className="grid gap-2">
                <Label htmlFor="trade_name">Nombre Comercial</Label>
                <Input
                    id="trade_name"
                    type="text"
                    value={data.trade_name}
                    onChange={(e) => setData('trade_name', e.target.value)}
                    disabled={processing}
                    placeholder="Nombre comercial"
                    className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                />
                <InputError message={errors.trade_name} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="status">Estado</Label>
                    <Input id="status" type="text" value={data.status} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="condition">Condición</Label>
                    <Input id="condition" type="text" value={data.condition} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" type="text" value={data.address} disabled className="bg-neutral-50 dark:bg-neutral-800" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input id="department" type="text" value={data.department} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="province">Provincia</Label>
                    <Input id="province" type="text" value={data.province} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="district">Distrito</Label>
                    <Input id="district" type="text" value={data.district} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                </div>
            </div>
        </>
    );

    const renderStep3 = () => (
        <>
            <PlanSelector
                data={{
                    plan_id: data.plan_id,
                    billing_period: data.billing_period
                }}
                setData={setData} // Esta es la función correcta de useForm
                errors={errors}
                plans={plans.map(plan => ({
                    id: plan.id.toString(), // Asegurar que sea string
                    name: plan.name,
                    price: plan.price,
                    features: plan.features
                }))}
                formatPrice={(price, period) => {
                    const numericPrice = Number(price) || 0;
                    
                    if (period === "yearly") {
                    const yearlyPrice = numericPrice * 12 * 0.85; // 15% descuento
                    return `US ${yearlyPrice.toLocaleString('es-EC')} / año`;
                    }
                    return `US ${numericPrice.toLocaleString('es-EC')} / mes`;
                }}
            />

            <div className="grid gap-2">
                <Label htmlFor="name">
                    Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    disabled={processing}
                    placeholder="Su nombre completo"
                    className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">
                    Correo <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    disabled={processing}
                    placeholder="correo@ejemplo.com"
                    className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">
                    Contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    disabled={processing}
                    placeholder="Contraseña"
                    className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                />
                <InputError message={errors.password} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password_confirmation">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="password_confirmation"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    disabled={processing}
                    placeholder="Confirmar contraseña"
                    className="bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                />
                <InputError message={errors.password_confirmation} />
            </div>
        </>
    );

    const renderStep4 = () => (
        <>
            <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resumen de tu plan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revisa los detalles de tu plan antes de continuar</p>
            </div>

            {selectedPlan && selectedPlan.price > 0 ? (
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-950/50 dark:to-purple-950/50">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex w-full flex-col items-center gap-2 border-b border-indigo-100 pb-4 dark:border-indigo-800">
                            <h4 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent">
                                {selectedPlan.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {data.billing_period === 'yearly' ? 'Facturación anual' : 'Facturación mensual'}
                            </p>
                            <div className="mt-2">
                                <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Total a pagar</p>
                                <p className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold whitespace-nowrap text-transparent">
                                    {formatPrice(selectedPlan.price, data.billing_period)}
                                </p>
                            </div>
                        </div>

                        <div className="w-full">
                            <ul className="grid grid-cols-1 gap-2">
                                {selectedPlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-950/50 dark:to-purple-950/50">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex w-full flex-col items-center gap-2 border-b border-indigo-100 pb-4 dark:border-indigo-800">
                            <h4 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent">
                                Plan de Prueba Gratuito
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">30 días sin costo</p>
                            <div className="mt-2">
                                <p className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent">
                                    Gratis
                                </p>
                            </div>
                        </div>

                        <div className="w-full space-y-2">
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Incluye:</h5>
                            <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                    <span className="text-sm">Hasta 100 facturas mensuales</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                    <span className="text-sm">Validación de documentos</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                    <span className="text-sm">Soporte por correo</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                    <span className="text-sm">API básica</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                    <span className="text-sm">1 usuario</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <AuthLayout
            title="Crear una cuenta"
            description="Ingrese su información para crear su cuenta y comenzar a facturar"
        >
            <Head title="Register" />

            <div className="mb-6">
                <div className="relative flex items-center justify-between">
                    <div className="absolute top-4 right-0 left-0 -z-10 h-[2px] bg-gray-200" />

                    <div
                        className="absolute top-4 left-0 -z-10 h-[2px] bg-green-500 transition-all duration-500 ease-in-out"
                        style={{
                            width: `${((currentStep - 1) / 3) * 100}%`,
                        }}
                    />

                    {[
                        { step: 1, label: 'Empresa' },
                        { step: 2, label: 'Detalles' },
                        { step: 3, label: 'Cuenta' },
                        { step: 4, label: 'Pago' },
                    ].map(({ step, label }) => (
                        <div key={step} className="relative flex flex-col items-center">
                            <div
                                className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-in-out ${
                                    currentStep === step
                                        ? 'bg-indigo-600 text-white'
                                        : currentStep > step
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                                } ${currentStep === step ? 'ring-2 ring-indigo-100 dark:ring-indigo-900/30' : ''} `}
                            >
                                {currentStep > step ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-sm font-medium">{step}</span>
                                )}
                            </div>
                            <div
                                className={`text-xs font-medium transition-colors duration-300 ${
                                    currentStep === step
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : currentStep > step
                                          ? 'text-green-500'
                                          : 'text-gray-400 dark:text-gray-500'
                                }`}
                            >
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={submit}>
                <div className="grid max-h-[calc(100vh-24rem)] gap-4 overflow-y-auto">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                </div>

                <div className="mt-auto flex justify-between gap-4">
                    {currentStep > 1 && (
                        <Button type="button" variant="outline" onClick={prevStep} disabled={processing} className="h-auto px-3 py-1.5 text-sm">
                            Anterior
                        </Button>
                    )}

                    {currentStep < 4 ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            disabled={processing || validatingRuc || (currentStep === 1 && !rucValidated)}
                            className="ml-auto h-auto w-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-sm text-white hover:from-indigo-700 hover:to-purple-700"
                        >
                            Siguiente
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={processing}
                            className="ml-auto h-auto w-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-sm text-white hover:from-indigo-700 hover:to-purple-700"
                        >
                            {processing ? 'Creando...' : selectedPlan ? 'Pagar y Crear Cuenta' : 'Crear Cuenta'}
                        </Button>
                    )}
                </div>

                <div className="text-center text-xs text-muted-foreground">
                    ¿Ya tienes una cuenta? <TextLink href={route('login')}>Iniciar sesión</TextLink>
                </div>
            </form>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                amount={selectedPlan ? calculatePrice(selectedPlan.price, data.billing_period) : 0}
                planId={selectedPlan?.id || 0}
                billingPeriod={data.billing_period}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
            />
        </AuthLayout>
    );
}

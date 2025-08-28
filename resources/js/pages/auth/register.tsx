import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SubscriptionPlan } from '@/common/interfaces/subscription-plan.interface';
import InputError from '@/components/input-error';
import PaymentModal from '@/components/payment-modal';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-split-layout';
import Api from '@/lib/api';
import axios from 'axios';

type RegisterForm = {
    // Campos básicos de registro
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    company_name: string; // Mapeado desde business_name
    ruc: string;          // Mapeado desde identification
    domain: string;
    plan_id: number | undefined;
    billing_period: string;
    
    // Campos SUNAT completos
    identification: string;        // RUC (ya existe como 'ruc' pero lo agregamos por consistencia)
    business_name: string;         // Razón social (ya existe como company_name)
    legal_name: string;            // Nombre legal (nuevo)
    commercial_name?: string;      // Nombre comercial (similar a trade_name)
    status: string;                // Estado del contribuyente
    taxpayer_status: string;       // Condición del contribuyente (antes 'condition')
    head_office_address: string;   // Dirección principal (antes 'address')
    
    // Estructuras anidadas
    taxpayer_dates?: {
        start_date: string;        // Fecha de inscripción (antes 'registration_date')
    };
    
    establishments?: Array<{
        address: string;
        department?: string;
        province?: string;
        district?: string;
        parish?: string;           // Nuevo campo
    }>;
    
    // Campos existentes que se mantienen
    trade_name?: string;          // Nombre comercial (alternativo a commercial_name)
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
    
    // Campos de ubicación directos (para fácil acceso)
    department?: string;          // Podría venir de establishments[0]
    province?: string;            // Podría venir de establishments[0]
    district?: string;            // Podría venir de establishments[0]
    parish?: string;              // Nuevo campo, podría venir de establishments[0]
    
    // Campos de pago
    card_number: string;
    card_expiry: string;
    card_cvv: string;
    
    // Campos calculados o auxiliares
    registration_date?: string;   // Alias para taxpayer_dates.start_date
    condition?: string;           // Alias para taxpayer_status (mantener compatibilidad)
    address?: string;             // Alias para head_office_address (mantener compatibilidad)
};

interface RegisterProps {
    freePlan?: {
        id: number;
        name: string;
        price: number;
        features: string[];
    };
    selectedPlan?: SubscriptionPlan;
    app_domain: string;
    billing_period?: string;
}

export default function Register({ freePlan, selectedPlan, app_domain, billing_period = 'monthly' }: RegisterProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm<RegisterForm>({
        // Campos básicos de usuario
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        
        // Campos de empresa
        company_name: '',
        ruc: '',
        domain: '',
        plan_id: selectedPlan?.id || freePlan?.id || undefined,
        billing_period: billing_period,
        
        // Campos SUNAT completos
        identification: '', // Equivalente a ruc
        business_name: '', // Equivalente a company_name
        legal_name: '',
        commercial_name: '',
        status: '',
        taxpayer_status: '', // Equivalente a condition
        head_office_address: '', // Equivalente a address
        
        // Estructuras anidadas SUNAT
        taxpayer_dates: {
            start_date: '', // Equivalente a registration_date
        },
        establishments: [{
            address: '',
            department: '',
            province: '',
            district: '',
            parish: '',
        }],
        
        // Campos SUNAT adicionales
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
        
        // Campos de ubicación directos (alternativos a establishments[0])
        department: '',
        province: '',
        district: '',
        parish: '',
        
        // Campos de pago
        card_number: '',
        card_expiry: '',
        card_cvv: '',
        
        // Campos alias para compatibilidad (opcionales)
        condition: '', // Alias de taxpayer_status
        address: '',  // Alias de head_office_address
        registration_date: '', // Alias de taxpayer_dates.start_date
    });

    const [validatingRuc, setValidatingRuc] = useState(false);
    const [rucValidated, setRucValidated] = useState(false);

    const parseAddress = (addressString) => {
        if (!addressString) {
            return {
                province: '',
                department: '',
                district: ''
            };
        }
    
        // Dividir por "/" y limpiar espacios
        const parts = addressString.split('/').map(part => part.trim()).filter(part => part.length > 0);
        
        // Función para limpiar texto (capitalizar correctamente)
        const cleanText = (text) => {
            if (!text) return '';
            return text.toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };
    
        // Función para limpiar nombres entre paréntesis
        const removeParentheses = (text) => {
            return text.replace(/\([^)]*\)/g, '').trim();
        };
    
        return {
            province: parts[0] ? cleanText(parts[0]) : '',
            department: parts[1] ? cleanText(parts[1]) : '',
            district: parts[2] ? cleanText(removeParentheses(parts[2])) : ''
        };
    };

    // 2. Funciones de limpieza de dominio (mover aquí)
    const cleanDomainValue = (value) => {
        if (!value) return '';
        
        // 1. Convertir a minúsculas
        let cleanValue = value.toLowerCase();
        
        // 2. Eliminar espacios en blanco (primero y más importante)
        cleanValue = cleanValue.replace(/\s+/g, ''); // Esto elimina TODOS los espacios
        
        // 3. Normalizar caracteres especiales y eliminar tildes
        cleanValue = cleanValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // 4. Reemplazar ñ por n
        cleanValue = cleanValue.replace(/ñ/g, "n");
        
        // 5. Eliminar caracteres no permitidos (solo letras, números y guiones)
        cleanValue = cleanValue.replace(/[^a-z0-9-]/g, "");
        
        // 6. Eliminar guiones al inicio y final
        cleanValue = cleanValue.replace(/^-+|-+$/g, "");
        
        // 7. Reemplazar múltiples guiones consecutivos por uno solo
        cleanValue = cleanValue.replace(/-{2,}/g, "-");
        
        return cleanValue;
    };
    
    // 3. Función personalizada para setear el domain
    const setCleanDomain = (value) => {
        const cleanedValue = cleanDomainValue(value);
        setData('domain', cleanedValue);
        
        // Limpiar errores si los hay
        if (errors.domain) {
            clearErrors('domain');
        }
    };
    
    // 4. Función de validación de dominio
    const validateDomain = (domain) => {
        if (!domain) {
            return 'El subdominio es obligatorio';
        }
        if (domain.length < 3) {
            return 'El subdominio debe tener al menos 3 caracteres';
        }
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(domain)) {
            return 'El subdominio solo puede contener letras, números y guiones internos';
        }
        return null; // No hay errores
    };

    useEffect(() => {
        // Cargar el script de Mercado Pago
        const loadMercadoPago = async () => {
            try {
                const script = document.createElement('script');
                script.src = 'https://sdk.mercadopago.com/js/v2';
                script.type = 'text/javascript';
                script.onload = () => {
                    const mp = new window.MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
                    window.mp = mp;
                };
                document.body.appendChild(script);
            } catch (error) {
                console.error('Error loading MercadoPago script:', error);
                toast.error('Error al cargar el script de Mercado Pago');
            }
        };

        loadMercadoPago();

        return () => {
            const script = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
            if (script) {
                document.body.removeChild(script);
            }
            // Limpiar el controlador del brick si existe
            if (window.cardPaymentBrickController) {
                window.cardPaymentBrickController.unmount();
            }
        };
    }, []);

    const calculatePrice = (basePrice: number, billingPeriod: string) => {
        if (billingPeriod === 'yearly') {
            const annualPrice = basePrice * 12;
            const discount = annualPrice * 0.15;
            return annualPrice - discount;
        }
        return basePrice;
    };

    const formatPrice = (price: number, billingPeriod: string) => {
        const finalPrice = calculatePrice(price, billingPeriod);
        const formatted = new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(finalPrice);
        
        if (billingPeriod === 'yearly') {
            return `${formatted}/año`;
        }
        return `${formatted}/mes`;
    };

    const handleRegistration = async (paymentId: string) => {
        console.log('=== INICIANDO REGISTRO FRONTEND ===');
        const formData = {
            ...data,
            payment_id: paymentId,
            // Include RUC in data JSON structure
            ruc: data.ruc,
        };
        
        console.log('Datos del formulario:', formData);
    
        try {
            // Show loading state immediately
            const loadingToast = toast.loading('Creando su cuenta y configurando su sistema...');
            
            console.log('Enviando petición de registro...');
            
            // Usar Axios directamente para tener más control
            const response = await axios.post(route('register'), formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });
    
            console.log('Respuesta recibida:', response);
            
            // Dismiss loading toast
            toast.dismiss(loadingToast);
    
            if (response.data.success) {
                console.log('Registro exitoso, redirigiendo...');
                toast.success(response.data.message || 'Cuenta creada exitosamente');
                
                // Usar la URL de redirección del servidor
                const redirectUrl = response.data.redirect || `https://${data.domain}.${app_domain}/login`;
                
                console.log('URL de redirección:', redirectUrl);
                
                // Show success message with redirect info
                toast.success('Redirigiendo a su panel administrativo...', {
                    duration: 2000,
                });
                
                // Redireccionar después de mostrar el toast
                setTimeout(() => {
                    console.log('Redirigiendo a:', redirectUrl);
                    window.location.href = redirectUrl;
                }, 2000);
            } else {
                console.error('Registro falló - respuesta no exitosa:', response.data);
                toast.error(response.data.message || 'Error al crear la cuenta');
            }
        } catch (error) {
            console.error('=== ERROR EN REGISTRO FRONTEND ===');
            console.error('Error completo:', error);
            console.error('Respuesta del error:', error.response?.data);
            console.error('Status del error:', error.response?.status);
            console.error('Headers del error:', error.response?.headers);
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                
                if (errorData.errors) {
                    console.error('Errores de validación:', errorData.errors);
                    Object.keys(errorData.errors).forEach((key) => {
                        if (errorData.errors[key]) {
                            toast.error(Array.isArray(errorData.errors[key]) ? errorData.errors[key][0] : errorData.errors[key]);
                        }
                    });
                } else if (errorData.message) {
                    console.error('Mensaje de error:', errorData.message);
                    toast.error(errorData.message);
                } else {
                    console.error('Error sin mensaje específico');
                    toast.error('Error al crear la cuenta. Por favor intente nuevamente.');
                }
            } else {
                console.error('Error sin respuesta del servidor');
                toast.error('Error de conexión. Por favor intente nuevamente.');
            }
        }
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
        // setRucValidated(false);
        clearErrors('ruc');
    
        try {
            // Petición directa con Axios
            const response = await axios.get<RegisterForm>(`/v1/sris/${ruc}`, {
                withCredentials: true, // Necesario para cookies de sesión
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
    
            const result = response.data; // Extraemos los datos de la respuesta
    
            if (result.success && result.data) {
                const addressData = parseAddress(result.data?.address ?? result.data?.head_office_address);

                setData((prevData) => ({
                    ...prevData,

                    ruc: ruc,
                    domain: cleanDomainValue(result.data?.business_name ?? ''),
                    company_name: result.data?.business_name ?? '',
                    status: result.data?.status ?? '',
                    condition: result.data?.condition ?? '',
                    address: result.data?.address ?? result.data?.head_office_address,
                    province: addressData.province,
                    department: addressData.department,
                    district: addressData.district,
                    registration_date: result.data?.registrationDate ?? '',
                    trade_name: result.data?.tradeName ?? result.data?.business_name,
                    emission_system: result.data?.emissionSystem ?? '',
                    accounting_system: result.data?.accountingSystem ?? '',
                    foreign_trade_activity: result.data?.foreignTradeActivity ?? '',
                    economic_activities: result.data?.economicActivities ?? [],
                    payment_vouchers: result.data?.paymentVouchers ?? [],
                    electronic_systems: result.data?.electronicSystems ?? [],
                    electronic_emission_date: result.data?.electronicEmissionDate ?? '',
                    electronic_vouchers: result.data?.electronicVouchers ?? [],
                    ple_date: result.data?.pleDate ?? '',
                    registries: result.data?.registries ?? [],
                    withdrawal_date: result.data?.withdrawalDate ?? '',
                    profession: result.data?.profession ?? '',
                    ubigeo: result.data?.ubigeo ?? '',
                    capital: typeof result.data?.capital === 'number' ? result.data.capital : 0,

                }));
                setRucValidated(true);
            } else {
                setData((prevData) => ({
                    ...prevData,
                    company_name: '',
                }));
                setError('ruc', result.error || 'Error validando RUC');
            }
        } catch (error) {
            console.error('Error validando RUC:', error);
            
            let errorMessage = 'Error validando RUC. Por favor intente nuevamente.';
            
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            setError('ruc', errorMessage);
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
            // Solo limpiar company_name si el RUC cambia y no está validado
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
        // Validar campos del paso actual antes de avanzar
        if (currentStep === 1) {
            // Validar que todos los campos obligatorios estén completos
            if (!data.ruc || !data.company_name || !data.domain) {
                toast.error('Por favor complete todos los campos obligatorios');
                return;
            }
            
            // Validar que el RUC esté validado
            if (!rucValidated) {
                toast.error('Por favor valide el RUC antes de continuar');
                return;
            }
            
            // Validar el dominio específicamente
            const domainError = validateDomain(data.domain);
            if (domainError) {
                setError('domain', domainError);
                toast.error('Por favor corrija los errores en el subdominio');
                return;
            }
            
            // Verificar que no haya errores de validación pendientes
            if (errors.domain) {
                toast.error('Por favor corrija los errores en el subdominio');
                return;
            }
        }
        
        // Si todas las validaciones pasan, avanzar al siguiente paso
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
            // Solo hacer scroll si no es el último paso
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

    const submit = async (e) => {
        e.preventDefault();
    
        const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    
        // Validar campos del paso actual
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
            
            // Validar el dominio
            const domainError = validateDomain(data.domain);
            if (domainError) {
                setError('domain', domainError);
                toast.error('Por favor corrija los errores en el subdominio');
                scrollToTop();
                return;
            }
            
            // Verificar errores pendientes
            if (errors.domain) {
                toast.error('Por favor corrija los errores en el subdominio');
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
    
            // Si el plan es pagado, mostrar el modal de pago
            if (selectedPlan && selectedPlan.price > 0) {
                setShowPaymentModal(true);
                return;
            }
    
            // Si el plan es gratuito, proceder con el registro normal
            handleRegistration('');
        } else {
            nextStep();
        }
    };
    
    // 3. useEffect para limpiar automáticamente cuando domain cambie desde otro lugar
    useEffect(() => {
        if (data.domain) {
            const cleanedValue = cleanDomainValue(data.domain);
            // Solo actualizar si el valor cambió después de la limpieza
            if (cleanedValue !== data.domain) {
                setData('domain', cleanedValue);
            }
        }
    }, [data.domain]);

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
                        onChange={(e) => {
                            // Usar la función de limpieza centralizada
                            setCleanDomain(e.target.value);
                        }}
                        onBlur={(e) => {
                            // Validación al salir del campo
                            const error = validateDomain(data.domain);
                            if (error) {
                                setError('domain', error);
                            } else {
                                clearErrors('domain');
                            }
                        }}
                        disabled={processing || !rucValidated}
                        placeholder="miempresa"
                        className="flex-1 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{app_domain}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Este será el dominio donde accederá a su sistema de facturación.
                    <br />
                    Solo se permiten letras minúsculas, números y guiones internos (no al inicio/final).
                </p>
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

            <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" type="text" value={data.address} disabled className="bg-neutral-50 dark:bg-neutral-800" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">

                <div className="grid gap-2">
                    <Label htmlFor="province">Provincia</Label>
                    <Input id="province" type="text" value={data.province} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="department">Ciudad</Label>
                    <Input id="department" type="text" value={data.department} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="district">Sector</Label>
                    <Input id="district" type="text" value={data.district} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                </div>
            </div>
        </>
    );

    const renderStep3 = () => (
        <>
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
                        {/* Encabezado del plan centrado */}
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

                        {/* Lista de características */}
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
                        {/* Encabezado del plan gratuito centrado */}
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

                        {/* Lista de características más compacta */}
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
            backgroundImage="/images/ANAHISOFT-01.jpg"
        >
            <Head title="Register" />

            <div className="mb-6">
                <div className="relative flex items-center justify-between">
                    {/* Línea conectora base */}
                    <div className="absolute top-4 right-0 left-0 -z-10 h-[2px] bg-gray-200" />

                    {/* Línea de progreso */}
                    <div
                        className="absolute top-4 left-0 -z-10 h-[2px] bg-green-500 transition-all duration-500 ease-in-out"
                        style={{
                            width: `${((currentStep - 1) / 3) * 100}%`,
                        }}
                    />

                    {/* Indicadores de pasos */}
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
                            disabled={
                                processing || 
                                validatingRuc || 
                                (currentStep === 1 && (!rucValidated || errors.domain || !data.domain))
                            }
                            className="ml-auto h-auto w-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-sm text-white hover:from-indigo-700 hover:to-purple-700"
                        >
                            Siguiente
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={(e) => submit(e)}
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

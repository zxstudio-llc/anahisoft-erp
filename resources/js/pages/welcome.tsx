import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Receipt, Shield, Zap, Building2, Check } from 'lucide-react';
import Navbar from '@/components/landing/navbar';
import Footer from '@/components/landing/footer';
import { SubscriptionPlan } from '@/common/interfaces/subscription-plan.interface';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const features = [
    {
        icon: Receipt,
        title: 'Facturación Electrónica',
        description: 'Emite comprobantes electrónicos válidos ante SRI de forma rápida y sencilla.'
    },
    {
        icon: Shield,
        title: 'Validación de Documentos',
        description: 'Valida RUC en tiempo real para asegurar la precisión de tus documentos.'
    },
    {
        icon: Zap,
        title: 'API Integrada',
        description: 'Integra la facturación con tu sistema actual mediante nuestra API REST.'
    },
    {
        icon: Building2,
        title: 'Multi-empresa',
        description: 'Gestiona múltiples empresas desde una sola plataforma de forma organizada.'
    }
];

const benefits = [
    'Cumplimiento con normativas SRI',
    'Soporte técnico especializado',
    'Almacenamiento seguro en la nube',
    'Reportes y dashboard en tiempo real',
    'Acceso desde cualquier dispositivo',
    'Actualizaciones automáticas'
];

interface Props {
    plans: SubscriptionPlan[];
}

export default function Welcome({ plans }: Props) {
    const [selectedBillingPeriod, setSelectedBillingPeriod] = useState('monthly');

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
        return `$ ${finalPrice.toLocaleString('es-EC')} /${billingPeriod === 'monthly' ? 'mes' : 'año'}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-16">
                {/* Background decoration */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute -inset-[10px] opacity-50">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-6"
                        >
                            Facturación Electrónica
                            <br />
                            <span className="text-gray-900 dark:text-white">para Ecuador</span>
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 sm:mt-4"
                        >
                            Simplifica tu proceso de facturación electrónica con una plataforma moderna, segura y fácil de usar.
                        </motion.p>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="mt-10 flex justify-center gap-4"
                        >
                            <Link
                                href="/register?billing_period=monthly&plan=1"
                                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl"
                            >
                                Empezar ahora
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Características principales
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Todo lo que necesitas para tu facturación electrónica en un solo lugar
                        </p>
                    </div>

                    <div className="mt-20">
                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center transform rotate-45">
                                                <feature.icon className="w-10 h-10 text-white transform -rotate-45" />
                                            </div>
                                            <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl" />
                                        </div>
                                    </div>
                                    <div className="mt-12 text-center">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-4 text-gray-600 dark:text-gray-300">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div id="benefits" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Beneficios que obtienes
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Optimiza tu gestión empresarial con nuestra solución integral de facturación electrónica
                            </p>
                            <div className="mt-12 space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={benefit}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className="flex items-center"
                                    >
                                        <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        <span className="ml-4 text-gray-700 dark:text-gray-300">{benefit}</span>
                                    </motion.div>
                                ))}
                        </div>
                        </motion.div>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mt-12 lg:mt-0"
                        >
                            <div className="relative">
                                <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl">
                                    <div className="p-8 flex items-center justify-center">
                                        <img
                                            src="/logo.svg"
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl -z-10" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Planes y Precios
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Elige el plan que mejor se adapte a tus necesidades
                        </p>

                        {/* Billing Period Selection */}
                        <div className="mt-8 max-w-md mx-auto">
                            <RadioGroup
                                value={selectedBillingPeriod}
                                onValueChange={setSelectedBillingPeriod}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className={`flex items-center justify-between rounded-md border p-4 ${
                                    selectedBillingPeriod === 'monthly' ? 'border-primary bg-primary/5' : 'border-border'
                                }`}>
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
                                <div className={`flex items-center justify-between rounded-md border p-4 ${
                                    selectedBillingPeriod === 'yearly' ? 'border-primary bg-primary/5' : 'border-border'
                                }`}>
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
                        </div>
                    </div>

                    <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl flex flex-col"
                            >
                                <div className="flex-1">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {plan.name}
                                        </h3>
                                        <p className="mt-4 flex items-baseline">
                                            <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                {formatPrice(plan.price, selectedBillingPeriod)}
                                            </span>
                                        </p>
                                        {selectedBillingPeriod === 'yearly' && (
                                            <p className="mt-1 text-sm text-green-600">
                                                Ahorro del 15% aplicado
                                            </p>
                                        )}
                                    </div>
                                    <ul className="mt-6 space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center">
                                                <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link
                                    href={route('register', { plan: plan.id, billing_period: selectedBillingPeriod })}
                                    className="mt-8 block w-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-center text-sm font-semibold text-white shadow hover:from-indigo-700 hover:to-purple-700"
                                >
                                    Empezar ahora
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            ¿Listo para empezar?
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Únete a cientos de empresas que ya confían en nosotros
                        </p>
                        <div className="mt-10">
                            <Link
                                href="/register?billing_period=monthly&plan=1"
                                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl"
                            >
                                Crear cuenta gratis
                                <ArrowRight className="ml-2 h-6 w-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

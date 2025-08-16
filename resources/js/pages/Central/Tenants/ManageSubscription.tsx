import TenantPayments from '@/components/tenants/tenant-payments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Payment } from '@/common/interfaces/payment.interface';
import { SubscriptionPlan } from '@/common/interfaces/subscription-plan.interface';

interface ManageTenant {
    id: string;
    company_name: string;
    primary_domain: string;
    subscription_plan?: {
        id: string;
        name: string;
    };
    subscription_status: 'active' | 'trial' | 'expired' | 'inactive';
    trial_ends_at: string | null;
    subscription_ends_at: string | null;
    subscription_active: boolean;
    is_active: boolean;
}

interface Props {
    tenant: ManageTenant;
    subscriptionPlans: SubscriptionPlan[];
    payments: Payment[];
}

interface FormData {
    subscription_plan_id: string;
    trial_ends_at: string;
    subscription_active: boolean;
    subscription_ends_at: string;
    is_active: boolean;
}

interface FormErrors {
    subscription_plan_id?: string;
    trial_ends_at?: string;
    subscription_ends_at?: string;
}

export default function ManageSubscription({ tenant, subscriptionPlans, payments }: Props) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        subscription_plan_id: tenant.subscription_plan ? tenant.subscription_plan.id : '',
        trial_ends_at: tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toISOString().split('T')[0] : '',
        subscription_active: tenant.subscription_active,
        subscription_ends_at: tenant.subscription_ends_at ? new Date(tenant.subscription_ends_at).toISOString().split('T')[0] : '',
        is_active: tenant.is_active,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Inquilinos',
            href: route('admin.tenants.index'),
        },
        {
            title: 'Gestionar Suscripción',
            href: route('admin.tenants.subscription', tenant.id),
        },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSelectChange = (name: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            await axios.post(route('admin.tenants.subscription.update', tenant.id), formData);
            setIsUpdating(false);
            toast.success('Suscripción actualizada correctamente');
            router.reload();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ errors: FormErrors }>;
                if (axiosError.response?.data?.errors) {
                    setErrors(axiosError.response.data.errors);
                }
            }
            toast.error('Error al actualizar la suscripción');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500">Activo</Badge>;
            case 'trial':
                return <Badge className="bg-blue-500">Prueba</Badge>;
            case 'expired':
                return <Badge className="bg-red-500">Expirado</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-500">Inactivo</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Datos para el componente de pagos
    const paymentMethods = [
        { value: 'credit_card', label: 'Tarjeta de Crédito' },
        { value: 'bank_transfer', label: 'Transferencia Bancaria' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'cash', label: 'Efectivo' },
        { value: 'other', label: 'Otro' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Gestionar Suscripción - ${tenant.company_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <Link href={route('admin.tenants.index')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Gestionar Suscripción</h1>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Inquilino</CardTitle>
                                <CardDescription>Detalles del inquilino y su suscripción actual.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">ID del Inquilino</h3>
                                        <p className="mt-1 text-lg font-medium">{tenant.id}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Nombre de la Empresa</h3>
                                        <p className="mt-1 text-lg font-medium">{tenant.company_name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Dominio Principal</h3>
                                        <p className="mt-1 text-lg font-medium">
                                            <a href={`https://${tenant.primary_domain}`} target="_blank" className="text-blue-600 hover:underline">
                                                {tenant.primary_domain}
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                                        <div className="mt-1 flex items-center gap-2">
                                            {tenant.is_active ? (
                                                <Badge className="bg-green-500">Activo</Badge>
                                            ) : (
                                                <Badge className="bg-red-500">Bloqueado</Badge>
                                            )}
                                            {getStatusBadge(tenant.subscription_status)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Plan Actual</h3>
                                        <p className="mt-1 text-lg font-medium">
                                            {tenant.subscription_plan ? tenant.subscription_plan.name : 'Sin plan asignado'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Fin del Período de Prueba</h3>
                                        <p className="mt-1 text-lg font-medium">{formatDate(tenant.trial_ends_at)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Fin de la Suscripción</h3>
                                        <p className="mt-1 text-lg font-medium">{formatDate(tenant.subscription_ends_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <TenantPayments 
                            tenant={{
                                ...tenant,
                                domains_count: 0,
                                created_at: new Date().toISOString(),
                                subscription_plan: tenant.subscription_plan ? {
                                    ...tenant.subscription_plan,
                                    id: tenant.subscription_plan.id.toString()
                                } : undefined
                            }} 
                            payments={payments} 
                            subscriptionPlans={subscriptionPlans} 
                            paymentMethods={paymentMethods} 
                        />
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Actualizar Suscripción</CardTitle>
                                <CardDescription>Modifique los detalles de la suscripción del inquilino.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Dialog open={isUpdating} onOpenChange={setIsUpdating}>
                                    <DialogTrigger asChild>
                                        <Button className="mb-4 w-full">Actualizar Suscripción</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[550px]">
                                        <form onSubmit={handleSubmit}>
                                            <DialogHeader>
                                                <DialogTitle>Actualizar Suscripción</DialogTitle>
                                                <DialogDescription>Modifique los detalles de la suscripción para este inquilino.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="subscription_plan_id">Plan de Suscripción</Label>
                                                    <Select
                                                        name="subscription_plan_id"
                                                        value={formData.subscription_plan_id}
                                                        onValueChange={(value) => handleSelectChange('subscription_plan_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione un plan" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {subscriptionPlans.map((plan) => (
                                                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                                                    {plan.name} - ${plan.price}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.subscription_plan_id && (
                                                        <p className="text-sm text-red-500">{errors.subscription_plan_id}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="trial_ends_at">Fin del Período de Prueba</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="trial_ends_at"
                                                            name="trial_ends_at"
                                                            type="date"
                                                            value={formData.trial_ends_at}
                                                            onChange={handleInputChange}
                                                        />
                                                        <CalendarIcon className="absolute top-2.5 right-3 h-4 w-4 text-gray-500" />
                                                    </div>
                                                    {errors.trial_ends_at && <p className="text-sm text-red-500">{errors.trial_ends_at}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="subscription_ends_at">Fin de la Suscripción</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="subscription_ends_at"
                                                            name="subscription_ends_at"
                                                            type="date"
                                                            value={formData.subscription_ends_at}
                                                            onChange={handleInputChange}
                                                        />
                                                        <CalendarIcon className="absolute top-2.5 right-3 h-4 w-4 text-gray-500" />
                                                    </div>
                                                    {errors.subscription_ends_at && (
                                                        <p className="text-sm text-red-500">{errors.subscription_ends_at}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        id="subscription_active"
                                                        name="subscription_active"
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={formData.subscription_active}
                                                        onChange={handleInputChange}
                                                    />
                                                    <Label htmlFor="subscription_active">Suscripción Activa</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        id="is_active"
                                                        name="is_active"
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={formData.is_active}
                                                        onChange={handleInputChange}
                                                    />
                                                    <Label htmlFor="is_active">Inquilino Activo</Label>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsUpdating(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Actualizando...' : 'Actualizar Suscripción'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Link href={route('admin.tenants.reset-admin', tenant.id)} className="w-full">
                                    <Button variant="outline" className="mb-4 w-full">
                                        Resetear Credenciales de Admin
                                    </Button>
                                </Link>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        router.visit(route('admin.tenants.index'));
                                    }}
                                >
                                    Volver a la Lista
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

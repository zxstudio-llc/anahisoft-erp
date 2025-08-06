import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Plus } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Payment, PaymentFormData, PaymentFormErrors, PaymentMethod } from '@/common/interfaces/payment.interface';
import { SubscriptionPlan } from '@/common/interfaces/subscription-plan.interface';
import { Tenant } from '@/common/interfaces/tenant.interface';

interface TenantPaymentsProps {
    tenant: Tenant;
    payments?: Payment[];
    subscriptionPlans: SubscriptionPlan[];
    paymentMethods: PaymentMethod[];
}

export default function TenantPayments({ tenant, payments = [], subscriptionPlans, paymentMethods }: TenantPaymentsProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<PaymentFormData>({
        tenant_id: tenant.id,
        subscription_plan_id: tenant.subscription_plan ? tenant.subscription_plan.id.toString() : '',
        payment_method: 'bank_transfer',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        billing_period: 'monthly',
        status: 'completed',
        notes: '',
    });
    const [errors, setErrors] = useState<PaymentFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: keyof PaymentFormData, value: string) => {
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
            await axios.post(route('payments.store'), formData);
            setIsCreating(false);
            toast.success('Pago registrado correctamente');
            router.reload();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ errors: PaymentFormErrors }>;
                if (axiosError.response?.data?.errors) {
                    setErrors(axiosError.response.data.errors);
                }
            }
            toast.error('Error al registrar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500">Completado</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500">Pendiente</Badge>;
            case 'failed':
                return <Badge className="bg-red-500">Fallido</Badge>;
            case 'refunded':
                return <Badge className="bg-blue-500">Reembolsado</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const toggleTenantActive = async () => {
        try {
            const response = await axios.post(route('admin.tenants.toggle-active', tenant.id));
            toast.success(response.data.message);
            router.reload();
        } catch {
            toast.error('Error al cambiar el estado del inquilino');
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Historial de Pagos</CardTitle>
                    <CardDescription>Historial de pagos realizados por este inquilino.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={tenant.is_active ? 'destructive' : 'default'}
                        onClick={toggleTenantActive}
                    >
                        {tenant.is_active ? 'Bloquear Inquilino' : 'Activar Inquilino'}
                    </Button>
                    <Dialog open={isCreating} onOpenChange={setIsCreating}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Registrar Pago
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                                    <DialogDescription>
                                        Complete los detalles del pago para registrarlo en el sistema.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subscription_plan_id">Plan de Suscripción</Label>
                                        <Select
                                            name="subscription_plan_id"
                                            value={formData.subscription_plan_id}
                                            onValueChange={(value) => handleSelectChange('subscription_plan_id', value)}
                                            required
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
                                            <p className="text-red-500 text-sm">{errors.subscription_plan_id}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Monto</Label>
                                            <Input
                                                id="amount"
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_date">Fecha de Pago</Label>
                                            <Input
                                                id="payment_date"
                                                name="payment_date"
                                                type="date"
                                                value={formData.payment_date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.payment_date && <p className="text-red-500 text-sm">{errors.payment_date}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_method">Método de Pago</Label>
                                            <Select
                                                name="payment_method"
                                                value={formData.payment_method}
                                                onValueChange={(value) => handleSelectChange('payment_method', value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un método" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {paymentMethods.map((method) => (
                                                        <SelectItem key={method.value} value={method.value}>
                                                            {method.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.payment_method && <p className="text-red-500 text-sm">{errors.payment_method}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="billing_period">Período de Facturación</Label>
                                            <Select
                                                name="billing_period"
                                                value={formData.billing_period}
                                                onValueChange={(value) => handleSelectChange('billing_period', value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un período" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="monthly">Mensual</SelectItem>
                                                    <SelectItem value="yearly">Anual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.billing_period && <p className="text-red-500 text-sm">{errors.billing_period}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Estado</Label>
                                        <Select
                                            name="status"
                                            value={formData.status}
                                            onValueChange={(value) => handleSelectChange('status', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="completed">Completado</SelectItem>
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="failed">Fallido</SelectItem>
                                                <SelectItem value="refunded">Reembolsado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notas</Label>
                                        <Input
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Notas adicionales sobre el pago"
                                        />
                                        {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Fecha de Pago</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex flex-col items-center justify-center">
                                            <DollarSign className="h-12 w-12 text-gray-300 mb-2" />
                                            <p className="text-lg font-medium">No hay pagos registrados</p>
                                            <p className="text-sm text-gray-500">Registre un nuevo pago para comenzar</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{payment.id}</TableCell>
                                        <TableCell>{payment.subscription_plan.name}</TableCell>
                                        <TableCell>${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : parseFloat(payment.amount).toFixed(2)}</TableCell>
                                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                        <TableCell>{payment.billing_period === 'monthly' ? 'Mensual' : 'Anual'}</TableCell>
                                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.visit(route('payments.show', payment.id))}
                                            >
                                                Ver
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
} 
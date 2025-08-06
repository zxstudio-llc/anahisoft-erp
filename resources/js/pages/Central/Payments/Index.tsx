import { PaymentFormData, PaymentFormErrors, PaymentsIndexProps } from '@/common/interfaces/payment.interface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { DollarSign, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];
export default function Index({ payments, tenants, subscription_plans, filters, payment_statuses, payment_methods }: PaymentsIndexProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<PaymentFormData>({
        tenant_id: '',
        subscription_plan_id: '',
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

    const handleSelectChange = (name: string, value: string) => {
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
            await axios.post(route('admin.payments.store'), formData);
            setIsCreating(false);
            toast.success('Pago registrado correctamente');
            router.reload();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error('Error al registrar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
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

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <Head title="Gestión de Pagos" />

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
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
                                        <DialogDescription>Complete los detalles del pago para registrarlo en el sistema.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tenant_id">Inquilino</Label>
                                                <Select
                                                    name="tenant_id"
                                                    value={formData.tenant_id}
                                                    onValueChange={(value) => handleSelectChange('tenant_id', value)}
                                                    required
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un inquilino" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {tenants.map((tenant) => (
                                                            <SelectItem key={tenant.id} value={tenant.id}>
                                                                {tenant.company_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.tenant_id && <p className="text-sm text-red-500">{errors.tenant_id}</p>}
                                            </div>
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
                                                        {subscription_plans.map((plan) => (
                                                            <SelectItem key={plan.id} value={plan.id.toString()}>
                                                                {plan.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.subscription_plan_id && <p className="text-sm text-red-500">{errors.subscription_plan_id}</p>}
                                            </div>
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
                                                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
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
                                                {errors.payment_date && <p className="text-sm text-red-500">{errors.payment_date}</p>}
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
                                                        {payment_methods.map((method) => (
                                                            <SelectItem key={method.value} value={method.value}>
                                                                {method.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.payment_method && <p className="text-sm text-red-500">{errors.payment_method}</p>}
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
                                                {errors.billing_period && <p className="text-sm text-red-500">{errors.billing_period}</p>}
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
                                                    {payment_statuses.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
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
                                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Pagos Registrados</CardTitle>
                            <CardDescription>Lista de todos los pagos registrados en el sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Buscar..."
                                            className="w-[250px] pl-8"
                                            value={filters.search || ''}
                                            onChange={(e) => router.get(route('admin.payments.index'), { search: e.target.value }, { preserveState: true })}
                                        />
                                    </div>
                                    <Select
                                        value={filters.subscription_plan_id || 'all'}
                                        onValueChange={(value) =>
                                            router.get(
                                                route('admin.payments.index'),
                                                { subscription_plan_id: value === 'all' ? '' : value },
                                                { preserveState: true },
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filtrar por plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los planes</SelectItem>
                                            {subscription_plans.map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                                    {plan.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={filters.status || 'all'}
                                        onValueChange={(value) =>
                                            router.get(route('admin.payments.index'), { status: value === 'all' ? '' : value }, { preserveState: true })
                                        }
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filtrar por estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            {payment_statuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Inquilino</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Monto</TableHead>
                                            <TableHead>Fecha de Pago</TableHead>
                                            <TableHead>Período</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="py-8 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <DollarSign className="mb-2 h-12 w-12 text-gray-300" />
                                                        <p className="text-lg font-medium">No hay pagos registrados</p>
                                                        <p className="text-sm text-gray-500">Registre un nuevo pago para comenzar</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            payments.data.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{payment.id}</TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={route('admin.tenants.subscription', payment.tenant.id)}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {payment.tenant.data.company_name || payment.tenant.id}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{payment.subscription_plan.name}</TableCell>
                                                    <TableCell>${parseFloat(payment.amount as string).toFixed(2)}</TableCell>
                                                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{payment.billing_period === 'monthly' ? 'Mensual' : 'Anual'}</TableCell>
                                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Link href={route('admin.payments.show', payment.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    Ver
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Mostrando {payments.from || 0} - {payments.to || 0} de {payments.total} pagos
                                </div>
                                <div className="flex gap-2">
                                    {payments.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}

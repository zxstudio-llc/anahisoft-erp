import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { PaymentFormErrors, PaymentShowProps } from '@/common/interfaces/payment.interface';

export default function Show({ payment }: PaymentShowProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        status: payment.status,
        notes: payment.notes || '',
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
            await axios.post(route('admin.payments.update-status', payment.id), formData);
            setIsUpdating(false);
            toast.success('Estado del pago actualizado correctamente');
            router.reload();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error('Error al actualizar el estado del pago');
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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title={`Pago #${payment.id}`} />

            <div className="container py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('admin.payments.index')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Detalles del Pago #{payment.id}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Pago</CardTitle>
                                <CardDescription>Detalles completos del pago registrado.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">ID del Pago</h3>
                                        <p className="mt-1 text-lg font-medium">{payment.id}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                                        <div className="mt-1">{getStatusBadge(payment.status)}</div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Inquilino</h3>
                                        <p className="mt-1 text-lg font-medium">
                                            <Link
                                                href={route('admin.tenants.subscription', payment.tenant.id)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {payment.tenant.data.company_name || payment.tenant.id}
                                            </Link>
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Plan de Suscripción</h3>
                                        <p className="mt-1 text-lg font-medium">{payment.subscription_plan.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Monto</h3>
                                        <p className="mt-1 text-lg font-medium">${parseFloat(payment.amount as string).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Método de Pago</h3>
                                        <p className="mt-1 text-lg font-medium">
                                            {payment.payment_method === 'credit_card'
                                                ? 'Tarjeta de Crédito'
                                                : payment.payment_method === 'bank_transfer'
                                                ? 'Transferencia Bancaria'
                                                : payment.payment_method === 'paypal'
                                                ? 'PayPal'
                                                : payment.payment_method === 'cash'
                                                ? 'Efectivo'
                                                : payment.payment_method}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Fecha de Pago</h3>
                                        <p className="mt-1 text-lg font-medium">{formatDate(payment.payment_date)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Período de Facturación</h3>
                                        <p className="mt-1 text-lg font-medium">
                                            {payment.billing_period === 'monthly' ? 'Mensual' : 'Anual'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <h3 className="text-sm font-medium text-gray-500">Notas</h3>
                                        <p className="mt-1 text-lg font-medium">{payment.notes || 'Sin notas'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Período de Suscripción</CardTitle>
                                <CardDescription>Información sobre el período de suscripción asociado a este pago.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Fecha de Inicio</h3>
                                        <p className="mt-1 text-lg font-medium">{formatDate(payment.subscription_starts_at)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Fecha de Finalización</h3>
                                        <p className="mt-1 text-lg font-medium">{formatDate(payment.subscription_ends_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Acciones</CardTitle>
                                <CardDescription>Gestione el estado del pago.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Dialog open={isUpdating} onOpenChange={setIsUpdating}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full mb-4">Actualizar Estado</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={handleSubmit}>
                                            <DialogHeader>
                                                <DialogTitle>Actualizar Estado del Pago</DialogTitle>
                                                <DialogDescription>
                                                    Cambie el estado del pago y añada notas adicionales si es necesario.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Estado</Label>
                                                    <Select
                                                        name="status"
                                                        value={formData.status}
                                                        onValueChange={(value) => handleSelectChange('status', value)}
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
                                                <Button type="button" variant="outline" onClick={() => setIsUpdating(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Actualizando...' : 'Actualizar Estado'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Link href={route('admin.tenants.subscription', payment.tenant.id)} className="w-full">
                                    <Button variant="outline" className="w-full mb-4">
                                        Ver Suscripción del Inquilino
                                    </Button>
                                </Link>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        router.visit(route('admin.payments.index'));
                                    }}
                                >
                                    Volver a la Lista
                                </Button>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start border-t pt-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Información Adicional</h3>
                                <div className="text-sm text-gray-500 space-y-1 w-full">
                                    <div className="flex justify-between">
                                        <span>Creado:</span>
                                        <span>{formatDate(payment.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Actualizado:</span>
                                        <span>{formatDate(payment.updated_at)}</span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
} 
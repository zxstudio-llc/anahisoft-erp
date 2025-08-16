import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    price: number;
    billing_period: 'monthly' | 'yearly';
    invoice_limit: number;
    features: string[];
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    plans: SubscriptionPlan[];
}

export default function Index({ plans }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este plan de suscripción?')) {
            router.delete(route('admin.subscription-plans.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Planes de Suscripción" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="container py-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Planes de Suscripción</h1>
                        <Button onClick={() => router.visit(route('admin.subscription-plans.create'))}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Plan
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <Card key={plan.id} className={plan.is_featured ? 'border-primary' : ''}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        {plan.is_featured && <Badge variant="default">Destacado</Badge>}
                                        {!plan.is_active && <Badge variant="destructive">Inactivo</Badge>}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.visit(route('admin.subscription-plans.edit', plan.id))}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(plan.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-2 text-3xl font-bold">
                                        {plan.price.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            /{plan.billing_period === 'monthly' ? 'mes' : 'año'}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Límite de facturas:</span>
                                            <span className="font-medium">{plan.invoice_limit === 0 ? 'Ilimitado' : plan.invoice_limit}</span>
                                        </div>

                                        {plan.features && plan.features.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="mb-2 text-sm font-medium">Características:</h4>
                                                <ul className="space-y-1">
                                                    {plan.features.map((feature, index) => (
                                                        <li key={index} className="flex items-center text-sm">
                                                            <span className="mr-2">✓</span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

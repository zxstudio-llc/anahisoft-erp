import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InvoiceUsage {
    total: number;
    monthly: number;
    limit: number;
    percentage: number;
    remaining: number;
    unlimited: boolean;
    last_reset: string;
    next_reset: string;
}

interface TenantInvoiceUsageProps {
    tenantId: string;
    initialUsage?: InvoiceUsage;
}

export default function TenantInvoiceUsage({ tenantId, initialUsage }: TenantInvoiceUsageProps) {
    const [usage, setUsage] = useState<InvoiceUsage | null>(initialUsage || null);
    const [loading, setLoading] = useState(!initialUsage);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialUsage) {
            fetchUsageData();
        }
    }, [tenantId]);

    const fetchUsageData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Hacer una solicitud para obtener los datos de uso de facturas del inquilino
            const response = await fetch(`/api/tenants/${tenantId}/invoice-usage`);
            const data = await response.json();

            if (data.success) {
                setUsage(data.data);
            } else {
                setError(data.message || 'Error al obtener los datos de uso');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Preparar datos para el gráfico
    const chartData = usage ? [
        { name: 'Facturas Mensuales', value: usage.monthly },
        { name: 'Facturas Totales', value: usage.total },
    ] : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Uso de Facturas</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : usage ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Uso Mensual</span>
                                <span className="text-sm font-medium">
                                    {usage.unlimited ? (
                                        <span className="text-green-500">Ilimitado</span>
                                    ) : (
                                        `${usage.monthly} / ${usage.limit}`
                                    )}
                                </span>
                            </div>
                            {!usage.unlimited && (
                                <Progress value={usage.percentage} className="h-2" />
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {usage.unlimited
                                        ? 'Plan con facturas ilimitadas'
                                        : `${usage.remaining} facturas restantes`}
                                </span>
                                <span>
                                    Próximo reinicio: {new Date(usage.next_reset).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        </div>

                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="rounded-md bg-muted p-3">
                                <div className="text-2xl font-bold">{usage.total}</div>
                                <div className="text-xs text-muted-foreground">Facturas Totales</div>
                            </div>
                            <div className="rounded-md bg-muted p-3">
                                <div className="text-2xl font-bold">{usage.monthly}</div>
                                <div className="text-xs text-muted-foreground">Facturas Mensuales</div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.get(`/tenants/${tenantId}/subscription`)}
                            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Gestionar Suscripción
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">No hay datos disponibles</div>
                )}
            </CardContent>
        </Card>
    );
} 
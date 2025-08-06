import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { formatCurrency } from '@/lib/utils';

interface StatsGridProps {
    stats: {
        sales: {
            current: number;
            previous: number;
            change: number;
        };
        clients: {
            total: number;
            new: number;
            change: number;
        };
        products: {
            total: number;
            new: number;
            change: number;
        };
        invoices: {
            total: number;
            pending: number;
            paid: number;
            change: number;
        };
    };
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Ventas del mes</p>
                        <h3 className="mt-2 text-3xl font-semibold">{formatCurrency(stats.sales.current)}</h3>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${stats.sales.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={stats.sales.change >= 0 ? 'trending-up' : 'trending-down'} className="h-4 w-4" />
                        <span>{Math.abs(stats.sales.change).toFixed(1)}%</span>
                    </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    vs. {formatCurrency(stats.sales.previous)} mes anterior
                </p>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                        <h3 className="mt-2 text-3xl font-semibold">{stats.clients.total}</h3>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${stats.clients.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={stats.clients.change >= 0 ? 'trending-up' : 'trending-down'} className="h-4 w-4" />
                        <span>{Math.abs(stats.clients.change).toFixed(1)}%</span>
                    </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {stats.clients.new} nuevos este mes
                </p>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Productos</p>
                        <h3 className="mt-2 text-3xl font-semibold">{stats.products.total}</h3>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${stats.products.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={stats.products.change >= 0 ? 'trending-up' : 'trending-down'} className="h-4 w-4" />
                        <span>{Math.abs(stats.products.change).toFixed(1)}%</span>
                    </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {stats.products.new} nuevos este mes
                </p>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Facturas</p>
                        <h3 className="mt-2 text-3xl font-semibold">{stats.invoices.total}</h3>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${stats.invoices.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={stats.invoices.change >= 0 ? 'trending-up' : 'trending-down'} className="h-4 w-4" />
                        <span>{Math.abs(stats.invoices.change).toFixed(1)}%</span>
                    </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {stats.invoices.pending} pendientes, {stats.invoices.paid} pagadas
                </p>
            </Card>
        </div>
    );
} 
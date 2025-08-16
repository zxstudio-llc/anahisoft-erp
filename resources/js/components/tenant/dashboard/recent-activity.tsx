import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RecentActivityProps {
    data: {
        invoices: Array<{
            id: number;
            client_name: string;
            total: number;
            status: string;
            date: string;
        }>;
        clients: Array<{
            id: number;
            name: string;
            document_number: string;
            created_at: string;
        }>;
        products: Array<{
            id: number;
            name: string;
            price: number;
            created_at: string;
        }>;
    };
}

export function RecentActivity({ data }: RecentActivityProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {message}
        </div>
    );

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Facturas recientes</h3>
                    <div className="space-y-4">
                        {data.invoices.length > 0 ? (
                            data.invoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{invoice.client_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(invoice.date)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(invoice.total)}</p>
                                        <Badge className={getStatusColor(invoice.status)}>
                                            {invoice.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState message="No hay facturas recientes" />
                        )}
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Clientes recientes</h3>
                    <div className="space-y-4">
                        {data.clients.length > 0 ? (
                            data.clients.map((client) => (
                                <div key={client.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{client.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {client.document_number}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(client.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState message="No hay clientes recientes" />
                        )}
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Productos recientes</h3>
                    <div className="space-y-4">
                        {data.products.length > 0 ? (
                            data.products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(product.created_at)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(product.price)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState message="No hay productos recientes" />
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
} 
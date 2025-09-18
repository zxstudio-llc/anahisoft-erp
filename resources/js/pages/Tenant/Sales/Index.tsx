import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/common/interfaces/tenant/sales.interface";
import { formatCurrency } from "@/lib/utils";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { Plus } from "lucide-react";

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface SalesProps {
    sales?: {
        data: Invoice[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: PaginationLink[];
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
    };
}

export default function Index({
    sales = {
        data: [],
        meta: {
            current_page: 1,
            from: 0,
            last_page: 1,
            links: [],
            path: '',
            per_page: 10,
            to: 0,
            total: 0,
        },
        links: {
            first: null,
            last: null,
            prev: null,
            next: null,
        },
    }
}: SalesProps) {
    const breadcrumbs = [
        { title: 'Inicio', href: '/' },
        { title: 'Ventas', href: '/sales' },
    ];

    // Asegurarse de que sales.data existe y es un array
    const salesData = Array.isArray(sales?.data) ? sales.data : [];
    const meta = sales?.meta || { last_page: 1, from: 0, to: 0, total: 0, links: [] };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Ventas</h1>
                    <Button onClick={() => router.visit('/sales/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Venta
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">Lista de Ventas</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                                            <th className="px-4 py-3">ID</th>
                                            <th className="px-4 py-3">Cliente</th>
                                            <th className="px-4 py-3">Total</th>
                                            <th className="px-4 py-3">Estado</th>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesData.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">
                                                    No se encontraron ventas
                                                </td>
                                            </tr>
                                        ) : (
                                            salesData.map((sale) => (
                                                <tr key={sale.id} className="border-t">
                                                    <td className="px-4 py-3">{sale.id}</td>
                                                    <td className="px-4 py-3">{sale.customer.business_name}</td>
                                                    <td className="px-4 py-3">{formatCurrency(sale.total)}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge>{sale.status}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {new Date(sale.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm">
                                                            Ver detalles
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {meta.last_page > 1 && (
                                <div className="flex items-center justify-between border-t px-4 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Mostrando {meta.from} a {meta.to} de {meta.total} resultados
                                    </div>
                                    <div className="flex gap-1">
                                        {meta.links &&
                                            meta.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
} 
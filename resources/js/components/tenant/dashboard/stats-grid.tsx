import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface StatsGridProps {
    stats: {
        sales: {
            current: number
            previous: number
            change: number
        }
        customers: {  // Cambio: 'customer' -> 'customers'
            total: number
            new: number
            change: number
        }
        products: {
            total: number
            new: number
            change: number
        }
        invoices: {
            total: number
            pending: number
            paid: number
            change: number
        }
    }
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {/* Ventas */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Ventas del mes</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(stats.sales.current)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {stats.sales.change >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                            {stats.sales.change >= 0 ? "+" : "-"}
                            {Math.abs(stats.sales.change).toFixed(1)}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="flex gap-2 font-medium">
                        {stats.sales.change >= 0 ? "Crecimiento este mes" : "Disminución este mes"}
                        {stats.sales.change >= 0 ? (
                            <IconTrendingUp className="size-4" />
                        ) : (
                            <IconTrendingDown className="size-4" />
                        )}
                    </div>
                    <div className="text-muted-foreground">
                        vs. {formatCurrency(stats.sales.previous)} mes anterior
                    </div>
                </CardFooter>
            </Card>

            {/* Clientes */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Clientes</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.customers.total} {/* Cambio: 'customer' -> 'customers' */}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {stats.customers.change >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                            {stats.customers.change >= 0 ? "+" : "-"}
                            {Math.abs(stats.customers.change).toFixed(1)}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="flex gap-2 font-medium">
                        {stats.customers.change >= 0 ? "Clientes en aumento" : "Clientes en descenso"}
                        {stats.customers.change >= 0 ? (
                            <IconTrendingUp className="size-4" />
                        ) : (
                            <IconTrendingDown className="size-4" />
                        )}
                    </div>
                    <div className="text-muted-foreground">
                        {stats.customers.new} nuevos este mes
                    </div>
                </CardFooter>
            </Card>

            {/* Productos */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Productos</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.products.total}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {stats.products.change >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                            {stats.products.change >= 0 ? "+" : "-"}
                            {Math.abs(stats.products.change).toFixed(1)}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="flex gap-2 font-medium">
                        {stats.products.change >= 0
                            ? "Más productos registrados"
                            : "Menos productos registrados"}
                        {stats.products.change >= 0 ? (
                            <IconTrendingUp className="size-4" />
                        ) : (
                            <IconTrendingDown className="size-4" />
                        )}
                    </div>
                    <div className="text-muted-foreground">
                        {stats.products.new} nuevos este mes
                    </div>
                </CardFooter>
            </Card>

            {/* Facturas */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Facturas</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.invoices.total}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {stats.invoices.change >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                            {stats.invoices.change >= 0 ? "+" : "-"}
                            {Math.abs(stats.invoices.change).toFixed(1)}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="flex gap-2 font-medium">
                        {stats.invoices.change >= 0
                            ? "Facturación en crecimiento"
                            : "Facturación en descenso"}
                        {stats.invoices.change >= 0 ? (
                            <IconTrendingUp className="size-4" />
                        ) : (
                            <IconTrendingDown className="size-4" />
                        )}
                    </div>
                    <div className="text-muted-foreground">
                        {stats.invoices.pending} pendientes, {stats.invoices.paid} pagadas
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
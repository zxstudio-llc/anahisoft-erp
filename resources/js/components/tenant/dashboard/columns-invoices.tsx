"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Invoice } from "@/common/interfaces/tenant/sales.interface"

export const invoiceColumns: ColumnDef<Invoice>[] = [
    {
        accessorKey: "id",
        header: () => null,
        cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
    {
        accessorKey: "number",
        header: "Factura",
        cell: ({ row }) => {
            const { establishment_code, emission_point, sequential } = row.original

            // Formatear cada parte con ceros a la izquierda
            const formattedEst = String(establishment_code).padStart(3, "0")
            const formattedPoint = String(emission_point).padStart(3, "0")
            const formattedNumber = String(sequential).padStart(9, "0")

            return (
                <span className="font-medium">
                    {formattedEst}-{formattedPoint}-{formattedNumber}
                </span>
            )
        },
    },
    {
        accessorKey: "customer",
        header: "Cliente",
        cell: ({ row }) => {
            const customer = row.original.customer

            if (!customer) return <span className="italic text-gray-400">Sin cliente</span>

            // Si tiene trade_name mostrarlo, si no usar business_name
            const displayName = customer.trade_name || customer.business_name

            return (
                <span className="font-medium">
                    {displayName}{" "}
                    <span className="text-gray-500 text-xs">
                        ({customer.formatted_identification})
                    </span>
                </span>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.original.status

            const statusMap: Record<
                Invoice['status'],
                { label: string; className: string }
            > = {
                draft: { label: "Borrador", className: "bg-gray-100 text-gray-700" },
                issued: { label: "Emitida", className: "bg-blue-100 text-blue-700" },
                authorized: { label: "Autorizada", className: "bg-green-100 text-green-700" },
                rejected: { label: "Rechazada", className: "bg-red-100 text-red-700" },
                canceled: { label: "Anulada", className: "bg-yellow-100 text-yellow-700" },
            }

            const { label, className } = statusMap[status]

            return <Badge className={`px-2 py-1 rounded-full text-xs ${className}`}>{label}</Badge>
        },
    },
    {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <span>${row.original.total.toFixed(2)}</span>,
    },
    {
        accessorKey: "issue_date",
        header: "Fecha de emisión",
        cell: ({ row }) => <span>{new Date(row.original.issue_date).toLocaleDateString()}</span>,
    },
]
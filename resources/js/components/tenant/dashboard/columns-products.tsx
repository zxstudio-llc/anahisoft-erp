"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ProductLight } from "@/common/interfaces/tenant/products.interface"

export const productColumns: ColumnDef<ProductLight>[] = [
    {
        accessorKey: "id",
        header: () => null,
        cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
    {
        accessorKey: "name",
        header: "Producto",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
        accessorKey: "code",
        header: "SKU",
        cell: ({ row }) => <span>{row.original.code}</span>,
    },
    {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => {
          const price = Number(row.original.price) // conversión segura
          return <span>${price.toFixed(2)}</span>
        },
    },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => <span>{row.original.stock}</span>,
    },
    {
        accessorKey: "created_at",
        header: "Creado",
        cell: ({ row }) => <span>{row.original.created_at}</span>,
    },
    {
        accessorKey: "updated_at",
        header: "Actualizado",
        cell: ({ row }) => <span>{row.original.updated_at}</span>,
    },
    {
        accessorKey: "active",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            className={`px-2 py-1 rounded-full text-xs ${
              row.original.active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.original.active ? "Activo" : "Inactivo"}
          </Badge>
        ),
    },
]
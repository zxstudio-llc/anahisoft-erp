"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { DataTableColumnHeader } from "../data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions-promotions"
import { PromotionStatusBadge } from "@/components/promotion-status-badge"

// Definimos los tipos de premio por defecto
const DEFAULT_PRIZE_TYPES = {
  cash: 'Efectivo',
  coupon: 'Cupón',
  product: 'Producto',
  service: 'Servicio',
  other: 'Otro'
}

export const promotionColumns = (prizeTypes: Record<string, string> = DEFAULT_PRIZE_TYPES): ColumnDef<any>[] => [
  {
    id: "provider_name",
    accessorFn: (row) => row.provider?.company_name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
  },
  {
    accessorKey: "prize_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Premio" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("prize_type")
      return prizeTypes[type as string] || type || 'No especificado'
    },
  },
  {
    accessorKey: "prize_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <PromotionStatusBadge status={row.getValue("status")} />
    ),
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inicio" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("start_date")
      return date ? format(new Date(date), 'PP') : 'N/A'
    },
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fin" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("end_date")
      return date ? format(new Date(date), 'PP') : 'N/A'
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActions 
        row={row} 
        statusOptions={table.options.meta?.statusOptions}
      />
    ),
  },
]
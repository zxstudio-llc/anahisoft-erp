"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/app/dataTable/data-table-column-header"
import { DataTableRowActionsBingo } from "@/components/app/dataTable/bingo/data-table-row-actions-bingo"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { bingoCardSchema } from "@/data/bingoCardSchema"
import { z } from "zod"

export const bingoCardColumns = (): ColumnDef<z.infer<typeof bingoCardSchema>>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[50px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "validation_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" className="w-[150px]" />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "table_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Número de Tabla" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("table_number")
      return <div className="w-[100px]">{typeof value === 'number' ? value : Number(value)}</div>
    },
  },
  {
    accessorKey: "game.game_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Número de Juego" />
    ),
    cell: ({ row }) => {
      const game = row.original.game
      return game?.game_number || "N/A"
    },
  },
  {
    accessorKey: "game.status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.original.game?.status
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status || 'N/A'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Compra" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at")
      return date ? format(new Date(date as string), 'PPpp') : 'N/A'
    },
  },
  {
    accessorKey: "game.end_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Sorteo" />
    ),
    cell: ({ row }) => {
      const date = row.original.game?.end_time
      return date ? format(new Date(date), 'PPpp') : 'N/A'
    },
  },
  {
    id: "customer",
    header: "Cliente",
    cell: ({ row }) => {
      const customer = row.original.customer || row.original.user
      return customer ? `${customer.first_name} ${customer.last_name}` : 'N/A'
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActionsBingo 
        row={row}
        onPrint={(card) => table.options.meta?.onPrint?.(card)}
        onPreview={(card) => table.options.meta?.onPreview?.(card)}
      />
    ),
  },
]
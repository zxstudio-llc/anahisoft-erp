"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/app/dataTable/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from 'date-fns/locale'
import { PromoCode } from "@/data/promoSchema"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"


export const PromoColumns: ColumnDef<PromoCode>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "provider_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("provider_name")}</div>,
    enableSorting: false,
    enableHiding: false,
  },  
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => <div>{row.getValue("description")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Válido hasta" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("end_date"));
      return format(date, 'PPP', { locale: es });
    },
    enableSorting: true,
  },
  {
    accessorKey: "uses",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usos" />
    ),
    cell: ({ row }) => {
      const maxUses = row.original.max_uses;
      const currentUses = row.original.current_uses;
      return maxUses ? `${currentUses}/${maxUses}` : 'Ilimitado';
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      const isActive = row.original.is_active;
      
      if (status === 'pending') return <Badge variant="secondary">Pendiente</Badge>;
      if (status === 'rejected') return <Badge variant="destructive">Rechazado</Badge>;
      return isActive ? <Badge variant="default" className="bg-green-500 hover:bg-green-600">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const promoCode = row.original;
      return (
        <div className="flex space-x-2">
          <Link href={`/admin/promo-codes/${promoCode.id}`}>
            <Button variant="outline" size="sm">Ver</Button>
          </Link>
          {(promoCode.can_edit) && (
            <Link href={`/admin/promo-codes/${promoCode.id}/edit`}>
              <Button variant="outline" size="sm">Editar</Button>
            </Link>
          )}
        </div>
      )
    },
  },
]
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/app/dataTable/data-table-column-header"
import { DataTableRowActionsBanner } from "@/components/app/dataTable/banner/data-table-row-actions-banner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { bannerSchema } from "@/data/bannerSchema"
import { z } from "zod"

export const bannerColumns = (): ColumnDef<z.infer<typeof bannerSchema>>[] => [
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
    accessorKey: "image_url",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Imagen" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue("image_url") as string;
      return imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Banner" 
          className="h-10 w-auto object-cover rounded" 
        />
      ) : (
        <span className="text-gray-400">Sin imagen</span>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Título" />
    ),
  },
  {
    accessorKey: "subtitle",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subtítulo" />
    ),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "published_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de publicación" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("published_at");
      return date ? format(new Date(date as string), 'PP') : 'No publicado';
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActionsBanner row={row} />,
  },
];
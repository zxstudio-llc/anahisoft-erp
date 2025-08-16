"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/app/dataTable/data-table-column-header"
import { DataTableRowActionsNews } from "@/components/app/dataTable/news/data-table-row-actions-news"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { newsSchema } from "@/data/newsSchema"
import { z } from "zod"

export const newsColumns = (): ColumnDef<z.infer<typeof newsSchema>>[] => [
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
          alt="Noticia" 
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
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
  },
  {
    accessorKey: "is_published",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const isPublished = row.getValue("is_published");
      return (
        <Badge variant={isPublished ? 'default' : 'secondary'}>
          {isPublished ? 'Publicado' : 'No publicado'}
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
    cell: ({ row }) => <DataTableRowActionsNews row={row} />,
  },
];
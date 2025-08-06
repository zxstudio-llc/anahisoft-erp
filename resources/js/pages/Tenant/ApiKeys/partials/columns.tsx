import { ColumnDef } from "@tanstack/react-table"
import { ApiKey } from '@/common/interfaces/tenant/apikey.interface'
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2 } from "lucide-react"

export const createColumns = (
  onDeleteClick: (token: ApiKey) => void
): ColumnDef<ApiKey>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 dark:text-white">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "abilities",
    header: "Permisos",
    cell: ({ row }) => {
      const abilities = row.getValue("abilities") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {abilities.map((ability) => (
            <span
              key={ability}
              className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              {ability}
            </span>
          ))}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Creada
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "last_used_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Último uso
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const lastUsed = row.getValue("last_used_at") as string | null
      return lastUsed ? new Date(lastUsed).toLocaleDateString() : "Nunca"
    },
  },
  {
    accessorKey: "expires_at",
    header: "Expira",
    cell: ({ row }) => {
      const expiresAt = row.getValue("expires_at") as string | null
      return expiresAt ? new Date(expiresAt).toLocaleDateString() : "Nunca"
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const token = row.original

      return (
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          onClick={() => onDeleteClick(token)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Eliminar
        </Button>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]

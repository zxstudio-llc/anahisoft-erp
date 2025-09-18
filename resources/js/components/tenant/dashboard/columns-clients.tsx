import { Badge } from "@/components/ui/badge"
import { CustomerLight } from "@/common/interfaces/tenant/customers.interface"
import { ColumnDef } from "@tanstack/react-table"


export const clientColumns: ColumnDef<CustomerLight>[] = [
  {
    accessorKey: "id",
    header: () => null,
    cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
  }, 
  {
    accessorKey: "identification",
    header: "# Documento",
    cell: ({ row }) => <span className="font-medium">{row.original.identification}</span>,
  },
  {
    accessorKey: "trade_name",
    header: "Nombre",
    cell: ({ row }) => <span className="font-medium">{row.original.trade_name}</span>,
  },
  {
    accessorKey: "email",
    header: "Correo",
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ row }) => <span>{row.original.phone}</span>,
  },
  {
    accessorKey: "business_name",
    header: "Empresa",
    cell: ({ row }) => <span>{row.original.business_name}</span>,
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

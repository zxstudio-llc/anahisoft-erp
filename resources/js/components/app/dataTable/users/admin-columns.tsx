"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { AdminActions } from "./admin-actions"
import { AdminUser } from "@/data/adminSchema"

export const adminColumns = (roles: any[], currentUserId?: number): ColumnDef<AdminUser>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const isCurrentUser = row.original.id === currentUserId;
      return (
        <div className="flex items-center">
          {isCurrentUser && (
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
          )}
          <span className={isCurrentUser ? "font-medium" : ""}>
            {row.original.email}
          </span>
          {isCurrentUser && (
            <span className="ml-2 text-xs text-muted-foreground">(Tú)</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
  },
  {
    accessorKey: "dni",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Documento" />
    ),
    cell: ({ row }) => row.original.dni || '-',
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.status ? 'default' : 'destructive'}>
        {row.original.status ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "user_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const userType = row.original.user_type;
      let variant: "default" | "secondary" | "destructive" | "outline";
      let displayText: string;
  
      switch (userType) {
        case 'admin':
          variant = 'default';
          displayText = 'Administrador';
          break;
        case 'provider':
          variant = 'secondary';
          displayText = 'Proveedor';
          break;
        case 'customer':
          variant = 'outline';
          displayText = 'Cliente';
          break;
        default:
          variant = 'destructive';
          displayText = 'Desconocido';
      }
  
      return (
        <Badge variant={variant}>
          {displayText}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.roles?.map((role) => (
          <Badge 
            key={role.id} 
            variant={role.name === 'Super admin' ? 'destructive' : 'secondary'}
          >
            {role.name}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registro" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return (
        <div className="flex flex-col">
          <span>{date.toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString()}
          </span>
        </div>
      );
    },
    sortingFn: 'datetime',
  },
  {
    id: "actions",
    cell: ({ row }) => <AdminActions row={row} roles={roles} currentUserId={currentUserId} />,
    enableSorting: false,
    enableHiding: false,
  },
]
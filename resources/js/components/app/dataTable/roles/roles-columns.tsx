import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/app/dataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Link } from "@inertiajs/react";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataTableRowActionsIcon } from "./data-table-row-actions-icon";

export const RoleColumns: ColumnDef<any>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.name}
        {row.original.name === 'Super admin' && (
          <Badge variant="destructive" className="ml-2">
            Sistema
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "guard_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Guard" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.guard_name}
      </Badge>
    ),
  },
  {
    accessorKey: "permissions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Permisos" />
    ),
    cell: ({ row }) => {
      const permissions = row.original.permissions || [];
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-pointer">
                {permissions.length} permisos
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <div className="grid grid-cols-2 gap-1">
                {permissions.map((perm: string) => (
                  <Badge 
                    key={perm} 
                    variant="secondary" 
                    className="truncate text-xs"
                  >
                    {perm}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "users_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuarios" />
    ),
    cell: ({ row }) => row.original.users_count,
  },
  {
    accessorKey: "permissions_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Permisos" />
    ),
    cell: ({ row }) => row.original.permissions_count,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" />
    ),
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActionsIcon 
        row={row} 
        permissions={table.options.meta?.permissions || []} 
      />
    ),

    // cell: ({ row }) => (
    //   <div className="flex space-x-2">
    //     <Link
    //       href={route('admin.roles.edit', row.original.id)}
    //       className="text-primary hover:underline"
    //     >
    //       Editar
    //     </Link>
    //     {row.original.name !== 'Super admin' && row.original.users_count === 0 && (
    //       <Link
    //         href={route('admin.roles.destroy', row.original.id)}
    //         method="delete"
    //         as="button"
    //         className="text-destructive hover:underline"
    //         onBefore={() => confirm('¿Estás seguro de eliminar este rol?')}
    //       >
    //         Eliminar
    //       </Link>
    //     )}
    //   </div>
    // ),
  },
];
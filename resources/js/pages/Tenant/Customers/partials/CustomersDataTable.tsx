"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export type Customer = {
  id: number
  identification_type: '04' | '05' | '06' | '07'
  identification: string | null
  business_name: string
  trade_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  special_taxpayer: boolean
  accounting_required: boolean
  credit_limit: number
  active: boolean
  created_at: string
  updated_at: string
  invoices_count: number
  formatted_identification: string
  identification_type_name: string
}

interface CustomersTableProps {
  data: Customer[]
  onView?: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
  onCreate?: () => void
}

export const columns: ColumnDef<Customer>[] = [
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
    accessorKey: "identification_type_name",
    header: "Tipo ID",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue("identification_type_name")}
      </Badge>
    ),
  },
  {
    accessorKey: "formatted_identification",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Identificación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue("formatted_identification")}
      </div>
    ),
  },
  {
    accessorKey: "business_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Razón Social
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const customer = row.original
      return (
        <div>
          <div className="font-medium">{customer.business_name}</div>
          {customer.trade_name && (
            <div className="text-sm text-muted-foreground">
              {customer.trade_name}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null
      return email ? (
        <a href={`mailto:${email}`} className="text-blue-600 hover:underline text-sm">
          {email}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null
      return phone ? (
        <a href={`tel:${phone}`} className="text-blue-600 hover:underline text-sm">
          {phone}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "credit_limit",
    header: () => <div className="text-right">Límite Crédito</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("credit_limit"))
      const formatted = new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="text-right font-medium font-mono">{formatted}</div>
    },
  },
  {
    accessorKey: "invoices_count",
    header: () => <div className="text-center">Facturas</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="secondary">
          {row.getValue("invoices_count")}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "active",
    header: () => <div className="text-center">Estado</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("active")
      return (
        <div className="text-center">
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const customer = row.original
      const props = table.options.meta as { onView?: (customer: Customer) => void, onEdit?: (customer: Customer) => void, onDelete?: (customer: Customer) => void }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => props.onView?.(customer)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => props.onEdit?.(customer)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => props.onDelete?.(customer)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function CustomersDataTable({ 
  data, 
  onView, 
  onEdit, 
  onDelete, 
  onCreate 
}: CustomersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      onView,
      onEdit,
      onDelete,
    },
  })

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona los clientes de tu empresa
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filtrar por razón social..."
            value={(table.getColumn("business_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("business_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filtrar por email..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "identification_type_name" ? "Tipo ID" :
                     column.id === "formatted_identification" ? "Identificación" :
                     column.id === "business_name" ? "Razón Social" :
                     column.id === "credit_limit" ? "Límite Crédito" :
                     column.id === "invoices_count" ? "Facturas" :
                     column.id === "active" ? "Estado" :
                     column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
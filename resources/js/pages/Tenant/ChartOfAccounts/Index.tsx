"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  IconArrowsDownUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head, usePage } from "@inertiajs/react"
import ImportExcelModal from "./ImportExcelModal"
import ChartOfAccountModal from "./ChartOfAccountModal"
import Api from "@/lib/api"
import { toast } from "sonner"

interface Account {
  id: string
  code: string
  name: string
  type: "asset" | "liability" | "equity" | "income" | "expense"
  typeOriginal?: string  // NUEVO: Para almacenar el tipo original del Excel
  level: number
  parentId?: string
  isActive: boolean
  description: string
  creditDebit: "debit" | "credit" | "neutral"
  children?: Account[]
}

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

interface IndexProps {
  parents: Account[]
}

export default function ChartOfAccounts({ parents }: IndexProps) {
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [rawAccounts, setRawAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openImportModal, setOpenImportModal] = useState(false)
  const [account, setAccounts] = useState<Account[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [openModal, setOpenModal] = useState(false)

  // Asegurar que los montos sean numéricos
  const mapAccounts = (accounts: any[]): Account[] => {
    // Validación de seguridad
    if (!Array.isArray(accounts)) {
      return []
    }

    return accounts.map((a) => ({
      id: String(a.id),
      code: String(a.code),
      name: String(a.name),
      type: a.financial_statement_type as Account["type"],
      typeOriginal: a.financial_statement_type_original || a.financial_statement_type_display, // NUEVO: Tipo original
      level: Number(a.level ?? 0),
      parentId: a.parent_id ? String(a.parent_id) : undefined,
      isActive: Boolean(a.active),
      description: String(a.description ?? ""),
      creditDebit: (a.nature ?? "neutral") as Account["creditDebit"],
      children: a.children ? mapAccounts(a.children) : undefined,
      financialStatementTypeDisplay: a.financial_statement_type_display,
      natureDisplay: a.nature_display,
      hasChildren: Boolean(a.has_children),
    }))
  }

  const accounts = useMemo(() => {
    // Verificación adicional de seguridad
    if (!rawAccounts || !Array.isArray(rawAccounts)) {
      return []
    }
    return mapAccounts(rawAccounts)
  }, [rawAccounts])

  const getTypeColorByOriginal = (typeOriginal?: string) => {
    if (!typeOriginal) return "bg-gray-100 text-gray-800"

    const type = typeOriginal.toUpperCase()
    switch (type) {
      case "ESTADO DE SITUACION":
        return "bg-blue-100 text-blue-800"
      case "ESTADO DE RESULTADOS":
        return "bg-green-100 text-green-800"
      case "ESTADO DE CAMBIOS EN EL PATRIMONIO":
        return "bg-purple-100 text-purple-800"
      case "ESTADO DE FLUJO DE EFECTIVO":
        return "bg-cyan-100 text-cyan-800"
      case "CUENTAS DE ORDEN":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeNameByOriginal = (typeOriginal?: string) => {
    if (!typeOriginal) return "No definido"

    const type = typeOriginal.toUpperCase()
    switch (type) {
      case "ESTADO DE SITUACION":
        return "Estado de Situación"
      case "ESTADO DE RESULTADOS":
        return "Estado de Resultados"
      case "ESTADO DE CAMBIOS EN EL PATRIMONIO":
        return "Estado de Cambios en el Patrimonio"
      case "ESTADO DE FLUJO DE EFECTIVO":
        return "Estado de Flujo de Efectivo"
      case "CUENTAS DE ORDEN":
        return "Cuentas de Orden"
      default:
        return typeOriginal
    }
  }


  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const copy = new Set(prev)
      copy.has(nodeId) ? copy.delete(nodeId) : copy.add(nodeId)
      return copy
    })
  }

  // Construir lista plana de filas visibles (respeta expandido/colapsado)
  const visibleAccounts = useMemo(() => {
    const list: Account[] = []
    const walk = (nodes: Account[]) => {
      nodes.forEach(n => {
        list.push(n)
        if (n.children && n.children.length && expandedNodes.has(n.id)) {
          walk(n.children)
        }
      })
    }
    walk(accounts)
    return list
  }, [accounts, expandedNodes])

  // Definir las columnas para TanStack Table
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Código

          <IconArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const account = row.original
        const indent = (account.level ?? 0) * 10

        return (
          <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
            <span className="font-mono font-medium">{account.code}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Nombre
          <IconArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "typeOriginal", // MODIFICADO: Usar typeOriginal en lugar de type
      header: "Tipo de Estado Financiero",
      cell: ({ row }) => {
        const account = row.original
        const typeOriginal = account.typeOriginal
        return (
          <Badge className={getTypeColorByOriginal(typeOriginal)}>
            {getTypeNameByOriginal(typeOriginal)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Activa" : "Inactiva"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "creditDebit",
      header: "Crédito/Débito",
      cell: ({ row }) => {
        const creditDebit = row.getValue("creditDebit") as string
        return (
          <Badge
            variant="outline"
            className={
              creditDebit === "debit" ? "bg-green-100 text-green-800" :
                creditDebit === "credit" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
            }
          >
            {creditDebit === "debit" ? "Débito" :
              creditDebit === "credit" ? "Crédito" : "Neutral"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const account = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedAccount(account)
                setOpenModal(true)
              }}>
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <IconTrash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: visibleAccounts,
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
  })

  // Totales para los cards
  const flattenAll = (nodes: Account[]): Account[] => {
    const res: Account[] = []
    const walk = (xs: Account[]) => xs.forEach(x => { res.push(x); if (x.children) walk(x.children) })
    walk(accounts)
    return res
  }
  const flat = useMemo(() => flattenAll(accounts), [accounts])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Plan de cuenta', href: '/finanzas/chart-of-statements' },
  ]

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      let page = 1
      const perPage = 100
      let allAccounts: any[] = []
  
      while (true) {
        const res = await Api.get(`/v1/chart-of-accounts?page=${page}&per_page=${perPage}`)
        const accountsPage = res.data.accounts.data || []
        allAccounts = [...allAccounts, ...accountsPage]
        if (accountsPage.length < perPage) break // última página
        page++
      }
  
      setRawAccounts(allAccounts)
    } catch (err) {
      console.error(err)
      toast.error("No se pudo cargar todas las cuentas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Plan de cuenta" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Cuentas Contables</CardTitle>
              <CardDescription>Estructura jerárquica del plan de cuentas</CardDescription>
            </div>
            <div className="flex gap-4">
              <ImportExcelModal
                isOpen={openImportModal}
                onClose={() => setOpenImportModal(false)}
                onSuccess={loadAccounts}
              />
              <Button onClick={() => setOpenImportModal(true)}>
                <IconUpload className="mr-2 h-4 w-4" /> Importar Excel
              </Button>
              <Button onClick={() => {
                setSelectedAccount(null)
                setOpenModal(true)
              }}>
                <IconPlus className="mr-2 h-4 w-4" />
                Nueva Cuenta
              </Button>
            </div>
          </div>

          {/* Filters y controles */}
          <div className="flex items-center py-4">
            <Input
              placeholder="Buscar cuentas por código o nombre..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columnas <IconChevronDown className="ml-2 h-4 w-4" />
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
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
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
                      <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
                }
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </div>
            <div className="flex w-full items-center gap-4 lg:w-fit">
              {/* Rows per page */}
              <div className="hidden items-center gap-2 lg:flex">
                <span className="text-sm font-medium">Filas por página</span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contador de página */}
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </div>

              {/* Botones de navegación */}
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Primera página</span>
                  <IconChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Página anterior</span>
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Página siguiente</span>
                  <IconChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Última página</span>
                  <IconChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ChartOfAccountModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          parents={rawAccounts} // 👈 directamente desde API
          account={selectedAccount}
          onSuccess={loadAccounts}
        />
      </div>
    </AppLayout>
  )
}
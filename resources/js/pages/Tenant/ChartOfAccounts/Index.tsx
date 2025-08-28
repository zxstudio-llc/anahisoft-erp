"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Plus, Search, ChevronRight, ChevronDown, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head, usePage } from "@inertiajs/react"
import ImportExcelModal from "./ImportExcelModal"
import CreateChartOfAccountModal from "./Create"

interface Account {
  id: string
  code: string
  name: string
  type: "asset" | "liability" | "equity" | "income" | "expense"
  level: number
  parentId?: string
  balance: number
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
  // Traer datos desde Inertia
  const { accounts: rawAccounts } = usePage().props as { accounts: any[] }

  // Asegurar que los montos sean numéricos
  const mapAccounts = (accounts: any[]): Account[] =>
    accounts.map((a) => ({
      id: String(a.id),
      code: String(a.code),
      name: String(a.name),
      type: a.account_type as Account["type"],
      level: Number(a.level ?? 0),
      parentId: a.parent_code ? String(a.parent_code) : undefined,
      // 👇 convertir a número SIEMPRE
      balance: Number(a.initial_balance ?? a.balance ?? 0),
      isActive: Boolean(a.active),
      description: String(a.description ?? ""),
      // soportar ambos nombres desde backend
      creditDebit: (a.credit_debit ?? a.credit_debit_type ?? "neutral") as Account["creditDebit"],
      children: a.children ? mapAccounts(a.children) : undefined,
    }))

  const accounts = useMemo(() => mapAccounts(rawAccounts || []), [rawAccounts])

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openModal, setOpenModal] = useState(false)


  const getTypeColor = (type: string) => {
    switch (type) {
      case "asset": return "bg-green-100 text-green-800"
      case "liability": return "bg-red-100 text-red-800"
      case "equity": return "bg-blue-100 text-blue-800"
      case "income": return "bg-purple-100 text-purple-800"
      case "expense": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case "asset": return "Activo"
      case "liability": return "Pasivo"
      case "equity": return "Patrimonio"
      case "income": return "Ingreso"
      case "expense": return "Gasto"
      default: return type
    }
  }

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const copy = new Set(prev)
      copy.has(nodeId) ? copy.delete(nodeId) : copy.add(nodeId)
      return copy
    })
  }

  // Filtro por búsqueda y tipo (a nivel raíz)
  const filteredRoots = useMemo(() => {
    const matches = (a: Account) =>
      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())

    const typeOk = (a: Account) => typeFilter === "all" || a.type === (typeFilter as Account["type"])

    // aplica filtro a todo el árbol pero mantiene jerarquía
    const deepFilter = (nodes: Account[]): Account[] =>
      nodes
        .map(n => ({
          ...n,
          children: n.children ? deepFilter(n.children) : undefined
        }))
        .filter(n => typeOk(n) && (matches(n) || (n.children && n.children.length > 0)))

    return deepFilter(accounts)
  }, [accounts, searchQuery, typeFilter])

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
    walk(filteredRoots)
    return list
  }, [filteredRoots, expandedNodes])

  // Paginación
  useEffect(() => {
    // si cambian filtros o expansión, vuelve a página 1
    setPage(1)
  }, [searchQuery, typeFilter, expandedNodes])

  const totalRows = visibleAccounts.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pageRows = visibleAccounts.slice(start, end)

  // Totales para los cards (sólo suma montos; ya son números)
  const flattenAll = (nodes: Account[]): Account[] => {
    const res: Account[] = []
    const walk = (xs: Account[]) => xs.forEach(x => { res.push(x); if (x.children) walk(x.children) })
    walk(accounts)
    return res
  }
  const flat = useMemo(() => flattenAll(accounts), [accounts])
  const totalAssets = useMemo(() => flat.filter(a => a.type === "asset").reduce((s, a) => s + (a.balance || 0), 0), [flat])
  const totalLiabilities = useMemo(() => flat.filter(a => a.type === "liability").reduce((s, a) => s + (a.balance || 0), 0), [flat])
  const totalEquity = useMemo(() => flat.filter(a => a.type === "equity").reduce((s, a) => s + (a.balance || 0), 0), [flat])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Plan de cuenta', href: '/finanzas/chart-of-statements' },
  ]

  const renderRow = (account: Account) => {
    const hasChildren = !!(account.children && account.children.length)
    const isExpanded = expandedNodes.has(account.id)
    const indent = (account.level ?? 0) * 20

    return (
      <TableRow key={account.id}>
        <TableCell>
          <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2"
                onClick={() => toggleExpanded(account.id)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <span className="font-mono font-medium">{account.code}</span>
          </div>
        </TableCell>
        <TableCell><span className="font-medium">{account.name}</span></TableCell>
        <TableCell><Badge className={getTypeColor(account.type)}>{getTypeName(account.type)}</Badge></TableCell>
        <TableCell className="text-right font-medium">{currency.format(account.balance || 0)}</TableCell>
        <TableCell>
          <Badge variant={account.isActive ? "default" : "secondary"}>
            {account.isActive ? "Activa" : "Inactiva"}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={
              account.creditDebit === "debit" ? "bg-green-100 text-green-800" :
              account.creditDebit === "credit" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }
          >
            {account.creditDebit === "debit" ? "Débito" :
             account.creditDebit === "credit" ? "Crédito" : "Neutral"}
          </Badge>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
              <DropdownMenuItem><Plus className="mr-2 h-4 w-4" />Agregar Subcuenta</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Plan de cuenta" />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan de Cuentas</h1>
            <p className="text-gray-600">Estructura contable de la empresa</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Activos</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{currency.format(totalAssets)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Pasivos</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{currency.format(totalLiabilities)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Patrimonio</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{currency.format(totalEquity)}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Cuentas Contables</CardTitle>
                  <CardDescription>Estructura jerárquica del plan de cuentas</CardDescription>
                </div>
                <div className="flex gap-4">
                <ImportExcelModal />
                <Button onClick={() => setOpenModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Cuenta
                </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar cuentas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Tipo de cuenta" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="asset">Activos</SelectItem>
                    <SelectItem value="liability">Pasivos</SelectItem>
                    <SelectItem value="equity">Patrimonio</SelectItem>
                    <SelectItem value="income">Ingresos</SelectItem>
                    <SelectItem value="expense">Gastos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-28"><SelectValue placeholder="Filas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Accounts Tree Table (paginado sobre filas visibles) */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Crédito/Débito</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length ? pageRows.map(renderRow) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">Sin resultados.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {totalRows ? start + 1 : 0}–{Math.min(end, totalRows)} de {totalRows}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <CreateChartOfAccountModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        parents={parents}
      />
      </div>
    </AppLayout>
  )
}

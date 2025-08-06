"use client"

import { useState } from "react"
import { Plus, Search, BookOpen, Calendar, MoreHorizontal, Eye, Edit, Trash2, FileText, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Head } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"

interface AccountingEntry {
  id: string
  entryNumber: string
  date: string
  description: string
  reference: string
  type: "income" | "expense" | "transfer" | "adjustment"
  status: "draft" | "posted" | "reversed"
  totalDebit: number
  totalCredit: number
  createdBy: string
  createdAt: string
  accounts: AccountDetail[]
}

interface AccountDetail {
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description: string
}

export default function AccountingEntries() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const accountingEntries: AccountingEntry[] = [
    {
      id: "1",
      entryNumber: "AST-2024-001",
      date: "2024-01-08",
      description: "Compra de equipos de oficina",
      reference: "FAC-001234",
      type: "expense",
      status: "posted",
      totalDebit: 5000,
      totalCredit: 5000,
      createdBy: "María González",
      createdAt: "2024-01-08T10:30:00",
      accounts: [
        {
          accountCode: "1205",
          accountName: "Equipos de Oficina",
          debit: 5000,
          credit: 0,
          description: "Compra de computadoras y mobiliario"
        },
        {
          accountCode: "1105",
          accountName: "Bancos",
          debit: 0,
          credit: 5000,
          description: "Pago mediante transferencia bancaria"
        }
      ]
    },
    {
      id: "2",
      entryNumber: "AST-2024-002",
      date: "2024-01-08",
      description: "Venta de servicios de consultoría",
      reference: "FAC-VTA-001",
      type: "income",
      status: "posted",
      totalDebit: 12000,
      totalCredit: 12000,
      createdBy: "Carlos Ruiz",
      createdAt: "2024-01-08T14:15:00",
      accounts: [
        {
          accountCode: "1305",
          accountName: "Cuentas por Cobrar",
          debit: 12000,
          credit: 0,
          description: "Facturación servicios enero 2024"
        },
        {
          accountCode: "4105",
          accountName: "Ingresos por Servicios",
          debit: 0,
          credit: 12000,
          description: "Consultoría empresarial"
        }
      ]
    },
    {
      id: "3",
      entryNumber: "AST-2024-003",
      date: "2024-01-07",
      description: "Pago de nómina mensual",
      reference: "NOM-ENE-2024",
      type: "expense",
      status: "posted",
      totalDebit: 45000,
      totalCredit: 45000,
      createdBy: "Ana López",
      createdAt: "2024-01-07T16:45:00",
      accounts: [
        {
          accountCode: "5105",
          accountName: "Sueldos y Salarios",
          debit: 35000,
          credit: 0,
          description: "Nómina enero 2024"
        },
        {
          accountCode: "5110",
          accountName: "Prestaciones Sociales",
          debit: 10000,
          credit: 0,
          description: "Beneficios y prestaciones"
        },
        {
          accountCode: "1105",
          accountName: "Bancos",
          debit: 0,
          credit: 45000,
          description: "Pago nómina vía transferencia"
        }
      ]
    },
    {
      id: "4",
      entryNumber: "AST-2024-004",
      date: "2024-01-06",
      description: "Transferencia entre cuentas bancarias",
      reference: "TRF-001",
      type: "transfer",
      status: "posted",
      totalDebit: 25000,
      totalCredit: 25000,
      createdBy: "Luis Martín",
      createdAt: "2024-01-06T11:20:00",
      accounts: [
        {
          accountCode: "1105",
          accountName: "Banco Principal",
          debit: 25000,
          credit: 0,
          description: "Transferencia recibida"
        },
        {
          accountCode: "1106",
          accountName: "Banco Secundario",
          debit: 0,
          credit: 25000,
          description: "Transferencia enviada"
        }
      ]
    },
    {
      id: "5",
      entryNumber: "AST-2024-005",
      date: "2024-01-05",
      description: "Ajuste por diferencia cambiaria",
      reference: "AJU-001",
      type: "adjustment",
      status: "draft",
      totalDebit: 1500,
      totalCredit: 1500,
      createdBy: "María González",
      createdAt: "2024-01-05T09:10:00",
      accounts: [
        {
          accountCode: "5205",
          accountName: "Gastos Financieros",
          debit: 1500,
          credit: 0,
          description: "Pérdida por diferencia cambiaria"
        },
        {
          accountCode: "1305",
          accountName: "Cuentas por Cobrar USD",
          debit: 0,
          credit: 1500,
          description: "Ajuste tipo de cambio"
        }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "reversed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800"
      case "expense":
        return "bg-red-100 text-red-800"
      case "transfer":
        return "bg-blue-100 text-blue-800"
      case "adjustment":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="h-3 w-3 mr-1" />
      case "expense":
        return <TrendingDown className="h-3 w-3 mr-1" />
      case "transfer":
        return <BookOpen className="h-3 w-3 mr-1" />
      case "adjustment":
        return <FileText className="h-3 w-3 mr-1" />
      default:
        return <BookOpen className="h-3 w-3 mr-1" />
    }
  }

  const filteredEntries = accountingEntries.filter((entry) => {
    const matchesSearch =
      entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.createdBy.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || entry.type === typeFilter
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const totalEntries = accountingEntries.length
  const postedEntries = accountingEntries.filter((entry) => entry.status === "posted").length
  const draftEntries = accountingEntries.filter((entry) => entry.status === "draft").length
  const totalDebits = accountingEntries.reduce((sum, entry) => sum + entry.totalDebit, 0)
  const totalCredits = accountingEntries.reduce((sum, entry) => sum + entry.totalCredit, 0)

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Estados de cuenta',
        href: '/finanzas/account-statements',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Estados de cuenta" />
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Asientos Contables</h1>
              <p className="text-gray-600">Registro y control de movimientos contables</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Asientos</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEntries}</div>
                  <p className="text-xs text-muted-foreground">Registros en el sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Asientos Contabilizados</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{postedEntries}</div>
                  <p className="text-xs text-muted-foreground">Movimientos confirmados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Débitos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalDebits.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Suma de débitos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalCredits.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Suma de créditos</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Registro de Asientos Contables</CardTitle>
                    <CardDescription>Movimientos contables del período</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Asiento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar asientos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="income">Ingresos</SelectItem>
                      <SelectItem value="expense">Gastos</SelectItem>
                      <SelectItem value="transfer">Transferencias</SelectItem>
                      <SelectItem value="adjustment">Ajustes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="posted">Contabilizado</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="reversed">Reversado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Entries Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Débito</TableHead>
                        <TableHead>Crédito</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Creado por</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono font-medium">
                            {entry.entryNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium truncate">{entry.description}</div>
                              <div className="text-sm text-gray-500">
                                {entry.accounts.length} cuenta{entry.accounts.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {entry.reference}
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(entry.type)}>
                              {getTypeIcon(entry.type)}
                              {entry.type === "income"
                                ? "Ingreso"
                                : entry.type === "expense"
                                ? "Gasto"
                                : entry.type === "transfer"
                                ? "Transferencia"
                                : "Ajuste"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            ${entry.totalDebit.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-red-600">
                            ${entry.totalCredit.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status === "posted"
                                ? "Contabilizado"
                                : entry.status === "draft"
                                ? "Borrador"
                                : "Reversado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{entry.createdBy}</div>
                              <div className="text-gray-500">
                                {new Date(entry.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Imprimir
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Duplicar
                                </DropdownMenuItem>
                                {entry.status === "posted" && (
                                  <DropdownMenuItem className="text-orange-600">
                                    <TrendingDown className="mr-2 h-4 w-4" />
                                    Reversar
                                  </DropdownMenuItem>
                                )}
                                {entry.status === "draft" && (
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredEntries.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron asientos que coincidan con los criterios.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
  )
}

"use client"

import { useState } from "react"
import { Plus, Search, FileText, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"

interface JournalEntry {
  id: string
  number: string
  date: string
  description: string
  reference: string
  status: "draft" | "posted" | "reversed"
  totalDebit: number
  totalCredit: number
  createdBy: string
  details: Array<{
    accountCode: string
    accountName: string
    debit: number
    credit: number
    description: string
  }>
}

interface JournalEntriesProps {
  entries?: JournalEntry[]
}

export default function JournalEntries({
  entries = [
    {
      id: "1",
      number: "JE-001",
      date: "2024-01-15",
      description: "Registro de venta de servicios",
      reference: "INV-001",
      status: "posted",
      totalDebit: 2500.0,
      totalCredit: 2500.0,
      createdBy: "Juan Pérez",
      details: [
        {
          accountCode: "1110",
          accountName: "Caja y Bancos",
          debit: 2500.0,
          credit: 0,
          description: "Cobro de factura INV-001",
        },
        {
          accountCode: "4100",
          accountName: "Ingresos por Servicios",
          debit: 0,
          credit: 2500.0,
          description: "Venta de servicios de consultoría",
        },
      ],
    },
    {
      id: "2",
      number: "JE-002",
      date: "2024-01-14",
      description: "Pago de nómina mensual",
      reference: "NOM-001",
      status: "posted",
      totalDebit: 8500.0,
      totalCredit: 8500.0,
      createdBy: "María González",
      details: [
        {
          accountCode: "5100",
          accountName: "Gastos de Personal",
          debit: 8500.0,
          credit: 0,
          description: "Pago de sueldos enero 2024",
        },
        {
          accountCode: "1110",
          accountName: "Caja y Bancos",
          debit: 0,
          credit: 8500.0,
          description: "Transferencia bancaria nómina",
        },
      ],
    },
    {
      id: "3",
      number: "JE-003",
      date: "2024-01-13",
      description: "Compra de suministros de oficina",
      reference: "COMP-001",
      status: "draft",
      totalDebit: 450.0,
      totalCredit: 450.0,
      createdBy: "Carlos Ruiz",
      details: [
        {
          accountCode: "5200",
          accountName: "Gastos de Oficina",
          debit: 450.0,
          credit: 0,
          description: "Compra de papelería y suministros",
        },
        {
          accountCode: "2110",
          accountName: "Cuentas por Pagar",
          debit: 0,
          credit: 450.0,
          description: "Deuda con proveedor Papelería Central",
        },
      ],
    },
  ],
}: JournalEntriesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

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

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalDebits = entries.reduce((sum, entry) => sum + entry.totalDebit, 0)
  const totalCredits = entries.reduce((sum, entry) => sum + entry.totalCredit, 0)
  const postedEntries = entries.filter((e) => e.status === "posted").length

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Asientos Diarios',
        href: '/finanzas/journal-entries',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Asientos Diarios" />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Libro Diario</h1>
          <p className="text-gray-600">Registro cronológico de asientos contables</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Asientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries.length}</div>
              <p className="text-xs text-muted-foreground">Registros totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Asientos Contabilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{postedEntries}</div>
              <p className="text-xs text-muted-foreground">Confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Débitos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalDebits.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCredits.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Journal Entries List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Asientos Contables</CardTitle>
                    <CardDescription>Lista de todos los asientos del libro diario</CardDescription>
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="posted">Contabilizado</SelectItem>
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
                        <TableHead className="text-right">Débito</TableHead>
                        <TableHead className="text-right">Crédito</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <TableCell className="font-medium">{entry.number}</TableCell>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{entry.description}</div>
                              <div className="text-sm text-gray-500">Ref: {entry.reference}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">${entry.totalDebit.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Imprimir
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entry Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalle del Asiento</CardTitle>
                <CardDescription>
                  {selectedEntry ? `${selectedEntry.number} - ${selectedEntry.description}` : "Selecciona un asiento"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEntry ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Fecha:</span>
                        <div>{new Date(selectedEntry.date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Referencia:</span>
                        <div>{selectedEntry.reference}</div>
                      </div>
                      <div>
                        <span className="font-medium">Creado por:</span>
                        <div>{selectedEntry.createdBy}</div>
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>
                        <Badge className={getStatusColor(selectedEntry.status)}>
                          {selectedEntry.status === "posted"
                            ? "Contabilizado"
                            : selectedEntry.status === "draft"
                              ? "Borrador"
                              : "Reversado"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Movimientos:</h4>
                      <div className="space-y-2">
                        {selectedEntry.details.map((detail, index) => (
                          <div key={index} className="border rounded p-3 text-sm">
                            <div className="font-medium">
                              {detail.accountCode} - {detail.accountName}
                            </div>
                            <div className="text-gray-600">{detail.description}</div>
                            <div className="flex justify-between mt-1">
                              <span>Débito: ${detail.debit.toLocaleString()}</span>
                              <span>Crédito: ${detail.credit.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-medium">
                        <span>Total Débito: ${selectedEntry.totalDebit.toLocaleString()}</span>
                        <span>Total Crédito: ${selectedEntry.totalCredit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">Haz clic en un asiento para ver los detalles</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  )
}

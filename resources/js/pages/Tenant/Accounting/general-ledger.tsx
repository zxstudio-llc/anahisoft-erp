"use client"

import { useState } from "react"
import { Search, Calendar, Download, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"

interface LedgerEntry {
  id: string
  date: string
  journalNumber: string
  description: string
  reference: string
  debit: number
  credit: number
  balance: number
}

interface Account {
  code: string
  name: string
  type: "asset" | "liability" | "equity" | "income" | "expense"
  openingBalance: number
  currentBalance: number
  entries: LedgerEntry[]
}

interface GeneralLedgerProps {
  accounts?: Account[]
}

export default function GeneralLedger({
  accounts = [
    {
      code: "1110",
      name: "Caja y Bancos",
      type: "asset",
      openingBalance: 50000,
      currentBalance: 45000,
      entries: [
        {
          id: "1",
          date: "2024-01-15",
          journalNumber: "JE-001",
          description: "Cobro de factura INV-001",
          reference: "INV-001",
          debit: 2500,
          credit: 0,
          balance: 52500,
        },
        {
          id: "2",
          date: "2024-01-14",
          journalNumber: "JE-002",
          description: "Pago de nómina mensual",
          reference: "NOM-001",
          debit: 0,
          credit: 8500,
          balance: 44000,
        },
        {
          id: "3",
          date: "2024-01-13",
          journalNumber: "JE-004",
          description: "Pago a proveedor",
          reference: "PROV-001",
          debit: 0,
          credit: 1500,
          balance: 45500,
        },
      ],
    },
    {
      code: "1120",
      name: "Cuentas por Cobrar",
      type: "asset",
      openingBalance: 80000,
      currentBalance: 85000,
      entries: [
        {
          id: "4",
          date: "2024-01-16",
          journalNumber: "JE-005",
          description: "Facturación de servicios",
          reference: "INV-002",
          debit: 1800,
          credit: 0,
          balance: 81800,
        },
        {
          id: "5",
          date: "2024-01-15",
          journalNumber: "JE-001",
          description: "Cobro de factura",
          reference: "INV-001",
          debit: 0,
          credit: 2500,
          balance: 80000,
        },
      ],
    },
    {
      code: "4100",
      name: "Ingresos por Servicios",
      type: "income",
      openingBalance: 0,
      currentBalance: 180000,
      entries: [
        {
          id: "6",
          date: "2024-01-15",
          journalNumber: "JE-001",
          description: "Venta de servicios de consultoría",
          reference: "INV-001",
          debit: 0,
          credit: 2500,
          balance: 2500,
        },
        {
          id: "7",
          date: "2024-01-16",
          journalNumber: "JE-005",
          description: "Servicios de desarrollo",
          reference: "INV-002",
          debit: 0,
          credit: 1800,
          balance: 4300,
        },
      ],
    },
  ],
}: GeneralLedgerProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(accounts[0] || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "asset":
        return "bg-green-100 text-green-800"
      case "liability":
        return "bg-red-100 text-red-800"
      case "equity":
        return "bg-blue-100 text-blue-800"
      case "income":
        return "bg-purple-100 text-purple-800"
      case "expense":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case "asset":
        return "Activo"
      case "liability":
        return "Pasivo"
      case "equity":
        return "Patrimonio"
      case "income":
        return "Ingreso"
      case "expense":
        return "Gasto"
      default:
        return type
    }
  }

  const filteredEntries = selectedAccount
    ? selectedAccount.entries.filter(
        (entry) =>
          entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.journalNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0)
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0)
  const balanceChange = selectedAccount ? selectedAccount.currentBalance - selectedAccount.openingBalance : 0

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Libro Mayor',
        href: '/finanzas/general-ledger',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Libro Mayor" />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Libro Mayor</h1>
          <p className="text-gray-600">Movimientos detallados por cuenta contable</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Accounts List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Cuentas</CardTitle>
                <CardDescription>Selecciona una cuenta para ver el mayor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <div
                      key={account.code}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAccount?.code === account.code ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="font-medium text-sm">{account.code}</div>
                      <div className="text-sm text-gray-600">{account.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <Badge className={getAccountTypeColor(account.type)} variant="outline">
                          {getTypeName(account.type)}
                        </Badge>
                        <span className="text-sm font-medium">${account.currentBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Details and Entries */}
          <div className="lg:col-span-3">
            {selectedAccount ? (
              <>
                {/* Account Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${selectedAccount.openingBalance.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${selectedAccount.currentBalance.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Variación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold flex items-center ${
                          balanceChange >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {balanceChange >= 0 ? (
                          <TrendingUp className="h-5 w-5 mr-1" />
                        ) : (
                          <TrendingDown className="h-5 w-5 mr-1" />
                        )}
                        ${Math.abs(balanceChange).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedAccount.entries.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Ledger */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>
                          {selectedAccount.code} - {selectedAccount.name}
                        </CardTitle>
                        <CardDescription>Movimientos del libro mayor</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Calendar className="mr-2 h-4 w-4" />
                          Filtrar Fechas
                        </Button>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Exportar
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
                          placeholder="Buscar movimientos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Ledger Entries Table */}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Asiento</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Referencia</TableHead>
                            <TableHead className="text-right">Débito</TableHead>
                            <TableHead className="text-right">Crédito</TableHead>
                            <TableHead className="text-right">Saldo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={4} className="font-medium">
                              Saldo Inicial
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right font-medium">
                              ${selectedAccount.openingBalance.toLocaleString()}
                            </TableCell>
                          </TableRow>
                          {filteredEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                              <TableCell className="font-medium">{entry.journalNumber}</TableCell>
                              <TableCell>{entry.description}</TableCell>
                              <TableCell>{entry.reference}</TableCell>
                              <TableCell className="text-right">
                                {entry.debit > 0 ? `$${entry.debit.toLocaleString()}` : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.credit > 0 ? `$${entry.credit.toLocaleString()}` : "-"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${entry.balance.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Totals */}
                    <div className="mt-4 flex justify-end">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-8 text-sm">
                          <div>
                            <span className="font-medium">Total Débitos:</span>
                            <div className="text-lg font-bold">${totalDebits.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="font-medium">Total Créditos:</span>
                            <div className="text-lg font-bold">${totalCredits.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="font-medium">Saldo Final:</span>
                            <div className="text-lg font-bold">${selectedAccount.currentBalance.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <div className="text-lg font-medium mb-2">Selecciona una cuenta</div>
                    <div>Elige una cuenta de la lista para ver sus movimientos</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  )
}

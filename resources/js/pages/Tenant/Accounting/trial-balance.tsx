"use client"

import { useState } from "react"
import { Download, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"

interface TrialBalanceAccount {
  code: string
  name: string
  type: "asset" | "liability" | "equity" | "income" | "expense"
  debitBalance: number
  creditBalance: number
}

interface TrialBalanceProps {
  accounts?: TrialBalanceAccount[]
  asOfDate?: string
}

export default function TrialBalance({
  accounts = [
    { code: "1110", name: "Caja y Bancos", type: "asset", debitBalance: 45000, creditBalance: 0 },
    { code: "1120", name: "Cuentas por Cobrar", type: "asset", debitBalance: 85000, creditBalance: 0 },
    { code: "1130", name: "Inventarios", type: "asset", debitBalance: 35000, creditBalance: 0 },
    { code: "1200", name: "Activos Fijos", type: "asset", debitBalance: 120000, creditBalance: 0 },
    { code: "2110", name: "Cuentas por Pagar", type: "liability", debitBalance: 0, creditBalance: 50000 },
    { code: "2120", name: "Préstamos Bancarios", type: "liability", debitBalance: 0, creditBalance: 80000 },
    { code: "3100", name: "Capital Social", type: "equity", debitBalance: 0, creditBalance: 100000 },
    { code: "3200", name: "Utilidades Retenidas", type: "equity", debitBalance: 0, creditBalance: 30000 },
    { code: "4100", name: "Ingresos por Ventas", type: "income", debitBalance: 0, creditBalance: 180000 },
    { code: "4200", name: "Ingresos por Servicios", type: "income", debitBalance: 0, creditBalance: 95000 },
    { code: "5100", name: "Costo de Ventas", type: "expense", debitBalance: 75000, creditBalance: 0 },
    { code: "5200", name: "Gastos Administrativos", type: "expense", debitBalance: 45000, creditBalance: 0 },
    { code: "5300", name: "Gastos de Ventas", type: "expense", debitBalance: 35000, creditBalance: 0 },
  ],
  asOfDate = "2024-01-31",
}: TrialBalanceProps) {
  const [periodFilter, setPeriodFilter] = useState("current")

  const getTypeColor = (type: string) => {
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

  // Group accounts by type
  const groupedAccounts = accounts.reduce(
    (groups, account) => {
      if (!groups[account.type]) {
        groups[account.type] = []
      }
      groups[account.type].push(account)
      return groups
    },
    {} as Record<string, TrialBalanceAccount[]>,
  )

  // Calculate totals
  const totalDebits = accounts.reduce((sum, account) => sum + account.debitBalance, 0)
  const totalCredits = accounts.reduce((sum, account) => sum + account.creditBalance, 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  // Calculate totals by type
  const assetTotal = (groupedAccounts.asset || []).reduce((sum, acc) => sum + acc.debitBalance, 0)
  const liabilityTotal = (groupedAccounts.liability || []).reduce((sum, acc) => sum + acc.creditBalance, 0)
  const equityTotal = (groupedAccounts.equity || []).reduce((sum, acc) => sum + acc.creditBalance, 0)
  const incomeTotal = (groupedAccounts.income || []).reduce((sum, acc) => sum + acc.creditBalance, 0)
  const expenseTotal = (groupedAccounts.expense || []).reduce((sum, acc) => sum + acc.debitBalance, 0)

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Balance',
        href: '/finanzas/trial-balance',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Balance" />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Balance de Comprobación</h1>
          <p className="text-gray-600">Verificación de saldos contables al {new Date(asOfDate).toLocaleDateString()}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${assetTotal.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pasivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${liabilityTotal.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Patrimonio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${equityTotal.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${incomeTotal.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${expenseTotal.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Balance Status */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              {isBalanced ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  <span className="text-lg font-medium">Balance Cuadrado</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <span className="text-lg font-medium">
                    Balance Descuadrado - Diferencia: ${Math.abs(totalDebits - totalCredits).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Balance de Comprobación</CardTitle>
                <CardDescription>Saldos de todas las cuentas contables</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Período Actual</SelectItem>
                    <SelectItem value="previous">Período Anterior</SelectItem>
                    <SelectItem value="ytd">Año a la Fecha</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Cambiar Fecha
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre de la Cuenta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Débito</TableHead>
                    <TableHead className="text-right">Crédito</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                    <>
                      <TableRow key={`header-${type}`} className="bg-gray-50">
                        <TableCell colSpan={5} className="font-bold text-gray-700">
                          {getTypeName(type).toUpperCase()}
                        </TableCell>
                      </TableRow>
                      {typeAccounts.map((account) => (
                        <TableRow key={account.code}>
                          <TableCell className="font-mono">{account.code}</TableCell>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(account.type)} variant="outline">
                              {getTypeName(account.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {account.debitBalance > 0 ? `$${account.debitBalance.toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {account.creditBalance > 0 ? `$${account.creditBalance.toLocaleString()}` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow key={`subtotal-${type}`} className="border-t">
                        <TableCell colSpan={3} className="font-medium text-gray-600">
                          Subtotal {getTypeName(type)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${typeAccounts.reduce((sum, acc) => sum + acc.debitBalance, 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${typeAccounts.reduce((sum, acc) => sum + acc.creditBalance, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                  <TableRow className="bg-gray-100 font-bold">
                    <TableCell colSpan={3}>TOTALES</TableCell>
                    <TableCell className="text-right">${totalDebits.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${totalCredits.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Balance Verification */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Total Débitos</div>
                  <div className="text-2xl font-bold">${totalDebits.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Créditos</div>
                  <div className="text-2xl font-bold">${totalCredits.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Diferencia</div>
                  <div className={`text-2xl font-bold ${isBalanced ? "text-green-600" : "text-red-600"}`}>
                    ${Math.abs(totalDebits - totalCredits).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  )
}

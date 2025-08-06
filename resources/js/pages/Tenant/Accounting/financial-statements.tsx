"use client"

import { useState } from "react"
import { Download, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"

interface FinancialData {
  balanceSheet: {
    assets: {
      current: Array<{ name: string; amount: number }>
      nonCurrent: Array<{ name: string; amount: number }>
    }
    liabilities: {
      current: Array<{ name: string; amount: number }>
      nonCurrent: Array<{ name: string; amount: number }>
    }
    equity: Array<{ name: string; amount: number }>
  }
  incomeStatement: {
    revenue: Array<{ name: string; amount: number }>
    expenses: Array<{ name: string; amount: number }>
  }
  cashFlow: {
    operating: Array<{ name: string; amount: number }>
    investing: Array<{ name: string; amount: number }>
    financing: Array<{ name: string; amount: number }>
  }
}

interface FinancialStatementsProps {
  data?: FinancialData
  period?: string
}

export default function FinancialStatements({
  data = {
    balanceSheet: {
      assets: {
        current: [
          { name: "Caja y Bancos", amount: 45000 },
          { name: "Cuentas por Cobrar", amount: 85000 },
          { name: "Inventarios", amount: 35000 },
        ],
        nonCurrent: [
          { name: "Propiedad, Planta y Equipo", amount: 120000 },
          { name: "Activos Intangibles", amount: 25000 },
        ],
      },
      liabilities: {
        current: [
          { name: "Cuentas por Pagar", amount: 50000 },
          { name: "Préstamos a Corto Plazo", amount: 30000 },
        ],
        nonCurrent: [{ name: "Préstamos a Largo Plazo", amount: 80000 }],
      },
      equity: [
        { name: "Capital Social", amount: 100000 },
        { name: "Utilidades Retenidas", amount: 50000 },
      ],
    },
    incomeStatement: {
      revenue: [
        { name: "Ingresos por Ventas", amount: 180000 },
        { name: "Ingresos por Servicios", amount: 95000 },
      ],
      expenses: [
        { name: "Costo de Ventas", amount: 75000 },
        { name: "Gastos Administrativos", amount: 45000 },
        { name: "Gastos de Ventas", amount: 35000 },
        { name: "Gastos Financieros", amount: 8000 },
      ],
    },
    cashFlow: {
      operating: [
        { name: "Utilidad Neta", amount: 112000 },
        { name: "Depreciación", amount: 15000 },
        { name: "Cambios en Capital de Trabajo", amount: -8000 },
      ],
      investing: [
        { name: "Compra de Activos Fijos", amount: -25000 },
        { name: "Venta de Equipos", amount: 5000 },
      ],
      financing: [
        { name: "Préstamos Obtenidos", amount: 20000 },
        { name: "Pago de Dividendos", amount: -15000 },
      ],
    },
  },
  period = "2024",
}: FinancialStatementsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  // Balance Sheet Calculations
  const totalCurrentAssets = data.balanceSheet.assets.current.reduce((sum, item) => sum + item.amount, 0)
  const totalNonCurrentAssets = data.balanceSheet.assets.nonCurrent.reduce((sum, item) => sum + item.amount, 0)
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets

  const totalCurrentLiabilities = data.balanceSheet.liabilities.current.reduce((sum, item) => sum + item.amount, 0)
  const totalNonCurrentLiabilities = data.balanceSheet.liabilities.nonCurrent.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities

  const totalEquity = data.balanceSheet.equity.reduce((sum, item) => sum + item.amount, 0)

  // Income Statement Calculations
  const totalRevenue = data.incomeStatement.revenue.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = data.incomeStatement.expenses.reduce((sum, item) => sum + item.amount, 0)
  const netIncome = totalRevenue - totalExpenses

  // Cash Flow Calculations
  const operatingCashFlow = data.cashFlow.operating.reduce((sum, item) => sum + item.amount, 0)
  const investingCashFlow = data.cashFlow.investing.reduce((sum, item) => sum + item.amount, 0)
  const financingCashFlow = data.cashFlow.financing.reduce((sum, item) => sum + item.amount, 0)
  const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Estados financieros',
        href: '/finanzas/financial-statements',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Estados financieros" />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Estados Financieros</h1>
              <p className="text-gray-600">Reportes financieros principales de la empresa</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">Año 2024</SelectItem>
                  <SelectItem value="2023">Año 2023</SelectItem>
                  <SelectItem value="q4-2024">Q4 2024</SelectItem>
                  <SelectItem value="q3-2024">Q3 2024</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Período
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                +15.2% vs período anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${netIncome.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                +8.7% vs período anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAssets.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                +5.3% vs período anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Flujo de Efectivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${netCashFlow.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12.1% vs período anterior
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="balance-sheet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="balance-sheet">Balance General</TabsTrigger>
            <TabsTrigger value="income-statement">Estado de Resultados</TabsTrigger>
            <TabsTrigger value="cash-flow">Flujo de Efectivo</TabsTrigger>
          </TabsList>

          {/* Balance Sheet */}
          <TabsContent value="balance-sheet">
            <Card>
              <CardHeader>
                <CardTitle>Balance General</CardTitle>
                <CardDescription>Situación financiera al {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Assets */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">ACTIVOS</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Activos Corrientes</h4>
                        <Table>
                          <TableBody>
                            {data.balanceSheet.assets.current.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="py-2">{item.name}</TableCell>
                                <TableCell className="py-2 text-right">${item.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t font-medium">
                              <TableCell className="py-2">Total Activos Corrientes</TableCell>
                              <TableCell className="py-2 text-right">${totalCurrentAssets.toLocaleString()}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Activos No Corrientes</h4>
                        <Table>
                          <TableBody>
                            {data.balanceSheet.assets.nonCurrent.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="py-2">{item.name}</TableCell>
                                <TableCell className="py-2 text-right">${item.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t font-medium">
                              <TableCell className="py-2">Total Activos No Corrientes</TableCell>
                              <TableCell className="py-2 text-right">
                                ${totalNonCurrentAssets.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">TOTAL ACTIVOS</span>
                          <span className="text-lg font-bold">${totalAssets.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities and Equity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">PASIVOS Y PATRIMONIO</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Pasivos Corrientes</h4>
                        <Table>
                          <TableBody>
                            {data.balanceSheet.liabilities.current.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="py-2">{item.name}</TableCell>
                                <TableCell className="py-2 text-right">${item.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t font-medium">
                              <TableCell className="py-2">Total Pasivos Corrientes</TableCell>
                              <TableCell className="py-2 text-right">
                                ${totalCurrentLiabilities.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Pasivos No Corrientes</h4>
                        <Table>
                          <TableBody>
                            {data.balanceSheet.liabilities.nonCurrent.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="py-2">{item.name}</TableCell>
                                <TableCell className="py-2 text-right">${item.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t font-medium">
                              <TableCell className="py-2">Total Pasivos No Corrientes</TableCell>
                              <TableCell className="py-2 text-right">
                                ${totalNonCurrentLiabilities.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Patrimonio</h4>
                        <Table>
                          <TableBody>
                            {data.balanceSheet.equity.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="py-2">{item.name}</TableCell>
                                <TableCell className="py-2 text-right">${item.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t font-medium">
                              <TableCell className="py-2">Total Patrimonio</TableCell>
                              <TableCell className="py-2 text-right">${totalEquity.toLocaleString()}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">TOTAL PASIVOS Y PATRIMONIO</span>
                          <span className="text-lg font-bold">
                            ${(totalLiabilities + totalEquity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Statement */}
          <TabsContent value="income-statement">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Resultados</CardTitle>
                <CardDescription>Período terminado el {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl mx-auto">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">INGRESOS</h4>
                      <Table>
                        <TableBody>
                          {data.incomeStatement.revenue.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="py-2">{item.name}</TableCell>
                              <TableCell className="py-2 text-right">${item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t font-medium bg-green-50">
                            <TableCell className="py-3">Total Ingresos</TableCell>
                            <TableCell className="py-3 text-right">${totalRevenue.toLocaleString()}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">GASTOS</h4>
                      <Table>
                        <TableBody>
                          {data.incomeStatement.expenses.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="py-2">{item.name}</TableCell>
                              <TableCell className="py-2 text-right">${item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t font-medium bg-red-50">
                            <TableCell className="py-3">Total Gastos</TableCell>
                            <TableCell className="py-3 text-right">${totalExpenses.toLocaleString()}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-lg">
                          <span>Total Ingresos</span>
                          <span>${totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                          <span>Total Gastos</span>
                          <span>(${totalExpenses.toLocaleString()})</span>
                        </div>
                        <hr className="border-gray-300" />
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>UTILIDAD NETA</span>
                          <span className={netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                            ${netIncome.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Ratios */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-600">Margen Bruto</div>
                        <div className="text-2xl font-bold">
                          {(
                            ((totalRevenue -
                              data.incomeStatement.expenses.find((e) => e.name === "Costo de Ventas")?.amount || 0) /
                              totalRevenue) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-600">Margen Neto</div>
                        <div className="text-2xl font-bold">{((netIncome / totalRevenue) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Statement */}
          <TabsContent value="cash-flow">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Flujo de Efectivo</CardTitle>
                <CardDescription>Período terminado el {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl mx-auto">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">ACTIVIDADES OPERACIONALES</h4>
                      <Table>
                        <TableBody>
                          {data.cashFlow.operating.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="py-2">{item.name}</TableCell>
                              <TableCell className="py-2 text-right">
                                {item.amount >= 0 ? "" : "("}${Math.abs(item.amount).toLocaleString()}
                                {item.amount < 0 ? ")" : ""}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t font-medium bg-blue-50">
                            <TableCell className="py-3">Flujo de Efectivo de Actividades Operacionales</TableCell>
                            <TableCell className="py-3 text-right">${operatingCashFlow.toLocaleString()}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">ACTIVIDADES DE INVERSIÓN</h4>
                      <Table>
                        <TableBody>
                          {data.cashFlow.investing.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="py-2">{item.name}</TableCell>
                              <TableCell className="py-2 text-right">
                                {item.amount >= 0 ? "" : "("}${Math.abs(item.amount).toLocaleString()}
                                {item.amount < 0 ? ")" : ""}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t font-medium bg-orange-50">
                            <TableCell className="py-3">Flujo de Efectivo de Actividades de Inversión</TableCell>
                            <TableCell className="py-3 text-right">
                              {investingCashFlow >= 0 ? "" : "("}${Math.abs(investingCashFlow).toLocaleString()}
                              {investingCashFlow < 0 ? ")" : ""}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">ACTIVIDADES DE FINANCIAMIENTO</h4>
                      <Table>
                        <TableBody>
                          {data.cashFlow.financing.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="py-2">{item.name}</TableCell>
                              <TableCell className="py-2 text-right">
                                {item.amount >= 0 ? "" : "("}${Math.abs(item.amount).toLocaleString()}
                                {item.amount < 0 ? ")" : ""}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t font-medium bg-purple-50">
                            <TableCell className="py-3">Flujo de Efectivo de Actividades de Financiamiento</TableCell>
                            <TableCell className="py-3 text-right">
                              {financingCashFlow >= 0 ? "" : "("}${Math.abs(financingCashFlow).toLocaleString()}
                              {financingCashFlow < 0 ? ")" : ""}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Flujo de Actividades Operacionales</span>
                          <span>${operatingCashFlow.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Flujo de Actividades de Inversión</span>
                          <span>
                            {investingCashFlow >= 0 ? "" : "("}${Math.abs(investingCashFlow).toLocaleString()}
                            {investingCashFlow < 0 ? ")" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Flujo de Actividades de Financiamiento</span>
                          <span>
                            {financingCashFlow >= 0 ? "" : "("}${Math.abs(financingCashFlow).toLocaleString()}
                            {financingCashFlow < 0 ? ")" : ""}
                          </span>
                        </div>
                        <hr className="border-gray-300" />
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>AUMENTO (DISMINUCIÓN) NETO EN EFECTIVO</span>
                          <span className={netCashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                            {netCashFlow >= 0 ? "" : "("}${Math.abs(netCashFlow).toLocaleString()}
                            {netCashFlow < 0 ? ")" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AppLayout>
  )
}

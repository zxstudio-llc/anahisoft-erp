"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, DollarSign, FileText, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface FinancialReportsProps {
  reportData?: {
    revenue: { current: number; previous: number; change: number }
    expenses: { current: number; previous: number; change: number }
    profit: { current: number; previous: number; change: number }
    invoices: { paid: number; pending: number; overdue: number }
  }
  monthlyData?: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
}

export default function FinancialReports({
  reportData = {
    revenue: { current: 45231.89, previous: 38942.15, change: 16.1 },
    expenses: { current: 12450.32, previous: 11230.45, change: 10.9 },
    profit: { current: 32781.57, previous: 27711.7, change: 18.3 },
    invoices: { paid: 156, pending: 23, overdue: 8 },
  },
  monthlyData = [
    { month: "Jan", revenue: 42000, expenses: 11000, profit: 31000 },
    { month: "Feb", revenue: 38000, expenses: 10500, profit: 27500 },
    { month: "Mar", revenue: 45000, expenses: 12000, profit: 33000 },
    { month: "Apr", revenue: 41000, expenses: 11500, profit: 29500 },
    { month: "May", revenue: 48000, expenses: 13000, profit: 35000 },
    { month: "Jun", revenue: 45231, expenses: 12450, profit: 32781 },
  ],
}: FinancialReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
              <p className="text-gray-600">Track your business performance and financial health</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.revenue.current)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.revenue.change >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span className={reportData.revenue.change >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(reportData.revenue.change)} from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.expenses.current)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.expenses.change >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-red-600" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-green-600" />
                )}
                <span className={reportData.expenses.change >= 0 ? "text-red-600" : "text-green-600"}>
                  {formatPercentage(reportData.expenses.change)} from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.profit.current)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.profit.change >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span className={reportData.profit.change >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(reportData.profit.change)} from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Paid:</span>
                  <span className="font-medium text-green-600">{reportData.invoices.paid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="font-medium text-yellow-600">{reportData.invoices.pending}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overdue:</span>
                  <span className="font-medium text-red-600">{reportData.invoices.overdue}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Revenue, expenses, and profit over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((data) => {
                    const margin = (data.profit / data.revenue) * 100
                    return (
                      <TableRow key={data.month}>
                        <TableCell className="font-medium">{data.month}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.expenses)}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(data.profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-green-600">
                            {margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
              <CardDescription>Your most valuable customers this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Acme Corp", revenue: 8500, percentage: 18.8 },
                  { name: "Tech Solutions", revenue: 6200, percentage: 13.7 },
                  { name: "Global Industries", revenue: 5800, percentage: 12.8 },
                  { name: "StartupXYZ", revenue: 4100, percentage: 9.1 },
                ].map((customer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.percentage}% of total</div>
                    </div>
                    <div className="font-bold">{formatCurrency(customer.revenue)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>How customers are paying you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { method: "Bank Transfer", count: 89, percentage: 47.6 },
                  { method: "Credit Card", count: 65, percentage: 34.8 },
                  { method: "PayPal", count: 23, percentage: 12.3 },
                  { method: "Check", count: 10, percentage: 5.3 },
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{payment.method}</div>
                      <div className="text-sm text-gray-500">{payment.percentage}% of payments</div>
                    </div>
                    <div className="font-bold">{payment.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

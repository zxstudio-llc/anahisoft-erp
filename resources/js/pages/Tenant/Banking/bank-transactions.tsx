"use client"

import { useState } from "react"
import { Search, Download, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  id: string
  date: string
  description: string
  type: "income" | "expense" | "transfer"
  amount: number
  balance: number
  category: string
  account: string
  reference: string
  status: "completed" | "pending" | "failed"
}

interface BankTransactionsProps {
  transactions?: Transaction[]
}

export default function BankTransactions({
  transactions = [
    {
      id: "1",
      date: "2024-01-15",
      description: "Pago de cliente - Acme Corp",
      type: "income",
      amount: 2500.0,
      balance: 45230.5,
      category: "Ventas",
      account: "Chase Business Checking",
      reference: "INV-001",
      status: "completed",
    },
    {
      id: "2",
      date: "2024-01-14",
      description: "Pago de nómina",
      type: "expense",
      amount: -8500.0,
      balance: 42730.5,
      category: "Nómina",
      account: "Chase Business Checking",
      reference: "PAY-001",
      status: "completed",
    },
    {
      id: "3",
      date: "2024-01-13",
      description: "Transferencia a ahorros",
      type: "transfer",
      amount: -10000.0,
      balance: 51230.5,
      category: "Transferencia",
      account: "Chase Business Checking",
      reference: "TRF-001",
      status: "completed",
    },
    {
      id: "4",
      date: "2024-01-12",
      description: "Pago de servicios públicos",
      type: "expense",
      amount: -450.0,
      balance: 61230.5,
      category: "Servicios",
      account: "Chase Business Checking",
      reference: "UTIL-001",
      status: "completed",
    },
    {
      id: "5",
      date: "2024-01-11",
      description: "Pago pendiente - Tech Solutions",
      type: "income",
      amount: 1800.0,
      balance: 61680.5,
      category: "Ventas",
      account: "Chase Business Checking",
      reference: "INV-002",
      status: "pending",
    },
  ],
}: BankTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [accountFilter, setAccountFilter] = useState("all")

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case "expense":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case "transfer":
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesAccount = accountFilter === "all" || transaction.account === accountFilter
    return matchesSearch && matchesType && matchesAccount
  })

  const accounts = Array.from(new Set(transactions.map((t) => t.account)))

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transacciones Bancarias</h1>
          <p className="text-gray-600">Historial completo de movimientos bancarios</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Historial de Transacciones</CardTitle>
                <CardDescription>Todos los movimientos bancarios registrados</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Rango de Fechas
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
                  placeholder="Buscar transacciones..."
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
                </SelectContent>
              </Select>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las cuentas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transactions Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span>{transaction.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{transaction.account}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">${transaction.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status === "completed"
                            ? "Completada"
                            : transaction.status === "pending"
                              ? "Pendiente"
                              : "Fallida"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron transacciones que coincidan con los criterios.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

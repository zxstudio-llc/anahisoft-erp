"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  accountType: "checking" | "savings" | "credit" | "investment"
  currency: string
  balance: number
  status: "active" | "inactive" | "frozen"
  lastTransaction: string
}

interface BankAccountsProps {
  accounts?: BankAccount[]
}

export default function BankAccounts({
  accounts = [
    {
      id: "1",
      bankName: "Chase Bank",
      accountName: "Business Checking",
      accountNumber: "****1234",
      accountType: "checking",
      currency: "USD",
      balance: 45230.5,
      status: "active",
      lastTransaction: "2024-01-15",
    },
    {
      id: "2",
      bankName: "Bank of America",
      accountName: "Business Savings",
      accountNumber: "****5678",
      accountType: "savings",
      currency: "USD",
      balance: 125000.0,
      status: "active",
      lastTransaction: "2024-01-14",
    },
    {
      id: "3",
      bankName: "Wells Fargo",
      accountName: "Business Credit Line",
      accountNumber: "****9012",
      accountType: "credit",
      currency: "USD",
      balance: -5500.0,
      status: "active",
      lastTransaction: "2024-01-13",
    },
    {
      id: "4",
      bankName: "Citibank",
      accountName: "Investment Account",
      accountNumber: "****3456",
      accountType: "investment",
      currency: "USD",
      balance: 75000.0,
      status: "active",
      lastTransaction: "2024-01-12",
    },
  ],
}: BankAccountsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "checking":
        return "bg-blue-100 text-blue-800"
      case "savings":
        return "bg-green-100 text-green-800"
      case "credit":
        return "bg-orange-100 text-orange-800"
      case "investment":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "frozen":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || account.accountType === typeFilter
    return matchesSearch && matchesType
  })

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cuentas Bancarias</h1>
          <p className="text-gray-600">Gestiona todas tus cuentas bancarias y monitorea balances</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +2.5% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuentas Activas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.filter((a) => a.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">de {accounts.length} cuentas totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efectivo Disponible</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {accounts
                  .filter((a) => a.accountType === "checking" || a.accountType === "savings")
                  .reduce((sum, a) => sum + a.balance, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">En cuentas corrientes y ahorros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Líneas de Crédito</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {Math.abs(
                  accounts.filter((a) => a.accountType === "credit").reduce((sum, a) => sum + a.balance, 0),
                ).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Utilizado en créditos</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Todas las Cuentas</CardTitle>
                <CardDescription>Lista de todas las cuentas bancarias registradas</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Cuenta
              </Button>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="checking">Corriente</SelectItem>
                  <SelectItem value="savings">Ahorros</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="investment">Inversión</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accounts Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banco</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Última Transacción</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{account.bankName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{account.accountName}</TableCell>
                      <TableCell className="font-mono">{account.accountNumber}</TableCell>
                      <TableCell>
                        <Badge className={getAccountTypeColor(account.accountType)}>
                          {account.accountType === "checking"
                            ? "Corriente"
                            : account.accountType === "savings"
                              ? "Ahorros"
                              : account.accountType === "credit"
                                ? "Crédito"
                                : "Inversión"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(account.status)}>
                          {account.status === "active"
                            ? "Activa"
                            : account.status === "inactive"
                              ? "Inactiva"
                              : "Congelada"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${account.balance < 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        ${account.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>{new Date(account.lastTransaction).toLocaleDateString()}</TableCell>
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
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
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
    </div>
  )
}

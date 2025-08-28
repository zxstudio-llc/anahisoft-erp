"use client"

import { useState } from "react"
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

export default function ChartOfAccounts() {
    // Traer datos desde Inertia
    const { accounts: rawAccounts } = usePage().props as { accounts: any[] }

    const mapAccounts = (accounts: any[]): Account[] =>
        accounts.map((a) => ({
            id: String(a.id),
            code: a.code,
            name: a.name,
            type: a.account_type,
            level: a.level,
            parentId: a.parent_code || undefined,
            balance: a.initial_balance || 0,
            isActive: a.active,
            description: a.description || "",
            creditDebit: a.credit_debit || "neutral", // valor traído desde backend
            children: a.children ? mapAccounts(a.children) : undefined,
        }))


    const accounts = mapAccounts(rawAccounts || [])

    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        const newExpanded = new Set(expandedNodes)
        if (newExpanded.has(nodeId)) newExpanded.delete(nodeId)
        else newExpanded.add(nodeId)
        setExpandedNodes(newExpanded)
    }

    const renderAccountRow = (account: Account) => {
        const hasChildren = account.children && account.children.length > 0
        const isExpanded = expandedNodes.has(account.id)
        const indent = account.level * 20

        return (
            <>
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
                    <TableCell className="text-right font-medium">${account.balance.toLocaleString()}</TableCell>
                    <TableCell>
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={
                            account.creditDebit === "debit" ? "bg-green-100 text-green-800" :
                                account.creditDebit === "credit" ? "bg-red-100 text-red-800" :
                                    "bg-gray-100 text-gray-800"
                        }>
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
                {hasChildren && isExpanded && account.children?.map(renderAccountRow)}
            </>
        )
    }

    const flattenAccounts = (accounts: Account[]): Account[] => {
        const result: Account[] = []
        const flatten = (accs: Account[]) => {
            accs.forEach((acc) => {
                result.push(acc)
                if (acc.children) flatten(acc.children)
            })
        }
        flatten(accounts)
        return result
    }

    const filteredAccounts = accounts.filter((account) => {
        const matchesSearch = account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = typeFilter === "all" || account.type === typeFilter
        return matchesSearch && matchesType
    })

    const totalAssets = flattenAccounts(accounts).filter(a => a.type === "asset").reduce((sum, a) => sum + a.balance, 0)
    const totalLiabilities = flattenAccounts(accounts).filter(a => a.type === "liability").reduce((sum, a) => sum + a.balance, 0)
    const totalEquity = flattenAccounts(accounts).filter(a => a.type === "equity").reduce((sum, a) => sum + a.balance, 0)

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Plan de cuenta', href: '/finanzas/chart-of-statements' },
    ]

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
                            <CardContent><div className="text-2xl font-bold text-green-600">${totalAssets.toLocaleString()}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Pasivos</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold text-red-600">${totalLiabilities.toLocaleString()}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Patrimonio</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold text-blue-600">${totalEquity.toLocaleString()}</div></CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle>Cuentas Contables</CardTitle>
                                    <CardDescription>Estructura jerárquica del plan de cuentas</CardDescription>
                                </div>
                                <ImportExcelModal />
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nueva Cuenta
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input placeholder="Buscar cuentas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                            </div>

                            {/* Accounts Tree Table */}
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
                                    <TableBody>{filteredAccounts.map(renderAccountRow)}</TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}

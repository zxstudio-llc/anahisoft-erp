"use client"

import { useState } from "react"
import { Package, TrendingUp, TrendingDown, ArrowUpDown, Download, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout"

interface StockMovement {
  id: string
  date: string
  product: string
  sku: string
  type: "in" | "out" | "transfer" | "adjustment"
  quantity: number
  warehouse: string
  reference: string
  user: string
  cost: number
}

interface StockMovementsProps {
  movements?: StockMovement[]
}

export default function StockMovements({
  movements = [
    {
      id: "MOV-001",
      date: "2024-01-15",
      product: "Laptop Dell XPS 13",
      sku: "LAP-001",
      type: "in",
      quantity: 50,
      warehouse: "Main Warehouse",
      reference: "PO-2024-001",
      user: "John Doe",
      cost: 45000,
    },
    {
      id: "MOV-002",
      date: "2024-01-15",
      product: "iPhone 15 Pro",
      sku: "PHN-001",
      type: "out",
      quantity: -25,
      warehouse: "Main Warehouse",
      reference: "SO-2024-015",
      user: "Jane Smith",
      cost: 25000,
    },
    {
      id: "MOV-003",
      date: "2024-01-14",
      product: 'Samsung Monitor 27"',
      sku: "MON-001",
      type: "transfer",
      quantity: 10,
      warehouse: "Secondary Warehouse",
      reference: "TR-2024-003",
      user: "Mike Johnson",
      cost: 3000,
    },
    {
      id: "MOV-004",
      date: "2024-01-14",
      product: "Wireless Mouse",
      sku: "MOU-001",
      type: "adjustment",
      quantity: -5,
      warehouse: "Main Warehouse",
      reference: "ADJ-2024-001",
      user: "Admin",
      cost: 150,
    },
  ],
}: StockMovementsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedWarehouse, setSelectedWarehouse] = useState("all")
  const [error, setError] = useState<string | null>(null);

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case "in":
        return "bg-green-100 text-green-800"
      case "out":
        return "bg-red-100 text-red-800"
      case "transfer":
        return "bg-blue-100 text-blue-800"
      case "adjustment":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4" />
      case "out":
        return <TrendingDown className="h-4 w-4" />
      case "transfer":
        return <ArrowUpDown className="h-4 w-4" />
      case "adjustment":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || movement.type === selectedType
    const matchesWarehouse = selectedWarehouse === "all" || movement.warehouse === selectedWarehouse

    return matchesSearch && matchesType && matchesWarehouse
  })

  const totalValue = filteredMovements.reduce((sum, movement) => sum + Math.abs(movement.cost), 0)

  const breadcrumbs = [
    { title: 'Inicio', href: '/' },
    { title: 'Produccion', href: '/inventory' },
    { title: 'Ordenes', href: '/inventory/purchase-orders' },
];

if (error) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="p-4 text-center text-red-500">{error}</div>
        </AppSidebarLayout>
    );
}

return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Movements</h1>
              <p className="text-gray-600">Track all inventory movements and transactions</p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredMovements.length}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock In</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredMovements.filter((m) => m.type === "in").length}
              </div>
              <p className="text-xs text-muted-foreground">Incoming items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {filteredMovements.filter((m) => m.type === "out").length}
              </div>
              <p className="text-xs text-muted-foreground">Outgoing items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Movement value</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Movement Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                  <SelectItem value="Secondary Warehouse">Secondary Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Movements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Movements</CardTitle>
            <CardDescription>Complete history of all inventory movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{movement.product}</TableCell>
                      <TableCell>{movement.sku}</TableCell>
                      <TableCell>
                        <Badge className={getMovementTypeColor(movement.type)}>
                          <span className="flex items-center gap-1">
                            {getMovementIcon(movement.type)}
                            {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          movement.quantity > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </TableCell>
                      <TableCell>{movement.warehouse}</TableCell>
                      <TableCell>{movement.reference}</TableCell>
                      <TableCell>{movement.user}</TableCell>
                      <TableCell className="text-right">${movement.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppSidebarLayout>
  )
}

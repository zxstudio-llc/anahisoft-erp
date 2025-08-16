"use client"

import { useState } from "react"
import { Plus, Search, Package, AlertTriangle, TrendingDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout"

interface InventoryItem {
  id: string
  sku: string
  name: string
  description: string
  category: string
  brand: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  unitPrice: number
  warehouse: string
  location: string
  status: "active" | "inactive" | "discontinued"
  lastMovement: string
  supplier: string
  barcode: string
}

interface InventoryManagementProps {
  items?: InventoryItem[]
}

export default function InventoryManagement({
  items = [
    {
      id: "1",
      sku: "PROD-001",
      name: "Laptop Dell Inspiron 15",
      description: "Laptop Dell Inspiron 15 con procesador Intel i5",
      category: "Electrónicos",
      brand: "Dell",
      currentStock: 25,
      minStock: 10,
      maxStock: 100,
      unitCost: 800,
      unitPrice: 1200,
      warehouse: "WH-001",
      location: "A-01-15",
      status: "active",
      lastMovement: "2024-01-15",
      supplier: "Tech Distributor Inc",
      barcode: "1234567890123",
    },
    {
      id: "2",
      sku: "PROD-002",
      name: "Mouse Inalámbrico Logitech",
      description: "Mouse inalámbrico ergonómico con receptor USB",
      category: "Accesorios",
      brand: "Logitech",
      currentStock: 5,
      minStock: 15,
      maxStock: 200,
      unitCost: 25,
      unitPrice: 45,
      warehouse: "WH-001",
      location: "B-02-08",
      status: "active",
      lastMovement: "2024-01-14",
      supplier: "Office Supplies Co",
      barcode: "2345678901234",
    },
    {
      id: "3",
      sku: "PROD-003",
      name: "Monitor Samsung 24 pulgadas",
      description: "Monitor LED Full HD de 24 pulgadas",
      category: "Electrónicos",
      brand: "Samsung",
      currentStock: 0,
      minStock: 5,
      maxStock: 50,
      unitCost: 200,
      unitPrice: 350,
      warehouse: "WH-002",
      location: "C-01-05",
      status: "active",
      lastMovement: "2024-01-10",
      supplier: "Electronics World",
      barcode: "3456789012345",
    },
    {
      id: "4",
      sku: "PROD-004",
      name: "Teclado Mecánico RGB",
      description: "Teclado mecánico con retroiluminación RGB",
      category: "Accesorios",
      brand: "Corsair",
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: 80,
      unitPrice: 150,
      warehouse: "WH-001",
      location: "B-03-12",
      status: "active",
      lastMovement: "2024-01-12",
      supplier: "Gaming Gear Ltd",
      barcode: "4567890123456",
    },
    {
      id: "5",
      sku: "PROD-005",
      name: "Impresora HP LaserJet",
      description: "Impresora láser monocromática HP LaserJet Pro",
      category: "Oficina",
      brand: "HP",
      currentStock: 8,
      minStock: 3,
      maxStock: 25,
      unitCost: 300,
      unitPrice: 500,
      warehouse: "WH-002",
      location: "D-01-03",
      status: "discontinued",
      lastMovement: "2024-01-08",
      supplier: "HP Direct",
      barcode: "5678901234567",
    },
  ],
}: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "discontinued":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { status: "out-of-stock", label: "Sin Stock", color: "bg-red-100 text-red-800" }
    } else if (item.currentStock <= item.minStock) {
      return { status: "low-stock", label: "Stock Bajo", color: "bg-yellow-100 text-yellow-800" }
    } else if (item.currentStock >= item.maxStock) {
      return { status: "overstock", label: "Sobrestock", color: "bg-blue-100 text-blue-800" }
    } else {
      return { status: "normal", label: "Normal", color: "bg-green-100 text-green-800" }
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    const stockStatus = getStockStatus(item).status
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && (stockStatus === "low-stock" || stockStatus === "out-of-stock")) ||
      (stockFilter === "normal" && stockStatus === "normal") ||
      (stockFilter === "overstock" && stockStatus === "overstock")

    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  })

  const categories = Array.from(new Set(items.map((item) => item.category)))
  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0)
  const lowStockItems = items.filter((item) => item.currentStock <= item.minStock).length
  const outOfStockItems = items.filter((item) => item.currentStock === 0).length

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Inventario</h1>
          <p className="text-gray-600">Control y seguimiento de productos en stock</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">SKUs registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Valor del inventario</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Productos por debajo del mínimo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">Productos agotados</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Inventario de Productos</CardTitle>
                <CardDescription>Lista completa de productos en stock</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="discontinued">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Stock Bajo</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="overstock">Sobrestock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Inventory Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Min/Max</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item)
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.brand}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{item.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.currentStock}</div>
                          <div className="text-sm text-gray-500">
                            ${(item.currentStock * item.unitCost).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Min: {item.minStock}</div>
                            <div>Max: {item.maxStock}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{item.warehouse}</div>
                            <div className="text-gray-500">{item.location}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status === "active"
                              ? "Activo"
                              : item.status === "inactive"
                                ? "Inactivo"
                                : "Descontinuado"}
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
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                Ajustar Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron productos que coincidan con los criterios.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AppSidebarLayout>
  )
}

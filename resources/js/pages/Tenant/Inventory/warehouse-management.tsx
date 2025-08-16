"use client"

import { useState } from "react"
import { Plus, Search, Package, MapPin, MoreHorizontal, Eye, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout"

interface Warehouse {
  id: string
  code: string
  name: string
  location: string
  manager: string
  capacity: number
  currentOccupancy: number
  status: "active" | "inactive" | "maintenance"
  type: "main" | "secondary" | "transit" | "returns"
  zones: Array<{
    id: string
    name: string
    capacity: number
    occupied: number
    type: "storage" | "picking" | "receiving" | "shipping"
  }>
}

interface WarehouseManagementProps {
  warehouses?: Warehouse[]
}

export default function WarehouseManagement({
  warehouses = [
    {
      id: "1",
      code: "WH-001",
      name: "Bodega Principal",
      location: "Zona Industrial Norte",
      manager: "Carlos Rodríguez",
      capacity: 10000,
      currentOccupancy: 7500,
      status: "active",
      type: "main",
      zones: [
        { id: "1", name: "Zona A - Almacenamiento", capacity: 4000, occupied: 3200, type: "storage" },
        { id: "2", name: "Zona B - Picking", capacity: 2000, occupied: 1800, type: "picking" },
        { id: "3", name: "Zona C - Recepción", capacity: 2000, occupied: 1500, type: "receiving" },
        { id: "4", name: "Zona D - Despacho", capacity: 2000, occupied: 1000, type: "shipping" },
      ],
    },
    {
      id: "2",
      code: "WH-002",
      name: "Bodega Secundaria",
      location: "Centro de Distribución Sur",
      manager: "Ana Martínez",
      capacity: 5000,
      currentOccupancy: 3200,
      status: "active",
      type: "secondary",
      zones: [
        { id: "5", name: "Zona A - Almacenamiento", capacity: 3000, occupied: 2000, type: "storage" },
        { id: "6", name: "Zona B - Picking", capacity: 1000, occupied: 800, type: "picking" },
        { id: "7", name: "Zona C - Despacho", capacity: 1000, occupied: 400, type: "shipping" },
      ],
    },
    {
      id: "3",
      code: "WH-003",
      name: "Bodega de Tránsito",
      location: "Puerto Comercial",
      manager: "Luis García",
      capacity: 3000,
      currentOccupancy: 1800,
      status: "active",
      type: "transit",
      zones: [
        { id: "8", name: "Zona Temporal", capacity: 2000, occupied: 1200, type: "storage" },
        { id: "9", name: "Zona de Carga", capacity: 1000, occupied: 600, type: "shipping" },
      ],
    },
    {
      id: "4",
      code: "WH-004",
      name: "Bodega en Mantenimiento",
      location: "Zona Industrial Este",
      manager: "Pedro López",
      capacity: 4000,
      currentOccupancy: 0,
      status: "maintenance",
      type: "secondary",
      zones: [
        { id: "10", name: "Zona A - Cerrada", capacity: 2000, occupied: 0, type: "storage" },
        { id: "11", name: "Zona B - Cerrada", capacity: 2000, occupied: 0, type: "storage" },
      ],
    },
  ],
}: WarehouseManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "main":
        return "bg-blue-100 text-blue-800"
      case "secondary":
        return "bg-purple-100 text-purple-800"
      case "transit":
        return "bg-orange-100 text-orange-800"
      case "returns":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || warehouse.status === statusFilter
    const matchesType = typeFilter === "all" || warehouse.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0)
  const totalOccupancy = warehouses.reduce((sum, wh) => sum + wh.currentOccupancy, 0)
  const activeWarehouses = warehouses.filter((wh) => wh.status === "active").length
  const occupancyPercentage = (totalOccupancy / totalCapacity) * 100

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Bodegas</h1>
          <p className="text-gray-600">Administración de almacenes y centros de distribución</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bodegas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warehouses.length}</div>
              <p className="text-xs text-muted-foreground">Centros registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bodegas Activas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeWarehouses}</div>
              <p className="text-xs text-muted-foreground">En operación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">m³ de almacenamiento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocupación</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getOccupancyColor(occupancyPercentage)}`}>
                {occupancyPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">{totalOccupancy.toLocaleString()} m³ ocupados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Warehouses List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Bodegas</CardTitle>
                    <CardDescription>Lista de todos los centros de almacenamiento</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Bodega
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar bodegas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="main">Principal</SelectItem>
                      <SelectItem value="secondary">Secundaria</SelectItem>
                      <SelectItem value="transit">Tránsito</SelectItem>
                      <SelectItem value="returns">Devoluciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Warehouses Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bodega</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Ocupación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWarehouses.map((warehouse) => {
                        const occupancy = (warehouse.currentOccupancy / warehouse.capacity) * 100
                        return (
                          <TableRow
                            key={warehouse.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => setSelectedWarehouse(warehouse)}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">{warehouse.name}</div>
                                <div className="text-sm text-gray-500">{warehouse.code}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                {warehouse.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTypeColor(warehouse.type)}>
                                {warehouse.type === "main"
                                  ? "Principal"
                                  : warehouse.type === "secondary"
                                    ? "Secundaria"
                                    : warehouse.type === "transit"
                                      ? "Tránsito"
                                      : "Devoluciones"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      occupancy >= 90
                                        ? "bg-red-500"
                                        : occupancy >= 75
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                    }`}
                                    style={{ width: `${occupancy}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-medium ${getOccupancyColor(occupancy)}`}>
                                  {occupancy.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(warehouse.status)}>
                                {warehouse.status === "active"
                                  ? "Activa"
                                  : warehouse.status === "inactive"
                                    ? "Inactiva"
                                    : "Mantenimiento"}
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
              </CardContent>
            </Card>
          </div>

          {/* Warehouse Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Bodega</CardTitle>
                <CardDescription>
                  {selectedWarehouse ? selectedWarehouse.name : "Selecciona una bodega"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedWarehouse ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Código:</span>
                        <div>{selectedWarehouse.code}</div>
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span>
                        <Badge className={getTypeColor(selectedWarehouse.type)}>
                          {selectedWarehouse.type === "main"
                            ? "Principal"
                            : selectedWarehouse.type === "secondary"
                              ? "Secundaria"
                              : selectedWarehouse.type === "transit"
                                ? "Tránsito"
                                : "Devoluciones"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Gerente:</span>
                        <div>{selectedWarehouse.manager}</div>
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>
                        <Badge className={getStatusColor(selectedWarehouse.status)}>
                          {selectedWarehouse.status === "active"
                            ? "Activa"
                            : selectedWarehouse.status === "inactive"
                              ? "Inactiva"
                              : "Mantenimiento"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Ubicación:</span>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {selectedWarehouse.location}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Capacidad:</span>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Ocupado: {selectedWarehouse.currentOccupancy.toLocaleString()} m³</span>
                          <span>Total: {selectedWarehouse.capacity.toLocaleString()} m³</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              (selectedWarehouse.currentOccupancy / selectedWarehouse.capacity) * 100 >= 90
                                ? "bg-red-500"
                                : (selectedWarehouse.currentOccupancy / selectedWarehouse.capacity) * 100 >= 75
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${(selectedWarehouse.currentOccupancy / selectedWarehouse.capacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Zonas:</h4>
                      <div className="space-y-2">
                        {selectedWarehouse.zones.map((zone) => {
                          const zoneOccupancy = (zone.occupied / zone.capacity) * 100
                          return (
                            <div key={zone.id} className="border rounded p-3 text-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{zone.name}</span>
                                <Badge variant="outline">
                                  {zone.type === "storage"
                                    ? "Almacén"
                                    : zone.type === "picking"
                                      ? "Picking"
                                      : zone.type === "receiving"
                                        ? "Recepción"
                                        : "Despacho"}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>
                                  {zone.occupied} / {zone.capacity} m³
                                </span>
                                <span>{zoneOccupancy.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full ${
                                    zoneOccupancy >= 90
                                      ? "bg-red-500"
                                      : zoneOccupancy >= 75
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{ width: `${zoneOccupancy}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Alerts */}
                    {selectedWarehouse.zones.some((zone) => (zone.occupied / zone.capacity) * 100 >= 90) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm text-red-800 font-medium">Alerta de Capacidad</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">Una o más zonas están al 90% o más de su capacidad.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <div>Selecciona una bodega para ver los detalles</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </AppSidebarLayout>
  )
}

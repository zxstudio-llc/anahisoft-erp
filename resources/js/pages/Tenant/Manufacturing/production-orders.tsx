"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Factory,
  Calendar,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout"

interface ProductionOrder {
  id: string
  orderNumber: string
  productSku: string
  productName: string
  quantity: number
  quantityProduced: number
  startDate: string
  plannedEndDate: string
  actualEndDate?: string
  status: "planned" | "in_progress" | "paused" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  workCenter: string
  assignedTo: string
  materials: Array<{
    sku: string
    name: string
    requiredQuantity: number
    allocatedQuantity: number
    unit: string
  }>
  operations: Array<{
    id: string
    name: string
    estimatedTime: number
    actualTime?: number
    status: "pending" | "in_progress" | "completed"
  }>
  notes?: string
}

interface ProductionOrdersProps {
  orders?: ProductionOrder[]
}

export default function ProductionOrders({
  orders = [
    {
      id: "1",
      orderNumber: "PO-2024-001",
      productSku: "PROD-FINISHED-001",
      productName: "Escritorio Ejecutivo Premium",
      quantity: 50,
      quantityProduced: 35,
      startDate: "2024-01-15",
      plannedEndDate: "2024-01-25",
      status: "in_progress",
      priority: "high",
      workCenter: "WC-CARPINTERIA",
      assignedTo: "Equipo Producción A",
      materials: [
        { sku: "MAT-001", name: "Madera MDF 18mm", requiredQuantity: 100, allocatedQuantity: 100, unit: "m²" },
        { sku: "MAT-002", name: "Herrajes Premium", requiredQuantity: 50, allocatedQuantity: 45, unit: "set" },
        { sku: "MAT-003", name: "Barniz Poliuretano", requiredQuantity: 20, allocatedQuantity: 20, unit: "L" },
      ],
      operations: [
        { id: "1", name: "Corte de Materiales", estimatedTime: 8, actualTime: 7, status: "completed" },
        { id: "2", name: "Ensamblaje", estimatedTime: 16, actualTime: 12, status: "in_progress" },
        { id: "3", name: "Acabado y Barnizado", estimatedTime: 12, status: "pending" },
        { id: "4", name: "Control de Calidad", estimatedTime: 4, status: "pending" },
      ],
      notes: "Pedido urgente para cliente VIP",
    },
    {
      id: "2",
      orderNumber: "PO-2024-002",
      productSku: "PROD-FINISHED-002",
      productName: "Silla Ergonómica Oficina",
      quantity: 100,
      quantityProduced: 100,
      startDate: "2024-01-10",
      plannedEndDate: "2024-01-20",
      actualEndDate: "2024-01-19",
      status: "completed",
      priority: "medium",
      workCenter: "WC-TAPICERIA",
      assignedTo: "Equipo Producción B",
      materials: [
        { sku: "MAT-004", name: "Estructura Metálica", requiredQuantity: 100, allocatedQuantity: 100, unit: "pcs" },
        { sku: "MAT-005", name: "Espuma HR", requiredQuantity: 50, allocatedQuantity: 50, unit: "m²" },
        { sku: "MAT-006", name: "Tela Mesh", requiredQuantity: 80, allocatedQuantity: 80, unit: "m" },
      ],
      operations: [
        { id: "5", name: "Soldadura Estructura", estimatedTime: 20, actualTime: 18, status: "completed" },
        { id: "6", name: "Tapizado", estimatedTime: 30, actualTime: 28, status: "completed" },
        { id: "7", name: "Ensamblaje Final", estimatedTime: 15, actualTime: 14, status: "completed" },
        { id: "8", name: "Inspección Final", estimatedTime: 5, actualTime: 4, status: "completed" },
      ],
    },
    {
      id: "3",
      orderNumber: "PO-2024-003",
      productSku: "PROD-FINISHED-003",
      productName: "Mesa de Reuniones",
      quantity: 25,
      quantityProduced: 0,
      startDate: "2024-01-20",
      plannedEndDate: "2024-02-05",
      status: "planned",
      priority: "low",
      workCenter: "WC-CARPINTERIA",
      assignedTo: "Equipo Producción A",
      materials: [
        { sku: "MAT-007", name: "Tablero Melamina", requiredQuantity: 75, allocatedQuantity: 60, unit: "m²" },
        { sku: "MAT-008", name: "Patas Metálicas", requiredQuantity: 100, allocatedQuantity: 0, unit: "pcs" },
      ],
      operations: [
        { id: "9", name: "Corte Tableros", estimatedTime: 6, status: "pending" },
        { id: "10", name: "Perforado", estimatedTime: 4, status: "pending" },
        { id: "11", name: "Ensamblaje", estimatedTime: 8, status: "pending" },
        { id: "12", name: "Acabado", estimatedTime: 6, status: "pending" },
      ],
      notes: "Pendiente llegada de patas metálicas",
    },
  ],
}: ProductionOrdersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "paused":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planned":
        return "Planificada"
      case "in_progress":
        return "En Proceso"
      case "paused":
        return "Pausada"
      case "completed":
        return "Completada"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente"
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return priority
    }
  }

  const getProgressPercentage = (order: ProductionOrder) => {
    return order.quantity > 0 ? (order.quantityProduced / order.quantity) * 100 : 0
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productSku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const totalOrders = orders.length
  const inProgressOrders = orders.filter((o) => o.status === "in_progress").length
  const completedOrders = orders.filter((o) => o.status === "completed").length
  const plannedOrders = orders.filter((o) => o.status === "planned").length

  const breadcrumbs = [
    { title: 'Inicio', href: '/' },
    { title: 'Productos', href: '/products' },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Órdenes de Producción</h1>
          <p className="text-gray-600">Gestión y seguimiento de la producción manufacturera</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">Órdenes registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressOrders}</div>
              <p className="text-xs text-muted-foreground">Actualmente produciendo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">Órdenes finalizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planificadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{plannedOrders}</div>
              <p className="text-xs text-muted-foreground">Por iniciar</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Lista de Órdenes</CardTitle>
                    <CardDescription>Todas las órdenes de producción</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Orden
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar órdenes..."
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
                      <SelectItem value="planned">Planificada</SelectItem>
                      <SelectItem value="in_progress">En Proceso</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orders Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Orden</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Fecha Fin</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const progress = getProgressPercentage(order)
                        return (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.productName}</div>
                                <div className="text-sm text-gray-500">{order.productSku}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>
                                    {order.quantityProduced}/{order.quantity}
                                  </span>
                                  <span>{progress.toFixed(0)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(order.priority)}>
                                {getPriorityLabel(order.priority)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(order.plannedEndDate).toLocaleDateString()}</TableCell>
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
                                    <Play className="mr-2 h-4 w-4" />
                                    Iniciar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pausar
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

          {/* Order Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Orden</CardTitle>
                <CardDescription>{selectedOrder ? selectedOrder.orderNumber : "Selecciona una orden"}</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedOrder ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Producto:</span>
                        <div>{selectedOrder.productName}</div>
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span>
                        <div>{selectedOrder.productSku}</div>
                      </div>
                      <div>
                        <span className="font-medium">Cantidad:</span>
                        <div>{selectedOrder.quantity} unidades</div>
                      </div>
                      <div>
                        <span className="font-medium">Producido:</span>
                        <div>{selectedOrder.quantityProduced} unidades</div>
                      </div>
                      <div>
                        <span className="font-medium">Centro de Trabajo:</span>
                        <div>{selectedOrder.workCenter}</div>
                      </div>
                      <div>
                        <span className="font-medium">Asignado a:</span>
                        <div>{selectedOrder.assignedTo}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Materiales:</h4>
                      <div className="space-y-2">
                        {selectedOrder.materials.map((material, index) => (
                          <div key={index} className="border rounded p-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">{material.name}</span>
                              <span>{material.sku}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>
                                Requerido: {material.requiredQuantity} {material.unit}
                              </span>
                              <span>
                                Asignado: {material.allocatedQuantity} {material.unit}
                              </span>
                            </div>
                            {material.allocatedQuantity < material.requiredQuantity && (
                              <div className="flex items-center mt-1">
                                <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                                <span className="text-red-600 text-xs">Material faltante</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Operaciones:</h4>
                      <div className="space-y-2">
                        {selectedOrder.operations.map((operation) => (
                          <div key={operation.id} className="border rounded p-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{operation.name}</span>
                              <Badge className={getStatusColor(operation.status)}>
                                {operation.status === "pending"
                                  ? "Pendiente"
                                  : operation.status === "in_progress"
                                    ? "En Proceso"
                                    : "Completada"}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Estimado: {operation.estimatedTime}h</span>
                              {operation.actualTime && <span>Real: {operation.actualTime}h</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Notas:</h4>
                        <div className="bg-yellow-50 p-3 rounded text-sm">{selectedOrder.notes}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <div>Selecciona una orden para ver los detalles</div>
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

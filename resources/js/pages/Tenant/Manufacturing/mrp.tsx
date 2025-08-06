"use client"

import { useState } from "react"
import { Search, Package, AlertTriangle, CheckCircle, ShoppingCart, Factory, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout"

interface MaterialRequirement {
  id: string
  materialSku: string
  materialName: string
  requiredQuantity: number
  unit: string
  availableStock: number
  deficit: number
  sourceOrder: string // e.g., Production Order ID
  dueDate: string
  status: "fulfilled" | "partial" | "unfulfilled"
  suggestedAction: "purchase" | "produce" | "none"
}

interface MRPProps {
  requirements?: MaterialRequirement[]
}

export default function MRP({
  requirements = [
    {
      id: "MR-001",
      materialSku: "MAT-001",
      materialName: "Madera MDF 18mm",
      requiredQuantity: 100,
      unit: "m²",
      availableStock: 120,
      deficit: 0,
      sourceOrder: "PO-2024-001",
      dueDate: "2024-01-20",
      status: "fulfilled",
      suggestedAction: "none",
    },
    {
      id: "MR-002",
      materialSku: "MAT-002",
      materialName: "Herrajes Premium",
      requiredQuantity: 50,
      unit: "set",
      availableStock: 45,
      deficit: 5,
      sourceOrder: "PO-2024-001",
      dueDate: "2024-01-20",
      status: "partial",
      suggestedAction: "purchase",
    },
    {
      id: "MR-003",
      materialSku: "MAT-007",
      materialName: "Tablero Melamina",
      requiredQuantity: 75,
      unit: "m²",
      availableStock: 60,
      deficit: 15,
      sourceOrder: "PO-2024-003",
      dueDate: "2024-02-01",
      status: "partial",
      suggestedAction: "purchase",
    },
    {
      id: "MR-004",
      materialSku: "MAT-008",
      materialName: "Patas Metálicas",
      requiredQuantity: 100,
      unit: "pcs",
      availableStock: 0,
      deficit: 100,
      sourceOrder: "PO-2024-003",
      dueDate: "2024-02-01",
      status: "unfulfilled",
      suggestedAction: "purchase",
    },
    {
      id: "MR-005",
      materialSku: "COMP-001",
      materialName: "Sub-Ensamblaje A",
      requiredQuantity: 20,
      unit: "pcs",
      availableStock: 5,
      deficit: 15,
      sourceOrder: "PO-2024-004",
      dueDate: "2024-02-10",
      status: "partial",
      suggestedAction: "produce",
    },
  ],
}: MRPProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "bg-green-100 text-green-800"
      case "partial":
        return "bg-yellow-100 text-yellow-800"
      case "unfulfilled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "Satisfecho"
      case "partial":
        return "Parcial"
      case "unfulfilled":
        return "Insatisfecho"
      default:
        return status
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "purchase":
        return <ShoppingCart className="h-4 w-4" />
      case "produce":
        return <Factory className="h-4 w-4" />
      default:
        return null
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "purchase":
        return "Comprar"
      case "produce":
        return "Producir"
      case "none":
        return "Ninguna"
      default:
        return action
    }
  }

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      req.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.materialSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.sourceOrder.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || req.status === statusFilter
    const matchesAction = actionFilter === "all" || req.suggestedAction === actionFilter
    return matchesSearch && matchesStatus && matchesAction
  })

  const totalRequirements = requirements.length
  const fulfilledRequirements = requirements.filter((r) => r.status === "fulfilled").length
  const unfulfilledDeficit = requirements
    .filter((r) => r.status === "unfulfilled" || r.status === "partial")
    .reduce((sum, r) => sum + r.deficit, 0)

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planificación de Requerimientos de Materiales (MRP)</h1>
          <p className="text-gray-600">Gestiona las necesidades de materiales para la producción</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requerimientos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequirements}</div>
              <p className="text-xs text-muted-foreground">Requerimientos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requerimientos Satisfechos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{fulfilledRequirements}</div>
              <p className="text-xs text-muted-foreground">Materiales disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Déficit Total</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{unfulfilledDeficit} unidades</div>
              <p className="text-xs text-muted-foreground">Materiales faltantes</p>
            </CardContent>
          </Card>
        </div>

        {/* MRP List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Lista de Requerimientos de Materiales</CardTitle>
                <CardDescription>Visualiza y gestiona las necesidades de materiales para la producción</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generar MRP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar material o orden de origen..."
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
                  <SelectItem value="fulfilled">Satisfecho</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="unfulfilled">Insatisfecho</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Acción Sugerida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="purchase">Comprar</SelectItem>
                  <SelectItem value="produce">Producir</SelectItem>
                  <SelectItem value="none">Ninguna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MRP Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Requerido</TableHead>
                    <TableHead>Disponible</TableHead>
                    <TableHead>Déficit</TableHead>
                    <TableHead>Orden Origen</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acción Sugerida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{req.materialName}</div>
                          <div className="text-sm text-gray-500">{req.materialSku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {req.requiredQuantity} {req.unit}
                      </TableCell>
                      <TableCell>
                        {req.availableStock} {req.unit}
                      </TableCell>
                      <TableCell>
                        <span className={req.deficit > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                          {req.deficit} {req.unit}
                        </span>
                      </TableCell>
                      <TableCell>{req.sourceOrder}</TableCell>
                      <TableCell>{new Date(req.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(req.status)}>{getStatusLabel(req.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getActionIcon(req.suggestedAction)}
                          {getActionLabel(req.suggestedAction)}
                        </Badge>
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
    </AppSidebarLayout>
  )
}

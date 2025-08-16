"use client"

import type React from "react"

import { useState } from "react"
import { Search, CheckCircle, XCircle, Plus, MoreHorizontal, Eye, Edit, FlaskConical, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout"

interface QualityInspection {
  id: string
  productId: string
  productName: string
  batchNumber: string
  inspectionDate: string
  inspector: string
  result: "pass" | "fail" | "pending"
  defectsFound: string[]
  notes?: string
  line?: string
}

interface QualityControlProps {
  inspections?: QualityInspection[]
}

export default function QualityControl({
  inspections = [
    {
      id: "QI-001",
      productId: "PROD-FINISHED-001",
      productName: "Escritorio Ejecutivo Premium",
      batchNumber: "BATCH-2024-001",
      inspectionDate: "2024-01-25",
      inspector: "Ana López",
      result: "pass",
      defectsFound: [],
      notes: "Inspección final de lote. Todo conforme.",
      line: "Línea Ensamblaje A",
    },
    {
      id: "QI-002",
      productId: "PROD-FINISHED-002",
      productName: "Silla Ergonómica Oficina",
      batchNumber: "BATCH-2024-002",
      inspectionDate: "2024-01-19",
      inspector: "Carlos Ruiz",
      result: "fail",
      defectsFound: ["Rayón en base", "Costura suelta"],
      notes: "5 unidades con defectos menores. Requieren retrabajo.",
      line: "Línea Tapicería B",
    },
    {
      id: "QI-003",
      productId: "PROD-FINISHED-003",
      productName: "Mesa de Reuniones",
      batchNumber: "BATCH-2024-003",
      inspectionDate: "2024-02-05",
      inspector: "Ana López",
      result: "pending",
      defectsFound: [],
      notes: "Inspección programada para el final del turno.",
      line: "Línea Carpintería C",
    },
    {
      id: "QI-004",
      productId: "PROD-FINISHED-001",
      productName: "Escritorio Ejecutivo Premium",
      batchNumber: "BATCH-2024-001",
      inspectionDate: "2024-01-16",
      inspector: "Pedro Gómez",
      result: "pass",
      defectsFound: [],
      notes: "Inspección de etapa de corte. Dimensiones correctas.",
      line: "Línea Carpintería A",
    },
  ],
}: QualityControlProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [resultFilter, setResultFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentInspection, setCurrentInspection] = useState<QualityInspection | null>(null)
  const [error, setError] = useState<string | null>(null);

  const getResultColor = (result: string) => {
    switch (result) {
      case "pass":
        return "bg-green-100 text-green-800"
      case "fail":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getResultLabel = (result: string) => {
    switch (result) {
      case "pass":
        return "Aprobado"
      case "fail":
        return "Rechazado"
      case "pending":
        return "Pendiente"
      default:
        return result
    }
  }

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      inspection.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.defectsFound.some((defect) => defect.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesResult = resultFilter === "all" || inspection.result === resultFilter
    return matchesSearch && matchesResult
  })

  const totalInspections = inspections.length
  const passedInspections = inspections.filter((i) => i.result === "pass").length
  const failedInspections = inspections.filter((i) => i.result === "fail").length

  const handleEdit = (inspection: QualityInspection) => {
    setCurrentInspection(inspection)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setCurrentInspection(null) // Clear for new creation
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic to save/update inspection
    console.log("Saving inspection:", currentInspection)
    setIsDialogOpen(false)
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Control de Calidad</h1>
          <p className="text-gray-600">Gestión de inspecciones y seguimiento de la calidad de productos</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspecciones</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInspections}</div>
              <p className="text-xs text-muted-foreground">Inspecciones registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inspecciones Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{passedInspections}</div>
              <p className="text-xs text-muted-foreground">Productos conformes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inspecciones Rechazadas</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedInspections}</div>
              <p className="text-xs text-muted-foreground">Productos con defectos</p>
            </CardContent>
          </Card>
        </div>

        {/* Quality Inspections List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Registros de Control de Calidad</CardTitle>
                <CardDescription>Historial de inspecciones de calidad por producto o línea</CardDescription>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Inspección
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar producto, lote, inspector o defecto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pass">Aprobado</SelectItem>
                  <SelectItem value="fail">Rechazado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Inspections Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Fecha Inspección</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Defectos</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{inspection.productName}</div>
                          {inspection.line && <div className="text-sm text-gray-500">Línea: {inspection.line}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{inspection.batchNumber}</TableCell>
                      <TableCell>{new Date(inspection.inspectionDate).toLocaleDateString()}</TableCell>
                      <TableCell>{inspection.inspector}</TableCell>
                      <TableCell>
                        <Badge className={getResultColor(inspection.result)}>{getResultLabel(inspection.result)}</Badge>
                      </TableCell>
                      <TableCell>
                        {inspection.defectsFound.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {inspection.defectsFound.map((defect, idx) => (
                              <Badge key={idx} variant="outline" className="bg-red-50 text-red-700">
                                {defect}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">Ninguno</span>
                        )}
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
                            <DropdownMenuItem onClick={() => handleEdit(inspection)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
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

        {/* Dialog for Create/Edit Inspection */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{currentInspection ? "Editar Inspección" : "Nueva Inspección de Calidad"}</DialogTitle>
              <DialogDescription>
                {currentInspection
                  ? "Modifica los detalles de la inspección de calidad."
                  : "Registra una nueva inspección de calidad para un producto o lote."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Producto</Label>
                  <Input
                    id="productName"
                    defaultValue={currentInspection?.productName || ""}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="batchNumber">Número de Lote</Label>
                  <Input
                    id="batchNumber"
                    defaultValue={currentInspection?.batchNumber || ""}
                    placeholder="Ej. BATCH-2024-001"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspectionDate">Fecha de Inspección</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    defaultValue={currentInspection?.inspectionDate || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="inspector">Inspector</Label>
                  <Input
                    id="inspector"
                    defaultValue={currentInspection?.inspector || ""}
                    placeholder="Nombre del inspector"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="result">Resultado</Label>
                <Select defaultValue={currentInspection?.result || "pending"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Aprobado</SelectItem>
                    <SelectItem value="fail">Rechazado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="defectsFound">Defectos Encontrados (separados por coma)</Label>
                <Input
                  id="defectsFound"
                  defaultValue={currentInspection?.defectsFound.join(", ") || ""}
                  placeholder="Ej. Rayón, Costura suelta"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  defaultValue={currentInspection?.notes || ""}
                  placeholder="Notas adicionales sobre la inspección."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{currentInspection ? "Guardar Cambios" : "Registrar Inspección"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </AppSidebarLayout>
  )
}

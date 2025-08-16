"use client"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import type React from "react"

import { useState } from "react"
import { Factory, Users, Clock, Plus, Search, MoreHorizontal, Edit, Trash, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

interface WorkCenter {
  id: string
  name: string
  code: string
  description: string
  capacity: number // hours per day
  unitOfMeasure: string // e.g., "horas", "unidades"
  assignedOperators: number
  status: "active" | "inactive" | "maintenance"
  standardTimes: Array<{
    operation: string
    time: number
    unit: string // e.g., "min", "horas"
  }>
}

interface WorkCentersProps {
  workCenters?: WorkCenter[]
}

export default function WorkCenters({
  workCenters = [
    {
      id: "WC-001",
      name: "Carpintería",
      code: "WC-CARPINTERIA",
      description: "Centro para corte, lijado y ensamblaje de madera.",
      capacity: 80,
      unitOfMeasure: "horas",
      assignedOperators: 5,
      status: "active",
      standardTimes: [
        { operation: "Corte de Tablero", time: 15, unit: "min/m²" },
        { operation: "Ensamblaje Básico", time: 30, unit: "min/unidad" },
      ],
    },
    {
      id: "WC-002",
      name: "Ensamblaje Final",
      code: "WC-ENSAMBLAJE",
      description: "Centro para el ensamblaje final de productos.",
      capacity: 120,
      unitOfMeasure: "horas",
      assignedOperators: 8,
      status: "active",
      standardTimes: [
        { operation: "Ensamblaje Completo", time: 45, unit: "min/unidad" },
        { operation: "Empaque", time: 10, unit: "min/unidad" },
      ],
    },
    {
      id: "WC-003",
      name: "Acabado y Barnizado",
      code: "WC-ACABADO",
      description: "Centro para procesos de pintura y barnizado.",
      capacity: 60,
      unitOfMeasure: "horas",
      assignedOperators: 3,
      status: "maintenance",
      standardTimes: [
        { operation: "Barnizado", time: 20, unit: "min/m²" },
        { operation: "Pulido", time: 15, unit: "min/unidad" },
      ],
    },
    {
      id: "WC-004",
      name: "Tapicería",
      code: "WC-TAPICERIA",
      description: "Centro para tapizado de sillas y muebles.",
      capacity: 70,
      unitOfMeasure: "horas",
      assignedOperators: 4,
      status: "active",
      standardTimes: [
        { operation: "Corte de Tela", time: 5, unit: "min/m" },
        { operation: "Tapizado de Silla", time: 60, unit: "min/unidad" },
      ],
    },
  ],
}: WorkCentersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentWorkCenter, setCurrentWorkCenter] = useState<WorkCenter | null>(null)
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo"
      case "inactive":
        return "Inactivo"
      case "maintenance":
        return "Mantenimiento"
      default:
        return status
    }
  }

  const filteredWorkCenters = workCenters.filter((wc) => {
    const matchesSearch =
      wc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wc.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || wc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEdit = (wc: WorkCenter) => {
    setCurrentWorkCenter(wc)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setCurrentWorkCenter(null) // Clear for new creation
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic to save/update work center
    console.log("Saving work center:", currentWorkCenter)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Centros de Trabajo y Tiempos Estándar</h1>
          <p className="text-gray-600">Gestión de recursos de producción y eficiencia operativa</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Centros</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workCenters.length}</div>
              <p className="text-xs text-muted-foreground">Centros de trabajo registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operadores Asignados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workCenters.reduce((sum, wc) => sum + wc.assignedOperators, 0)}</div>
              <p className="text-xs text-muted-foreground">Total en todos los centros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacidad Total (Horas/Día)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workCenters.reduce((sum, wc) => sum + wc.capacity, 0)}</div>
              <p className="text-xs text-muted-foreground">Capacidad combinada</p>
            </CardContent>
          </Card>
        </div>

        {/* Work Centers List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Lista de Centros de Trabajo</CardTitle>
                <CardDescription>Administra tus centros de producción y sus capacidades</CardDescription>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Centro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar centro por nombre o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work Centers Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Capacidad ({workCenters[0]?.unitOfMeasure || "horas"})</TableHead>
                    <TableHead>Operadores</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkCenters.map((wc) => (
                    <TableRow key={wc.id}>
                      <TableCell className="font-medium">{wc.code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{wc.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{wc.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{wc.capacity}</TableCell>
                      <TableCell>{wc.assignedOperators}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(wc.status)}>{getStatusLabel(wc.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(wc)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Ver Tiempos Estándar
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

        {/* Dialog for Create/Edit Work Center */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{currentWorkCenter ? "Editar Centro de Trabajo" : "Nuevo Centro de Trabajo"}</DialogTitle>
              <DialogDescription>
                {currentWorkCenter
                  ? "Modifica la información del centro de trabajo."
                  : "Crea un nuevo centro de trabajo para tu producción."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    defaultValue={currentWorkCenter?.name || ""}
                    placeholder="Ej. Carpintería"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    defaultValue={currentWorkCenter?.code || ""}
                    placeholder="Ej. WC-CARPINTERIA"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  defaultValue={currentWorkCenter?.description || ""}
                  placeholder="Descripción detallada del centro de trabajo."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacidad (horas/día)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    defaultValue={currentWorkCenter?.capacity || 0}
                    placeholder="Ej. 80"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="operators">Operadores Asignados</Label>
                  <Input
                    id="operators"
                    type="number"
                    defaultValue={currentWorkCenter?.assignedOperators || 0}
                    placeholder="Ej. 5"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select defaultValue={currentWorkCenter?.status || "active"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{currentWorkCenter ? "Guardar Cambios" : "Crear Centro"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </AppSidebarLayout>
  )
}

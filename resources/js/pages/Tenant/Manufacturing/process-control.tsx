"use client"

import { useState } from "react"
import {
  Search,
  Play,
  Pause,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  FastForward,
  StopCircle,
  Plus,
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

interface ProcessStage {
  id: string
  processName: string
  stageName: string
  workCenter: string
  assignedTo: string
  startDate: string
  plannedEndDate: string
  actualEndDate?: string
  status: "pending" | "in_progress" | "paused" | "completed" | "on_hold" | "cancelled"
  progress: number // 0-100
  notes?: string
}

interface ProcessControlProps {
  stages?: ProcessStage[]
}

export default function ProcessControl({
  stages = [
    {
      id: "PS-001",
      processName: "Fabricación Escritorio Ejecutivo",
      stageName: "Corte de Materiales",
      workCenter: "WC-CARPINTERIA",
      assignedTo: "Operador Juan Pérez",
      startDate: "2024-01-15",
      plannedEndDate: "2024-01-16",
      actualEndDate: "2024-01-16",
      status: "completed",
      progress: 100,
    },
    {
      id: "PS-002",
      processName: "Fabricación Escritorio Ejecutivo",
      stageName: "Ensamblaje",
      workCenter: "WC-ENSAMBLAJE",
      assignedTo: "Equipo Ensamblaje A",
      startDate: "2024-01-16",
      plannedEndDate: "2024-01-18",
      status: "in_progress",
      progress: 75,
      notes: "Esperando herrajes faltantes para 5 unidades.",
    },
    {
      id: "PS-003",
      processName: "Fabricación Escritorio Ejecutivo",
      stageName: "Acabado y Barnizado",
      workCenter: "WC-ACABADO",
      assignedTo: "Operador María García",
      startDate: "2024-01-18",
      plannedEndDate: "2024-01-20",
      status: "pending",
      progress: 0,
    },
    {
      id: "PS-004",
      processName: "Fabricación Silla Ergonómica",
      stageName: "Tapizado",
      workCenter: "WC-TAPICERIA",
      assignedTo: "Equipo Tapicería B",
      startDate: "2024-01-10",
      plannedEndDate: "2024-01-12",
      actualEndDate: "2024-01-13",
      status: "completed",
      progress: 100,
    },
    {
      id: "PS-005",
      processName: "Fabricación Silla Ergonómica",
      stageName: "Ensamblaje Final",
      workCenter: "WC-ENSAMBLAJE",
      assignedTo: "Equipo Ensamblaje B",
      startDate: "2024-01-13",
      plannedEndDate: "2024-01-15",
      status: "paused",
      progress: 50,
      notes: "Pausa por mantenimiento de máquina.",
    },
  ],
}: ProcessControlProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [workCenterFilter, setWorkCenterFilter] = useState("all")
  const [selectedStage, setSelectedStage] = useState<ProcessStage | null>(null)
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "paused":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "on_hold":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "in_progress":
        return "En Proceso"
      case "paused":
        return "Pausada"
      case "completed":
        return "Completada"
      case "on_hold":
        return "En Espera"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  const filteredStages = stages.filter((stage) => {
    const matchesSearch =
      stage.processName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stage.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stage.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || stage.status === statusFilter
    const matchesWorkCenter = workCenterFilter === "all" || stage.workCenter === workCenterFilter
    return matchesSearch && matchesStatus && matchesWorkCenter
  })

  const totalStages = stages.length
  const inProgressStages = stages.filter((s) => s.status === "in_progress").length
  const completedStages = stages.filter((s) => s.status === "completed").length
  const pendingStages = stages.filter((s) => s.status === "pending").length

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Control de Procesos por Etapas</h1>
          <p className="text-gray-600">Monitoreo y gestión del progreso de cada etapa de producción</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Etapas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStages}</div>
              <p className="text-xs text-muted-foreground">Etapas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressStages}</div>
              <p className="text-xs text-muted-foreground">Actualmente activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedStages}</div>
              <p className="text-xs text-muted-foreground">Etapas finalizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <FastForward className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{pendingStages}</div>
              <p className="text-xs text-muted-foreground">Por iniciar</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stages List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Lista de Etapas de Proceso</CardTitle>
                    <CardDescription>Todas las etapas de producción</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Etapa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar proceso, etapa o asignado..."
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
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Proceso</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="on_hold">En Espera</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={workCenterFilter} onValueChange={setWorkCenterFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Centro de Trabajo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="WC-CARPINTERIA">WC-CARPINTERIA</SelectItem>
                      <SelectItem value="WC-ENSAMBLAJE">WC-ENSAMBLAJE</SelectItem>
                      <SelectItem value="WC-ACABADO">WC-ACABADO</SelectItem>
                      <SelectItem value="WC-TAPICERIA">WC-TAPICERIA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stages Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proceso</TableHead>
                        <TableHead>Etapa</TableHead>
                        <TableHead>Centro de Trabajo</TableHead>
                        <TableHead>Asignado</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStages.map((stage) => (
                        <TableRow
                          key={stage.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedStage(stage)}
                        >
                          <TableCell className="font-medium">{stage.processName}</TableCell>
                          <TableCell>{stage.stageName}</TableCell>
                          <TableCell>{stage.workCenter}</TableCell>
                          <TableCell>{stage.assignedTo}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{stage.progress}%</span>
                              </div>
                              <Progress value={stage.progress} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(stage.status)}>{getStatusLabel(stage.status)}</Badge>
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
                                {stage.status === "pending" && (
                                  <DropdownMenuItem>
                                    <Play className="mr-2 h-4 w-4" />
                                    Iniciar
                                  </DropdownMenuItem>
                                )}
                                {stage.status === "in_progress" && (
                                  <>
                                    <DropdownMenuItem>
                                      <Pause className="mr-2 h-4 w-4" />
                                      Pausar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <StopCircle className="mr-2 h-4 w-4" />
                                      Finalizar
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {stage.status === "paused" && (
                                  <DropdownMenuItem>
                                    <Play className="mr-2 h-4 w-4" />
                                    Reanudar
                                  </DropdownMenuItem>
                                )}
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

          {/* Stage Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Etapa</CardTitle>
                <CardDescription>{selectedStage ? selectedStage.stageName : "Selecciona una etapa"}</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedStage ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Proceso:</span>
                        <div>{selectedStage.processName}</div>
                      </div>
                      <div>
                        <span className="font-medium">Centro de Trabajo:</span>
                        <div>{selectedStage.workCenter}</div>
                      </div>
                      <div>
                        <span className="font-medium">Asignado a:</span>
                        <div>{selectedStage.assignedTo}</div>
                      </div>
                      <div>
                        <span className="font-medium">Fecha Inicio:</span>
                        <div>{new Date(selectedStage.startDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Fecha Fin Planificada:</span>
                        <div>{new Date(selectedStage.plannedEndDate).toLocaleDateString()}</div>
                      </div>
                      {selectedStage.actualEndDate && (
                        <div>
                          <span className="font-medium">Fecha Fin Real:</span>
                          <div>{new Date(selectedStage.actualEndDate).toLocaleDateString()}</div>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Progreso:</span>
                        <Progress value={selectedStage.progress} className="h-2 mt-1" />
                        <span className="text-sm text-gray-600">{selectedStage.progress}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>
                        <div>
                          <Badge className={getStatusColor(selectedStage.status)}>
                            {getStatusLabel(selectedStage.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {selectedStage.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Notas:</h4>
                        <div className="bg-yellow-50 p-3 rounded text-sm">{selectedStage.notes}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <div>Selecciona una etapa para ver los detalles</div>
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

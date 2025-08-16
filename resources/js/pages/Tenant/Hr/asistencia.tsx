"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Clock, CalendarIcon, Users, CheckCircle, XCircle, AlertCircle, Search, Filter, Download } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { BreadcrumbItem } from "@/types"

const asistenciaData = [
  {
    id: 1,
    empleado: "Ana García",
    fecha: "2024-01-08",
    horaEntrada: "08:30",
    horaSalida: "17:30",
    horasTrabajadas: "8.5",
    estado: "Presente",
    observaciones: ""
  },
  {
    id: 2,
    empleado: "Carlos López",
    fecha: "2024-01-08",
    horaEntrada: "09:15",
    horaSalida: "18:00",
    horasTrabajadas: "8.25",
    estado: "Tardanza",
    observaciones: "Llegó 15 min tarde"
  },
  {
    id: 3,
    empleado: "María Rodríguez",
    fecha: "2024-01-08",
    horaEntrada: "-",
    horaSalida: "-",
    horasTrabajadas: "0",
    estado: "Ausente",
    observaciones: "Vacaciones programadas"
  },
  {
    id: 4,
    empleado: "Juan Martínez",
    fecha: "2024-01-08",
    horaEntrada: "08:00",
    horaSalida: "16:30",
    horasTrabajadas: "8.0",
    estado: "Presente",
    observaciones: "Salida temprana autorizada"
  }
]

export default function AsistenciaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")

  const filteredAsistencia = asistenciaData.filter(registro => {
    const matchesSearch = registro.empleado.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = estadoFilter === "todos" || registro.estado.toLowerCase() === estadoFilter.toLowerCase()
    return matchesSearch && matchesEstado
  })

  const estadisticas = {
    totalEmpleados: 248,
    presentes: asistenciaData.filter(r => r.estado === "Presente").length,
    tardanzas: asistenciaData.filter(r => r.estado === "Tardanza").length,
    ausentes: asistenciaData.filter(r => r.estado === "Ausente").length,
    porcentajeAsistencia: Math.round((asistenciaData.filter(r => r.estado === "Presente" || r.estado === "Tardanza").length / asistenciaData.length) * 100)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Presente":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />{estado}</Badge>
      case "Tardanza":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertCircle className="w-3 h-3 mr-1" />{estado}</Badge>
      case "Ausente":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />{estado}</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Asistencia',
        href: '/asistencia',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Asistencia" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Control de Asistencia</h1>
              <p className="text-muted-foreground">
                Monitorea la asistencia y puntualidad de los empleados
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.totalEmpleados}</div>
                <p className="text-xs text-muted-foreground">
                  Empleados registrados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presentes</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{estadisticas.presentes}</div>
                <p className="text-xs text-muted-foreground">
                  Empleados presentes hoy
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tardanzas</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{estadisticas.tardanzas}</div>
                <p className="text-xs text-muted-foreground">
                  Llegadas tardías
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">% Asistencia</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.porcentajeAsistencia}%</div>
                <p className="text-xs text-muted-foreground">
                  Tasa de asistencia hoy
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="presente">Presente</SelectItem>
                <SelectItem value="tardanza">Tardanza</SelectItem>
                <SelectItem value="ausente">Ausente</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Más filtros
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Asistencia</CardTitle>
              <CardDescription>
                {filteredAsistencia.length} registros para {date ? format(date, "PPP", { locale: es }) : "hoy"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Hora Entrada</TableHead>
                    <TableHead>Hora Salida</TableHead>
                    <TableHead>Horas Trabajadas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAsistencia.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder-icon.png?height=32&width=32&text=${registro.empleado.charAt(0)}`} />
                            <AvatarFallback>{registro.empleado.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{registro.empleado}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{registro.horaEntrada}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{registro.horaSalida}</span>
                        </div>
                      </TableCell>
                      <TableCell>{registro.horasTrabajadas}h</TableCell>
                      <TableCell>
                        {getEstadoBadge(registro.estado)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {registro.observaciones || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
  )
}

"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Accreditation {
  id: string
  name: string
  type: "certification" | "license" | "permit" | "qualification"
  issuingAuthority: string
  issueDate: string
  expiryDate: string
  status: "active" | "expired" | "pending" | "suspended"
  certificateNumber: string
  employee?: string
  department: string
  renewalRequired: boolean
  daysUntilExpiry: number
}

interface AccreditationListProps {
  accreditations?: Accreditation[]
}

export default function AccreditationList({
  accreditations = [
    {
      id: "1",
      name: "ISO 9001:2015 Quality Management",
      type: "certification",
      issuingAuthority: "ISO International",
      issueDate: "2023-01-15",
      expiryDate: "2026-01-15",
      status: "active",
      certificateNumber: "ISO-9001-2023-001",
      department: "Calidad",
      renewalRequired: false,
      daysUntilExpiry: 730,
    },
    {
      id: "2",
      name: "Licencia de Operación Comercial",
      type: "license",
      issuingAuthority: "Gobierno Municipal",
      issueDate: "2023-06-01",
      expiryDate: "2024-06-01",
      status: "active",
      certificateNumber: "LOC-2023-456",
      department: "Legal",
      renewalRequired: true,
      daysUntilExpiry: 120,
    },
    {
      id: "3",
      name: "Certificación PMP",
      type: "certification",
      issuingAuthority: "PMI",
      issueDate: "2022-03-10",
      expiryDate: "2025-03-10",
      status: "active",
      certificateNumber: "PMP-2022-789",
      employee: "Juan Pérez",
      department: "Proyectos",
      renewalRequired: true,
      daysUntilExpiry: 400,
    },
    {
      id: "4",
      name: "Permiso Ambiental",
      type: "permit",
      issuingAuthority: "Ministerio de Ambiente",
      issueDate: "2021-08-15",
      expiryDate: "2023-08-15",
      status: "expired",
      certificateNumber: "ENV-2021-123",
      department: "Operaciones",
      renewalRequired: true,
      daysUntilExpiry: -150,
    },
    {
      id: "5",
      name: "Certificación SCRUM Master",
      type: "qualification",
      issuingAuthority: "Scrum Alliance",
      issueDate: "2023-09-20",
      expiryDate: "2025-09-20",
      status: "active",
      certificateNumber: "CSM-2023-555",
      employee: "María González",
      department: "Desarrollo",
      renewalRequired: true,
      daysUntilExpiry: 600,
    },
  ],
}: AccreditationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "certification":
        return "bg-blue-100 text-blue-800"
      case "license":
        return "bg-purple-100 text-purple-800"
      case "permit":
        return "bg-orange-100 text-orange-800"
      case "qualification":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getExpiryStatus = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) {
      return { icon: <AlertTriangle className="h-4 w-4 text-red-600" />, text: "Vencida", color: "text-red-600" }
    } else if (daysUntilExpiry <= 30) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
        text: "Por vencer",
        color: "text-orange-600",
      }
    } else if (daysUntilExpiry <= 90) {
      return { icon: <Clock className="h-4 w-4 text-yellow-600" />, text: "Próximo a vencer", color: "text-yellow-600" }
    } else {
      return { icon: <CheckCircle className="h-4 w-4 text-green-600" />, text: "Vigente", color: "text-green-600" }
    }
  }

  const filteredAccreditations = accreditations.filter((accreditation) => {
    const matchesSearch =
      accreditation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accreditation.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accreditation.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (accreditation.employee && accreditation.employee.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = typeFilter === "all" || accreditation.type === typeFilter
    const matchesStatus = statusFilter === "all" || accreditation.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const expiringCount = accreditations.filter((a) => a.daysUntilExpiry <= 90 && a.daysUntilExpiry > 0).length
  const expiredCount = accreditations.filter((a) => a.daysUntilExpiry < 0).length
  const activeCount = accreditations.filter((a) => a.status === "active").length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acreditaciones y Certificaciones</h1>
          <p className="text-gray-600">Gestiona certificaciones, licencias y permisos de la empresa</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground">Certificaciones vigentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{expiringCount}</div>
              <p className="text-xs text-muted-foreground">En los próximos 90 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
              <p className="text-xs text-muted-foreground">Requieren renovación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accreditations.length}</div>
              <p className="text-xs text-muted-foreground">Acreditaciones registradas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Todas las Acreditaciones</CardTitle>
                <CardDescription>Lista completa de certificaciones, licencias y permisos</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Acreditación
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar acreditaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="certification">Certificación</SelectItem>
                  <SelectItem value="license">Licencia</SelectItem>
                  <SelectItem value="permit">Permiso</SelectItem>
                  <SelectItem value="qualification">Cualificación</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="expired">Vencida</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="suspended">Suspendida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accreditations Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Autoridad Emisora</TableHead>
                    <TableHead>Empleado/Depto</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccreditations.map((accreditation) => {
                    const expiryStatus = getExpiryStatus(accreditation.daysUntilExpiry)
                    return (
                      <TableRow key={accreditation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{accreditation.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{accreditation.certificateNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(accreditation.type)}>
                            {accreditation.type === "certification"
                              ? "Certificación"
                              : accreditation.type === "license"
                                ? "Licencia"
                                : accreditation.type === "permit"
                                  ? "Permiso"
                                  : "Cualificación"}
                          </Badge>
                        </TableCell>
                        <TableCell>{accreditation.issuingAuthority}</TableCell>
                        <TableCell>
                          <div>
                            {accreditation.employee && <div className="font-medium">{accreditation.employee}</div>}
                            <div className="text-sm text-gray-500">{accreditation.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(accreditation.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(accreditation.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(accreditation.status)}>
                            {accreditation.status === "active"
                              ? "Activa"
                              : accreditation.status === "expired"
                                ? "Vencida"
                                : accreditation.status === "pending"
                                  ? "Pendiente"
                                  : "Suspendida"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center space-x-1 ${expiryStatus.color}`}>
                            {expiryStatus.icon}
                            <span className="text-sm">{expiryStatus.text}</span>
                          </div>
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
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Certificado
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

            {filteredAccreditations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron acreditaciones que coincidan con los criterios.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

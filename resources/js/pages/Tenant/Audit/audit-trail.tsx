"use client"

import { useState } from "react"
import { Search, Download, Shield, User, Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  module: string
  details: string
  ipAddress: string
  userAgent: string
  status: "success" | "failed" | "warning"
  severity: "low" | "medium" | "high" | "critical"
}

interface AuditTrailProps {
  auditLogs?: AuditLog[]
}

export default function AuditTrail({
  auditLogs = [
    {
      id: "1",
      timestamp: "2024-01-15T10:30:00Z",
      user: "admin@company.com",
      action: "LOGIN",
      module: "Authentication",
      details: "Usuario administrador inició sesión exitosamente",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "low",
    },
    {
      id: "2",
      timestamp: "2024-01-15T10:25:00Z",
      user: "juan.perez@company.com",
      action: "CREATE_INVOICE",
      module: "Invoicing",
      details: "Creó nueva factura INV-001 por $2,500.00",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "medium",
    },
    {
      id: "3",
      timestamp: "2024-01-15T10:20:00Z",
      user: "maria.gonzalez@company.com",
      action: "UPDATE_CUSTOMER",
      module: "CRM",
      details: "Actualizó información del cliente Acme Corp",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      status: "success",
      severity: "low",
    },
    {
      id: "4",
      timestamp: "2024-01-15T10:15:00Z",
      user: "carlos.ruiz@company.com",
      action: "DELETE_DOCUMENT",
      module: "Documents",
      details: "Eliminó documento: Contrato temporal v1.0",
      ipAddress: "192.168.1.103",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "high",
    },
    {
      id: "5",
      timestamp: "2024-01-15T10:10:00Z",
      user: "unknown@external.com",
      action: "FAILED_LOGIN",
      module: "Authentication",
      details: "Intento de inicio de sesión fallido - credenciales incorrectas",
      ipAddress: "203.0.113.45",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      status: "failed",
      severity: "critical",
    },
  ],
}: AuditTrailProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter
    return matchesSearch && matchesModule && matchesStatus && matchesSeverity
  })

  const modules = Array.from(new Set(auditLogs.map((log) => log.module)))
  const totalLogs = auditLogs.length
  const failedActions = auditLogs.filter((log) => log.status === "failed").length
  const criticalEvents = auditLogs.filter((log) => log.severity === "critical").length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Auditoría</h1>
          <p className="text-gray-600">Monitorea todas las actividades y cambios en el sistema</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLogs}</div>
              <p className="text-xs text-muted-foreground">Eventos registrados hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acciones Fallidas</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedActions}</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalEvents}</div>
              <p className="text-xs text-muted-foreground">Alta prioridad</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(auditLogs.map((log) => log.user)).size}</div>
              <p className="text-xs text-muted-foreground">En las últimas 24h</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Registro de Actividades</CardTitle>
                <CardDescription>Historial completo de acciones del sistema</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar Registro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar en registros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los módulos</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="success">Exitoso</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las severidades</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audit Logs Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.module}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status === "success" ? "Exitoso" : log.status === "failed" ? "Fallido" : "Advertencia"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity === "low"
                            ? "Baja"
                            : log.severity === "medium"
                              ? "Media"
                              : log.severity === "high"
                                ? "Alta"
                                : "Crítica"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron registros que coincidan con los criterios.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

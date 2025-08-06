"use client"
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ComplianceItem {
  id: string
  name: string
  category: string
  status: "compliant" | "non-compliant" | "pending" | "review"
  dueDate: string
  assignedTo: string
  priority: "high" | "medium" | "low"
  completionRate: number
}

interface ComplianceDashboardProps {
  complianceItems?: ComplianceItem[]
}

export default function ComplianceDashboard({
  complianceItems = [
    {
      id: "1",
      name: "Auditoría Financiera Anual",
      category: "Financiero",
      status: "pending",
      dueDate: "2024-03-31",
      assignedTo: "Departamento Financiero",
      priority: "high",
      completionRate: 75,
    },
    {
      id: "2",
      name: "Revisión de Políticas de Seguridad",
      category: "Seguridad",
      status: "compliant",
      dueDate: "2024-02-15",
      assignedTo: "IT Security",
      priority: "medium",
      completionRate: 100,
    },
    {
      id: "3",
      name: "Capacitación en Prevención de Lavado de Dinero",
      category: "Legal",
      status: "review",
      dueDate: "2024-04-30",
      assignedTo: "Recursos Humanos",
      priority: "high",
      completionRate: 60,
    },
    {
      id: "4",
      name: "Evaluación de Riesgos Operacionales",
      category: "Operacional",
      status: "non-compliant",
      dueDate: "2024-01-31",
      assignedTo: "Gestión de Riesgos",
      priority: "high",
      completionRate: 30,
    },
    {
      id: "5",
      name: "Actualización de Manuales de Procedimientos",
      category: "Operacional",
      status: "pending",
      dueDate: "2024-05-15",
      assignedTo: "Calidad",
      priority: "medium",
      completionRate: 45,
    },
  ],
}: ComplianceDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800"
      case "non-compliant":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "review":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const compliantCount = complianceItems.filter((item) => item.status === "compliant").length
  const nonCompliantCount = complianceItems.filter((item) => item.status === "non-compliant").length
  const pendingCount = complianceItems.filter((item) => item.status === "pending").length
  const reviewCount = complianceItems.filter((item) => item.status === "review").length

  const overallCompliance = Math.round((compliantCount / complianceItems.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Cumplimiento</h1>
          <p className="text-gray-600">Monitorea el estado de cumplimiento normativo y regulatorio</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumplimiento General</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallCompliance}%</div>
              <Progress value={overallCompliance} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +5% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumpliendo</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
              <p className="text-xs text-muted-foreground">Requisitos cumplidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Cumpliendo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{nonCompliantCount}</div>
              <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount + reviewCount}</div>
              <p className="text-xs text-muted-foreground">Pendientes y en revisión</p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Items */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Elementos de Cumplimiento</CardTitle>
                <CardDescription>Estado actual de todos los requisitos de cumplimiento</CardDescription>
              </div>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requisito</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Asignado a</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.assignedTo}</TableCell>
                      <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority === "high" ? "Alta" : item.priority === "medium" ? "Media" : "Baja"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.completionRate} className="w-16" />
                          <span className="text-sm text-gray-600">{item.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === "compliant"
                            ? "Cumpliendo"
                            : item.status === "non-compliant"
                              ? "No Cumple"
                              : item.status === "pending"
                                ? "Pendiente"
                                : "En Revisión"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Compliance by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento por Categoría</CardTitle>
              <CardDescription>Distribución del estado de cumplimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Financiero", "Legal", "Operacional", "Seguridad"].map((category) => {
                  const categoryItems = complianceItems.filter((item) => item.category === category)
                  const categoryCompliant = categoryItems.filter((item) => item.status === "compliant").length
                  const categoryRate =
                    categoryItems.length > 0 ? Math.round((categoryCompliant / categoryItems.length) * 100) : 0

                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{category}</div>
                        <div className="text-sm text-gray-500">{categoryItems.length} requisitos</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={categoryRate} className="w-20" />
                        <span className="text-sm font-medium w-12">{categoryRate}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Vencimientos</CardTitle>
              <CardDescription>Requisitos que vencen pronto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems
                  .filter((item) => new Date(item.dueDate) > new Date())
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 5)
                  .map((item) => {
                    const daysUntilDue = Math.ceil(
                      (new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                    )
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.assignedTo}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{daysUntilDue} días</div>
                          <div className="text-xs text-gray-500">{new Date(item.dueDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

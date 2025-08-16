"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Download,
  FileText,
  Folder,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Document {
  id: string
  name: string
  type: string
  category: "contract" | "invoice" | "certificate" | "policy" | "report" | "legal"
  size: string
  uploadDate: string
  lastModified: string
  uploadedBy: string
  status: "active" | "archived" | "pending_review"
  tags: string[]
  version: string
}

interface DocumentManagementProps {
  documents?: Document[]
}

export default function DocumentManagement({
  documents = [
    {
      id: "1",
      name: "Contrato de Servicios - Acme Corp",
      type: "PDF",
      category: "contract",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      lastModified: "2024-01-15",
      uploadedBy: "Juan Pérez",
      status: "active",
      tags: ["contrato", "servicios", "acme"],
      version: "1.0",
    },
    {
      id: "2",
      name: "Factura INV-001",
      type: "PDF",
      category: "invoice",
      size: "156 KB",
      uploadDate: "2024-01-14",
      lastModified: "2024-01-14",
      uploadedBy: "María González",
      status: "active",
      tags: ["factura", "ventas"],
      version: "1.0",
    },
    {
      id: "3",
      name: "Certificado ISO 9001",
      type: "PDF",
      category: "certificate",
      size: "890 KB",
      uploadDate: "2024-01-10",
      lastModified: "2024-01-10",
      uploadedBy: "Ana López",
      status: "active",
      tags: ["certificado", "iso", "calidad"],
      version: "2.1",
    },
    {
      id: "4",
      name: "Política de Seguridad de Datos",
      type: "DOCX",
      category: "policy",
      size: "1.2 MB",
      uploadDate: "2024-01-08",
      lastModified: "2024-01-12",
      uploadedBy: "Carlos Ruiz",
      status: "pending_review",
      tags: ["política", "seguridad", "datos"],
      version: "3.0",
    },
    {
      id: "5",
      name: "Reporte Financiero Q4 2023",
      type: "XLSX",
      category: "report",
      size: "3.1 MB",
      uploadDate: "2024-01-05",
      lastModified: "2024-01-05",
      uploadedBy: "Luis Martín",
      status: "archived",
      tags: ["reporte", "financiero", "q4"],
      version: "1.0",
    },
  ],
}: DocumentManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "contract":
        return "bg-blue-100 text-blue-800"
      case "invoice":
        return "bg-green-100 text-green-800"
      case "certificate":
        return "bg-purple-100 text-purple-800"
      case "policy":
        return "bg-orange-100 text-orange-800"
      case "report":
        return "bg-red-100 text-red-800"
      case "legal":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />
  }

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      document.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || document.category === categoryFilter
    const matchesStatus = statusFilter === "all" || document.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalDocuments = documents.length
  const activeDocuments = documents.filter((d) => d.status === "active").length
  const pendingReview = documents.filter((d) => d.status === "pending_review").length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Documentos</h1>
          <p className="text-gray-600">Organiza y gestiona todos los documentos de la empresa</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Documentos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeDocuments}</div>
              <p className="text-xs text-muted-foreground">En uso actualmente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes Revisión</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingReview}</div>
              <p className="text-xs text-muted-foreground">Requieren revisión</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Almacenamiento</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8 GB</div>
              <p className="text-xs text-muted-foreground">Espacio utilizado</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Todos los Documentos</CardTitle>
                <CardDescription>Lista completa de documentos organizacionales</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Documento
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Carpeta
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="contract">Contratos</SelectItem>
                  <SelectItem value="invoice">Facturas</SelectItem>
                  <SelectItem value="certificate">Certificados</SelectItem>
                  <SelectItem value="policy">Políticas</SelectItem>
                  <SelectItem value="report">Reportes</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                  <SelectItem value="pending_review">Pendiente Revisión</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Documents Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Subido por</TableHead>
                    <TableHead>Fecha Subida</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Versión</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            {getFileIcon(document.type)}
                          </div>
                          <div>
                            <div className="font-medium">{document.name}</div>
                            <div className="text-sm text-gray-500">{document.type}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(document.category)}>
                          {document.category === "contract"
                            ? "Contrato"
                            : document.category === "invoice"
                              ? "Factura"
                              : document.category === "certificate"
                                ? "Certificado"
                                : document.category === "policy"
                                  ? "Política"
                                  : document.category === "report"
                                    ? "Reporte"
                                    : "Legal"}
                        </Badge>
                      </TableCell>
                      <TableCell>{document.size}</TableCell>
                      <TableCell>{document.uploadedBy}</TableCell>
                      <TableCell>{new Date(document.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(document.status)}>
                          {document.status === "active"
                            ? "Activo"
                            : document.status === "archived"
                              ? "Archivado"
                              : "Pendiente Revisión"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">v{document.version}</TableCell>
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
                              Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Descargar
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron documentos que coincidan con los criterios.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

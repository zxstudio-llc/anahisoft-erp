"use client"

import { useState } from "react"
import { Plus, Search, Building2, Mail, Phone, MoreHorizontal, Eye, Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BreadcrumbItem } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"

interface Provider {
  id: string
  providerId: string
  companyName: string
  contactName: string
  email: string
  phone: string
  category: string
  address: string
  city: string
  country: string
  taxId: string
  paymentTerms: string
  creditLimit: number
  currentBalance: number
  status: "active" | "inactive" | "suspended"
  registrationDate: string
  lastOrder: string
  totalOrders: number
  rating: number
}

export default function ProvidersManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const providers: Provider[] = [
    {
      id: "1",
      providerId: "PROV-001",
      companyName: "Tecnología Avanzada S.A.",
      contactName: "Roberto Silva",
      email: "roberto.silva@tecavanzada.com",
      phone: "+1 (555) 123-4567",
      category: "Tecnología",
      address: "Av. Principal 123",
      city: "Ciudad Capital",
      country: "País",
      taxId: "12345678901",
      paymentTerms: "30 días",
      creditLimit: 50000,
      currentBalance: 15000,
      status: "active",
      registrationDate: "2023-01-15",
      lastOrder: "2024-01-05",
      totalOrders: 45,
      rating: 4.5
    },
    {
      id: "2",
      providerId: "PROV-002",
      companyName: "Suministros Industriales Ltda.",
      contactName: "Carmen López",
      email: "carmen.lopez@suministros.com",
      phone: "+1 (555) 987-6543",
      category: "Suministros",
      address: "Calle Industrial 456",
      city: "Ciudad Industrial",
      country: "País",
      taxId: "98765432109",
      paymentTerms: "15 días",
      creditLimit: 75000,
      currentBalance: 22000,
      status: "active",
      registrationDate: "2022-08-20",
      lastOrder: "2024-01-03",
      totalOrders: 78,
      rating: 4.8
    },
    {
      id: "3",
      providerId: "PROV-003",
      companyName: "Servicios Logísticos Express",
      contactName: "Miguel Torres",
      email: "miguel.torres@logexpress.com",
      phone: "+1 (555) 456-7890",
      category: "Logística",
      address: "Zona Franca 789",
      city: "Puerto Comercial",
      country: "País",
      taxId: "45678912345",
      paymentTerms: "7 días",
      creditLimit: 30000,
      currentBalance: 8500,
      status: "active",
      registrationDate: "2023-03-10",
      lastOrder: "2024-01-07",
      totalOrders: 32,
      rating: 4.2
    },
    {
      id: "4",
      providerId: "PROV-004",
      companyName: "Materiales de Construcción S.A.",
      contactName: "Ana Martínez",
      email: "ana.martinez@matconst.com",
      phone: "+1 (555) 321-0987",
      category: "Construcción",
      address: "Carretera Norte Km 15",
      city: "Ciudad Norte",
      country: "País",
      taxId: "78912345678",
      paymentTerms: "45 días",
      creditLimit: 100000,
      currentBalance: 35000,
      status: "inactive",
      registrationDate: "2021-11-05",
      lastOrder: "2023-12-15",
      totalOrders: 156,
      rating: 4.0
    },
    {
      id: "5",
      providerId: "PROV-005",
      companyName: "Consultoría Empresarial Pro",
      contactName: "David Ruiz",
      email: "david.ruiz@consultpro.com",
      phone: "+1 (555) 654-3210",
      category: "Servicios",
      address: "Torre Empresarial Piso 12",
      city: "Centro Financiero",
      country: "País",
      taxId: "32165498732",
      paymentTerms: "30 días",
      creditLimit: 25000,
      currentBalance: 0,
      status: "suspended",
      registrationDate: "2023-06-01",
      lastOrder: "2023-11-20",
      totalOrders: 12,
      rating: 3.5
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRatingStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating))
  }

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.providerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || provider.category === categoryFilter
    const matchesStatus = statusFilter === "all" || provider.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = Array.from(new Set(providers.map((prov) => prov.category)))
  const totalProviders = providers.length
  const activeProviders = providers.filter((prov) => prov.status === "active").length
  const totalCreditLimit = providers.reduce((sum, prov) => sum + prov.creditLimit, 0)
  const totalCurrentBalance = providers.reduce((sum, prov) => sum + prov.currentBalance, 0)

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Proveedores',
        href: '/providers-management',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Proveedores" />
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Proveedores</h1>
              <p className="text-gray-600">Administración y control de proveedores</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProviders}</div>
                  <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{activeProviders}</div>
                  <p className="text-xs text-muted-foreground">Operando actualmente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Límite de Crédito</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalCreditLimit.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Límite total disponible</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalCurrentBalance.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Saldo pendiente total</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Lista de Proveedores</CardTitle>
                    <CardDescription>Información completa de proveedores</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proveedor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar proveedores..."
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
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Providers Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Límite Crédito</TableHead>
                        <TableHead>Saldo Actual</TableHead>
                        <TableHead>Calificación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>
                                  {provider.companyName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{provider.companyName}</div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {provider.city}, {provider.country}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{provider.providerId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{provider.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{provider.contactName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {provider.email}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {provider.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${provider.creditLimit.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${provider.currentBalance.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">
                                {getRatingStars(provider.rating)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({provider.rating})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(provider.status)}>
                              {provider.status === "active"
                                ? "Activo"
                                : provider.status === "inactive"
                                ? "Inactivo"
                                : "Suspendido"}
                            </Badge>
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
                                  Ver Perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Ver Órdenes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Estado de Cuenta
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

                {filteredProviders.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron proveedores que coincidan con los criterios.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
  )
}

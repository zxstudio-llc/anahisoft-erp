"use client"

import { useState } from "react"
import { Plus, Search, Users, Mail, Calendar, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { BreadcrumbItem } from "@/types"

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: number
  status: "active" | "inactive" | "terminated"
  manager: string
  address: string
  avatar?: string
}

interface EmployeesProps {
  employees?: Employee[]
}

export default function Employees({
  employees = [
    {
      id: "1",
      employeeId: "EMP-001",
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@company.com",
      phone: "+1 (555) 123-4567",
      position: "Gerente de Ventas",
      department: "Ventas",
      hireDate: "2022-01-15",
      salary: 75000,
      status: "active",
      manager: "María González",
      address: "123 Main St, Ciudad",
    },
    {
      id: "2",
      employeeId: "EMP-002",
      firstName: "María",
      lastName: "González",
      email: "maria.gonzalez@company.com",
      phone: "+1 (555) 987-6543",
      position: "Directora de Operaciones",
      department: "Operaciones",
      hireDate: "2021-03-10",
      salary: 95000,
      status: "active",
      manager: "CEO",
      address: "456 Oak Ave, Ciudad",
    },
    {
      id: "3",
      employeeId: "EMP-003",
      firstName: "Carlos",
      lastName: "Ruiz",
      email: "carlos.ruiz@company.com",
      phone: "+1 (555) 456-7890",
      position: "Desarrollador Senior",
      department: "Tecnología",
      hireDate: "2022-06-01",
      salary: 85000,
      status: "active",
      manager: "Ana López",
      address: "789 Pine St, Ciudad",
    },
    {
      id: "4",
      employeeId: "EMP-004",
      firstName: "Ana",
      lastName: "López",
      email: "ana.lopez@company.com",
      phone: "+1 (555) 321-0987",
      position: "Gerente de TI",
      department: "Tecnología",
      hireDate: "2020-09-15",
      salary: 90000,
      status: "active",
      manager: "María González",
      address: "321 Elm St, Ciudad",
    },
    {
      id: "5",
      employeeId: "EMP-005",
      firstName: "Luis",
      lastName: "Martín",
      email: "luis.martin@company.com",
      phone: "+1 (555) 654-3210",
      position: "Contador",
      department: "Finanzas",
      hireDate: "2023-02-01",
      salary: 65000,
      status: "inactive",
      manager: "María González",
      address: "654 Maple Ave, Ciudad",
    },
  ],
}: EmployeesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "terminated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const departments = Array.from(new Set(employees.map((emp) => emp.department)))
  const totalEmployees = employees.length
  const activeEmployees = employees.filter((emp) => emp.status === "active").length
  const averageSalary = employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Empleados',
        href: '/empleados',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Empleador" />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Empleados</h1>
          <p className="text-gray-600">Gestión del personal de la empresa</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
              <p className="text-xs text-muted-foreground">Trabajando actualmente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Áreas de trabajo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salario Promedio</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageSalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Salario anual promedio</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Lista de Empleados</CardTitle>
                <CardDescription>Información completa del personal</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Empleado
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar empleados..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
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
                  <SelectItem value="terminated">Terminado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employees Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead>Salario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {employee.firstName[0]}
                              {employee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{employee.employeeId}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department}</Badge>
                      </TableCell>
                      <TableCell>{new Date(employee.hireDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">${employee.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status === "active"
                            ? "Activo"
                            : employee.status === "inactive"
                              ? "Inactivo"
                              : "Terminado"}
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
                              Ver Asistencia
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

            {filteredEmployees.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron empleados que coincidan con los criterios.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  )
}

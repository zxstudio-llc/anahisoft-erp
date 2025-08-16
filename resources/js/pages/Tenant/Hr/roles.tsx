"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { BreadcrumbItem } from "@/types"

const empleados = [
  {
    id: 1,
    nombre: "Ana García",
    email: "ana.garcia@empresa.com",
    cargo: "Desarrolladora Senior",
    departamento: "Tecnología",
    estado: "Activo",
    fechaIngreso: "2023-01-15",
    salario: "$75,000"
  },
  {
    id: 2,
    nombre: "Carlos López",
    email: "carlos.lopez@empresa.com",
    cargo: "Gerente de Ventas",
    departamento: "Ventas",
    estado: "Activo",
    fechaIngreso: "2022-08-20",
    salario: "$85,000"
  },
  {
    id: 3,
    nombre: "María Rodríguez",
    email: "maria.rodriguez@empresa.com",
    cargo: "Analista de RRHH",
    departamento: "Recursos Humanos",
    estado: "Vacaciones",
    fechaIngreso: "2023-03-10",
    salario: "$60,000"
  },
  {
    id: 4,
    nombre: "Juan Martínez",
    email: "juan.martinez@empresa.com",
    cargo: "Contador",
    departamento: "Finanzas",
    estado: "Activo",
    fechaIngreso: "2021-11-05",
    salario: "$70,000"
  }
]

export default function EmpleadosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  )

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Roles" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Empleados</h1>
              <p className="text-muted-foreground">
                Gestiona la información de todos los empleados
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
                  <DialogDescription>
                    Completa la información del nuevo empleado.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nombre" className="text-right">
                      Nombre
                    </Label>
                    <Input id="nombre" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" type="email" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cargo" className="text-right">
                      Cargo
                    </Label>
                    <Input id="cargo" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="departamento" className="text-right">
                      Departamento
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tecnologia">Tecnología</SelectItem>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="rrhh">Recursos Humanos</SelectItem>
                        <SelectItem value="finanzas">Finanzas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                    Guardar Empleado
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Empleados</CardTitle>
              <CardDescription>
                {filteredEmpleados.length} empleados encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead>Salario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpleados.map((empleado) => (
                    <TableRow key={empleado.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder-icon.png?height=32&width=32&text=${empleado.nombre.charAt(0)}`} />
                            <AvatarFallback>{empleado.nombre.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{empleado.nombre}</div>
                            <div className="text-sm text-muted-foreground">{empleado.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{empleado.cargo}</TableCell>
                      <TableCell>{empleado.departamento}</TableCell>
                      <TableCell>
                        <Badge variant={empleado.estado === "Activo" ? "default" : "secondary"}>
                          {empleado.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{empleado.fechaIngreso}</TableCell>
                      <TableCell>{empleado.salario}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
            </CardContent>
          </Card>
        </div>
      </AppLayout>
  )
}

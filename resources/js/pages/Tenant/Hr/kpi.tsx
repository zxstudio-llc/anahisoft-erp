"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, Target, Award, AlertTriangle, Download, Calendar } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"

const asistenciaData = [
  { mes: "Ene", asistencia: 92, tardanzas: 8 },
  { mes: "Feb", asistencia: 89, tardanzas: 11 },
  { mes: "Mar", asistencia: 94, tardanzas: 6 },
  { mes: "Abr", asistencia: 91, tardanzas: 9 },
  { mes: "May", asistencia: 96, tardanzas: 4 },
  { mes: "Jun", asistencia: 93, tardanzas: 7 },
]

const productividadData = [
  { departamento: "Tecnología", productividad: 87, meta: 85 },
  { departamento: "Ventas", productividad: 92, meta: 90 },
  { departamento: "RRHH", productividad: 78, meta: 80 },
  { departamento: "Finanzas", productividad: 85, meta: 85 },
  { departamento: "Marketing", productividad: 89, meta: 88 },
]

const rotacionData = [
  { name: "Permanecen", value: 85, color: "#22c55e" },
  { name: "Rotación", value: 15, color: "#ef4444" },
]

const satisfaccionData = [
  { categoria: "Ambiente Laboral", puntuacion: 4.2 },
  { categoria: "Compensación", puntuacion: 3.8 },
  { categoria: "Desarrollo", puntuacion: 4.0 },
  { categoria: "Liderazgo", puntuacion: 4.1 },
  { categoria: "Balance Vida-Trabajo", puntuacion: 3.9 },
]

const chartConfig = {
  asistencia: {
    label: "Asistencia",
    color: "#2563eb",
  },
  tardanzas: {
    label: "Tardanzas",
    color: "#dc2626",
  },
  productividad: {
    label: "Productividad",
    color: "#16a34a",
  },
  meta: {
    label: "Meta",
    color: "#64748b",
  },
} satisfies ChartConfig

export default function KPIsPage() {
  const kpis = [
    {
      titulo: "Tasa de Retención",
      valor: "85%",
      cambio: "+2.5%",
      tendencia: "up",
      descripcion: "vs mes anterior",
      icono: Users,
      color: "text-green-600"
    },
    {
      titulo: "Productividad Promedio",
      valor: "86.2%",
      cambio: "+1.8%",
      tendencia: "up",
      descripcion: "vs mes anterior",
      icono: Target,
      color: "text-blue-600"
    },
    {
      titulo: "Satisfacción Laboral",
      valor: "4.0/5",
      cambio: "-0.1",
      tendencia: "down",
      descripcion: "vs trimestre anterior",
      icono: Award,
      color: "text-yellow-600"
    },
    {
      titulo: "Tiempo Promedio Contratación",
      valor: "18 días",
      cambio: "-3 días",
      tendencia: "up",
      descripción: "vs mes anterior",
      icono: Clock,
      color: "text-purple-600"
    }
  ]

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kpi',
        href: '/kpi',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Kpi" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">KPIs de Recursos Humanos</h1>
              <p className="text-muted-foreground">
                Indicadores clave de rendimiento y métricas de RRHH
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select defaultValue="mes">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mes</SelectItem>
                  <SelectItem value="trimestre">Este trimestre</SelectItem>
                  <SelectItem value="año">Este año</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Exportar Reporte
              </Button>
            </div>
          </div>

          {/* KPIs Principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.titulo}</CardTitle>
                  <kpi.icono className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.valor}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {kpi.tendencia === "up" ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                    )}
                    <span className={kpi.tendencia === "up" ? "text-green-600" : "text-red-600"}>
                      {kpi.cambio}
                    </span>
                    <span className="ml-1">{kpi.descripcion}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asistencia y Tardanzas</CardTitle>
                <CardDescription>Tendencia mensual de asistencia</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={asistenciaData}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="asistencia" fill="var(--color-asistencia)" />
                    <Bar dataKey="tardanzas" fill="var(--color-tardanzas)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productividad por Departamento</CardTitle>
                <CardDescription>Comparación con metas establecidas</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={productividadData} layout="horizontal">
                    <XAxis type="number" />
                    <YAxis dataKey="departamento" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="productividad" fill="var(--color-productividad)" />
                    <Bar dataKey="meta" fill="var(--color-meta)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tasa de Rotación</CardTitle>
                <CardDescription>Distribución de empleados</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rotacionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {rotacionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {rotacionData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfacción Laboral</CardTitle>
                <CardDescription>Puntuación por categoría (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {satisfaccionData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.categoria}</span>
                        <span className="text-sm text-muted-foreground">{item.puntuacion}/5</span>
                      </div>
                      <Progress value={item.puntuacion * 20} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas y Recomendaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Alertas y Recomendaciones</span>
              </CardTitle>
              <CardDescription>
                Áreas que requieren atención inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Satisfacción en Compensación</h4>
                    <p className="text-sm text-yellow-700">
                      La puntuación de satisfacción en compensación (3.8/5) está por debajo del promedio. 
                      Considerar revisar la estructura salarial.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Productividad en RRHH</h4>
                    <p className="text-sm text-red-700">
                      El departamento de RRHH no está alcanzando su meta de productividad (78% vs 80%). 
                      Revisar procesos y carga de trabajo.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Award className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Excelente Desempeño en Ventas</h4>
                    <p className="text-sm text-green-700">
                      El departamento de Ventas superó su meta de productividad (92% vs 90%). 
                      Considerar replicar sus mejores prácticas.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
  )
}

"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SalesChartProps {
  data: Array<{
    date: string
    ventas: number
  }>
}

const chartConfig = {
  ventas: {
    label: "Ventas",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const timeRangeOptions = [
  { value: "15d", label: "15 días", shortLabel: "15d" },
  { value: "3m", label: "3 meses", shortLabel: "3m" },
  { value: "6m", label: "6 meses", shortLabel: "6m" },
  { value: "12m", label: "12 meses", shortLabel: "12m" },
]

export function SalesChart({ data }: SalesChartProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6m")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("3m")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const today = new Date()

    if (timeRange === "15d") {
      // Para 15 días, mostrar desde hace 15 días hasta hoy
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 14) // 14 días atrás + hoy = 15 días
      
      // Generar todos los días en el rango
      const days: string[] = []
      const tempDate = new Date(startDate)
      
      while (tempDate <= today) {
        days.push(tempDate.toISOString().slice(0, 10)) // "YYYY-MM-DD"
        tempDate.setDate(tempDate.getDate() + 1)
      }
      
      // Mapear los días con los datos reales, poniendo 0 si no hay datos
      return days.map((day) => {
        const match = data.find((item) => item.date.slice(0, 10) === day)
        return {
          date: day,
          ventas: match ? match.ventas : 0,
        }
      })
    } else {
      // Para filtros mensuales - mostrar todos los días en el rango
      let monthsToShow = 6
      if (timeRange === "12m") monthsToShow = 12
      if (timeRange === "3m") monthsToShow = 3
      
      // Calcular fecha de inicio
      const startDate = new Date(today.getFullYear(), today.getMonth() - monthsToShow + 1, 1)
      
      // Generar todos los días desde startDate hasta hoy
      const days: string[] = []
      const tempDate = new Date(startDate)
      
      while (tempDate <= today) {
        days.push(tempDate.toISOString().slice(0, 10)) // "YYYY-MM-DD"
        tempDate.setDate(tempDate.getDate() + 1)
      }
      
      // Mapear los días con los datos reales, poniendo 0 si no hay datos
      return days.map((day) => {
        const match = data.find((item) => item.date.slice(0, 10) === day)
        return {
          date: day,
          ventas: match ? match.ventas : 0,
        }
      })
    }
  }, [data, timeRange])

  const total = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.ventas, 0)
  }, [filteredData])

  const getTimeRangeLabel = () => {
    const option = timeRangeOptions.find(opt => opt.value === timeRange)
    return option ? option.label : "6 meses"
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-6">
          <CardTitle>Ventas por {timeRange === "15d" ? "día" : "mes"}</CardTitle>
          <CardDescription className="mb-4">
            Análisis de ventas por período seleccionado
          </CardDescription>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex min-w-[200px]">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">
              Últimos {getTimeRangeLabel()}
            </span>
            <span className="text-lg leading-none font-black sm:text-4xl font">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-ventas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-ventas)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("es-EC", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("es-EC", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="line"
                />
              }
            />
            <Area
              dataKey="ventas"
              type="natural"
              fill="url(#fillVentas)"
              stroke="var(--color-ventas)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
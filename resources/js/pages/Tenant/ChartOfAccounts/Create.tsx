"use client"

import { useState } from "react"
import { Plus, ChevronLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head, useForm, Link } from "@inertiajs/react"

interface ParentAccount {
  code: string
  name: string
}

interface CreateChartOfAccountProps {
  parents?: ParentAccount[]
}

export default function CreateChartOfAccount({ parents = [] }: CreateChartOfAccountProps) {
  const { data, setData, post, processing, errors } = useForm({
    code: "",
    name: "",
    account_type: "",
    account_subtype: "",
    parent_code: "",
    level: 1,
    is_detail: true,
    initial_balance: 0,
    active: true,
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route("tenant.chart-of-accounts.store"))
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Plan de cuenta", href: "/finanzas/chart-of-statements" },
    { title: "Nueva Cuenta", href: "" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Nueva Cuenta Contable" />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Link href={route("tenant.chart-of-accounts.index")} className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="mr-2 h-4 w-4" /> Volver
            </Link>
            <h1 className="text-2xl font-bold">Crear Nueva Cuenta</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Datos de la Cuenta</CardTitle>
              <CardDescription>Ingrese la información de la nueva cuenta contable</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Código</label>
                    <Input
                      value={data.code}
                      onChange={(e) => setData("code", e.target.value)}
                      placeholder="Ej: 1001"
                    />
                    {errors.code && <p className="text-red-600 text-sm">{errors.code}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <Input
                      value={data.name}
                      onChange={(e) => setData("name", e.target.value)}
                      placeholder="Ej: Caja y Bancos"
                    />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de cuenta</label>
                    <Select
                      value={data.account_type}
                      onValueChange={(value) => setData("account_type", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">Activo</SelectItem>
                        <SelectItem value="liability">Pasivo</SelectItem>
                        <SelectItem value="equity">Patrimonio</SelectItem>
                        <SelectItem value="income">Ingreso</SelectItem>
                        <SelectItem value="expense">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.account_type && <p className="text-red-600 text-sm">{errors.account_type}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subcuenta de</label>
                    <Select
                      value={data.parent_code}
                      onValueChange={(value) => setData("parent_code", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona cuenta padre" />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((p) => (
                          <SelectItem key={p.code} value={p.code}>
                            {p.code} - {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.parent_code && <p className="text-red-600 text-sm">{errors.parent_code}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Saldo Inicial</label>
                  <Input
                    type="number"
                    value={data.initial_balance}
                    onChange={(e) => setData("initial_balance", Number(e.target.value))}
                  />
                  {errors.initial_balance && <p className="text-red-600 text-sm">{errors.initial_balance}</p>}
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      checked={data.active}
                      onChange={(e) => setData("active", e.target.checked)}
                    />
                    <span>Cuenta activa</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      checked={data.is_detail}
                      onChange={(e) => setData("is_detail", e.target.checked)}
                    />
                    <span>Cuenta de detalle</span>
                  </label>
                </div>

                <Button type="submit" disabled={processing}>
                  <Plus className="mr-2 h-4 w-4" /> Guardar Cuenta
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

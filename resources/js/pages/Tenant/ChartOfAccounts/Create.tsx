"use client"

import { useForm, Head } from "@inertiajs/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useState } from "react"

interface ParentAccount {
  code: string
  name: string
}

interface CreateChartOfAccountModalProps {
  open: boolean
  onClose: () => void
  parents?: ParentAccount[]
}

export default function CreateChartOfAccountModal({ open, onClose, parents = [] }: CreateChartOfAccountModalProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
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
    post(route("tenant.chart-of-accounts.store"), {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Cuenta Contable</DialogTitle>
          <DialogDescription>Ingrese la información de la nueva cuenta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Código</label>
              <Input
                value={data.code}
                onChange={(e) => setData("code", e.target.value)}
                placeholder="Ej: 1001"
              />
              {errors.code && <p className="text-red-600 text-sm">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Nombre</label>
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
              <label className="block text-sm font-medium">Tipo de cuenta</label>
              <Select
                value={data.account_type}
                onValueChange={(value) => setData("account_type", value)}
              >
                <SelectTrigger>
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
              <label className="block text-sm font-medium">Subcuenta de</label>
              <Select
                value={data.parent_code}
                onValueChange={(value) => setData("parent_code", value)}
              >
                <SelectTrigger>
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
            <label className="block text-sm font-medium">Saldo Inicial</label>
            <Input
              type="number"
              value={data.initial_balance}
              onChange={(e) => setData("initial_balance", Number(e.target.value))}
            />
            {errors.initial_balance && <p className="text-red-600 text-sm">{errors.initial_balance}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              <Plus className="mr-2 h-4 w-4" /> Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

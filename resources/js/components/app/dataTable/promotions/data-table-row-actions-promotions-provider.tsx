"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Ellipsis } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActionsProvider<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const promotion = row.original
  const { delete: destroy, processing } = useForm()

  const handleDelete = () => {
    if (confirm('¿Estás seguro de desactivar esta promoción? No se eliminará, solo se marcará como inactiva.')) {
      destroy(route('provider.promotions.destroy', promotion.id), {
        onSuccess: () => {
          toast.success("La promoción ha sido desactivada exitosamente")
        },
        onError: () => {
          toast.error("Ocurrió un error al desactivar la promoción")
        }
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          disabled={processing}
        >
          <Ellipsis className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        {promotion.status === 'rejected' && (
          <DropdownMenuItem asChild>
            <a href={route('provider.promotions.edit', promotion.id)}>
              Revisar / Editar
            </a>
          </DropdownMenuItem>
        )}
        {promotion.status !== 'inactive' && (
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600"
          >
            Desactivar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

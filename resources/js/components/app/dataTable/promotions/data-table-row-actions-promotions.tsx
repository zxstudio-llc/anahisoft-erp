"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Ellipsis, Printer } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  statusOptions?: Record<string, string>
}

export function DataTableRowActions<TData>({
  row,
  statusOptions = {}
}: DataTableRowActionsProps<TData>) {
  const promotion = row.original
  const { post, delete: destroy, processing } = useForm()

  const handleApprove = () => {
    post(route('admin.promotions.approve', promotion.id), {
      onSuccess: () => {
        toast({
          title: "Promoción aprobada",
          description: "La promoción ha sido aprobada exitosamente",
        })
      },
      onError: () => {
        toast({
          title: "Error",
          description: "No se pudo aprobar la promoción",
          variant: "destructive"
        })
      }
    })
  }

  const handleReject = () => {
    // Esto abriría un modal para ingresar la razón
    // Por ahora redirigimos a la vista de revisión
    window.location.href = route('admin.promotions.review', promotion.id)
  }

  const handleDelete = () => {
    if (confirm('¿Estás seguro de desactivar esta promoción? No se eliminará, solo se marcará como inactiva.')) {
      destroy(route('admin.promotions.destroy', promotion.id), {
        onSuccess: () => {
          toast({
            title: "Promoción desactivada",
            description: "La promoción ha sido marcada como inactiva",
          })
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
      <DropdownMenuContent align="end" className="w-[160px]">
        {promotion.status === 'pending' && (
          <>
            <DropdownMenuItem onClick={handleApprove}>
              Aprobar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReject}>
              Rechazar
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem asChild>
          <a href={route('admin.promotions.review', promotion.id)}>
            Revisar
          </a>
        </DropdownMenuItem>
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
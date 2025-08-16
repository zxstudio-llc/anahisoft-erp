"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Ellipsis, Printer } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import { bingoCardSchema } from "@/data/bingoCardSchema"
import { z } from "zod"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onPrint?: (card: z.infer<typeof bingoCardSchema>) => void
  onPreview?: (card: z.infer<typeof bingoCardSchema>) => void
}

export function DataTableRowActionsBingo<TData>({
  row,
  onPrint,
  onPreview
}: DataTableRowActionsProps<TData>) {
  // Transformar los datos antes de validar
  const transformData = (data: any) => ({
    ...data,
    table_number: Number(data.table_number) || 0, // Convertir a número
    customer: data.customer || data.user || { // Compatibilidad con ambos nombres
      first_name: 'Nombre',
      last_name: 'Apellido'
    },
    game: data.game || { // Valores por defecto para game
      game_number: 'N/A',
      status: 'N/A',
      end_time: new Date().toISOString()
    }
  })

  const parseResult = bingoCardSchema.safeParse(transformData(row.original))

  if (!parseResult.success) {
    console.error("Error parsing bingo card:", parseResult.error)
    return null
  }

  const card = parseResult.data

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => onPreview?.(card)}>
            Vista previa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPrint?.(card)}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
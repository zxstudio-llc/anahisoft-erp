"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Game } from "@/types"
import { bingoCardSchema } from "@/data/bingoCardSchema"
import { z } from "zod"

export const gameColumns = (): ColumnDef<z.infer<typeof bingoCardSchema>>[] => [
  {
    accessorKey: 'game_number',
    header: 'N° Juego',
  },
  {
    accessorKey: 'name',
    header: 'Nombre',
  },
  {
    accessorKey: 'start_time',
    header: 'Inicio',
    cell: ({ row }) => new Date(row.original.start_time).toLocaleString(),
  },
  {
    accessorKey: 'end_time',
    header: 'Fin',
    cell: ({ row }) => new Date(row.original.end_time).toLocaleString(),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <span className="capitalize">{row.original.status}</span>,
  },
]
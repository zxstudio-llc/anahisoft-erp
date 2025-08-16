"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import { newsSchema } from "@/data/newsSchema"
import { z } from "zod"
import { Link, router } from "@inertiajs/react"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActionsNews<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const news = newsSchema.parse(row.original)

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar esta noticia?')) {
      router.delete(`/admin/news/${news.id}`)
    }
  }

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
          <DropdownMenuItem asChild>
            <Link 
              href={`/admin/news/${news.id}/edit`}
              className="w-full cursor-pointer"
            >
              <div className="flex items-center">
                <Pencil className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600 cursor-pointer"
            onClick={handleDelete}
          >
            <div className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
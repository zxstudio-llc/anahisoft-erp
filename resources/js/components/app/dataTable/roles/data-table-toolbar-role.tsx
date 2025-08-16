"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/app/dataTable/data-table-view-options"
import { DataTableFacetedFilter } from "@/components/app/dataTable/roles/data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  guardOptions: {
    label: string
    value: string
  }[]
}

export function DataTableToolbarRole<TData>({
  table,
  guardOptions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrar por nombre"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        <DataTableFacetedFilter
          column={table.getColumn("guard_name")}
          title="Guard"
          options={guardOptions.filter(option => option.value)}
          selectMode={true}
        />
        
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reiniciar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
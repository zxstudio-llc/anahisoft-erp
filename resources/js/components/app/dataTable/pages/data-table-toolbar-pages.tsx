"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/app/dataTable/data-table-view-options"
import { DataTableFacetedFilter } from "../data-table-faceted-filter"
import React from "react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbarPages<TData>({
  table,
  onResetSearch,
}: DataTableToolbarProps<TData> & { onResetSearch?: () => void }) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    table.setGlobalFilter(search);
  }, [search]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setSearch("");
              if (onResetSearch) onResetSearch();
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

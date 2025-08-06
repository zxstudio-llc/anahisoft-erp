"use client"

import { Row } from "@tanstack/react-table"
import { SquarePen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { roleSchema } from "@/data/roleSchema"
import { useState } from "react"
import { EditRoleDialog } from "@/pages/admin/roles/edit-role-dialog"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActionsIcon<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState(false)
  const role = roleSchema.parse(row.original)

  return (
    <>
      <Button
        variant="ghost"
        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        onClick={() => setOpen(true)}
      >
        <SquarePen className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>
      
      <EditRoleDialog
        roleId={role.id}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function ImportExcelModal() {
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setSubmitting(true)

    const formData = new FormData()
    formData.append("file", file)

    post(route("tenant.chart-of-accounts.import"), formData, {
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" /> Importar Excel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Plan de Cuentas</DialogTitle>
          <DialogDescription>
            Selecciona un archivo Excel (.xlsx, .xls, .csv) para importar las cuentas contables.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Input 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button type="submit" disabled={!file || submitting}>
              {submitting ? "Subiendo..." : "Subir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

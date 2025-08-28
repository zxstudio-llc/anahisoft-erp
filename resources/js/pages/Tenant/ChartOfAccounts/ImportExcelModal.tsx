"use client"

import { useState } from "react"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"

export default function ImportExcelModal() {
  const [open, setOpen] = useState(false)
  
  const { data, setData, post, processing, errors, reset } = useForm({
    file: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setData('file', file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!data.file) {
      toast.error('Por favor seleccione un archivo')
      return
    }

    // Crear FormData para el archivo
    const formData = new FormData()
    formData.append('file', data.file)

    // Usar router.post directamente con FormData
    post(route('tenant.chart-of-accounts.import'), {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onSuccess: () => {
        toast.success('Plan de cuentas importado correctamente')
        setOpen(false)
        reset()
      },
      onError: (errors) => {
        console.error('Error al importar:', errors)
        if (errors.file) {
          toast.error(errors.file)
        } else {
          toast.error('Error al importar el archivo')
        }
      },
      onFinish: () => {
        // Reset form after processing
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Upload className="mr-2 h-4 w-4" /> 
          Importar Excel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Plan de Cuentas</DialogTitle>
          <DialogDescription>
          Selecciona un archivo Excel (.xlsx, .xls, .csv) para importar las cuentas contables.
      </DialogDescription>
          <DialogDescription className="space-y-2">
            <>
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md gap-2">
              <p className="font-bold text-blue-900">Formato esperado:</p>
              <ul className="text-blue-800 space-y-1 text-xs">
                <li>*<strong>CODIGO CUENTA:</strong> Código único de la cuenta</li>
                <li>*<strong>NOMBRE CUENTA:</strong> Nombre descriptivo</li>
                <li>*<strong>TIPO ESTADO FINANCIERO:</strong> asset, liability, equity, income, expense</li>
                <li>*<strong>TIENE SUBCUENTAS:</strong> si/no</li>
                <li>*<strong>ESTADO:</strong> activa/inactiva</li>
              </ul>
            </div>
            </>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileChange}
              disabled={processing}
            />
            {errors.file && (
              <p className="text-red-600 text-sm mt-1">{errors.file}</p>
            )}
          </div>

          <DialogFooter className="flex justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!data.file || processing}
              className="min-w-[100px]"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
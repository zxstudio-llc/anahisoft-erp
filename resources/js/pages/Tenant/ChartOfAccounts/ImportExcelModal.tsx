"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import Api from "@/lib/api"
import { toast } from "sonner"

interface ImportExcelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ImportExcelModal({ isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  // const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!file) {
      toast.error('Por favor seleccione un archivo');
      return;
    }
  
    setProcessing(true);
    const formData = new FormData();
    formData.append('file', file!);
  
    try {
      // IMPORTANTE: NO poner headers Content-Type
      await Api.post('v1/chart-of-accounts/import', formData);
      
      toast.success('Plan de cuentas importado correctamente');
      
      setFile(null);
  
      // Cerrar el modal automáticamente
      handleClose();
  
      // Llamar al callback de éxito si existe
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.response?.data?.errors?.file) {
        toast.error(err.response.data.errors.file[0]);
      } else {
        toast.error('Error al importar el archivo:', err);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Plan de Cuentas</DialogTitle>
          <DialogDescription>
            Selecciona un archivo Excel (.xlsx, .xls, .csv) para importar las cuentas contables.
          </DialogDescription>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md gap-2">
              <p className="font-bold text-blue-900">Formato esperado:</p>
              <ul className="text-blue-800 space-y-1 text-xs">
                <li>* <strong>CODIGO CUENTA:</strong> Código único de la cuenta</li>
                <li>* <strong>NOMBRE CUENTA:</strong> Nombre descriptivo</li>
                <li>* <strong>TIPO ESTADO FINANCIERO:</strong> asset, liability, equity, income, expense</li>
                <li>* <strong>TIENE SUBCUENTAS:</strong> si/no</li>
                <li>* <strong>ESTADO:</strong> activa/inactiva</li>
              </ul>
            </div>
          </div>

        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={processing}
          />

          <DialogFooter className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!file || processing}>
              {processing ? 'Subiendo...' : 'Importar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

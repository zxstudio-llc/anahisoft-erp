"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Api from "@/lib/api"
import { toast } from "sonner"

export interface ChartOfAccount {
  id: number
  code: string
  name: string
  financial_statement_type: string
  nature: "debit" | "credit" | "neutral"
  parent_id?: number | null
  active: boolean
}

interface ChartOfAccountModalProps {
  isOpen: boolean
  onClose: () => void
  account?: ChartOfAccount
  onSuccess?: (account: ChartOfAccount, isEdit: boolean) => void
  parents?: ChartOfAccount[]
}

export default function ChartOfAccountModal({
  isOpen,
  onClose,
  account,
  onSuccess,
  parents = []
}: ChartOfAccountModalProps) {
  const isEditMode = !!account
  const [processing, setProcessing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Estados para el buscador de cuentas padre
  const [parentAccounts, setParentAccounts] = useState<ChartOfAccount[]>([])
  const [parentSearch, setParentSearch] = useState("")
  const [loadingParents, setLoadingParents] = useState(false)
  const [parentOpen, setParentOpen] = useState(false)

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    financial_statement_type: "",
    nature: "debit" as "debit" | "credit" | "neutral",
    parent_id: null as number | null,
    active: true,
  })

  // Inicializar formulario
  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code,
        name: account.name,
        financial_statement_type: account.financial_statement_type,
        nature: account.nature,
        parent_id: account.parent_id || null,
        active: account.active,
      })
    } else {
      setFormData({
        code: "",
        name: "",
        financial_statement_type: "",
        nature: "debit",
        parent_id: null,
        active: true,
      })
    }

    setValidationErrors({})
    setParentSearch("")
    setParentAccounts([])
  }, [account, isOpen])

  // Función para buscar cuentas padre
  const searchParentAccounts = async (search: string = "") => {
    if (loadingParents) return
    
    setLoadingParents(true)
    try {
      const params: any = {
        per_page: 50, // Límite razonable
        sort_field: 'code',
        sort_order: 'asc',
        active: true // Solo cuentas activas
      }

      if (search.trim()) {
        params.search = search.trim()
      }

      const response = await Api.get('/v1/chart-of-accounts', { params })
      
      const accounts = response.data?.accounts?.data || []
      
      // Si estamos editando, excluir la cuenta actual para evitar autoreferencia
      const filteredAccounts = isEditMode && account 
        ? accounts.filter((acc: ChartOfAccount) => acc.id !== account.id)
        : accounts

      setParentAccounts(filteredAccounts)
    } catch (error) {
      console.error('Error al buscar cuentas padre:', error)
      toast.error("Error al cargar cuentas padre")
      setParentAccounts([])
    } finally {
      setLoadingParents(false)
    }
  }

  // Buscar cuentas cuando se abre el selector o cambia la búsqueda
  useEffect(() => {
    if (parentOpen || parentSearch) {
      const timeoutId = setTimeout(() => {
        searchParentAccounts(parentSearch)
      }, 300) // Debounce de 300ms

      return () => clearTimeout(timeoutId)
    }
  }, [parentOpen, parentSearch])

  // Encontrar la cuenta padre seleccionada para mostrar en el trigger
  const selectedParent = useMemo(() => {
    return parentAccounts.find(acc => acc.id === formData.parent_id)
  }, [parentAccounts, formData.parent_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setValidationErrors({})

    try {
      let response
      if (isEditMode && account) {
        response = await Api.put<ChartOfAccount>(`/v1/chart-of-accounts/${account.id}`, formData)
        toast.success("Cuenta actualizada exitosamente")
        onSuccess?.(response, true)
      } else {
        response = await Api.post<ChartOfAccount>(`/v1/chart-of-accounts`, formData)
        toast.success("Cuenta creada exitosamente")
        onSuccess?.(response, false)
      }
      handleClose()
    } catch (error: any) {
      console.error(error)
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors)
        const firstError = Object.values(error.response.data.errors)[0]
        toast.error(String(firstError))
      } else {
        toast.error("Error al procesar la solicitud")
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setValidationErrors({})
    setParentAccounts([])
    setParentSearch("")
    setParentOpen(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Cuenta Contable" : "Nueva Cuenta Contable"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualice los datos de la cuenta contable."
              : "Complete la información para crear una nueva cuenta contable."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Código *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ej: 101.01"
              disabled={isEditMode}
              className={validationErrors.code ? "border-red-500" : ""}
            />
            {validationErrors.code && <p className="text-sm text-red-500">{validationErrors.code}</p>}
          </div>

          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Caja y Bancos"
              className={validationErrors.name ? "border-red-500" : ""}
            />
            {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
          </div>

          <div>
            <Label htmlFor="financial_statement_type">Tipo de Estado Financiero *</Label>
            <Input
              id="financial_statement_type"
              value={formData.financial_statement_type}
              onChange={(e) => setFormData({ ...formData, financial_statement_type: e.target.value })}
              placeholder="Ej: ESTADO DE SITUACION"
              className={validationErrors.financial_statement_type ? "border-red-500" : ""}
            />
            {validationErrors.financial_statement_type && (
              <p className="text-sm text-red-500">{validationErrors.financial_statement_type}</p>
            )}
          </div>

          <div>
            <Label>Naturaleza *</Label>
            <Select
              value={formData.nature}
              onValueChange={(value) => setFormData({ ...formData, nature: value as "debit" | "credit" | "neutral" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona naturaleza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debit">Débito</SelectItem>
                <SelectItem value="credit">Crédito</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.nature && <p className="text-sm text-red-500">{validationErrors.nature}</p>}
          </div>

          {/* Selector de cuenta padre con búsqueda */}
          <div>
            <Label>Cuenta Padre</Label>
            <Popover open={parentOpen} onOpenChange={setParentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={parentOpen}
                  className="w-full justify-between"
                >
                  {selectedParent 
                    ? `${selectedParent.code} - ${selectedParent.name}` 
                    : "Selecciona cuenta padre..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-lg p-0" align="center">
                <Command shouldFilter={false}>
                  <div className="flex items-center border-b px-3">
                    <CommandInput
                      placeholder="Buscar cuenta..."
                      value={parentSearch}
                      onValueChange={setParentSearch}
                      className="flex-1"
                    />
                  </div>
                  <CommandList>
                    {loadingParents ? (
                      <CommandEmpty>Buscando...</CommandEmpty>
                    ) : parentAccounts.length === 0 ? (
                      <CommandEmpty>
                        {parentSearch ? "No se encontraron cuentas" : "Escriba para buscar cuentas"}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setFormData({ ...formData, parent_id: null })
                            setParentOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              !formData.parent_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span>Sin cuenta padre</span>
                        </CommandItem>
                        {parentAccounts.map((parentAccount) => (
                          <CommandItem
                            key={parentAccount.id}
                            value={`${parentAccount.code}-${parentAccount.name}`}
                            onSelect={() => {
                              setFormData({ 
                                ...formData, 
                                parent_id: parentAccount.id 
                              })
                              setParentOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "h-4 w-4",
                                formData.parent_id === parentAccount.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{parentAccount.code}</span>
                              <span className="text-sm text-muted-foreground ">
                                {parentAccount.name}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {validationErrors.parent_id && <p className="text-sm text-red-500">{validationErrors.parent_id}</p>}
          </div>

          
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
              />
              <Label htmlFor="active">Cuenta activa</Label>
            </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? "Procesando..." : isEditMode ? "Actualizar" : "Crear"} 
              {!processing && " Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
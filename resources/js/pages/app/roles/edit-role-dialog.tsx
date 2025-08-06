"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { roleSchema } from "@/data/roleSchema"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { router } from "@inertiajs/react"
import { useEffect, useState } from "react"
import axios from "axios"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  guard_name: z.string().optional().default('web'),
  permissions: z.array(z.number()),
})

interface EditRoleDialogProps {
  roleId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface PermissionGroup {
  group: string
  permissions: {
    id: number
    name: string
    description: string
  }[]
}

export function EditRoleDialog({ roleId, open, onOpenChange, onSuccess }: EditRoleDialogProps) {
  const [loading, setLoading] = useState(true)
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([])
  const [initialRole, setInitialRole] = useState<any>(null)
  const [availableGuards, setAvailableGuards] = useState<string[]>(['web']) // Valor por defecto

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      guard_name: 'web',
      permissions: [],
    },
  })

  // Cargar datos del rol y permisos
  useEffect(() => {
    if (open && roleId) {
      setLoading(true)
      axios.get(`/admin/roles/${roleId}/edit`)
        .then(response => {
          const { role, permissions, guards } = response.data // Asegúrate de que la respuesta incluya guards
          setInitialRole(role)
          setPermissionGroups(permissions)
          setAvailableGuards(guards || ['web']) // Usa guards de la respuesta o el valor por defecto
          
          form.reset({
            name: role.name,
            guard_name: role.guard_name,
            permissions: role.permissions,
          })
        })
        .catch(error => {
          toast.error("Error al cargar el rol")
          console.error(error)
        })
        .finally(() => setLoading(false))
    }
  }, [open, roleId])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    router.put(`/admin/roles/${roleId}`, {
      name: values.name,
      guard_name: values.guard_name,
      permissions: values.permissions,
    }, {
      onSuccess: () => {
        toast.success("Rol actualizado correctamente")
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (errors) => {
        toast.error("Error al actualizar el rol")
        console.error(errors)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {loading ? 'Cargando...' : `Editar Rol: ${initialRole?.name}`}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <p>Cargando información del rol...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Rol</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guard_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guard</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        disabled
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              <div>
                <FormLabel>Permisos</FormLabel>
                <div className="space-y-4 mt-4">
                  {permissionGroups.map(group => (
                    <div key={group.group} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3 capitalize">{group.group}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.permissions.map(permission => (
                          <FormField
                            key={`permission-${permission.id}`}
                            control={form.control}
                            name="permissions"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, permission.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== permission.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {permission.description}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
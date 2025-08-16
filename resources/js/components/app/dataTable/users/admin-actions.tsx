"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { router } from "@inertiajs/react"
import { toast } from "sonner"
import { AdminUser } from "@/data/adminSchema"

export function AdminActions({ 
  row, 
  roles, 
  currentUserId 
}: { 
  row: { original: AdminUser }, 
  roles: any[],
  currentUserId?: number
}) {
  const admin = row.original;
  const isCurrentUser = currentUserId ? admin.id === currentUserId : false;

  const handleDelete = () => {
    if (isCurrentUser) {
      return toast.error('No puedes eliminarte a ti mismo');
    }
    if (confirm('¿Estás seguro de eliminar este administrador?')) {
      router.delete(route('admin.users.destroy', admin.id), {
        onSuccess: () => toast.success('Administrador eliminado'),
        onError: () => toast.error('Error al eliminar')
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a 
            href={route('admin.users.edit', admin.id)} 
            className="flex items-center"
            onClick={isCurrentUser ? (e) => e.preventDefault() : undefined}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isCurrentUser ? 'Ver perfil' : 'Editar'}
          </a>
        </DropdownMenuItem>
        
        {!isCurrentUser && !admin.roles.some(r => r.name === 'Super admin') && (
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type BreadcrumbItem } from '@/types'
import { AdminUser } from '@/data/adminSchema'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Usuarios', href: '/admin/users' },
  { title: 'Editar usuario', href: '/admin/users/edit' }
]

interface UserEditProps {
  user: AdminUser;
  roles: any[];
  userTypes: string[]; // Agregar userTypes a las props
}

export default function UserEdit({ user, roles, userTypes }: UserEditProps) {
  // Verificaciones defensivas para roles
  const userRoles = user.roles || [];
  const firstRole = userRoles.length > 0 ? userRoles[0] : null;
  const currentRoleId = firstRole?.id?.toString() || '';

  const { data, setData, put, processing, errors } = useForm({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    gender: user.gender || '',
    date_of_birth: user.date_of_birth || '',
    dni: user.dni || '',
    company_name: user.company_name || '',
    company_address: user.company_address || '',
    user_type: user.user_type || (userTypes[0] || 'customer'), // Usar el primer tipo disponible como default
    role_id: currentRoleId,
    password: '',
    password_confirmation: '',
    status: user.status ?? true,
    is_verified: user.is_verified ?? false,
    is_suspended: user.is_suspended ?? false,
    subscribed_to_news_letter: user.subscribed_to_news_letter ?? false
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('admin.users.update', user.id))
  }

  // Función helper para obtener el nombre del rol actual
  const getCurrentRoleName = () => {
    if (!data.role_id) return 'Sin rol';
    const currentRole = roles?.find(r => r.id.toString() === data.role_id);
    return currentRole?.name || 'Sin rol';
  }

  // Verificar si el usuario actual es super admin
  const isCurrentUserSuperAdmin = userRoles.some(r => r.name === 'Super admin');

  // Mapear user_type para mostrar nombres amigables
  const getUserTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'admin': 'Administrador',
      'customer': 'Cliente',
      'provider': 'Proveedor',
      'user': 'Usuario',
      // Agregar más mappings según sea necesario
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar usuario ${user.first_name || 'Usuario'}`} />
      
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Editar usuario</h2>
            <p className="text-muted-foreground">
              Modifique los datos del usuario
            </p>
          </div>
        </div>
        <div className="rounded-md border p-6">
          <form onSubmit={submit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    className="mt-1"
                    required
                  />
                  {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    className="mt-1"
                    required
                  />
                  {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mt-1"
                    required
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className="mt-1"
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={data.dni}
                    onChange={(e) => setData('dni', e.target.value)}
                    className="mt-1"
                  />
                  {errors.dni && <p className="text-sm text-red-500 mt-1">{errors.dni}</p>}
                </div>
                
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select
                    value={data.gender || undefined}
                    onValueChange={(value) => setData('gender', value || '')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                </div>
                
                <div>
                  <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={data.date_of_birth}
                    onChange={(e) => setData('date_of_birth', e.target.value)}
                    className="mt-1"
                  />
                  {errors.date_of_birth && <p className="text-sm text-red-500 mt-1">{errors.date_of_birth}</p>}
                </div>
                
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    className="mt-1"
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Información de empresa (solo para providers) */}
            {(data.user_type === 'provider' || user.user_type === 'provider') && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información de empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company_name">Nombre de empresa</Label>
                    <Input
                      id="company_name"
                      value={data.company_name}
                      onChange={(e) => setData('company_name', e.target.value)}
                      className="mt-1"
                    />
                    {errors.company_name && <p className="text-sm text-red-500 mt-1">{errors.company_name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="company_address">Dirección de empresa</Label>
                    <Input
                      id="company_address"
                      value={data.company_address}
                      onChange={(e) => setData('company_address', e.target.value)}
                      className="mt-1"
                    />
                    {errors.company_address && <p className="text-sm text-red-500 mt-1">{errors.company_address}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Configuración del sistema */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración del sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="user_type">Tipo de usuario</Label>
                  <Select
                    value={data.user_type}
                    onValueChange={(value) => setData('user_type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar tipo">
                        {getUserTypeDisplay(data.user_type)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getUserTypeDisplay(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.user_type && <p className="text-sm text-red-500 mt-1">{errors.user_type}</p>}
                </div>
                
                <div>
                  <Label htmlFor="role_id">Rol</Label>
                  <Select
                    value={data.role_id}
                    onValueChange={(value) => setData('role_id', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar rol">
                        {getCurrentRoleName()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles && roles.map((role) => (
                        <SelectItem 
                          key={role.id} 
                          value={role.id.toString()}
                          disabled={role.name === 'Super admin' && !isCurrentUserSuperAdmin}
                        >
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && <p className="text-sm text-red-500 mt-1">{errors.role_id}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="status"
                    type="checkbox"
                    checked={data.status}
                    onChange={(e) => setData('status', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="status">Usuario activo</Label>
                  {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="is_verified"
                    type="checkbox"
                    checked={data.is_verified}
                    onChange={(e) => setData('is_verified', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is_verified">Email verificado</Label>
                  {errors.is_verified && <p className="text-sm text-red-500 mt-1">{errors.is_verified}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="is_suspended"
                    type="checkbox"
                    checked={data.is_suspended}
                    onChange={(e) => setData('is_suspended', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is_suspended">Usuario suspendido</Label>
                  {errors.is_suspended && <p className="text-sm text-red-500 mt-1">{errors.is_suspended}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="subscribed_to_news_letter"
                    type="checkbox"
                    checked={data.subscribed_to_news_letter}
                    onChange={(e) => setData('subscribed_to_news_letter', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="subscribed_to_news_letter">Suscrito al newsletter</Label>
                  {errors.subscribed_to_news_letter && <p className="text-sm text-red-500 mt-1">{errors.subscribed_to_news_letter}</p>}
                </div>
              </div>
            </div>

            {/* Cambio de contraseña */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cambio de contraseña</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="password">Nueva contraseña (opcional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="mt-1"
                    placeholder="Dejar en blanco para no cambiar"
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <Label htmlFor="password_confirmation">Confirmar nueva contraseña</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className="mt-1"
                    placeholder="Solo si cambió la contraseña"
                  />
                  {errors.password_confirmation && <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>}
                </div>
              </div>
            </div>

            {/* Debug info - remover en producción */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-gray-100 rounded-md text-xs">
                <strong>Debug Info:</strong>
                <pre>{JSON.stringify({
                  userRoles: userRoles,
                  firstRole: firstRole,
                  currentRoleId: currentRoleId,
                  rolesCount: roles?.length || 0,
                  userTypes: userTypes,
                  formData: data
                }, null, 2)}</pre>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Actualizando...' : 'Actualizar usuario'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
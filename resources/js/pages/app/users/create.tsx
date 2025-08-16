import { Head, useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard' },
  { title: 'Usuarios', href: '/admin/users' },
  { title: 'Crear usuario', href: '/admin/users/create' }
]

interface UserCreateProps {
  roles: Array<{ id: number, name: string }>;
  existingProviders: Array<{ id: number, company_name: string, dni: string }>;
}

export default function UserCreate({ roles, existingProviders }: UserCreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    image: null as File | null,
    status: true,
    address: '',
    gender: '',
    date_of_birth: '',
    subscribed_to_news_letter: false,
    dni: '',
    company_name: '',
    company_address: '',
    role_id: '',
    provider_id: '',
    is_new_provider: false
  });

  const [showProviderFields, setShowProviderFields] = useState(false);
  const [isNewProvider, setIsNewProvider] = useState(false);

  useEffect(() => {
    // Mostrar campos de proveedor si el rol seleccionado es Provider
    const selectedRole = roles.find(r => r.id.toString() === data.role_id);
    setShowProviderFields(selectedRole?.name === 'Provider');
  }, [data.role_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData('image', e.target.files?.[0] || null);
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.users.store'), {
      forceFormData: true,
      onError: (errors) => {
        console.error('Errores en el formulario:', errors);
      }
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear nuevo usuario" />
      
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Crear nuevo usuario</h2>
            <p className="text-muted-foreground">
              Complete los datos del nuevo usuario
            </p>
          </div>
        </div>

        <div className="rounded-md border p-6">
          <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rol del usuario */}
              <div className="md:col-span-2">
                <Label htmlFor="role_id">Rol*</Label>
                <Select
                  value={data.role_id}
                  onValueChange={(value) => setData('role_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_id && <p className="text-sm text-red-500 mt-1">{errors.role_id}</p>}
              </div>

              {/* Campos básicos */}
              <div>
                <Label htmlFor="first_name">Nombre*</Label>
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
                <Label htmlFor="last_name">Apellido*</Label>
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
                <Label htmlFor="email">Email*</Label>
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

              {/* Campos de contraseña */}
              <div>
                <Label htmlFor="password">Contraseña*</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="mt-1"
                  required
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="password_confirmation">Confirmar contraseña*</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              {/* Sección de proveedor (solo visible si el rol es Provider) */}
              {showProviderFields && (
                <>
                  <div className="md:col-span-2 border-t pt-4">
                    <h3 className="text-lg font-medium">Información del Proveedor</h3>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_new_provider"
                          checked={isNewProvider}
                          onCheckedChange={(checked) => {
                            setIsNewProvider(checked);
                            setData('is_new_provider', checked);
                            setData('provider_id', '');
                          }}
                        />
                        <Label htmlFor="is_new_provider">Crear nuevo proveedor</Label>
                      </div>
                    </div>
                  </div>

                  {!isNewProvider ? (
                    <div className="md:col-span-2">
                      <Label htmlFor="provider_id">Proveedor existente</Label>
                      <Select
                        value={data.provider_id}
                        onValueChange={(value) => setData('provider_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un proveedor existente" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingProviders.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id.toString()}>
                              {provider.company_name} (DNI: {provider.dni})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.provider_id && <p className="text-sm text-red-500 mt-1">{errors.provider_id}</p>}
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="dni">DNI*</Label>
                        <Input
                          id="dni"
                          value={data.dni}
                          onChange={(e) => setData('dni', e.target.value)}
                          className="mt-1"
                          required={isNewProvider}
                        />
                        {errors.dni && <p className="text-sm text-red-500 mt-1">{errors.dni}</p>}
                      </div>

                      <div>
                        <Label htmlFor="company_name">Nombre de la empresa*</Label>
                        <Input
                          id="company_name"
                          value={data.company_name}
                          onChange={(e) => setData('company_name', e.target.value)}
                          className="mt-1"
                          required={isNewProvider}
                        />
                        {errors.company_name && <p className="text-sm text-red-500 mt-1">{errors.company_name}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="company_address">Dirección de la empresa*</Label>
                        <Input
                          id="company_address"
                          value={data.company_address}
                          onChange={(e) => setData('company_address', e.target.value)}
                          className="mt-1"
                          required={isNewProvider}
                        />
                        {errors.company_address && <p className="text-sm text-red-500 mt-1">{errors.company_address}</p>}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Campo de imagen */}
              <div>
                <Label htmlFor="image">Imagen de perfil</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1"
                  accept="image/*"
                />
                {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
              </div>

              {/* Estado activo/inactivo */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={data.status}
                  onCheckedChange={(checked) => setData('status', checked)}
                />
                <Label htmlFor="status">Usuario activo</Label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              
              <Button type="submit" disabled={processing}>
                {processing ? 'Creando...' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Key, Mail, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Tenant {
  id: string;
  company_name: string;
  domain: string;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
}

interface ResetAdminCredentialsProps {
  tenant: Tenant;
  adminUser: AdminUser;
}

export default function ResetAdminCredentials({ tenant, adminUser }: ResetAdminCredentialsProps) {
  const { data, setData, post, processing, errors } = useForm({
    email: adminUser.email,
    password: '',
    password_confirmation: '',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('admin.tenants.update-admin', tenant.id));
  };

  const breadcrumbs = [
    { title: 'Inicio', href: route('home') },
    { title: 'Inquilinos', href: route('admin.tenants.index') },
    { title: tenant.company_name, href: route('admin.tenants.subscription', tenant.id) },
    { title: 'Resetear Credenciales', href: route('admin.tenants.reset-admin', tenant.id) },
  ];

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={route('admin.tenants.index')}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Resetear Credenciales de Administrador</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inquilino: {tenant.company_name}</CardTitle>
            <CardDescription>
              Dominio: {tenant.domain}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <p className="font-medium">Información importante</p>
              </div>
              <p className="mt-2 text-sm">
                Estás a punto de cambiar las credenciales del administrador de este inquilino. 
                El usuario administrador actual es <strong>{adminUser.name}</strong> con email <strong>{adminUser.email}</strong>.
                Esta acción no puede deshacerse.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email del Administrador</span>
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <span>Nueva Contraseña</span>
                    </div>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    required
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 8 caracteres.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    required
                  />
                </div>

                <CardFooter className="flex justify-end gap-2 px-0">
                  <Button variant="outline" asChild>
                    <Link href={route('admin.tenants.index')}>Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={processing}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 
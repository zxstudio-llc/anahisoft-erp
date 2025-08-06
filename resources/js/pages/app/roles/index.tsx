import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTableRole } from '@/components/app/dataTable/roles/data-table-role';
import { RoleColumns } from '@/components/app/dataTable/roles/roles-columns';
import { type BreadcrumbItem } from '@/types';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard' },
  { title: 'Seguridad', href: '#' },
  { title: 'Roles', href: '/admin/roles' }
];

export default function RolesIndex() {
  const { roles, permissionsByGroup, filters, guards } = usePage().props;

  const guardOptions = React.useMemo(() => {
    if (Array.isArray(guards)) {
      return guards
        .filter(guard => typeof guard === 'string')
        .map(guard => ({
          label: guard,
          value: guard
        }));
    }
    else if (typeof guards === 'object' && guards !== null) {
      return Object.keys(guards)
        .filter(key => typeof key === 'string')
        .map(key => ({
          label: key,
          value: key
        }));
    }
    // Fallback to empty array
    return [];
  }, [guards]);

  return (

    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Roles" />
      <div  className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestión de Roles</h2>
            <p className="text-muted-foreground">
              Administra los roles y sus permisos asociados
            </p>
          </div>
          <Link href={route('admin.roles.create')}>
            <Button>
              Crear Nuevo Rol
            </Button>
          </Link>
        </div>

        <div>
          
        <DataTableRole
          columns={RoleColumns}
          data={roles}
          guardOptions={guardOptions}
          meta={{ permissions: permissionsByGroup }}
        />
        </div>
      </div>
    </AppLayout>
  );
}
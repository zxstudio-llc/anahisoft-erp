import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { DataTableAdmin } from '@/components/app/dataTable/users/data-table-admin'
import { adminColumns } from '@/components/app/dataTable/users/admin-columns'
import { type BreadcrumbItem } from '@/types'
import { AdminUser } from '@/data/adminSchema'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";


interface AdminsIndexProps {
  users: AdminUser[];
  roles: any[];
  currentUserId: number;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Usuarios', href: '/admin/users' }
]

export default function UsersIndex({ users, roles, currentUserId }: AdminsIndexProps) {
  const columns = adminColumns(roles, currentUserId);
  
  const [activeTab, setActiveTab] = useState('all');
  const filteredUsers = users.filter(user => {
    if (activeTab === "all") return true;
    if (activeTab === "super_admin") return user.roles.some(r => r.name === 'Super admin');
    if (activeTab === "provider") return user.user_type === 'provider';
    if (activeTab === "customer") return user.user_type === 'customer';
    return true;
  });
  const counts = {
    super_admin: users.filter(u => u.roles.some(r => r.name === 'Super admin')).length,
    provider: users.filter(u => u.user_type === 'provider').length,
    customer: users.filter(u => u.user_type === 'customer').length,
    all: users.length,
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Usuarios" />
      
      <div  className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Todos los Usuarios</h2>
            <p className="text-muted-foreground">
              Lista completa de usuarios del sistema
            </p>
          </div>
          
          <a 
            href={route('admin.users.create')}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Nuevo Usuario
          </a>
        </div>
        <div className="flex items-center justify-center space-y-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="super_admin">
              Super Admins <Badge className="ml-2">{counts.super_admin}</Badge>
            </TabsTrigger>
            <TabsTrigger value="provider">
              Providers <Badge className="ml-2">{counts.provider}</Badge>
            </TabsTrigger>
            <TabsTrigger value="customer">
              Customers <Badge className="ml-2">{counts.customer}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all">
              All Users <Badge className="ml-2">{counts.all}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        </div>

        <DataTableAdmin
          columns={columns} 
          data={filteredUsers}
          filterKey="email"
          meta={{ currentUserId }}
        />
      </div>
    </AppLayout>
  )
}
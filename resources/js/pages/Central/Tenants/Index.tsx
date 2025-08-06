import { TenantsIndexProps } from '@/common/interfaces/tenant.interface';
import { TenantStatsCards } from '@/components/tenants/stats-cards';
import { TenantsTable } from '@/components/tenants/tenants-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Building2, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inquilinos',
        href: '/tenants',
    },
];

const roles = [
    {
        name: 'Administrador',
        description: 'Control total del sistema con acceso a todas las funciones',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path
                    fillRule="evenodd"
                    d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    {
        name: 'Vendedor',
        description: 'Gestión de ventas e inventario básico',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path
                    fillRule="evenodd"
                    d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    {
        name: 'Cajero',
        description: 'Manejo de caja y transacciones',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                <path
                    fillRule="evenodd"
                    d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
                    clipRule="evenodd"
                />
                <path d="M2.25 18a.75.75 0 000 1.5h19.5a.75.75 0 000-1.5H2.25z" />
            </svg>
        ),
    },
    {
        name: 'Contador',
        description: 'Acceso a reportes contables y financieros',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path
                    fillRule="evenodd"
                    d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM9.75 14.25a.75.75 0 000 1.5H15a.75.75 0 000-1.5H9.75z"
                    clipRule="evenodd"
                />
                <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
            </svg>
        ),
    },
];

export default function Index({ tenants, stats, app_domain }: TenantsIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inquilinos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Inquilinos</h1>
                    </div>
                </div>

                <TenantStatsCards stats={stats} />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="lg:col-span-3">
                        <TenantsTable tenants={tenants} app_domain={app_domain} />
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <CardTitle>Roles Disponibles</CardTitle>
                                </div>
                                <CardDescription>Cada inquilino puede tener usuarios con diferentes roles</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {roles.map((role, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="rounded-md bg-primary/10 p-2 text-primary">{role.icon}</div>
                                        <div>
                                            <h4 className="font-medium">{role.name}</h4>
                                            <p className="text-sm text-muted-foreground">{role.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Información</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>Cada inquilino representa una empresa independiente con su propio dominio, usuarios y datos.</p>
                                <p>
                                    Al crear un inquilino, se genera automáticamente un usuario administrador que puede gestionar la configuración y
                                    crear usuarios adicionales con diferentes roles.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

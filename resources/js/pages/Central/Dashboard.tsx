import { DashboardProps } from '@/common/interfaces/dashboard.interface';
import { DomainsChart } from '@/components/dashboard/domains-chart';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { TenantsChart } from '@/components/dashboard/tenants-chart';
import { TrendCard } from '@/components/dashboard/trend-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

export default function Dashboard({ tenants, domains, users, chartData }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <StatsGrid data={chartData.tenantStats} />
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {chartData.trendStats.map((stat, index) => (
                        <TrendCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            trendValue={stat.trend.value}
                            trendPositive={stat.trend.positive}
                            description={stat.description}
                        />
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <TenantsChart data={chartData.tenantsPerMonth} />
                    <DomainsChart data={chartData.domainsPerTenant} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h3 className="mb-4 text-lg font-medium">Inquilinos Recientes</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Creado</th>
                                        <th className="px-4 py-2 text-left">Dominios</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.slice(0, 5).map((tenant) => (
                                        <tr key={tenant.id} className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                            <td className="px-4 py-2">{tenant.id}</td>
                                            <td className="px-4 py-2">{new Date(tenant.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">{domains.filter((domain) => domain.tenant_id === tenant.id).length}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h3 className="mb-4 text-lg font-medium">Usuarios Recientes</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                        <th className="px-4 py-2 text-left">Nombre</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                        <th className="px-4 py-2 text-left">Registrado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.slice(0, 5).map((user) => (
                                        <tr key={user.id} className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                            <td className="px-4 py-2">{user.name}</td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

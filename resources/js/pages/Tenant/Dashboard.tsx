import { DashboardData } from '@/common/interfaces/tenant/dashboard.interface';
import { StatsGrid } from '@/components/tenant/dashboard/stats-grid';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import RecentActivity from '@/components/tenant/dashboard/recent-activity';
import { SalesChart } from '@/components/tenant/dashboard/sales-chart';

interface Props {
    dashboardData: DashboardData;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


export default function Dashboard({ dashboardData }: Props) {

const salesChartData = dashboardData.charts.salesByMonth.map(item => ({
    date: item.name,     // aquí 'name' del backend se convierte en 'date'
    ventas: item.value,  // 'value' -> 'ventas'
  }));
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <StatsGrid stats={dashboardData.stats} />
                        <div className="px-4 lg:px-6">
                        <SalesChart data={salesChartData} />
                        </div>
                        <RecentActivity
                            invoices={dashboardData.recentActivity.invoices}
                            customers={dashboardData.recentActivity.customers}
                            products={dashboardData.recentActivity.products}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
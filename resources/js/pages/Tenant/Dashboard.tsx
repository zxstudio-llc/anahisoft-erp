import { DashboardData } from '@/common/interfaces/tenant/dashboard.interface';
import { StatsGrid } from '@/components/tenant/dashboard/stats-grid';
import { SalesChart } from '@/components/tenant/dashboard/sales-chart';
import { InvoicesChart } from '@/components/tenant/dashboard/invoices-chart';
import { RecentActivity } from '@/components/tenant/dashboard/recent-activity';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <StatsGrid stats={dashboardData.stats} />
                
                <div className="grid gap-4 md:grid-cols-2">
                    <SalesChart data={dashboardData.charts.salesByMonth} />
                    <InvoicesChart data={dashboardData.charts.invoicesByStatus} />
                </div>

                <RecentActivity data={dashboardData.recentActivity} />
            </div>
        </AppLayout>
    );
}

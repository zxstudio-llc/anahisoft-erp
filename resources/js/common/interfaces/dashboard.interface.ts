export interface Tenant {
    id: string;
    created_at: string;
}

export interface Domain {
    id: string;
    tenant_id: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export interface TrendStat {
    title: string;
    value: string | number;
    trend: {
        value: string;
        positive: boolean;
    };
    description: string;
}

export interface DashboardProps {
    tenants: Tenant[];
    domains: Domain[];
    users: User[];
    chartData: {
        tenantsPerMonth: Array<{ name: string; value: number }>;
        domainsPerTenant: Array<{ name: string; value: number }>;
        tenantStats: Array<{ name: string; value: number }>;
        trendStats: TrendStat[];
    };
}

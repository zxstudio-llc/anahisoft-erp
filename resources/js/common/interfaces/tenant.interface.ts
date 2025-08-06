export interface TenantDomain {
    id: string;
    domain: string;
    is_primary: boolean;
    created_at: string;
}

export interface Tenant {
    id: string;
    primary_domain?: string;
    domains_count: number;
    created_at: string;
    updated_at?: string;
    last_activity?: string;
    company_name?: string;
    admin_email?: string;
    users_count?: number;
    is_active: boolean;
    subscription_plan?: {
        id: string;
        name: string;
    };
    subscription_status: 'active' | 'trial' | 'expired' | 'inactive';
}

export interface TenantStats {
    total: number;
    active_last_month: number;
    with_multiple_domains: number;
    created_this_month: number;
}

export interface TenantsIndexProps {
    tenants: Tenant[];
    stats: TenantStats;
    app_domain: string;
}

export interface CreateTenantFormData {
    id: string;
    domain: string;
    company_name: string;
    ruc: string;
    admin_name: string;
    admin_email: string;
    admin_password: string;
    status?: string;
    condition?: string;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
    registration_date?: string;
    trade_name?: string;
}

export interface EditTenantFormData extends Record<string, string> {
    id: string;
    domain: string;
    company_name: string;
}

export interface CreateTenantResponse {
    success?: boolean;
    message?: string;
    errors?: Record<string, string>;
}

export interface TenantRole {
    id: number;
    name: string;
    description: string;
    permissions: string[];
}

export interface TenantUser {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    last_login?: string;
} 
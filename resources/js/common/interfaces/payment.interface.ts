import { SubscriptionPlan } from './subscription-plan.interface';

export interface Payment {
    id: number;
    tenant: {
        id: string;
        data: {
            company_name: string;
        };
    };
    subscription_plan: SubscriptionPlan;
    amount: string | number;
    payment_method: string;
    payment_date: string;
    billing_period: 'monthly' | 'yearly';
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    notes?: string;
    subscription_starts_at: string;
    subscription_ends_at: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentMethod {
    value: string;
    label: string;
}

export interface PaymentStatus {
    value: string;
    label: string;
}

export interface PaymentFormData {
    tenant_id: string;
    subscription_plan_id: string;
    payment_method: string;
    amount: string;
    payment_date: string;
    billing_period: string;
    status: string;
    notes: string;
}

export interface PaymentFilters {
    search?: string;
    subscription_plan_id?: string;
    status?: string;
}

export interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedPayments {
    data: Payment[];
    from: number;
    to: number;
    total: number;
    links: PaginationLinks[];
}

export interface PaymentsIndexProps {
    payments: PaginatedPayments;
    tenants: {
        id: string;
        company_name: string;
    }[];
    subscription_plans: SubscriptionPlan[];
    filters: PaymentFilters;
    payment_statuses: PaymentStatus[];
    payment_methods: PaymentMethod[];
}

export interface PaymentShowProps {
    payment: Payment;
}

export interface PaymentFormErrors {
    tenant_id?: string;
    subscription_plan_id?: string;
    payment_method?: string;
    amount?: string;
    payment_date?: string;
    billing_period?: string;
    status?: string;
    notes?: string;
}

export interface PaymentResponse {
    payment_id: string;
    status: string;
}

export interface PreferenceData {
    preference_id: string;
    init_point: string;
}

export interface PaymentRequest {
    token: string;
    email: string;
    amount: number;
    currency_code: string;
    plan_id: number;
    billing_period: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaymentApiResponse {
    success: boolean;
    message?: string;
    data?: {
        payment_id: string;
        status: string;
    };
}

export interface PreferenceApiResponse {
    success: boolean;
    data: {
        preference_id: string;
        init_point: string;
    };
    message?: string;
}

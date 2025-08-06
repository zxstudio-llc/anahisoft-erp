export interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    price: number;
    billing_period?: string;
    invoice_limit?: number;
    features: string[];
    is_active?: boolean;
    is_featured?: boolean;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionStatus {
    isActive: boolean;
    onTrial: boolean;
    trialEndsAt: string | null;
    subscriptionEndsAt: string | null;
}

export interface InvoiceUsage {
    total_invoices: number;
    monthly_invoices: number;
    limit: number;
    last_reset: string;
}

export interface Props {
    currentPlan: SubscriptionPlan | null;
    availablePlans: SubscriptionPlan[];
    subscriptionStatus: SubscriptionStatus;
    invoiceUsage: InvoiceUsage;
}

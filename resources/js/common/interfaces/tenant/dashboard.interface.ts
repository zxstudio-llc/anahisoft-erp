export interface DashboardData {
    stats: {
        sales: {
            current: number;
            previous: number;
            change: number;
        };
        customers: {
            total: number;
            new: number;
            change: number;
        };
        products: {
            total: number;
            new: number;
            change: number;
        };
        invoices: {
            total: number;
            pending: number;
            paid: number;
            change: number;
        };
    };
    charts: {
        salesByMonth: Array<{
            name: string;
            value: number;
        }>;
        invoicesByStatus: Array<{
            name: string;
            value: number;
        }>;
    };
    recentActivity: {
        invoices: Array<{
            id: number;
            number: string;
            customer_name: string;
            date: string;
            total: number;
            status: string;
            issue_date: string;
        }>;
        customers: Array<{
            id: number;
            business_name: string;
            identification: string;
            trade_name: string | null;
            email: string | null;
            phone: string | null;
            active: boolean;
            created_at: string;
        }>;
        products: Array<{
            id: number;
            code: string;
            name: string;
            price: number;
            stock: number;
            active: boolean;
            created_at: string;
            updated_at: string;
        }>;
    };
} 
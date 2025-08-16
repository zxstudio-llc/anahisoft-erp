export interface DashboardData {
    stats: {
        sales: {
            current: number;
            previous: number;
            change: number;
        };
        clients: {
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
            client_name: string;
            total: number;
            status: string;
            date: string;
        }>;
        clients: Array<{
            id: number;
            name: string;
            document_number: string;
            created_at: string;
        }>;
        products: Array<{
            id: number;
            name: string;
            price: number;
            created_at: string;
        }>;
    };
} 
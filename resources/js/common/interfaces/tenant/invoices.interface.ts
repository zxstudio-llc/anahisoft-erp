export interface Invoice {
    id: number;
    number: string;
    customer_name: string;
    date: string;
    total: number;
    status: string;
    issue_date: string;
}

export interface Filters {
    search: string;
    status: string;
    sort_field: string;
    sort_order: string;
    per_page: number;
}

export interface Props {
    invoices: Invoice[];
    filters: Filters;
}

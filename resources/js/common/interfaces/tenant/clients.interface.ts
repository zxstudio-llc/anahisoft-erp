export interface ClientResponse {
    success: boolean;
    message: string;
    data: Client;
}

export interface Client {
    id: number;
    name: string;
    document_type: string;
    document_number: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    district: string | null;
    province: string | null;
    department: string | null;
    country: string | null;
    ubigeo: string | null;
    is_active: boolean;
    created_at: string;
}

export interface DocumentType {
    value: string;
    label: string;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface Pagination {
    data: Client[];
    links: PaginationLinks;
    meta: PaginationMeta;
}

export interface Filters {
    search: string | null;
    document_type: string | null;
    is_active: boolean | null;
    sort_field: string;
    sort_order: string;
    per_page: number;
}

export interface IndexProps {
    clients: Pagination;
    filters: Filters;
    document_types: DocumentType[];
}

export interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentTypes: DocumentType[];
    client?: {
        id: number;
        name: string;
        document_type: string;
        document_number: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        district?: string;
        province?: string;
        department?: string;
        country?: string;
        ubigeo?: string;
        is_active?: boolean;
    };
}

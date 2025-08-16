export interface Product {
    id: number;
    code: string;
    name: string;
    description: string | null;
    item_type: 'product' | 'service';
    unit_price: number;
    price: number;
    cost: number;
    stock: number;
    unit_type: string;
    currency: string;
    igv_type: string;
    igv_percentage: number;
    has_igv: boolean;
    category_id: number | null;
    brand: string | null;
    model: string | null;
    barcode: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: {
        id: number;
        name: string;
    };
}

export interface Category {
    id: number;
    name: string;
}

export interface UnitType {
    value: string;
    label: string;
}

export interface IgvType {
    value: string;
    label: string;
}

export interface Currency {
    value: string;
    label: string;
}

export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface ProductsResponse {
    products: PaginatedData<Product>;
    filters: {
        search: string | null;
        category_id: string | null;
        is_active: boolean;
        sort_field: string;
        sort_order: 'asc' | 'desc';
        per_page: number;
    };
    categories: Category[];
    unit_types: UnitType[];
    igv_types: IgvType[];
    currencies: Currency[];
}

export interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    unitTypes: UnitType[];
    igvTypes: IgvType[];
    currencies: Currency[];
    product?: Product;
    onSuccess?: (product: Product, isEdit?: boolean) => void;
}

export interface ProductFormData {
    code: string;
    name: string;
    description: string;
    item_type: 'product' | 'service';
    unit_price: number;
    price: number;
    cost: number;
    stock: number;
    unit_type: string;
    currency: string;
    igv_type: string;
    igv_percentage: number;
    has_igv: boolean;
    category_id: string;
    brand: string;
    model: string;
    barcode: string;
    is_active: boolean;
    [key: string]: string | number | boolean;
}

export interface NextCodeResponse {
    success: boolean;
    data: {
        code: string;
    };
}

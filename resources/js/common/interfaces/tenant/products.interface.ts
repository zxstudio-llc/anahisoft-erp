export interface Product {
    id: number;
    code: string;
    name: string;
    description: string | null;
    item_type: 'product' | 'service';
    unit_price: number;
    price: number; // incluye IVA si has_igv = true
    cost: number;
    stock: number;
    unit_type: string;
    vat_rate: '0' | '1';
    ice_rate: string;
    irbpnr_rate: string;
    vat_percentage: number; // calculado según vat_rate
    has_igv: boolean;
    category_id: number | null;
    category?: { id: number; name: string };
    brand: string | null;
    model: string | null;
    barcode: string | null;
    sku: string | null;
    min_stock: number;
    track_inventory: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductLight {
    id: number;
    code: string;
    name: string;
    price: number;
    stock: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface UnitType {
    value: string;
    label: string;
}

export interface VatType {
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
        active: boolean;
        sort_field: string;
        sort_order: 'asc' | 'desc';
        per_page: number;
    };
    categories: Category[];
    unit_types: UnitType[];
    vat_types: VatType[];
}

export interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    unitTypes: UnitType[];
    vatTypes: VatType[];
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
    min_stock: number;
    track_inventory: boolean;
    unit_type: string;
    vat_rate: '0' | '1';
    ice_rate: string;
    irbpnr_rate: string;
    has_igv: boolean;
    category_id: string;
    brand: string;
    model: string;
    barcode: string;
    sku: string;
    active: boolean;
    [key: string]: string | number | boolean;
}

export interface NextCodeResponse {
    success: boolean;
    data: {
        code: string;
    };
}

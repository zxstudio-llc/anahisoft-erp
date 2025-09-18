import { Customer } from "./customers.interface";
import { Product } from "./products.interface";

export interface Customer {
    id: number;
    company_id: number | null;
    identification_type: '04' | '05' | '06' | '07';
    identification: string | null;
    business_name: string;
    trade_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    special_taxpayer: boolean;
    accounting_required: boolean;
    credit_limit: number;
    active: boolean;
    created_at: string;
    updated_at: string;
    district: string;
    province: string;
    department: string;
    ubigeo: string;
    formatted_identification: string;
    identification_type_name: string;
    invoices_count?: number;
}

export interface Product {
    id: number;
    code: string;
    sku: string;
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
    ice_rate: string;
    category_id: number | null;
    brand: string | null;
    model: string | null;
    barcode: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
    category?: {
        id: number;
        name: string;
    };
}

export interface InvoiceDetail {
    id: number;
    invoice_id: number;
    product?: Product | null;
    main_code: string;
    auxiliary_code?: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    discount: number;
    subtotal: number;
    iva: number;
    ice: number;
    total: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface Invoice {
    id: number;
    type: 'sale' | 'purchase';
    customer?: Customer | null;
    supplier_id?: number | null;
    document_type: '01' | '03';
    establishment_code: string;
    emission_point: string;
    sequential: string;
    access_key?: string | null;
    issue_date: string;
    period: string; // MM/YYYY
    subtotal_12: number;
    subtotal_0: number;
    subtotal_no_tax: number;
    subtotal_exempt: number;
    discount: number;
    ice: number;
    iva: number;
    tip: number;
    total: number;
    status: 'draft' | 'issued' | 'authorized' | 'rejected' | 'canceled';
    xml_content?: string | null;
    authorization_number?: string | null;
    authorization_date?: string | null;
    details?: InvoiceDetail[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;

    // Archivos generados (si es electrónico)
    xml_path?: string | null;
    pdf_path?: string | null;
    cdr_path?: string | null;
    is_electronic: boolean;
}

export interface CreateInvoiceData {
    type?: 'sale' | 'purchase'; // default 'sale'
    customer_id?: number;        // obligatorio si es venta
    supplier_id?: number;        // obligatorio si es compra
    document_type: '01' | '03';  // Factura o Boleta
    establishment_code?: string;
    emission_point?: string;
    sequential?: string;
    issue_date: string;
    period: string;              // MM/YYYY
    is_electronic?: boolean;
    details: Array<{
        product_id?: number | null;
        main_code: string;
        auxiliary_code?: string | null;
        description: string;
        quantity: number;
        unit_price: number;
        discount?: number;
        subtotal?: number;
        iva?: number;
        ice?: number;
        total?: number;
    }>;
}
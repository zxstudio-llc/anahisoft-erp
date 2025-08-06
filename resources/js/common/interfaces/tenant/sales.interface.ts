import { Client } from "./clients.interface";
import { Product } from "./products.interface";

export interface Client {
    id: number;
    name: string;
    document_type: string;
    document_number: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface Product {
    id: number;
    code: string;
    name: string;
    description?: string;
    price: number;
    price_without_igv: number;
    igv_amount: number;
    stock: number;
    unit_type: string;
    category?: {
        id: number;
        name: string;
    };
}

export interface Settings {
    ruc: string;
    business_name: string;
    trade_name: string;
    address: string;
    ubigeo: string;
    district: string;
    province: string;
    department: string;
    phone: string;
    email: string;
    sunat_mode: 'demo' | 'test' | 'prod';
    invoice_series: string;
    receipt_series: string;
}

export interface Sale {
    id: number;
    client: Client;
    total: number;
    status: string;
    created_at: string;
    document_type: string;
    series: string;
    number: string;
    sunat_response?: string;
    sunat_ticket?: string;
    xml_path?: string;
    pdf_path?: string;
    cdr_path?: string;
    sunat_state?: string;
    is_electronic: boolean;
    environment: string;
}

export interface CreateSaleData {
    client_id: number;
    products: Array<{
        id: number;
        quantity: number;
    }>;
} 
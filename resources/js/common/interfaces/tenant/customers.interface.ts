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

export interface CustomerLight {
  id: number;
  identification: string | null;
  business_name: string;
  trade_name: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export interface DocumentType {
  value: '04' | '05' | '06' | '07';
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

export interface CustomerPagination {
  data: Customer[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface CustomerFilters {
  search: string | null;
  identification_type: string | null;
  active: boolean | null;
  sort_field: string;
  sort_order: string;
  per_page: number;
}

export interface CustomerIndexResponse {
  success: boolean;
  customers: CustomerPagination;
  filters: CustomerFilters;
  identification_types: DocumentType[];
}

export interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTypes: DocumentType[];
  customer?: Customer;
  onSuccess?: (customer: Customer) => void;
}
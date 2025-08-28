export interface Customer {
    id: number;
    business_name: string;
    document_type: string;
    identification: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
  }
  
  export interface CustomerResponse {
    success: boolean;
    message: string;
    data: Customer;
  }
  
  export interface DocumentType {
    value: string;
    label: string;
  }
  
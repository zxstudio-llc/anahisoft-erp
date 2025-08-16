export interface DniValidationData {
    dni: string;
    firstName: string;
    lastName: string;
    motherLastName: string;
    verificationCode: number;
    verificationLetter: string;
    success: boolean;
}

export interface RucValidationData {
    ruc: string;
    businessName: string;
    tradeName: string | null;
    phones: string[];
    type: string | null;
    status: string;
    condition: string;
    address: string | null;
    department: string | null;
    province: string | null;
    district: string | null;
    registrationDate: string | null;
    emissionSystem: string | null;
    accountingSystem: string | null;
    foreignActivity: string | null;
    economicActivities: string[];
    paymentVouchers: string[];
    electronicSystems: string[];
    electronicEmissionDate: string | null;
    electronicVouchers: string[];
    pleDate: string | null;
    registers: string[];
    withdrawalDate: string | null;
    profession: string | null;
    ubigeo: string | null;
    capital: string | null;
    success: boolean;
}

export type DocumentValidationData = DniValidationData | RucValidationData;

export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
    request: any;
}

export interface ClientFormData {
    name: string;
    document_type: string;
    document_number: string;
    email: string;
    phone: string;
    address: string;
    district: string;
    province: string;
    department: string;
    country: string;
    ubigeo: string;
    is_active: boolean;
}

export interface ApiError {
    response?: {
        data?: {
            message?: string;
            errors?: Record<string, string[]>;
        };
    };
} 
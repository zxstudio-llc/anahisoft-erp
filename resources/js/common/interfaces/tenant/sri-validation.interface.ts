export interface RucValidationResponse {
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
}

export interface ApiValidationResponse {
    data: {
        success: boolean;
        data: RucValidationResponse;
    };
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
    request: any;
}

export interface SriApiResponse {
    success: boolean;
    data: {
        identification: string;
        business_name: string;
        legal_name: string;
        commercial_name: string | null;
        status: string | null;
        taxpayer_status: string | null;
        taxpayer_type: string;
        regime: string;
        main_activity: string;
        accounting_required: string;
        withholding_agent: string;
        special_taxpayer: string;
        head_office_address: string;
        debt_amount: string | null;
        debt_description: string | null;
        ruc_number: string;
        company_name: string;
        taxpayer_dates: {
            start_date: string | null;
            cessation_date: string | null;
            restart_date: string | null;
            update_date: string | null;
        };
        legal_representatives: any[];
        cancellation_reason: string | null;
        ghost_taxpayer: string;
        nonexistent_transactions: string;
        establishments: Array<{
            number: string;
            commercial_name: string | null;
            address: string;
            status: string;
            department: string | null;
            province: string;
            district: string | null;
            parish: string;
            establishment_type: string;
            is_headquarters: boolean;
        }>;
    };
    meta: {
        cached: boolean;
        timestamp: string;
        source: string;
        establishments_count: number;
        cache_key: string;
    };
}
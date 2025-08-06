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
declare global {
    interface Window {
        Culqi: {
            publicKey: string;
            settings: (settings: CulqiSettings) => void;
            options: (options: CulqiOptions) => void;
            open: () => void;
            close: () => void;
            token?: CulqiToken;
            error?: CulqiError;
        };
        culqi: () => void;
    }
}

export interface CulqiSettings {
    title: string;
    currency: string;
    amount: number;
    order?: string;
    language?: string;
}

export interface CulqiOptions {
    style?: {
        logo?: string;
        maincolor?: string;
        buttontext?: string;
        maintext?: string;
        desctext?: string;
    };
}

export interface CulqiToken {
    id: string;
    email: string;
    card_number?: string;
    card_brand?: string;
    card_type?: string;
    client?: {
        ip: string;
        ip_country: string;
        ip_country_code: string;
    };
}

export interface CulqiError {
    code: string;
    message: string;
    user_message?: string;
}

export interface CulqiCharge {
    id: string;
    amount: number;
    currency_code: string;
    outcome: {
        type: string;
        code?: string;
        merchant_message?: string;
        user_message?: string;
    };
    source: {
        id: string;
        type: string;
        card_number?: string;
        last_four?: string;
        active?: boolean;
        iin?: {
            object?: string;
            card_brand?: string;
            card_type?: string;
            card_category?: string;
            issuer?: {
                name?: string;
                country?: string;
                country_code?: string;
                website?: string;
                phone_number?: string;
            };
            installments_allowed?: number[];
        };
    };
}

// This empty export is needed to make the file a module
export {}; 
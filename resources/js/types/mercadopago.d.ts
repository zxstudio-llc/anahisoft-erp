declare global {
    interface Window {
        MercadoPago: any;
        mp: any;
        cardPaymentBrickController: any;
    }
}

export interface CardFormData {
    token: string;
    payment_method_id?: string;
    paymentMethodId?: string;
    issuer_id?: string;
    issuerId?: string;
    cardholderEmail?: string;
    installments?: number;
    identificationType?: string;
    identificationNumber?: string;
    payer?: {
        email?: string;
        identification?: {
            type: string;
            number: string;
        };
    };
}

export interface MercadoPagoBrickSettings {
    initialization: {
        preferenceId: string;
        amount: number;
    };
    customization?: {
        visual?: {
            style?: {
                theme?: string;
                customVariables?: {
                    formBackgroundColor?: string;
                    baseColor?: string;
                };
            };
        };
        paymentMethods?: {
            maxInstallments?: number;
            minInstallments?: number;
            excludedPaymentMethods?: string[];
            excludedPaymentTypes?: string[];
        };
    };
    callbacks: {
        onReady: () => void;
        onSubmit: (cardFormData: CardFormData) => Promise<void>;
        onError: (error: Error) => void;
        onPaymentSuccess: (data: { id: string }) => void;
    };
}

export interface MercadoPagoBrickController {
    unmount: () => void;
}

export interface MercadoPagoBrickBuilder {
    create: (type: string, elementId: string, settings: MercadoPagoBrickSettings) => Promise<MercadoPagoBrickController>;
}

export interface MercadoPagoInstance {
    bricks(): MercadoPagoBrickBuilder;
}

export interface MercadoPagoConstructor {
    new (publicKey: string): MercadoPagoInstance;
}

// Instead of extending Window interface globally, export the types for manual augmentation
export interface MercadoPagoWindow {
    MercadoPago: MercadoPagoConstructor;
    mp: MercadoPagoInstance;
    cardPaymentBrickController: MercadoPagoBrickController;
}

export interface MercadoPagoPaymentResponse {
    id: string;
    status: string;
    status_detail: string;
    payment_method_id: string;
    payment_type_id: string;
    transaction_amount: number;
    installments: number;
    processing_mode: string;
    description: string;
    metadata: Record<string, any>;
}

export interface MercadoPagoPreference {
    id: string;
    init_point: string;
    sandbox_init_point: string;
    items: Array<{
        id: string;
        title: string;
        description: string;
        picture_url: string;
        category_id: string;
        quantity: number;
        unit_price: number;
    }>;
    payer: {
        name: string;
        surname: string;
        email: string;
        phone: {
            area_code: string;
            number: string;
        };
        identification: {
            type: string;
            number: string;
        };
        address: {
            street_name: string;
            street_number: number;
            zip_code: string;
        };
    };
    back_urls: {
        success: string;
        failure: string;
        pending: string;
    };
    auto_return: string;
    payment_methods: {
        excluded_payment_methods: Array<{ id: string }>;
        excluded_payment_types: Array<{ id: string }>;
        installments: number;
    };
    notification_url: string;
    statement_descriptor: string;
    external_reference: string;
    expires: boolean;
    expiration_date_from: string;
    expiration_date_to: string;
}

export {}; 
import type { route as routeFn } from 'ziggy-js';
import type { MercadoPagoWindow } from './mercadopago';

declare global {
    const route: typeof routeFn;

    interface Window extends MercadoPagoWindow {
        Echo: {
            connector: {
                pusher: {
                    connection: {
                        state: string;
                        bind: (event: string, callback: (error?: any) => void) => void;
                    };
                };
            };
            channel: (channel: string) => {
                listen: (event: string, callback: (e: any) => void) => void;
                stopListening: (event: string) => void;
            };
            private: (channel: string) => {
                listen: (event: string, callback: (e: any) => void) => void;
                stopListening: (event: string) => void;
            };
            join: (channel: string) => {
                listen: (event: string, callback: (e: any) => void) => void;
                stopListening: (event: string) => void;
            };
        };
    }
}

export {};

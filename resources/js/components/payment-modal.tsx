import type { PaymentApiResponse, PaymentRequest } from '@/common/interfaces/payment.interface';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Api from '@/lib/api';
import { LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    planId: number;
    billingPeriod: string;
    onPaymentSuccess: (paymentId: string) => void;
    onPaymentError: (error: Error) => void;
}

const getCulqiErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
        'card_declined': 'La tarjeta fue rechazada. Por favor, intente con otra tarjeta.',
        'expired_card': 'La tarjeta está vencida.',
        'insufficient_funds': 'La tarjeta no tiene fondos suficientes.',
        'invalid_card': 'La tarjeta es inválida.',
        'contact_issuer': 'Contacte al emisor de su tarjeta.',
        'invalid_number': 'El número de tarjeta es inválido.',
        'invalid_expiry_month': 'El mes de expiración es inválido.',
        'invalid_expiry_year': 'El año de expiración es inválido.',
        'invalid_cvc': 'El código de seguridad es inválido.',
        'processing_error': 'Ocurrió un error procesando su pago. Por favor, intente nuevamente.',
    };

    return errorMessages[error] || 'Error al procesar el pago. Por favor, intente nuevamente.';
};

export default function PaymentModal({ isOpen, onClose, amount, planId, billingPeriod, onPaymentSuccess, onPaymentError }: PaymentModalProps) {
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isCulqiReady, setIsCulqiReady] = useState(false);

    const handlePaymentError = (error: Error | unknown) => {
        console.error('Error processing payment:', error);

        // Extract error code from the error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = typeof error === 'object' && error !== null ? (error as any).code : '';
        
        // Get user-friendly error message
        const userMessage = errorCode 
            ? getCulqiErrorMessage(errorCode)
            : errorMessage || 'Error al procesar el pago';

        onPaymentError(new Error(userMessage));
    };

    useEffect(() => {
        if (!isOpen) return;

        // Cargar el script de Culqi
        const loadCulqi = async () => {
            try {
                const script = document.createElement('script');
                script.src = 'https://checkout.culqi.com/js/v4';
                script.async = true;
                script.onload = () => {
                    window.Culqi.publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY;
                    setIsCulqiReady(true);
                };
                document.body.appendChild(script);
            } catch (error) {
                console.error('Error loading Culqi script:', error);
                onPaymentError(new Error('Error al cargar el script de Culqi'));
            }
        };

        loadCulqi();

        return () => {
            const script = document.querySelector('script[src="https://checkout.culqi.com/js/v4"]');
            if (script) {
                document.body.removeChild(script);
            }
        };
    }, [isOpen, onPaymentError]);

    const handlePayment = useCallback(() => {
        if (!isCulqiReady) return;

        window.Culqi.settings({
            title: 'Suscripción',
            currency: 'PEN',
            amount: amount * 100, // Culqi requires amount in cents
            order: 'pgo_test_ID_DE_ORDEN',
            language: 'es',
        });

        window.Culqi.options({
            style: {
                logo: '/logo.svg',
                maincolor: '#6366F1',
                buttontext: 'white',
                maintext: '#4F46E5',
                desctext: '#6B7280',
            }
        });

        window.Culqi.open();

        window.culqi = async () => {
            if (window.Culqi.token) {
                try {
                    setIsProcessingPayment(true);

                    const paymentData = {
                        token: window.Culqi.token.id,
                        email: window.Culqi.token.email,
                        amount: amount,
                        currency_code: 'PEN',
                        plan_id: planId,
                        billing_period: billingPeriod,
                    } satisfies PaymentRequest;

                    const response = await Api.post<PaymentApiResponse>('/payment/process', paymentData);

                    if (!response.success || !response.data) {
                        throw new Error(response.message || 'Error al procesar el pago');
                    }

                    onPaymentSuccess(response.data.payment_id);
                } catch (error) {
                    handlePaymentError(error);
                } finally {
                    setIsProcessingPayment(false);
                }
            } else if (window.Culqi.error) {
                handlePaymentError(window.Culqi.error);
            }
        };
    }, [isCulqiReady, amount, planId, billingPeriod, onPaymentSuccess]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Suscripción al Plan</DialogTitle>
                    <DialogDescription>Complete los datos de su tarjeta para procesar la suscripción</DialogDescription>
                </DialogHeader>

                <div className="relative min-h-[100px] w-full">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <button
                            onClick={handlePayment}
                            disabled={isProcessingPayment || !isCulqiReady}
                            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isProcessingPayment ? (
                                <div className="flex items-center justify-center gap-2">
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                    <span>Procesando...</span>
                                </div>
                            ) : (
                                'Pagar con Tarjeta'
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

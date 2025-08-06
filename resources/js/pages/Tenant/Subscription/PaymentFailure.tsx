import { Head } from '@inertiajs/react';
import { XCircle } from 'lucide-react';
import TextLink from '@/components/text-link';

interface PaymentFailureProps {
    message: string;
}

export default function PaymentFailure({ message }: PaymentFailureProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Head title="Error en el Pago" />

            <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
                <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                
                <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    Error en el Pago
                </h1>
                
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    {message}
                </p>

                <div className="space-x-4">
                    <TextLink href={route('tenant.subscription.index')} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        Volver a Intentar
                    </TextLink>
                </div>
            </div>
        </div>
    );
} 
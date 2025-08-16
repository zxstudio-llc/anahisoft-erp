import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';

import TextLink from '@/components/text-link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AuthLayout from '@/layouts/auth/auth-split-layout';

interface PendingProps {
    message: string;
}

export default function Pending({ message }: PendingProps) {
    return (
        <AuthLayout
            title="Pago pendiente"
            description="Tu pago está siendo procesado"
            backgroundImage="/assets/img/bg/auth.jpg"
        >
            <Head title="Pago pendiente" />

            <Alert className="mb-6">
                <Clock className="h-4 w-4" />
                <AlertTitle>Pago pendiente</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>

            <div className="text-center">
                <TextLink href="/">Volver al inicio</TextLink>
            </div>
        </AuthLayout>
    );
} 
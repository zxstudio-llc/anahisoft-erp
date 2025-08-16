import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            theme="light"
            className="!font-sans"
            toastOptions={{
                classNames: {
                    toast: 'group toast group',
                    description: 'group-data-[type=success]:text-green-800 group-data-[type=error]:text-red-800',
                    actionButton: 'group-data-[type=success]:bg-green-500 group-data-[type=error]:bg-red-500',
                    cancelButton: 'group-data-[type=success]:bg-green-100 group-data-[type=error]:bg-red-100',
                },
            }}
        />
    );
} 
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // Verificar si el usuario ya ha aceptado las cookies
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowConsent(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50">
            <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-2">🍪 Aviso de Cookies</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Al continuar navegando, acepta nuestra política de cookies.
                </p>
                <div className="flex gap-4">
                    <Button 
                        onClick={acceptCookies}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        Aceptar
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={acceptCookies}
                        className="w-full"
                    >
                        Rechazar
                    </Button>
                </div>
            </Card>
        </div>
    );
} 
import echo from "@/lib/echo";
import { toast } from "sonner";

interface TenantStatusEvent {
    tenantId: string;
    isActive: boolean;
    message: string;
}

export function TenantStatusListener() {
    echo.channel('tenant.status').listen('.TenantStatusChanged', (e: TenantStatusEvent) => {
        console.log(e);
        // Mostrar notificación toast con el mensaje
        toast(e.isActive ? "Cuenta Activa" : "Cuenta Inactiva", {
            description: e.message,
            duration: 5000,
        });
    });

    return null;
}

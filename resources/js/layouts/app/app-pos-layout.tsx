import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header-tenant';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/toast';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AppPosLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    // Obtener isTenant desde las props compartidas por el servidor
    const page = usePage();
    const isTenant = page.props.isTenant as boolean;

    return (
        <AppShell variant="header">
            <div className="flex flex-col h-screen">

            
            {/* <AppSidebar isTenant={isTenant} /> */}
            <AppHeader isTenant={isTenant} />

            <AppContent variant="header" className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
                {children}
                <Toaster />
            </AppContent>
            </div>
        </AppShell>
    );
}

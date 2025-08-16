import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { TenantStatusListener } from '../components/tenant-status-listener';
import { Toaster } from '../components/ui/toast';
import AppLayoutTemplate from './app/app-sidebar-layout';
import CookieConsent from '@/components/cookie-consent';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}
export default function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
    return (
        <>
            <TenantStatusListener />
            <AppLayoutTemplate breadcrumbs={breadcrumbs}>
                {children}
                <Toaster />
                <CookieConsent />
            </AppLayoutTemplate>
        </>
    );
}

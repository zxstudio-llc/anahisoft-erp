import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { centralSidebarNavItems, tenantSidebarNavItems } from '@/lib/Navigation';
import { type SharedData } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') return null;

    const page = usePage<SharedData>();
    
    // Múltiples formas de detectar si es tenant
    const isTenant = !!(
        page.props.tenant || 
        page.url.includes('/tenant/') ||
        page.url.startsWith('/settings/') // Si las rutas de tenant usan /settings/
    );
    
    const navItems = isTenant ? tenantSidebarNavItems : centralSidebarNavItems;

    const isActive = (href: string) => {
        // Mejorar la lógica de detección de rutas activas
        if (href === route('dashboard') && page.url === '/admin/dashboard') {
            return true;
        }
        if (href === '/settings/profile' && page.url.includes('/settings/profile')) {
            return true;
        }
        if (href === '/settings/password' && page.url.includes('/settings/password')) {
            return true;
        }
        if (href === '/settings/appearance' && page.url.includes('/settings/appearance')) {
            return true;
        }
        
        // Para rutas que usan route() helper
        try {
            if (href.includes('admin.settings') && page.url.includes('/admin/settings')) {
                return page.url.includes(href.split('.').pop() || '');
            }
        } catch (error) {
            // Fallback si route() falla
        }
        
        return page.url.startsWith(href);
    };

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {navItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isActive(item.href),
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
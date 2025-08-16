import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

import { centralNavItems, footerNavItems, tenantNavItems } from '@/lib/Navigation';
import AppLogo from './app-logo';

export function AppSidebar({ isTenant }: { isTenant: boolean }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    const navItems = isTenant ? tenantNavItems : centralNavItems;

    // Personalizar el logo según el contexto
    const logoText = isTenant ? 'Panel Inquilino' : 'Panel Central';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <div
                                    className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground"
                                    style={{ backgroundColor: isTenant ? '#2563eb' : 'var(--sidebar-primary)' }}
                                >
                                    <AppLogo />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="mb-0.5 truncate leading-tight font-semibold">{logoText}</span>
                                    <span className="truncate text-xs text-muted-foreground">{auth.user.name}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

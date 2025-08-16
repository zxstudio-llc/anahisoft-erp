import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (title: string) => {
        setOpenItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
    };

    const isActive = (href: string) => {
        // Si la URL actual es exactamente igual a la ruta del dashboard
        if (href === route('dashboard') && page.url === '/admin/dashboard') {
            return true;
        }
        // Para otras rutas, verificar si la URL actual comienza con la ruta del ítem
        return page.url.startsWith(href);
    };

    const renderMenuItem = (item: NavItem) => {
        if (item.subItems) {
            const isOpen = openItems.includes(item.title);
            const hasActiveSubItem = item.subItems.some((subItem) => isActive(subItem.href));

            return (
                <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={{ children: item.title }} isActive={hasActiveSubItem} className="w-full">
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.subItems.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
                                            <Link href={subItem.href} prefetch>
                                                {subItem.icon && <subItem.icon />}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            );
        }

        return (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={{ children: item.title }} className="w-full">
                    <Link href={item.href} prefetch>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    return (
        <SidebarGroup className="px-0 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>{items.map(renderMenuItem)}</SidebarMenu>
        </SidebarGroup>
    );
}

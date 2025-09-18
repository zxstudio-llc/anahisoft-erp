import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { centralNavItems, footerNavItems, tenantNavItems } from '@/lib/Navigation';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Search } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    isTenant?: boolean;
}

export function AppHeader({ breadcrumbs = [], isTenant = false }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const logoText = isTenant ? 'Panel Inquilino' : 'Panel Central';

    return (
        <>
            <div className="bg-sidebar border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:min-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left p-4">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground"
                                            style={{ backgroundColor: isTenant ? '#2563eb' : 'var(--sidebar-primary)' }}
                                        >
                                            <AppLogoIcon className="h-4 w-4 fill-current text-white" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm">
                                            <span className="mb-0.5 truncate leading-tight font-semibold">{logoText}</span>
                                            <span className="truncate text-xs text-muted-foreground">{auth.user.name}</span>
                                        </div>
                                    </div>
                                </SheetHeader>
                                
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">

                                        {/* Footer Navigation Items */}
                                        <div className="flex flex-col space-y-2 border-t pt-4">
                                            {footerNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={item.href}
                                                    target={item.href.startsWith('http') ? "_blank" : undefined}
                                                    rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
                                                    className="flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-4 w-4" />}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link href="/dashboard" prefetch className="flex items-center space-x-3 text-white">
                        <div
                            className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground"
                            style={{ backgroundColor: isTenant ? '#2563eb' : 'var(--sidebar-primary)' }}
                        >
                            <AppLogo />
                        </div>
                        <div className="hidden sm:grid flex-1 text-left text-sm">
                            <span className="mb-0.5 truncate leading-tight font-semibold">{logoText}</span>
                            <span className="truncate text-xs">{auth.user.name}</span>
                        </div>
                    </Link>

                    {/* Right Side Actions */}
                    <div className="ml-auto flex items-center space-x-2">
                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
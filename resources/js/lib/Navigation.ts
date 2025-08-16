import { type NavItem } from '@/types';
import {
    ActivitySquare,
    Banknote,
    BarChart,
    BarChart3,
    BookOpen,
    Boxes,
    Building,
    ChartColumnStackedIcon,
    ClipboardList,
    Cog,
    CogIcon,
    CreditCard,
    DollarSign,
    FactoryIcon,
    FileClock,
    FileSpreadsheet,
    FileText,
    Folder,
    Handshake,
    HandshakeIcon,
    ImagePlay,
    Images,
    Key,
    LayoutDashboard,
    List,
    ListChecks,
    MessageSquare,
    NotebookText,
    Package,
    Receipt,
    Search,
    Shield,
    ShieldEllipsis,
    ShoppingCart,
    UserRoundCog,
    Users,
    Users2,
    UsersIcon,
    Warehouse,
} from 'lucide-react';

export const centralNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutDashboard,
    },
    {
        title: 'Inquilinos',
        href: route('admin.tenants.index'),
        icon: Building,
    },
    {
        title: 'Suscripciones',
        href: route('admin.subscription-plans.index'),
        icon: CreditCard,
    },
    {
        title: 'Pagos',
        href: route('admin.payments.index'),
        icon: DollarSign,
    },
    {
        title: 'Configuración',
        href: route('admin.settings.profile.edit'),
        icon: Cog,
    },
    {
        title: 'Usuarios',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Roles y permisos',
        href: '/admin/roles',
        icon: ShieldEllipsis,
    },
    {
        title: 'Páginas',
        href: '/admin/pages',
        icon: FileText,
    },
    {
        title: 'Noticias/Blog',
        href: '/admin/news',
        icon: NotebookText,
    },
    {
        title: 'Media',
        href: '/admin/media',
        icon: Images,
    },
    {
        title: 'Banners',
        href: '/admin/banners',
        icon: ImagePlay,
    },
    {
        title: 'Menús',
        href: '/admin/menus',
        icon: List,
    },
    {
        title: 'Testimonios',
        href: '/admin/testimonials',
        icon: MessageSquare,
    },
    {
        title: 'SEO',
        href: '/admin/seo',
        icon: Search,
    },
    {
        title: 'Analítica',
        href: '/admin/analytics',
        icon: BarChart,
    },
    {
        title: 'Configuracion',
        href: '/admin/settings',
        icon: Cog,
    },
    {
        title: 'Footer',
        href: '/admin/footers/manage',
        icon: BarChart,
    }
];

// Elementos de navegación para la sección de inquilinos
export const tenantNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('tenant.dashboard'),
        icon: LayoutDashboard,
    },
    {
        title: 'Finanzas',
        href: '#',
        icon: Banknote,
        subItems: [
            {
                title: 'Facturación',
                href: route('tenant.invoices.index'),
                icon: Receipt,
            },
            {
                title: 'Plan de cuentas', href: '/finanzas/chart-of-accounts',
                icon: FileText,
            },
            {
                title: 'Estados de cuenta', href: '/finanzas/account-statements',
                icon: FileClock,
            },
            {
                title: 'Estados financieros', href: '/finanzas/financial-statements',
                icon: FileSpreadsheet,
            },
            {
                title: 'Libro mayor', href: '/finanzas/general-ledger',
                icon: BarChart3,
            },
            {
                title: 'Asientos de diario', href: '/finanzas/journal-entries',
                icon: BarChart3,
            },
            {
                title: 'Balance', href: '/finanzas/trial-balance',
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Ventas y CRM',
        href: '#',
        icon: HandshakeIcon,
        subItems: [
            {
                title: 'Clientes',
                href: route('tenant.clients.index'),
                icon: Users,
            },
            {
                title: 'Ventas',
                href: route('tenant.sales.index'),
                icon: ShoppingCart,
            },
            { title: 'Leads', href: '/crm/leads',
                icon: ListChecks, },
            {
                title: 'Pipeline', href: '/crm/pipeline',
                icon: ClipboardList,
            },
            // { title: 'Tareas y Seguimiento', href: '/crm/tareas',
            //     icon: ActivitySquare, },
            // { title: "Facturación SRI", href: "/facturacion", icon: FileSpreadsheet, },
        ],
    },
    {
        title: 'Inventario y Compras',
        href: '#',
        icon: Boxes,
        subItems: [
            {
                title: 'Productos',
                href: route('tenant.products.index'),
                icon: Package,
            },
            {
                title: 'Categorías',
                href: route('tenant.categories.index'),
                icon: Folder,
            },
            {
                title: 'Ordenes de Compra', href: '/inventory/purchase-orders',
                icon: FileClock,
            },
            {
                title: 'Gestión de inventario', href: '/inventory/inventory-management',
                icon: FileClock,
            },
            {
                title: 'Proveedores', href: '/inventory/providers-management',
                icon: Handshake,
            },
            {
                title: 'Gestión de almacenes', href: '/inventory/warehouse-management',
                icon: ClipboardList,
            },
            {
                title: 'Movimientos de existencias', href: '/inventory/stock-movements',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Producción',
        href: '#',
        icon: FactoryIcon,
        subItems: [
            {
                title: 'Órdenes de producción', href: '/produccion/ordenes',
                icon: FileText,
            },
            {
                title: 'MRP', href: '/produccion/mrp',
                icon: BarChart3,
            },
            {
                title: 'Control de procesos', href: '/produccion/process-control',
                icon: Warehouse,
            },
            {
                title: 'Centros de trabajo', href: '/produccion/work-centers',
                icon: Warehouse,
            },
            {
                title: 'Calidad', href: '/produccion/quality-control',
                icon: ListChecks,
            },
        ],
    },
    {
        title: 'RRHH',
        href: '#',
        icon: UsersIcon,
        subItems: [
            {
                title: 'Empleados', href: '/rrhh/empleados',
                icon: Users2,
            },
            {
                title: 'Cargos y roles', href: '/rrhh/roles',
                icon: UserRoundCog,
            },
            {
                title: 'Asistencia', href: '/rrhh/asistencia',
                icon: FileClock,
            },
            {
                title: 'KPIs', href: '/rrhh/kpis',
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Reportes BI',
        href: '#',
        icon: ChartColumnStackedIcon,
        subItems: [
            {
                title: 'Dashboard Financiero', href: '/bi/finanzas',
                icon: BarChart3,
            },
            {
                title: 'Dashboard de Ventas', href: '/bi/ventas',
                icon: BarChart3,
            },
            {
                title: 'Inventario & Logística', href: '/bi/inventario',
                icon: BarChart3,
            },
            {
                title: 'Recursos Humanos', href: '/bi/rrhh',
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Suscripción',
        href: route('subscription.index'),
        icon: CreditCard,
    },
    {
        title: 'Configuración',
        href: '#',
        icon: Cog,
        subItems: [
            {
                title: 'Usuarios',
                href: route('tenant.users.index'),
                icon: Users,
            },
            {
                title: 'API Keys',
                href: route('api-keys.index'),
                icon: Key,
            },
            {
                title: 'Roles',
                href: route('tenant.roles.index'),
                icon: Shield,
            },
            {
                title: 'Empresa',
                href: route('settings.index'),
                icon: Building,
            },
        ],
    },
];

export const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];


export const centralSidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: route('admin.settings.profile.edit'),
        icon: null,
    },
    {
        title: 'Password',
        href: route('admin.settings.password.edit'),
        icon: null,
    },
    {
        title: 'Appearance',
        href: route('admin.settings.appearance'),
        icon: null,
    },
];

export const tenantSidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: null,
    },
];
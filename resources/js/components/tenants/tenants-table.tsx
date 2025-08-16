import { Tenant } from '@/common/interfaces/tenant.interface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { Building2, CreditCard, Edit, Key, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { EditTenantModal } from './edit-tenant-modal';
import { CreateTenantModal } from './create-tenant-modal';

interface TenantsTableProps {
    tenants: Tenant[];
    app_domain: string;
}

export function TenantsTable({ tenants, app_domain }: TenantsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof Tenant>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleSort = (field: keyof Tenant) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleEdit = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTenant(null);
    };

    const filteredTenants = tenants.filter((tenant) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            tenant.id.toLowerCase().includes(searchLower) ||
            (tenant.primary_domain && tenant.primary_domain.toLowerCase().includes(searchLower)) ||
            (tenant.company_name && tenant.company_name.toLowerCase().includes(searchLower))
        );
    });

    const sortedTenants = [...filteredTenants].sort((a, b) => {
        const aValue = a[sortField] ?? '';
        const bValue = b[sortField] ?? '';
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Función para obtener el badge de estado de suscripción
    const getSubscriptionStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Activa</span>;
            case 'trial':
                return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Prueba</span>;
            case 'expired':
                return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Expirada</span>;
            case 'inactive':
                return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">Inactiva</span>;
            default:
                return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">Desconocido</span>;
        }
    };

    return (
        <>
            <Card className="overflow-hidden">
                <div className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Inquilinos</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar inquilinos..."
                                    className="w-64 rounded-md border px-3 py-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="absolute top-2.5 right-3 h-5 w-5 text-gray-400"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <CreateTenantModal domain={app_domain} />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium tracking-wide text-neutral-500 uppercase dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                                <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('company_name')}>
                                    <div className="flex items-center">
                                        Inquilino
                                        {sortField === 'company_name' && <SortIcon direction={sortDirection} />}
                                    </div>
                                </th>
                                <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('primary_domain')}>
                                    <div className="flex items-center">
                                        Dominio
                                        {sortField === 'primary_domain' && <SortIcon direction={sortDirection} />}
                                    </div>
                                </th>
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('created_at')}>
                                    <div className="flex items-center">
                                        Creado
                                        {sortField === 'created_at' && <SortIcon direction={sortDirection} />}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-3 text-center text-sm text-neutral-500">
                                        No hay inquilinos disponibles
                                    </td>
                                </tr>
                            ) : (
                                sortedTenants.map((tenant) => (
                                    <tr
                                        key={tenant.id}
                                        className="border-b border-neutral-200 bg-white text-sm last:border-0 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                    <Building2 className="h-5 w-5 text-neutral-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{tenant.company_name || tenant.id}</div>
                                                    <div className="text-xs text-neutral-500">{tenant.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <a
                                                href={`https://${tenant.primary_domain}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {tenant.primary_domain}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            {tenant.subscription_plan ? (
                                                <span>{tenant.subscription_plan.name}</span>
                                            ) : (
                                                <span className="text-neutral-500">Sin plan</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{getSubscriptionStatusBadge(tenant.subscription_status)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <span>
                                                    {new Date(tenant.created_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => router.visit(route('admin.tenants.subscription', tenant.id))}
                                                        >
                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                            Gestionar Suscripción
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.visit(route('admin.tenants.reset-admin', tenant.id))}>
                                                            <Key className="mr-2 h-4 w-4" />
                                                            Resetear Credenciales
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {editingTenant && <EditTenantModal tenant={editingTenant} isOpen={isEditModalOpen} onClose={closeEditModal} />}
        </>
    );
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' }) {
    return (
        <span className="ml-1">
            {direction === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                        fillRule="evenodd"
                        d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z"
                        clipRule="evenodd"
                    />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                        fillRule="evenodd"
                        d="M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 11-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"
                        clipRule="evenodd"
                    />
                </svg>
            )}
        </span>
    );
}

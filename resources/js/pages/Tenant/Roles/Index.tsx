import { Permission, PermissionsResponse, Role, RolesResponse, defaultFilters } from '@/common/interfaces/tenant/roles.interface';
import RoleModal from '@/components/tenants/create-role-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import Api from '@/lib/api';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Pencil, Plus, Search, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface Filters {
    search: string;
    sort_field: string;
    sort_order: string;
    per_page: number;
    page?: number;
}

export default function Index() {
    // Estados
    const [roles, setRoles] = useState<Role[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        current_page: 1,
        from: 0,
        last_page: 1,
        links: [],
        path: '',
        per_page: 10,
        to: 0,
        total: 0,
    });
    const [filters, setFilters] = useState<Filters>(defaultFilters);
    const [permissions, setPermissions] = useState<Array<{ value: string; label: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);

    // Cargar roles
    const loadRoles = async () => {
        try {
            setIsLoading(true);
            const { data: rolesData } = await Api.get<{ data: RolesResponse }>('/v1/roles', {
                params: filters,
            });

            setRoles(rolesData.roles.data);
            setMeta({
                current_page: rolesData.roles.current_page,
                from: rolesData.roles.from,
                last_page: rolesData.roles.last_page,
                links: rolesData.roles.links,
                path: rolesData.roles.path,
                per_page: rolesData.roles.per_page,
                to: rolesData.roles.to,
                total: rolesData.roles.total,
            });
        } catch (error) {
            console.error('Error al cargar roles:', error);
            toast.error('Error al cargar los roles');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar permisos
    const loadPermissions = async () => {
        try {
            const { data: permissionsData } = await Api.get<{ data: PermissionsResponse }>('/v1/roles/permissions');
            setPermissions(
                permissionsData.permissions.map((permission: Permission) => ({
                    value: permission.name,
                    label: permission.name.replace(/[._-]/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase()),
                })),
            );
        } catch (error) {
            console.error('Error al cargar permisos:', error);
            toast.error('Error al cargar los permisos');
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        loadRoles();
    }, [filters]);

    useEffect(() => {
        loadPermissions();
    }, []);

    // Manejar cambios en los filtros
    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleSort = (field: string) => {
        setFilters((prev) => ({
            ...prev,
            sort_field: field,
            sort_order: prev.sort_field === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
            page: 1,
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    // Manejar acciones de rol
    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleDelete = async (role: Role) => {
        if (!confirm('¿Está seguro de eliminar este rol?')) return;

        try {
            const { data: response } = await Api.delete<{ data: { success: boolean; message: string } }>(`/v1/roles/${role.id}`);
            if (response.success) {
                toast.success('Rol eliminado exitosamente');
                loadRoles();
            }
        } catch (error) {
            console.error('Error al eliminar rol:', error);
            toast.error('Error al eliminar el rol');
        }
    };

    const handleModalSuccess = () => {
        loadRoles();
        setIsModalOpen(false);
        setSelectedRole(undefined);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: '/roles',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                            <ShieldCheck className="h-6 w-6" />
                            <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Rol
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {/* Filtros */}
                        <div className="mb-6 flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar roles..."
                                        value={filters.search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="relative overflow-x-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                </div>
                            ) : roles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 py-8">
                                    <XCircle className="h-12 w-12 text-muted-foreground" />
                                    <p className="text-lg text-muted-foreground">
                                        {filters.search ? 'No se encontraron resultados' : 'No hay roles registrados'}
                                    </p>
                                    {filters.search ? (
                                        <Button variant="outline" onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}>
                                            Limpiar filtros
                                        </Button>
                                    ) : (
                                        <Button onClick={() => setIsModalOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Crear nuevo rol
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="cursor-pointer px-6 py-3" onClick={() => handleSort('name')}>
                                                Nombre
                                                {filters.sort_field === 'name' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Permisos
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((role) => (
                                            <tr key={role.id} className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">{role.name}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions.map((permission) => (
                                                            <span
                                                                key={permission.name}
                                                                className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                                            >
                                                                {permission.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="outline" size="icon" onClick={() => handleEdit(role)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(role)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Paginación */}
                        {meta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-400">
                                    Mostrando <span className="font-medium">{meta.from}</span> a <span className="font-medium">{meta.to}</span> de{' '}
                                    <span className="font-medium">{meta.total}</span> resultados
                                </div>
                                <div className="flex items-center space-x-2">
                                    {meta.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => link.url && handlePageChange(i)}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <RoleModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRole(undefined);
                    }}
                    role={selectedRole}
                    permissions={permissions}
                    onSuccess={handleModalSuccess}
                />
            </div>
        </AppLayout>
    );
}

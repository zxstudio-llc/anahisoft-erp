import { User, PaginationMeta, ApiResponse, DeleteResponse } from '@/common/interfaces/tenant/users.interface';
import UserModal from '@/components/tenants/create-user-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import Api from '@/lib/api';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, UserCircle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Filters {
    search: string;
    role: string;
    is_active: boolean | null;
    sort_field: string;
    sort_order: string;
    per_page: number;
    page?: number;
}

export default function Index() {
    // Estados
    const [users, setUsers] = useState<User[]>([]);
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
    const [filters, setFilters] = useState<Filters>({
        search: '',
        role: '',
        is_active: null,
        sort_field: 'created_at',
        sort_order: 'desc',
        per_page: 10,
    });
    const [roles, setRoles] = useState<Array<{ value: string; label: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

    // Cargar usuarios
    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await Api.get<ApiResponse>('/v1/users', { params: filters });
            
            if (response.data.success) {
                setUsers(response.data.users.data);
                setMeta({
                    current_page: response.data.users.current_page,
                    from: response.data.users.from,
                    last_page: response.data.users.last_page,
                    links: response.data.users.links,
                    path: response.data.users.path,
                    per_page: response.data.users.per_page,
                    to: response.data.users.to,
                    total: response.data.users.total,
                });
                setRoles(response.data.roles);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            toast.error('Error al cargar los usuarios');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Cargar datos iniciales
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Manejar cambios en los filtros
    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleRoleChange = (value: string) => {
        setFilters((prev) => ({ ...prev, role: value === 'all' ? '' : value, page: 1 }));
    };

    const handleStatusChange = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            is_active: value === 'all' ? null : value === 'active',
            page: 1,
        }));
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

    // Manejar acciones de usuario
    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (user: User) => {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return;

        try {
            const response = await Api.delete<DeleteResponse>(`/v1/users/${user.id}`);
            if (response.data.success) {
                toast.success(response.data.message);
                loadUsers();
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            toast.error('Error al eliminar el usuario');
        }
    };

    const handleModalSuccess = async (updatedUser?: User) => {
        if (updatedUser) {
            // Actualizar el usuario en el estado local
            setUsers(users.map(user => 
                user.id === updatedUser.id ? updatedUser : user
            ));
            toast.success('Usuario actualizado exitosamente');
        } else {
            // Si no hay usuario actualizado, recargar la lista completa
            await loadUsers();
        }
        setIsModalOpen(false);
        setSelectedUser(undefined);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Usuarios',
            href: '/users',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                            <UserCircle className="h-6 w-6" />
                            <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Usuario
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {/* Filtros */}
                        <div className="mb-6 flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar usuarios..."
                                        value={filters.search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <Select value={filters.role || 'all'} onValueChange={handleRoleChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.is_active === null ? 'all' : filters.is_active ? 'active' : 'inactive'}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="active">Activos</SelectItem>
                                    <SelectItem value="inactive">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tabla */}
                        <div className="relative overflow-x-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <UserCircle className="h-12 w-12 text-gray-400" />
                                    {meta.total === 0 ? (
                                        <>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                No hay usuarios registrados
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                Para comenzar a usar el sistema, necesitas crear al menos un usuario.
                                            </p>
                                            <div className="mt-6">
                                                <Button onClick={() => setIsModalOpen(true)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Registrar Primer Usuario
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                No se encontraron resultados
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                No hay usuarios que coincidan con los filtros aplicados.
                                            </p>
                                            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setFilters({
                                                            search: '',
                                                            role: '',
                                                            is_active: null,
                                                            sort_field: 'created_at',
                                                            sort_order: 'desc',
                                                            per_page: 10,
                                                        })
                                                    }
                                                >
                                                    Limpiar filtros
                                                </Button>
                                                <Button onClick={() => setIsModalOpen(true)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Nuevo Usuario
                                                </Button>
                                            </div>
                                        </>
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
                                            <th scope="col" className="cursor-pointer px-6 py-3" onClick={() => handleSort('email')}>
                                                Email
                                                {filters.sort_field === 'email' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Rol
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Estado
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4">{user.roles[0]?.name}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                                            user.is_active
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                        }`}
                                                    >
                                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="outline" size="icon" onClick={() => handleEdit(user)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(user)}>
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
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(undefined);
                }}
                user={selectedUser}
                roles={roles}
                onSuccess={handleModalSuccess}
            />
        </AppLayout>
    );
}

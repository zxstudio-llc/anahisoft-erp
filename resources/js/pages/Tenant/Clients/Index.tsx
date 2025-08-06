import { Client } from '@/common/interfaces/tenant/clients.interface';
import ClientModal from '@/components/tenants/create-client-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import Api from '@/lib/api';
import { Eye, Pencil, Plus, Search, Trash2, UserCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface Filters {
    search: string;
    document_type: string;
    is_active: boolean | null;
    sort_field: string;
    sort_order: string;
    per_page: number;
    page?: number;
}

interface ApiResponse {
    data: {
        success: boolean;
        clients: {
            data: Client[];
            current_page: number;
            from: number;
            last_page: number;
            links: PaginationLink[];
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
        filters: {
            search: string;
            document_type: string | null;
            is_active: boolean | null;
            sort_field: string;
            sort_order: string;
            per_page: number;
        };
        document_types: Array<{
            value: string;
            label: string;
        }>;
    };
}

interface DeleteResponse {
    data: {
        success: boolean;
        message: string;
    };
}

export default function Index() {
    // Estados
    const [clients, setClients] = useState<Client[]>([]);
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
        document_type: '',
        is_active: null,
        sort_field: 'created_at',
        sort_order: 'desc',
        per_page: 10,
    });
    const [documentTypes, setDocumentTypes] = useState<Array<{ value: string; label: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

    // Cargar clientes
    const loadClients = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await Api.get<ApiResponse>('/v1/clients', {
                params: {
                    ...filters,
                    page: filters.page
                }
            });

            const { data } = response;
            if (data.success) {
                setClients(data.clients.data);
                setMeta({
                    current_page: data.clients.current_page,
                    from: data.clients.from,
                    last_page: data.clients.last_page,
                    links: data.clients.links,
                    path: data.clients.path,
                    per_page: data.clients.per_page,
                    to: data.clients.to,
                    total: data.clients.total,
                });
                setDocumentTypes(data.document_types);
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            toast.error('Error al cargar los clientes');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Cargar datos iniciales
    useEffect(() => {
        loadClients();
    }, [loadClients]);

    // Manejadores de filtros
    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };

    const handleDocumentTypeChange = (value: string) => {
        setFilters(prev => ({ ...prev, document_type: value === 'all' ? '' : value, page: 1 }));
    };

    const handleStatusChange = (value: string) => {
        setFilters(prev => ({
            ...prev,
            is_active: value === 'all' ? null : value === 'active',
            page: 1,
        }));
    };

    const handleSort = (field: string) => {
        setFilters(prev => ({
            ...prev,
            sort_field: field,
            sort_order: prev.sort_field === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
            page: 1,
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleDelete = async (client: Client) => {
        if (!confirm('¿Está seguro de eliminar este cliente?')) return;

        try {
            const response = await Api.delete<DeleteResponse>(`/v1/clients/${client.id}`);
            if (response.data.success) {
                toast.success(response.data.message);
                loadClients();
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            toast.error('Error al eliminar el cliente');
        }
    };

    const handleModalSuccess = (client: Client) => {
        loadClients();
        setIsModalOpen(false);
        setSelectedClient(undefined);
    };

    const breadcrumbs = [
        { title: 'Inicio', href: '/' },
        { title: 'Clientes', href: '/clients' },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                            <UserCircle className="h-6 w-6" />
                            <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {/* Filtros */}
                        <div className="mb-6 flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar clientes..."
                                        value={filters.search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <Select value={filters.document_type || 'all'} onValueChange={handleDocumentTypeChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tipo de documento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los tipos</SelectItem>
                                    {documentTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.is_active === null ? 'all' : filters.is_active ? 'active' : 'inactive'}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Estado" />
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
                            ) : clients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <UserCircle className="h-12 w-12 text-gray-400" />
                                    {meta.total === 0 ? (
                                        <>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                No hay clientes registrados
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                Para comenzar a usar el sistema, necesitas registrar al menos un cliente.
                                            </p>
                                            <div className="mt-6">
                                                <Button onClick={() => setIsModalOpen(true)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Registrar Primer Cliente
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                No se encontraron resultados
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                No hay clientes que coincidan con los filtros aplicados.
                                            </p>
                                            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setFilters({
                                                            search: '',
                                                            document_type: '',
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
                                                    Nuevo Cliente
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="cursor-pointer px-6 py-3" onClick={() => handleSort('id')}>
                                                ID
                                                {filters.sort_field === 'id' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th scope="col" className="cursor-pointer px-6 py-3" onClick={() => handleSort('name')}>
                                                Nombre
                                                {filters.sort_field === 'name' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th scope="col" className="px-6 py-3">Documento</th>
                                            <th scope="col" className="px-6 py-3">Email</th>
                                            <th scope="col" className="px-6 py-3">Teléfono</th>
                                            <th scope="col" className="cursor-pointer px-6 py-3" onClick={() => handleSort('created_at')}>
                                                Fecha de Registro
                                                {filters.sort_field === 'created_at' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((client) => (
                                            <tr key={client.id} className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <td className="px-6 py-4">{client.id}</td>
                                                <td className="flex items-center gap-2 px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    <UserCircle className="h-5 w-5" />
                                                    {client.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {client.document_type} - {client.document_number}
                                                </td>
                                                <td className="px-6 py-4">{client.email || '-'}</td>
                                                <td className="px-6 py-4">{client.phone || '-'}</td>
                                                <td className="px-6 py-4">{new Date(client.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedClient(client);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(client)}>
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
                                    Mostrando <span className="font-medium">{meta.from}</span> a{' '}
                                    <span className="font-medium">{meta.to}</span> de{' '}
                                    <span className="font-medium">{meta.total}</span> resultados
                                </div>
                                <div className="flex items-center space-x-2">
                                    {meta.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    const page = new URL(link.url).searchParams.get('page');
                                                    handlePageChange(Number(page));
                                                }
                                            }}
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

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedClient(undefined);
                }}
                client={selectedClient}
                documentTypes={documentTypes}
                onSuccess={handleModalSuccess}
            />
        </AppSidebarLayout>
    );
}

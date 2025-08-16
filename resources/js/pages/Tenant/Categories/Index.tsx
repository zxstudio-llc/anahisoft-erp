import { Category, Filters, CategoriesResponse, ApiResponse, PaginatedCategories } from '@/common/interfaces/tenant/categories.interface';
import CategoryModal from '@/components/tenants/create-category-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import Api from '@/lib/api';
import { FolderTree, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Index() {
    // Estados para los datos
    const [categories, setCategories] = useState<Category[]>([]);
    const [meta, setMeta] = useState<Omit<PaginatedCategories, 'data'>>({
        current_page: 1,
        first_page_url: '',
        from: 0,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        per_page: 10,
        prev_page_url: null,
        to: 0,
        total: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para filtros
    const [filters, setFilters] = useState<Filters>({
        search: '',
        is_active: null,
        sort_field: 'name',
        sort_order: 'asc',
        per_page: 10,
    });

    // Estados para el modal
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

    // Cargar datos iniciales
    useEffect(() => {
        loadCategories();
    }, [filters]);

    // Función para cargar categorías
    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const apiFilters = {
                ...filters,
                is_active: filters.is_active === null ? '' : filters.is_active ? 'true' : 'false',
            };
            
            const response = await Api.get<ApiResponse<CategoriesResponse>>('/v1/categories', { params: apiFilters });
            const { categories: paginatedCategories } = response.data;

            setCategories(paginatedCategories.data || []);
            setMeta({
                current_page: paginatedCategories.current_page,
                first_page_url: paginatedCategories.first_page_url,
                from: paginatedCategories.from || 0,
                last_page: paginatedCategories.last_page,
                last_page_url: paginatedCategories.last_page_url,
                links: paginatedCategories.links,
                next_page_url: paginatedCategories.next_page_url,
                path: paginatedCategories.path,
                per_page: paginatedCategories.per_page,
                prev_page_url: paginatedCategories.prev_page_url,
                to: paginatedCategories.to || 0,
                total: paginatedCategories.total,
            });
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            setError('Error al cargar las categorías');
            toast.error('Error al cargar las categorías');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadCategories();
    };

    const handleSort = (field: string) => {
        setFilters((prev: Filters) => ({
            ...prev,
            sort_field: field,
            sort_order: prev.sort_field === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleDelete = async (categoryId: number, productsCount: number) => {
        if (productsCount > 0) {
            toast.error('No se puede eliminar esta categoría porque tiene productos asociados');
            return;
        }

        if (confirm('¿Está seguro de eliminar esta categoría?')) {
            try {
                await Api.delete(`/v1/categories/${categoryId}`);
                setCategories((prevCategories) => prevCategories.filter((c) => c.id !== categoryId));
                toast.success('Categoría eliminada exitosamente');
            } catch (error) {
                console.error('Error al eliminar la categoría:', error);
                toast.error('Error al eliminar la categoría');
            }
        }
    };

    const handlePageChange = (url: string) => {
        if (!url) return;

        // Extraer parámetros de la URL de paginación
        const urlObj = new URL(url);
        const page = urlObj.searchParams.get('page');

        if (page) {
            setFilters((prev: Filters) => ({
                ...prev,
                page: parseInt(page),
            }));
        }
    };

    // Abrir modal para crear una nueva categoría
    const openCreateModal = () => {
        setSelectedCategory(undefined);
        setCategoryModalOpen(true);
    };

    // Abrir modal para editar una categoría existente
    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setCategoryModalOpen(true);
    };

    // Cerrar el modal
    const closeModal = () => {
        setSelectedCategory(undefined);
        setCategoryModalOpen(false);
    };

    // Manejar el éxito en la creación/actualización de categorías
    const handleCategorySuccess = async (category: Category, isEdit: boolean = false) => {
        try {
            // Recargar todas las categorías para obtener la información más actualizada
            await loadCategories();

            // Mostrar alerta según el tipo de operación
            if (isEdit) {
                toast.success('Categoría actualizada exitosamente');
            } else {
                toast.success('Categoría creada exitosamente');
            }
        } catch (error) {
            console.error('Error al recargar categorías:', error);
            toast.error('Operación exitosa, pero hubo un error al actualizar la lista');
        }

        closeModal();
    };

    const breadcrumbs = [
        { title: 'Inicio', href: '/' },
        { title: 'Categorías', href: '/categories' },
    ];

    if (error) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="p-4 text-center text-red-500">{error}</div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categorías</h1>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Categoría
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar categorías..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                    value={filters.search || ''}
                                    onChange={(e) => setFilters((prev: Filters) => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={filters.is_active === null ? '' : filters.is_active ? 'true' : 'false'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFilters((prev: Filters) => ({
                                        ...prev,
                                        is_active: value === '' ? null : value === 'true',
                                    }));
                                }}
                            >
                                <option value="">Todos los estados</option>
                                <option value="true">Activos</option>
                                <option value="false">Inactivos</option>
                            </select>
                            <Button type="submit" variant="secondary">
                                Buscar
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('id')}>
                                                ID
                                                {filters.sort_field === 'id' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('name')}>
                                                Nombre
                                                {filters.sort_field === 'name' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="px-4 py-3">Descripción</th>
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('products_count')}>
                                                Productos
                                                {filters.sort_field === 'products_count' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('is_active')}>
                                                Estado
                                                {filters.sort_field === 'is_active' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : categories.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-4">
                                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                                        <FolderTree className="h-12 w-12 text-gray-400" />
                                                        {meta.total === 0 ? (
                                                            <>
                                                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    No hay categorías registradas
                                                                </h3>
                                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                    Para comenzar a usar el sistema, necesitas registrar al menos una categoría.
                                                                </p>
                                                                <div className="mt-6">
                                                                    <Button onClick={openCreateModal}>
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Registrar Primera Categoría
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    No se encontraron resultados
                                                                </h3>
                                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                    No hay categorías que coincidan con los filtros aplicados.
                                                                </p>
                                                                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            setFilters({
                                                                                search: '',
                                                                                is_active: null,
                                                                                sort_field: 'name',
                                                                                sort_order: 'asc',
                                                                                per_page: 10,
                                                                            })
                                                                        }
                                                                    >
                                                                        Limpiar filtros
                                                                    </Button>
                                                                    <Button onClick={openCreateModal}>
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Nueva Categoría
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            categories.map((category) => (
                                                <tr key={category.id} className="border-t">
                                                    <td className="px-4 py-3">{category.id}</td>
                                                    <td className="flex items-center gap-2 px-4 py-3">
                                                        <FolderTree className="h-5 w-5 text-muted-foreground" />
                                                        {category.name}
                                                    </td>
                                                    <td className="px-4 py-3">{category.description || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
                                                            {category.products_count || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                category.is_active
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                                                            }`}
                                                        >
                                                            {category.is_active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(category)}>
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Editar</span>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500"
                                                                onClick={() => handleDelete(category.id, category.products_count || 0)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Eliminar</span>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {meta.last_page > 1 && (
                                <div className="flex items-center justify-between border-t px-4 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Mostrando {meta.from} a {meta.to} de {meta.total} resultados
                                    </div>
                                    <div className="flex gap-1">
                                        {meta.links &&
                                            meta.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && handlePageChange(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de creación/edición de categoría */}
            <CategoryModal isOpen={isCategoryModalOpen} onClose={closeModal} category={selectedCategory} onSuccess={handleCategorySuccess} />
        </AppSidebarLayout>
    );
}

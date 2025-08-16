import { Category, Currency, IgvType, Product, ProductsResponse, UnitType } from '@/common/interfaces/tenant/products.interface';
import ProductModal from '@/components/tenants/create-product-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import Api from '@/lib/api';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Index() {
    // Estados para los datos
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [igvTypes, setIgvTypes] = useState<IgvType[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalProducts, setTotalProducts] = useState(0);

    // Estados para filtros
    const [filters, setFilters] = useState({
        search: '',
        category_id: null as string | null,
        sort_field: 'name',
        sort_order: 'asc' as 'asc' | 'desc',
    });

    // Estados para el modal
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

    // Cargar datos iniciales
    useEffect(() => {
        loadProducts();
    }, [filters]);

    // Función para cargar productos y datos relacionados
    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const responseData = await Api.get<{ data: ProductsResponse }>('/v1/products', { params: filters });
            setProducts(responseData.data.products.data || []);
            setTotalProducts(responseData.data.products.total);
            setCategories(responseData.data.categories || []);
            setUnitTypes(responseData.data.unit_types || []);
            setIgvTypes(responseData.data.igv_types || []);
            setCurrencies(responseData.data.currencies || []);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setError('Error al cargar los productos');
            toast.error('Error al cargar los productos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters((prev) => ({
            ...prev,
            search: prev.search,
            category_id: prev.category_id,
        }));
    };

    const handleSort = (field: string) => {
        setFilters((prev) => ({
            ...prev,
            sort_field: field,
            sort_order: prev.sort_field === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
        }));
    };

    // Abrir modal para crear un nuevo producto
    const openCreateModal = () => {
        setSelectedProduct(undefined);
        setProductModalOpen(true);
    };

    // Abrir modal para editar un producto existente
    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    // Cerrar el modal
    const closeModal = () => {
        setSelectedProduct(undefined);
        setProductModalOpen(false);
    };

    // Manejar el éxito en la creación/actualización de productos
    const handleProductSuccess = async (product: Product, isEdit: boolean = false) => {
        try {
            console.log(isEdit);
            // Recargar todos los productos para obtener la información más actualizada
            await loadProducts();

            // Mostrar alerta según el tipo de operación
            if (isEdit) {
                toast.success('Producto actualizado exitosamente');
            } else {
                toast.success('Producto creado exitosamente');
            }
        } catch (error) {
            console.error('Error al recargar productos:', error);
            toast.error('Operación exitosa, pero hubo un error al actualizar la lista');
        }

        closeModal();
    };

    const handleDelete = async (productId: number) => {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            try {
                await Api.delete(`/v1/products/${productId}`);
                setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
                toast.success('Producto eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
                toast.error('Error al eliminar el producto');
            }
        }
    };

    const breadcrumbs = [
        { title: 'Inicio', href: '/' },
        { title: 'Productos', href: '/products' },
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
                    <h1 className="text-2xl font-bold">Productos</h1>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar productos..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                    value={filters.search}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={filters.category_id || ''}
                                onChange={(e) => setFilters((prev) => ({ ...prev, category_id: e.target.value || null }))}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
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
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('code')}>
                                                Código
                                                {filters.sort_field === 'code' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('name')}>
                                                Producto
                                                {filters.sort_field === 'name' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('price')}>
                                                Precio
                                                {filters.sort_field === 'price' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('stock')}>
                                                Stock
                                                {filters.sort_field === 'stock' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="px-4 py-3">Categoría</th>
                                            <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('created_at')}>
                                                Fecha de Registro
                                                {filters.sort_field === 'created_at' && (
                                                    <span className="ml-1">{filters.sort_order === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : products.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-4">
                                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                                        <Package className="h-12 w-12 text-gray-400" />
                                                        {totalProducts === 0 ? (
                                                            <>
                                                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    No hay productos registrados
                                                                </h3>
                                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                    Para comenzar a usar el sistema, necesitas registrar al menos un producto.
                                                                </p>
                                                                <div className="mt-6">
                                                                    <Button onClick={openCreateModal}>
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Registrar Primer Producto
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    No se encontraron resultados
                                                                </h3>
                                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                    No hay productos que coincidan con los filtros aplicados.
                                                                </p>
                                                                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            setFilters({
                                                                                search: '',
                                                                                category_id: null,
                                                                                sort_field: 'name',
                                                                                sort_order: 'asc',
                                                                            })
                                                                        }
                                                                    >
                                                                        Limpiar filtros
                                                                    </Button>
                                                                    <Button onClick={openCreateModal}>
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Nuevo Producto
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product) => (
                                                <tr key={product.id} className="border-t">
                                                    <td className="px-4 py-3">{product.id}</td>
                                                    <td className="px-4 py-3">{product.code}</td>
                                                    <td className="flex items-center gap-2 px-4 py-3">
                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                        {product.name}
                                                    </td>
                                                    <td className="px-4 py-3">S/ {Number(product.price).toFixed(2)}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                product.stock > 10
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                                                                    : product.stock > 0
                                                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                                                                      : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                                                            }`}
                                                        >
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {product.category ? (
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
                                                                {product.category.name}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">{new Date(product.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}>
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Editar</span>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500"
                                                                onClick={() => handleDelete(product.id)}
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
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de creación/edición de producto */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={closeModal}
                categories={categories}
                unitTypes={unitTypes}
                igvTypes={igvTypes}
                currencies={currencies}
                product={selectedProduct}
                onSuccess={handleProductSuccess}
            />
        </AppSidebarLayout>
    );
}

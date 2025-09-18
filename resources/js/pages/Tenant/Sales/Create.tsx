import { Customer, Product } from '@/common/interfaces/tenant/sales.interface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import Api from '@/lib/api';
import { toast } from 'sonner';
import SaleSuccessModal from '@/components/modals/sale-success-modal';
import { Calculator, CreditCard, Minus, Package, Plus, Receipt, Search, ShoppingCart, Trash2, User, Settings, Store, ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AppPosLayout from '@/layouts/app/app-pos-layout';

interface CreateProps {
    clients: Customer[];
    products?: Product[];
}

export default function Create({ clients = [], products = [] }: CreateProps) {
    const [formData, setFormData] = useState({
        customer_id: '',
        products: [] as Array<{ id: number; quantity: number }>,
        document_type: '01', // 01: Factura, 03: Liquidación de Compra
        is_electronic: true,
    });

    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [totals, setTotals] = useState({
        subtotal_12: 0,    // Subtotal with 15% IVA (Ecuador)
        subtotal_0: 0,     // Subtotal with 0% IVA
        iva: 0,            // IVA amount
        ice: 0,            // ICE amount
        total: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [saleResult, setSaleResult] = useState<{
        sale: {
            id: number;
            type: 'sale' | 'purchase';
            document_type: '01' | '03';
            document_type_name: string;
            total: number;
            subtotal_12: number;
            subtotal_0: number;
            iva: number;
            ice: number;
            status: 'draft' | 'issued' | 'authorized' | 'rejected' | 'canceled';
            customer?: Customer | null;
            details: Array<{
                id: number;
                product?: Product | null;
                quantity: number;
                unit_price: number;
                subtotal: number;
                iva: number;
                ice: number;
                total: number;
            }>;
            xml_path?: string | null;
            pdf_path?: string | null;
            cdr_path?: string | null;
        };
        can_download_pdf: boolean;
        can_download_xml: boolean;
        can_download_cdr: boolean;
    } | null>(null);

    const breadcrumbs = [
        { title: 'Inicio', href: '/' },
        { title: 'Ventas', href: '/sales' },
        { title: 'Nueva Venta', href: '/sales/create' },
    ];

    const calculateTotals = useCallback(() => {
        let subtotal_12 = 0;
        let subtotal_0 = 0;
        let iva = 0;
        let ice = 0;
        let total = 0;

        selectedProducts.forEach((product) => {
            const quantity = formData.products.find((p) => p.id === product.id)?.quantity || 0;
            const unitPrice = product.unit_price || 0;
            const productSubtotal = unitPrice * quantity;

            if (product.has_igv) {
                subtotal_12 += productSubtotal;
                const ivaAmount = productSubtotal * (product.igv_percentage / 100);
                iva += ivaAmount;
                total += productSubtotal + ivaAmount;
            } else {
                // Product with 0% IVA
                subtotal_0 += productSubtotal;
                total += productSubtotal;
            }

            if (product.ice_rate) {
                const iceAmount = productSubtotal * (parseFloat(product.ice_rate) / 100);
                ice += iceAmount;
                total += iceAmount;
            }
        });

        setTotals({ subtotal_12, subtotal_0, iva, ice, total });
    }, [selectedProducts, formData.products]);

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    useEffect(() => {
        if (formData.customer_id && clients.length > 0) {
            const client = clients.find((c) => c.id.toString() === formData.customer_id);
            setSelectedClient(client || null);
        } else {
            setSelectedClient(null);
        }
    }, [formData.customer_id, clients]);

    const addProductToCart = (product: Product) => {
        const isService = product.item_type === 'service';
        const existingIndex = formData.products.findIndex((p) => p.id === product.id);

        if (existingIndex >= 0) {
            const currentQuantity = formData.products[existingIndex].quantity;

            // ✅ CORRECCIÓN: Solo validar stock para productos físicos
            if (!isService && currentQuantity >= product.stock) {
                toast.error('Stock insuficiente', {
                    description: `Solo hay ${product.stock} unidades disponibles de ${product.name}`
                });
                return;
            }

            setFormData((prev) => ({
                ...prev,
                products: prev.products.map((p, i) => (i === existingIndex ? { ...p, quantity: p.quantity + 1 } : p)),
            }));

            const newQuantity = formData.products[existingIndex].quantity + 1;
            toast.success(`Cantidad actualizada: ${product.name}`, {
                description: `Nueva cantidad: ${newQuantity}`
            });
        } else {
            // ✅ CORRECCIÓN: Solo validar stock para productos físicos
            if (!isService && product.stock <= 0) {
                toast.error('Sin stock', {
                    description: `No hay unidades disponibles de ${product.name}`
                });
                return;
            }

            setFormData((prev) => ({
                ...prev,
                products: [...prev.products, { id: product.id, quantity: 1 }],
            }));
            setSelectedProducts((prev) => [...prev, product]);
            toast.success(`${isService ? 'Servicio' : 'Producto'} agregado: ${product.name}`, {
                description: `Se ha añadido ${isService ? 'el servicio' : 'el producto'} al carrito`
            });
        }
    };

    const updateProductQuantity = (productId: number, newQuantity: number) => {
        const product = selectedProducts.find(p => p.id === productId);

        if (newQuantity <= 0) {
            removeProductFromCart(productId);
            return;
        }

        const isService = product?.item_type === 'service';

        // ✅ CORRECCIÓN: Solo validar stock para productos físicos
        if (product && !isService && newQuantity > product.stock) {
            toast.error('Stock insuficiente', {
                description: `Solo hay ${product.stock} unidades disponibles`
            });
            return;
        }

        setFormData((prev) => ({
            ...prev,
            products: prev.products.map((p) => (p.id === productId ? { ...p, quantity: newQuantity } : p)),
        }));
    };

    const removeProductFromCart = (productId: number) => {
        const product = selectedProducts.find(p => p.id === productId);

        setFormData((prev) => ({
            ...prev,
            products: prev.products.filter((p) => p.id !== productId),
        }));
        setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));

        if (product) {
            const itemType = product.item_type === 'service' ? 'Servicio' : 'Producto';
            toast.info(`${itemType} eliminado: ${product.name}`, {
                description: `${itemType} removido del carrito`
            });
        }
    };

    const filteredProducts = products.filter(
        (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.id.toString().includes(searchTerm),
    );

    const clearCart = () => {
        const productCount = selectedProducts.length;

        setFormData((prev) => ({ ...prev, products: [] }));
        setSelectedProducts([]);

        if (productCount > 0) {
            toast.info('Carrito limpiado', {
                description: `Se eliminaron ${productCount} item${productCount !== 1 ? 's' : ''} del carrito`
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customer_id) {
            toast.error('Selecciona un cliente para continuar');
            return;
        }

        if (selectedProducts.length === 0) {
            toast.error('Agrega al menos un producto o servicio al carrito');
            return;
        }

        setIsSubmitting(true);
        toast.loading('Procesando venta...', { id: 'sale-processing' });

        try {
            const response = await Api.post('/v1/sales', formData);

            toast.success('¡Venta procesada exitosamente!', {
                id: 'sale-processing',
                description: 'La venta ha sido registrada correctamente'
            });

            // Guardar resultado para el modal
            const responseData = response.data as { data: typeof saleResult };
            setSaleResult(responseData.data);
            setShowSuccessModal(true);

            // Limpiar el formulario después del éxito
            setFormData({
                customer_id: '',
                products: [],
                document_type: '01',
                is_electronic: true,
            });
            setSelectedProducts([]);
            setSelectedClient(null);

        } catch (error: unknown) {
            console.error('Error al procesar la venta:', error);

            let errorMessage = 'Error desconocido al procesar la venta';
            if (error && typeof error === 'object' && 'response' in error) {
                const errorResponse = error.response as { data?: { message?: string } };
                errorMessage = errorResponse.data?.message || 'Error en el servidor';
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error('Error al procesar la venta', {
                id: 'sale-processing',
                description: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add loading state if data is not available
    if (!clients || !products) {
        return (
            <AppPosLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando datos...</p>
                    </div>
                </div>
            </AppPosLayout>
        );
    }

    return (
        <AppPosLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-1 gap-4 overflow-hidden">
                    {/* Panel Izquierdo - Productos y Servicios */}
                    <div className="flex flex-1 flex-col rounded-lg border bg-card">
                        {/* Header */}
                        <div className="border-b p-6">
                            <div className="mb-4 flex items-center">
                                {/* Botón de volver */}
                                <Button
                                    variant="default"
                                    size="icon"
                                    onClick={() => window.history.back()}
                                    className="mr-2"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Store className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">Punto de Venta</h1>
                                        <p className="text-sm text-muted-foreground">Selecciona productos y servicios para agregar a la venta</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buscador de productos */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    placeholder="Buscar productos o servicios por nombre o código..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Grid de productos */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                                {filteredProducts.map((product) => {
                                    const isService = product.item_type === 'service';
                                    return (
                                        <Card
                                            key={product.id}
                                            className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1"
                                            onClick={() => addProductToCart(product)}
                                        >
                                            <CardContent className="p-4 relative overflow-hidden">
                                                <div className="flex flex-col items-center space-y-3 text-center relative z-10">
                                                    <div className={`rounded-full p-3 transition-all duration-200 group-hover:scale-110 ${isService
                                                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300'
                                                        : 'bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30'
                                                        }`}>
                                                        {isService ? (
                                                            <Settings className={`h-6 w-6 transition-transform duration-200 group-hover:rotate-12 ${isService ? 'text-blue-600' : 'text-primary'
                                                                }`} />
                                                        ) : (
                                                            <Package className="h-6 w-6 text-primary transition-transform duration-200 group-hover:rotate-12" />
                                                        )}
                                                    </div>
                                                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium transition-colors duration-200 group-hover:text-primary">{product.name}</h3>
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-bold text-foreground transition-all duration-200 group-hover:scale-105">{formatCurrency(product.unit_price)}</p>
                                                        <div className="flex flex-col items-center gap-1">
                                                            {/* Tipo de item */}
                                                            <Badge variant={isService ? "default" : "secondary"} className={`text-xs transition-all duration-200 group-hover:scale-105 ${isService
                                                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                                : 'group-hover:bg-primary/10 group-hover:text-primary'
                                                                }`}>
                                                                {isService ? 'Servicio' : `Stock: ${product.stock || 'N/A'}`}
                                                            </Badge>

                                                            {/* IVA Badge */}
                                                            {product.has_igv ? (
                                                                <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                                                    IVA {product.igv_percentage}%
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                                                                    IVA 0%
                                                                </Badge>
                                                            )}

                                                            {/* ICE Badge si aplica */}
                                                            {product.ice_rate && parseFloat(product.ice_rate) > 0 && (
                                                                <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                                                                    ICE {product.ice_rate}%
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                                    <Package className="mb-4 h-12 w-12" />
                                    <p>No se encontraron productos o servicios</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel Derecho - Carrito y Checkout */}
                    <div className="flex lg:w-64 xl:w-96 flex-col rounded-lg border bg-card">
                        <form onSubmit={handleSubmit} className="flex h-full flex-col">
                            {/* Header del carrito */}
                            <div className="border-b px-3 py-2">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <Receipt className="h-5 w-5 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Carrito de Compras</h2>
                                    </div>
                                    {selectedProducts.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearCart}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />
                                            Limpiar
                                        </Button>
                                    )}
                                </div>

                                {/* Selección de cliente */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                        <User className="h-4 w-4" />
                                        Cliente
                                    </Label>
                                    {/* Mensaje de validación */}
                                    {selectedProducts.length > 0 && !formData.customer_id && (
                                        <Label className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>Selecciona un cliente para continuar</span>
                                        </Label>
                                    )}
                                    <Select
                                        value={formData.customer_id}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, customer_id: value }))}
                                    >
                                        <SelectTrigger className="h-auto min-h-[40px] py-2">
                                            <SelectValue placeholder="Seleccionar cliente">
                                                {selectedClient && (
                                                    <div className="flex flex-col items-start text-left w-full">
                                                        <span className="font-medium text-sm truncate w-full">{selectedClient.business_name}</span>
                                                        <span className="text-xs text-muted-foreground">{selectedClient.identification}</span>
                                                    </div>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="">
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id.toString()} className="py-3">
                                                    <div className="flex flex-col items-start w-full">
                                                        <span className="font-medium text-sm">{client.business_name}</span>
                                                        <span className="text-xs text-muted-foreground">{client.identification}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Lista de productos en el carrito */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <div className="border-b px-3 py-2 flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-muted-foreground">ITEMS SELECCIONADOS</h3>
                                    {selectedProducts.length > 0 && (
                                        <Badge variant="secondary">
                                            {selectedProducts.length} {selectedProducts.length === 1 ? 'item' : 'items'}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
                                    {selectedProducts.length === 0 ? (
                                        <div className="flex h-32 flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
                                            <div className="rounded-full bg-muted/50 p-4 mb-3 animate-pulse">
                                                <ShoppingCart className="h-8 w-8" />
                                            </div>
                                            <p className="text-sm font-medium">Carrito vacío</p>
                                            <p className="text-xs">Selecciona productos o servicios para agregar</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 py-2 w-full">
                                            {selectedProducts.map((product) => {
                                                const cartItem = formData.products.find((p) => p.id === product.id);
                                                const quantity = cartItem?.quantity || 0;
                                                const subtotal = product.unit_price * quantity;
                                                const ivaAmount = product.has_igv ? subtotal * (product.igv_percentage / 100) : 0;
                                                const iceAmount = product.ice_rate ? subtotal * (parseFloat(product.ice_rate) / 100) : 0;
                                                const total = subtotal + ivaAmount + iceAmount;
                                                const isService = product.item_type === 'service';

                                                return (
                                                    <div
                                                        key={product.id}
                                                        className="group rounded-lg border bg-white p-3 transition-all duration-200 hover:shadow-md hover:border-primary/20"
                                                        >
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="line-clamp-2 text-sm font-medium transition-colors duration-200 group-hover:text-primary">{product.name}</h4>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {/* Tipo de item */}
                                                                    <Badge variant={isService ? "default" : "secondary"} className={`text-xs ${isService
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {isService ? 'Servicio' : 'Producto'}
                                                                    </Badge>

                                                                    {/* IVA Badge */}
                                                                    {product.has_igv ? (
                                                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                                            IVA {product.igv_percentage}%
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                                            IVA 0%
                                                                        </span>
                                                                    )}

                                                                    {/* ICE Badge si aplica */}
                                                                    {product.ice_rate && parseFloat(product.ice_rate) > 0 && (
                                                                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                                                            ICE {product.ice_rate}%
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeProductFromCart(product.id)}
                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateProductQuantity(product.id, quantity - 1)}
                                                                    className="h-7 w-7 p-0 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:border-primary/30"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-10 text-center text-sm font-bold bg-muted/30 rounded px-2 py-1 transition-all duration-200">{quantity}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateProductQuantity(product.id, quantity + 1)}
                                                                    className="h-7 w-7 p-0 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:border-primary/30"
                                                                    // ✅ No deshabilitar para servicios
                                                                    disabled={!isService && quantity >= product.stock}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-muted-foreground">{formatCurrency(product.unit_price)} c/u</p>
                                                                <p className="text-sm font-bold text-primary transition-all duration-200 group-hover:scale-105">{formatCurrency(total)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Configuración de facturación */}
                            <div className="border-t border-b px-3 py-2">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ">
                                        <Label className="flex items-center text-sm font-medium gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Comprobante Electrónico
                                        </Label>
                                        <Switch
                                            checked={formData.is_electronic}
                                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_electronic: checked }))}
                                        />
                                    </div>
                                    <Select
                                        value={formData.document_type}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, document_type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="01">Factura</SelectItem>
                                            <SelectItem value="03">Liquidación de Compra</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Totales */}
                            <div className="border-t px-3 py-2 bg-gradient-to-r from-muted/30 to-muted/10">
                                <div className="space-y-2">
                                    {totals.subtotal_12 > 0 && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span className="font-medium">Subtotal 15%:</span>
                                            <span className="font-semibold">{formatCurrency(totals.subtotal_12)}</span>
                                        </div>
                                    )}
                                    {totals.subtotal_0 >= 0 && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span className="font-medium">Subtotal 0%:</span>
                                            <span className="font-semibold">{formatCurrency(totals.subtotal_0)}</span>
                                        </div>
                                    )}
                                    {totals.iva > 0 && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span className="font-medium">I.V.A:</span>
                                            <span className="font-semibold">{formatCurrency(totals.iva)}</span>
                                        </div>
                                    )}
                                    {totals.ice >= 0 && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span className="font-medium">I.C.E:</span>
                                            <span className="font-semibold">{formatCurrency(totals.ice)}</span>
                                        </div>
                                    )}
                                    <Separator className="my-3" />
                                    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                                        <span className="text-lg font-bold text-primary">Total:</span>
                                        <span className="text-xl font-black text-primary">{formatCurrency(totals.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="p-4 space-x-3 grid grid-cols-2 gap-2">
                                <Button
                                    className="w-full h-10 text-base font-semibold px-3 py-2 gap-2"
                                    disabled={selectedProducts.length === 0 || !formData.customer_id || isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-5 w-5" />
                                            Procesar Venta
                                        </>
                                    )}
                                </Button>

                                {selectedProducts.length > 0 && (
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 px-3 py-2 gap-2 text-base font-medium transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                                        onClick={() => console.log('Guardar como borrador')}
                                    >
                                        <Calculator className="h-4 w-4" />
                                        Guardar Borrador
                                    </Button>
                                )}
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            {/* Modal de éxito */}
            {saleResult && (
                <SaleSuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => {
                        setShowSuccessModal(false);
                        setSaleResult(null);
                    }}
                    sale={saleResult.sale}
                    canDownloadPdf={saleResult.can_download_pdf}
                    canDownloadXml={saleResult.can_download_xml}
                    canDownloadCdr={saleResult.can_download_cdr}
                />
            )}
        </AppPosLayout>
    );
}
import { Client, Product, Settings } from '@/common/interfaces/tenant/sales.interface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency } from '@/lib/utils';
import Api from '@/lib/api';
import { toast } from 'sonner';
import SaleSuccessModal from '@/components/modals/sale-success-modal';
import { Calculator, CreditCard, Minus, Package, Plus, Receipt, Search, ShoppingCart, Trash2, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface CreateProps {
    clients: Client[];
    products: Product[];
    settings: Settings;
}

export default function Create({ clients, products }: CreateProps) {
    const [formData, setFormData] = useState({
        client_id: '',
        products: [] as Array<{ id: number; quantity: number }>,
        document_type: '01', // 01: Factura, 03: Boleta
        is_electronic: true,
    });

    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [totals, setTotals] = useState({
        subtotal: 0,
        igv: 0,
        total: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [saleResult, setSaleResult] = useState<{
        sale: {
            id: number;
            document_number: string;
            document_type: string;
            document_type_name: string;
            total: number;
            subtotal: number;
            igv: number;
            sunat_state: string;
            client: {
                id: number;
                name: string;
                email?: string;
                phone?: string;
                document_number: string;
            };
            products: Array<{
                id: number;
                name: string;
                pivot: {
                    quantity: number;
                    price: number;
                    total: number;
                };
            }>;
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
        let subtotal = 0;
        let igv = 0;
        let total = 0;

        selectedProducts.forEach((product) => {
            const quantity = formData.products.find((p) => p.id === product.id)?.quantity || 0;
            const price = product.price || 0;
            
            // Calcular subtotal (precio sin IGV)
            const priceWithoutIgv = price / 1.18; // Precio sin IGV (dividir entre 1.18)
            const igvAmount = price - priceWithoutIgv; // IGV es la diferencia
            
            subtotal += priceWithoutIgv * quantity;
            igv += igvAmount * quantity;
            total += price * quantity;
        });

        setTotals({ subtotal, igv, total });
    }, [selectedProducts, formData.products]);

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    useEffect(() => {
        if (formData.client_id) {
            const client = clients.find((c) => c.id.toString() === formData.client_id);
            setSelectedClient(client || null);
        } else {
            setSelectedClient(null);
        }
    }, [formData.client_id, clients]);

    const addProductToCart = (product: Product) => {
        const existingIndex = formData.products.findIndex((p) => p.id === product.id);

        if (existingIndex >= 0) {
            // Verificar si hay suficiente stock
            const currentQuantity = formData.products[existingIndex].quantity;
            if (currentQuantity >= product.stock) {
                toast.error('Stock insuficiente', {
                    description: `Solo hay ${product.stock} unidades disponibles de ${product.name}`
                });
                return;
            }
            
            // Si el producto ya existe, incrementar cantidad
            setFormData((prev) => ({
                ...prev,
                products: prev.products.map((p, i) => (i === existingIndex ? { ...p, quantity: p.quantity + 1 } : p)),
            }));
            toast.success(`Cantidad actualizada: ${product.name}`, {
                description: `Nueva cantidad: ${formData.products[existingIndex].quantity + 1}`
            });
        } else {
            // Verificar si hay stock disponible
            if (product.stock <= 0) {
                toast.error('Sin stock', {
                    description: `No hay unidades disponibles de ${product.name}`
                });
                return;
            }
            
            // Si es nuevo, agregarlo
            setFormData((prev) => ({
                ...prev,
                products: [...prev.products, { id: product.id, quantity: 1 }],
            }));
            setSelectedProducts((prev) => [...prev, product]);
            toast.success(`Producto agregado: ${product.name}`, {
                description: 'El producto se ha añadido al carrito'
            });
        }
    };

    const updateProductQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeProductFromCart(productId);
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
            toast.info(`Producto eliminado: ${product.name}`, {
                description: 'El producto se ha removido del carrito'
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
                description: `Se eliminaron ${productCount} producto${productCount !== 1 ? 's' : ''} del carrito`
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.client_id) {
            toast.error('Selecciona un cliente para continuar');
            return;
        }
        
        if (selectedProducts.length === 0) {
            toast.error('Agrega al menos un producto al carrito');
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
                client_id: '',
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

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-1 gap-4 overflow-hidden">
                    {/* Panel Izquierdo - Productos */}
                    <div className="flex flex-1 flex-col rounded-lg border bg-card">
                        {/* Header */}
                        <div className="border-b p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <ShoppingCart className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Punto de Venta</h1>
                                    <p className="text-sm text-muted-foreground">Selecciona productos para agregar a la venta</p>
                                </div>
                            </div>

                            {/* Buscador de productos */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    placeholder="Buscar productos por nombre o código..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Grid de productos */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1"
                                        onClick={() => addProductToCart(product)}
                                    >
                                        <CardContent className="p-4 relative overflow-hidden">
                                            <div className="flex flex-col items-center space-y-3 text-center relative z-10">
                                                <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/20 p-3 transition-all duration-200 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/30">
                                                    <Package className="h-6 w-6 text-primary transition-transform duration-200 group-hover:rotate-12" />
                                                </div>
                                                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium transition-colors duration-200 group-hover:text-primary">{product.name}</h3>
                                                <div className="space-y-2">
                                                    <p className="text-lg font-bold text-foreground transition-all duration-200 group-hover:scale-105">{formatCurrency(product.price)}</p>
                                                    <Badge variant="secondary" className="text-xs transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                                                        Stock: {product.stock || 'N/A'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                                    <Package className="mb-4 h-12 w-12" />
                                    <p>No se encontraron productos</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel Derecho - Carrito y Checkout */}
                    <div className="flex w-96 flex-col rounded-lg border bg-card">
                        <form onSubmit={handleSubmit} className="flex h-full flex-col">
                            {/* Header del carrito */}
                            <div className="border-b p-6">
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
                                    <Select
                                        value={formData.client_id}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, client_id: value }))}
                                    >
                                        <SelectTrigger className="h-auto min-h-[40px] py-2">
                                            <SelectValue placeholder="Seleccionar cliente">
                                                {selectedClient && (
                                                    <div className="flex flex-col items-start text-left w-full">
                                                        <span className="font-medium text-sm truncate w-full">{selectedClient.name}</span>
                                                        <span className="text-xs text-muted-foreground">{selectedClient.document_number}</span>
                                                    </div>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-w-[300px]">
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id.toString()} className="py-3">
                                                    <div className="flex flex-col items-start w-full">
                                                        <span className="font-medium text-sm">{client.name}</span>
                                                        <span className="text-xs text-muted-foreground">{client.document_number}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Lista de productos en el carrito */}
                            <div className="flex-1 overflow-hidden">
                                <div className="border-b p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-muted-foreground">PRODUCTOS SELECCIONADOS</h3>
                                        {selectedProducts.length > 0 && (
                                            <Badge variant="secondary">
                                                {selectedProducts.length} {selectedProducts.length === 1 ? 'producto' : 'productos'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-4">
                                    {selectedProducts.length === 0 ? (
                                        <div className="flex h-32 flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
                                            <div className="rounded-full bg-muted/50 p-4 mb-3 animate-pulse">
                                                <ShoppingCart className="h-8 w-8" />
                                            </div>
                                            <p className="text-sm font-medium">Carrito vacío</p>
                                            <p className="text-xs">Selecciona productos para agregar</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 py-4">
                                            {selectedProducts.map((product) => {
                                                const cartItem = formData.products.find((p) => p.id === product.id);
                                                const quantity = cartItem?.quantity || 0;
                                                const subtotal = product.price * quantity;

                                                return (
                                                    <div 
                                                        key={product.id} 
                                                        className="group rounded-lg border bg-white p-3 transition-all duration-200 hover:shadow-md hover:border-primary/20"
                                                    >
                                                        <div className="mb-3 flex items-start justify-between">
                                                            <h4 className="line-clamp-2 flex-1 text-sm font-medium transition-colors duration-200 group-hover:text-primary">{product.name}</h4>
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
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-muted-foreground">{formatCurrency(product.price)} c/u</p>
                                                                <p className="text-sm font-bold text-primary transition-all duration-200 group-hover:scale-105">{formatCurrency(subtotal)}</p>
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
                            <div className="border-t border-b p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        <Label className="text-sm font-medium">Tipo de Comprobante</Label>
                                    </div>
                                    <Select
                                        value={formData.document_type}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, document_type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="01">Factura Electrónica</SelectItem>
                                            <SelectItem value="03">Boleta Electrónica</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm">Comprobante Electrónico</Label>
                                        <Switch
                                            checked={formData.is_electronic}
                                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_electronic: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Totales */}
                            <div className="border-t p-4 bg-gradient-to-r from-muted/30 to-muted/10">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span className="font-medium">Subtotal:</span>
                                        <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span className="font-medium">IGV (18%):</span>
                                        <span className="font-semibold">{formatCurrency(totals.igv)}</span>
                                    </div>
                                    <Separator className="my-3" />
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                                        <span className="text-lg font-bold text-primary">Total:</span>
                                        <span className="text-2xl font-bold text-primary">{formatCurrency(totals.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="p-4 space-y-3">
                                <Button 
                                    className="w-full h-12 text-base font-semibold"
                                    disabled={selectedProducts.length === 0 || !formData.client_id || isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            Procesar Venta
                                        </>
                                    )}
                                </Button>
                                
                                {/* Mensaje de validación */}
                                {selectedProducts.length > 0 && !formData.client_id && (
                                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Selecciona un cliente para continuar</span>
                                    </div>
                                )}
                                
                                {selectedProducts.length > 0 && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-11 text-base font-medium transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                                        onClick={() => console.log('Guardar como borrador')}
                                    >
                                        <Calculator className="mr-2 h-4 w-4" />
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
        </AppSidebarLayout>
    );
}

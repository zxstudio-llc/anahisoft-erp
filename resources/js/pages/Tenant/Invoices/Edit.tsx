"use client"

import { useState, useCallback, useEffect } from "react"
import { Plus, Minus, Save, Send, Eye, ChevronLeft, Search, Package, Settings, Trash2, Calculator, User, CreditCard, ShoppingCart, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import Api from "@/lib/api"
import SaleSuccessModal from "@/components/modals/sale-success-modal"

interface Product {
  id: number;
  name: string;
  code: string;
  sku: string | null;
  unit_price: number;
  has_igv: boolean;
  igv_percentage: number;
  ice_rate: string | null;
  item_type: string;
  stock: number;
}

interface Customer {
  id: number;
  business_name: string;
  identification: string;
  email: string;
  phone: string;
  address: string;
}

interface InvoiceDetail {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
  iva: number;
  ice: number;
  total: number;
}

interface Invoice {
  id: number;
  customer_id: string;
  document_type: '01' | '03';
  establishment_code: string;
  emission_point: string;
  sequential: string;
  issue_date: string;
  period: string;
  subtotal_12: number;
  subtotal_0: number;
  iva: number;
  ice: number;
  total: number;
  status: 'draft' | 'issued' | 'authorized' | 'rejected' | 'canceled';
  is_electronic: boolean;
  customer?: Customer;
  details: InvoiceDetail[];
}

interface EditProps {
  invoice: Invoice;
  customers: Customer[];
  products: Product[];
}

export default function EditInvoice({ invoice: initialInvoice, customers = [], products = [] }: EditProps) {
  const [formData, setFormData] = useState({
    customer_id: initialInvoice.customer_id.toString(),
    products: initialInvoice.details.map(detail => ({
      id: detail.product_id,
      quantity: detail.quantity
    })),
    document_type: initialInvoice.document_type,
    is_electronic: initialInvoice.is_electronic,
  });

  const [additionalFields, setAdditionalFields] = useState({
    establishment_code: initialInvoice.establishment_code,
    emission_point: initialInvoice.emission_point,
    sequential: initialInvoice.sequential,
    issue_date: initialInvoice.issue_date.split('T')[0],
    period: initialInvoice.period,
    dueDate: '',
    notes: '',
    terms: '',
  });

  const [selectedProducts, setSelectedProducts] = useState<Product[]>(
    initialInvoice.details.map(detail => ({
      id: detail.product?.id || detail.product_id,
      name: detail.product?.name || 'Producto no disponible',
      code: detail.product?.code || '',
      sku: detail.product?.sku || null,
      unit_price: detail.unit_price,
      has_igv: detail.product?.has_igv || false,
      igv_percentage: detail.product?.igv_percentage || 0,
      ice_rate: detail.product?.ice_rate || null,
      item_type: detail.product?.item_type || 'product',
      stock: detail.product?.stock || 0,
    }))
  );

  const [totals, setTotals] = useState({
    subtotal_12: initialInvoice.subtotal_12,
    subtotal_0: initialInvoice.subtotal_0,
    iva: initialInvoice.iva,
    ice: initialInvoice.ice,
    total: initialInvoice.total,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialInvoice.customer || null);
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

  const formatInvoiceNumber = (establishmentCode?: string, emissionPoint?: string, sequential?: string) => {
    const establishment = establishmentCode || '001';
    const emission = emissionPoint || '001';
    const seq = sequential || '';

    if (!seq) {
      return 'XXX-XXX-XXXXXXXXX';
    }

    const formattedEstablishment = establishment.padStart(3, '0');
    const formattedEmissionPoint = emission.padStart(3, '0');
    const formattedSequential = seq.padStart(9, '0');

    return `${formattedEstablishment}-${formattedEmissionPoint}-${formattedSequential}`;
  };

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
    if (formData.customer_id && customers.length > 0) {
      const client = customers.find((c) => c.id.toString() === formData.customer_id);
      setSelectedCustomer(client || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [formData.customer_id, customers]);

  const addProductToCart = (product: Product) => {
    const isService = product.item_type === 'service';
    const existingIndex = formData.products.findIndex((p) => p.id === product.id);

    if (existingIndex >= 0) {
      const currentQuantity = formData.products[existingIndex].quantity;

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
  
    if (formData.products.length === 0) {
      toast.error('Agrega al menos un producto o servicio al carrito');
      return;
    }
  
    setIsSubmitting(true);
    toast.loading('Actualizando factura...', { id: 'invoice-updating' });
  
    try {
      const dataToSend = {
        ...formData,
        establishment_code: additionalFields.establishment_code,
        emission_point: additionalFields.emission_point,
        sequential: additionalFields.sequential,
        issue_date: additionalFields.issue_date,
        period: additionalFields.period,
        status: 'issued'
      };
  
      const response = await Api.put(`/v1/sales/${initialInvoice.id}`, dataToSend);
  
      toast.success('¡Factura actualizada y emitida exitosamente!', {
        id: 'invoice-updating',
        description: 'La factura ha sido actualizada y emitida correctamente'
      });
  
      // Guardar resultado para el modal
      const responseData = response.data as { data: typeof saleResult };
      setSaleResult(responseData.data);
      setShowSuccessModal(true);
  
      // Limpiar el formulario después del éxito (opcional, ya que redirigimos)
      // setFormData({
      //   customer_id: '',
      //   products: [],
      //   document_type: '01',
      //   is_electronic: true,
      // });
      // setAdditionalFields(prev => ({
      //   ...prev,
      //   sequential: '',
      //   issue_date: new Date().toISOString().split('T')[0],
      //   period: new Date().toLocaleDateString('es-EC', { month: '2-digit', year: 'numeric' }).replace('/', '/'),
      //   dueDate: '',
      //   notes: '',
      //   terms: ''
      // }));
      // setSelectedProducts([]);
      // setSelectedClient(null);
      // setSelectedCustomer(null);
  
    } catch (error: unknown) {
      console.error('Error al actualizar la factura:', error);
  
      let errorMessage = 'Error desconocido al actualizar la factura';
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as { data?: { message?: string } };
        errorMessage = errorResponse.data?.message || 'Error en el servidor';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      toast.error('Error al actualizar la factura', {
        id: 'invoice-updating',
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.customer_id) {
      toast.error('Selecciona un cliente para continuar');
      return;
    }
  
    if (formData.products.length === 0) {
      toast.error('Agrega al menos un producto o servicio al carrito');
      return;
    }
  
    setIsSubmitting(true);
    toast.loading('Guardando borrador...', { id: 'draft-saving' });
  
    try {
      const dataToSend = {
        ...formData,
        establishment_code: additionalFields.establishment_code,
        emission_point: additionalFields.emission_point,
        sequential: additionalFields.sequential,
        issue_date: additionalFields.issue_date,
        period: additionalFields.period,
        status: 'draft'
      };
  
      const response = await Api.put(`/v1/sales/${initialInvoice.id}`, dataToSend);
  
      toast.success('¡Borrador guardado exitosamente!', {
        id: 'draft-saving',
        description: 'La factura se ha guardado como borrador'
      });
  
      // Para borrador no mostramos modal, solo redirigimos
      window.location.href = `/invoices/${initialInvoice.id}`;
  
    } catch (error: unknown) {
      console.error('Error al guardar borrador:', error);
      
      let errorMessage = 'Error desconocido al guardar borrador';
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as { data?: { message?: string } };
        errorMessage = errorResponse.data?.message || 'Error en el servidor';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      toast.error('Error al guardar borrador', {
        id: 'draft-saving',
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleModalClose = () => {
  setShowSuccessModal(false);
  setSaleResult(null);
  // Redirigir a la vista de detalle después de cerrar el modal
  window.location.href = `/invoices/${initialInvoice.id}`;
};

  return (
    <AppLayout>
      <Head title={`Editar Factura ${formatInvoiceNumber(additionalFields.establishment_code, additionalFields.emission_point, additionalFields.sequential)}`} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="default"
              size="icon"
              onClick={() => window.history.back()}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">Editar Factura</h1>
              <p className="text-sm text-gray-600">Editando factura {formatInvoiceNumber(additionalFields.establishment_code, additionalFields.emission_point, additionalFields.sequential)}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => window.location.href = `/invoices/${initialInvoice.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Factura
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting || formData.products.length === 0 || !formData.customer_id}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || formData.products.length === 0 || !formData.customer_id}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Actualizar y Emitir
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-6">
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Factura</CardTitle>
                <CardDescription>Información básica de la factura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente
                    </Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                    >
                      <SelectTrigger className="h-auto min-h-[40px] py-2">
                        <SelectValue placeholder="Seleccionar cliente">
                          {selectedCustomer && (
                            <div className="flex flex-col items-start text-left w-full">
                              <span className="font-medium text-sm truncate w-full">{selectedCustomer.business_name}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            <div className="flex flex-col items-start w-full">
                              <span className="font-medium text-sm">{customer.business_name}</span>
                              <span className="text-xs text-muted-foreground">{customer.identification}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishmentCode">Establecimiento</Label>
                    <Input
                      id="establishmentCode"
                      value={additionalFields.establishment_code}
                      onChange={(e) => setAdditionalFields({
                        ...additionalFields,
                        establishment_code: e.target.value.slice(0, 3)
                      })}
                      maxLength={3}
                      pattern="[0-9]{3}"
                      placeholder="001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emissionPoint">Punto de Emisión</Label>
                    <Input
                      id="emissionPoint"
                      value={additionalFields.emission_point}
                      onChange={(e) => setAdditionalFields({
                        ...additionalFields,
                        emission_point: e.target.value.slice(0, 3)
                      })}
                      maxLength={3}
                      pattern="[0-9]{3}"
                      placeholder="001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha de Factura</Label>
                    <Input
                      id="date"
                      type="date"
                      value={additionalFields.issue_date}
                      onChange={(e) => setAdditionalFields({ ...additionalFields, issue_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="invoiceNumber" className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        # de Factura
                      </div>
                    </Label>
                    <div className="relative">
                      <Input
                        id="invoiceNumber"
                        value={formatInvoiceNumber(
                          additionalFields.establishment_code,
                          additionalFields.emission_point,
                          additionalFields.sequential
                        )}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed font-mono text-center w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col gap-2">
                    <Label>Tipo de Documento</Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(value: '01' | '03') => setFormData({ ...formData, document_type: value })}
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
                  <div className="flex flex-col items-end space-y-2 gap-2">
                    <Label className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Comprobante Electrónico
                    </Label>
                    <Switch
                      checked={formData.is_electronic}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_electronic: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Catalog */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Catálogo de Productos</CardTitle>
                    <CardDescription>Selecciona productos o servicios para agregar a la factura</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search products */}
                <div className="relative mb-4">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos o servicios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 max-h-80 overflow-y-auto">
                  {filteredProducts.map((product) => {
                    const isService = product.item_type === 'service'
                    return (
                      <Card
                        key={product.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                        onClick={() => addProductToCart(product)}
                      >
                        <CardContent className="p-3">
                          <div className="flex flex-col items-center space-y-2 text-center">
                            <div className={`rounded-full p-2 transition-all duration-200 group-hover:scale-110 ${isService
                              ? 'bg-blue-100 group-hover:bg-blue-200'
                              : 'bg-primary/10 group-hover:bg-primary/20'
                              }`}>
                              {isService ? (
                                <Settings className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Package className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <h3 className="line-clamp-2 min-h-[2rem] text-sm font-medium">{product.name}</h3>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-primary">{formatCurrency(product.unit_price)}</p>
                              <div className="flex flex-col items-center gap-1">
                                <Badge variant={isService ? "default" : "secondary"} className="text-xs">
                                  {isService ? 'Servicio' : `Stock: ${product.stock}`}
                                </Badge>
                                {product.has_igv ? (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    IVA {product.igv_percentage}%
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    IVA 0%
                                  </Badge>
                                )}
                                {product.ice_rate && parseFloat(product.ice_rate) > 0 && (
                                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                    ICE {product.ice_rate}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Items de la Factura</CardTitle>
                    <CardDescription>Productos o servicios en esta factura</CardDescription>
                  </div>
                  {selectedProducts.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Limpiar Todo
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Producto/Servicio</TableHead>
                        <TableHead className="w-[15%]">Cantidad</TableHead>
                        <TableHead className="w-[15%]">Precio Unitario</TableHead>
                        <TableHead className="w-[15%]">Total</TableHead>
                        <TableHead className="w-[15%]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProducts.map((product) => {
                        const quantity = formData.products.find((p) => p.id === product.id)?.quantity || 0;
                        const total = product.unit_price * quantity;
                        const isService = product.item_type === 'service';

                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{product.name}</span>
                                <div className="flex gap-1 mt-1">
                                  <Badge variant={isService ? "default" : "secondary"} className="text-xs">
                                    {isService ? 'Servicio' : 'Producto'}
                                  </Badge>
                                  {product.has_igv ? (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                      IVA {product.igv_percentage}%
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                      IVA 0%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateProductQuantity(product.id, quantity - 1)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateProductQuantity(product.id, quantity + 1)}
                                  className="h-7 w-7 p-0"
                                  disabled={!isService && quantity >= product.stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(product.unit_price)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-primary">{formatCurrency(total)}</div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeProductFromCart(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {selectedProducts.length === 0 && (
                  <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="mb-4 h-8 w-8" />
                    <p>No hay items en la factura</p>
                    <p className="text-sm">Selecciona productos del catálogo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Totals and Additional Information */}
          <div className="lg:w-64 xl:w-96 space-y-6">
            {/* Totals Card */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {totals.subtotal_12 > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Subtotal 15%:</span>
                      <span className="font-medium">{formatCurrency(totals.subtotal_12)}</span>
                    </div>
                  )}
                  {totals.subtotal_0 > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Subtotal 0%:</span>
                      <span className="font-medium">{formatCurrency(totals.subtotal_0)}</span>
                    </div>
                  )}
                  {totals.iva > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>I.V.A:</span>
                      <span className="font-medium">{formatCurrency(totals.iva)}</span>
                    </div>
                  )}
                  {totals.ice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>I.C.E:</span>
                      <span className="font-medium">{formatCurrency(totals.ice)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Agregar notas adicionales para el cliente"
                    value={additionalFields.notes}
                    onChange={(e) => setAdditionalFields({ ...additionalFields, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms">Términos y Condiciones</Label>
                  <Textarea
                    id="terms"
                    placeholder="Términos y condiciones de pago"
                    value={additionalFields.terms}
                    onChange={(e) => setAdditionalFields({ ...additionalFields, terms: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {
  saleResult && (
    <SaleSuccessModal
      isOpen={showSuccessModal}
      onClose={handleModalClose}
      sale={saleResult.sale}
      canDownloadPdf={saleResult.can_download_pdf}
      canDownloadXml={saleResult.can_download_xml}
      canDownloadCdr={saleResult.can_download_cdr}
    />
  )
}
    </AppLayout>
  )
}
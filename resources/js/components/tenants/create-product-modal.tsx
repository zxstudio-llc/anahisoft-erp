import { ApiResponse } from '@/common/interfaces/api.interface';
import { NextCodeResponse, Product, ProductFormData, ProductModalProps } from '@/common/interfaces/tenant/products.interface';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper, StepperContent } from '@/components/ui/stepper';
import Api from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const STEPS = [
    { title: 'Información Básica', description: 'Datos principales del producto' },
    { title: 'Detalles Adicionales', description: 'Información complementaria' },
    { title: 'Precios e Impuestos', description: 'Configuración de precios' },
];

interface ApiError {
    response?: {
        data?: {
            errors?: Record<string, string>;
        };
    };
}

export default function ProductModal({ isOpen, onClose, categories, unitTypes, igvTypes, currencies, product, onSuccess }: ProductModalProps) {
    const isEditMode = !!product;
    const [currentStep, setCurrentStep] = useState(1);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [isLoadingCode, setIsLoadingCode] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        code: 'Generando código...',
        name: '',
        description: '',
        item_type: 'product',
        unit_price: 0,
        price: 0,
        cost: 0,
        stock: 0,
        unit_type: 'NIU',
        currency: 'PEN',
        igv_type: '10',
        igv_percentage: 18.0,
        has_igv: true,
        category_id: '',
        brand: '',
        model: '',
        barcode: '',
        is_active: true,
    });

    const setData = useCallback((key: keyof ProductFormData, value: string | number | boolean) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const setFormDataBulk = useCallback((data: ProductFormData) => {
        setFormData(data);
    }, []);

    const reset = useCallback(() => {
        setFormData({
            code: 'Generando código...',
            name: '',
            description: '',
            item_type: 'product',
            unit_price: 0,
            price: 0,
            cost: 0,
            stock: 0,
            unit_type: 'NIU',
            currency: 'PEN',
            igv_type: '10',
            igv_percentage: 18.0,
            has_igv: true,
            category_id: '',
            brand: '',
            model: '',
            barcode: '',
            is_active: true,
        });
    }, []);

    // Función para obtener el siguiente código
    const fetchNextCode = useCallback(async () => {
        if (isEditMode) return;

        try {
            setIsLoadingCode(true);
            const response = await Api.get<ApiResponse<NextCodeResponse>>('/v1/products/next-code');
            if (!response.data.success) {
                toast.error('Error al obtener el código');
                return;
            }
            setData('code', response.data.data.code);
        } catch (error) {
            console.error('Error al obtener el código:', error);
        } finally {
            setIsLoadingCode(false);
        }
    }, [isEditMode, setData]);

    // Cargar el código al abrir el modal
    useEffect(() => {
        if (isOpen && !isEditMode) {
            fetchNextCode();
        }
    }, [isOpen, isEditMode, fetchNextCode]);

    // Función para validar el paso 1
    const validateStep1 = () => {
        const requiredFields = ['code', 'name', 'item_type', 'unit_type'];
        const newErrors: { [key: string]: string } = {};

        requiredFields.forEach((field) => {
            if (!formData[field]) {
                newErrors[field] = 'Este campo es requerido';
            }
        });

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Función para validar el paso 2
    const validateStep2 = () => {
        const requiredFields = ['category_id'];
        const productRequiredFields = formData.item_type === 'product' ? ['stock'] : [];
        const allRequiredFields = [...requiredFields, ...productRequiredFields];
        const newErrors: { [key: string]: string } = {};

        allRequiredFields.forEach((field) => {
            if (!formData[field]) {
                newErrors[field] = 'Este campo es requerido';
            }
        });

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Función para validar el paso 3
    const validateStep3 = () => {
        const requiredFields = ['currency', 'igv_type', 'igv_percentage', 'price'];
        const newErrors: { [key: string]: string } = {};

        requiredFields.forEach((field) => {
            if (typeof formData[field] === 'number') {
                if (formData[field] <= 0) {
                    newErrors[field] = 'El valor debe ser mayor a 0';
                }
            } else if (!formData[field]) {
                newErrors[field] = 'Este campo es requerido';
            }
        });

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Cálculos de IGV
    const [igvAmount, setIgvAmount] = useState(0);
    const [priceWithIgv, setPriceWithIgv] = useState(0);

    const calculatePrices = useCallback((basePrice: number) => {
        // IGV siempre es 18% en Perú
        const igvRate = 18;

        const igvAmount = basePrice * (igvRate / 100);
        const finalPrice = basePrice + igvAmount;

        return {
            basePrice: parseFloat(basePrice.toFixed(2)), // Valor unitario
            igvAmount: parseFloat(igvAmount.toFixed(2)), // Monto del IGV
            totalPrice: parseFloat(finalPrice.toFixed(2)), // Precio de venta (incluye IGV)
        };
    }, []);

    // Actualizar los datos del formulario cuando cambia el producto
    useEffect(() => {
        if (product) {
            const newData: ProductFormData = {
                code: product.code || '',
                name: product.name || '',
                description: product.description || '',
                item_type: product.item_type || 'product',
                unit_price: product.unit_price || 0,
                price: product.price || 0,
                cost: product.cost || 0,
                stock: product.stock || 0,
                unit_type: product.unit_type || 'NIU',
                currency: product.currency || 'PEN',
                igv_type: product.igv_type || '10',
                igv_percentage: product.igv_percentage || 18.0,
                has_igv: product.has_igv !== undefined ? product.has_igv : true,
                category_id: product.category_id ? String(product.category_id) : '',
                brand: product.brand || '',
                model: product.model || '',
                barcode: product.barcode || '',
                is_active: product.is_active !== undefined ? product.is_active : true,
            };
            setFormDataBulk(newData);
        } else {
            reset();
        }
        setCurrentStep(1);
    }, [product, isOpen, reset, setFormDataBulk]);

    // Recalcular los valores de IGV cuando cambian los datos relevantes
    useEffect(() => {
        const prices = calculatePrices(Number(formData.unit_price));
        setIgvAmount(prices.igvAmount);
        setPriceWithIgv(prices.totalPrice);
        setData('price', prices.totalPrice);
    }, [formData.unit_price, calculatePrices, setData]);

    // Limpiar errores de validación al cambiar de paso o cerrar el modal
    useEffect(() => {
        setValidationErrors({});
    }, [currentStep, isOpen]);

    // Limpiar campos específicos cuando se cambia el tipo de ítem
    useEffect(() => {
        if (formData.item_type === 'service') {
            // Para servicios, resetear campos no aplicables
            setData('stock', 0);
            setData('barcode', '');
            setData('brand', '');
            setData('model', '');
        }
    }, [formData.item_type, setData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Solo permitir envío si estamos en el último paso
        if (currentStep !== STEPS.length) {
            nextStep();
            return;
        }

        // Validar el último paso antes de enviar
        if (!validateStep3()) {
            return;
        }

        setProcessing(true);

        try {
            if (isEditMode && product) {
                const response = await Api.put<ApiResponse<Product>>(`/v1/products/${product.id}`, formData);
                reset();
                onClose();
                if (onSuccess) {
                    onSuccess(response.data, true);
                }
            } else {
                const response = await Api.post<ApiResponse<Product>>('/v1/products', formData);
                reset();
                onClose();
                if (onSuccess) {
                    onSuccess(response.data, false);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            const apiError = error as ApiError;
            if (apiError.response?.data?.errors) {
                setValidationErrors(apiError.response.data.errors);
                // Mostrar el primer error de validación
                const firstError = Object.values(apiError.response.data.errors)[0];
                toast.error(firstError || 'Error al procesar el formulario');
            } else {
                toast.error('Error al procesar la solicitud');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        reset();
        setCurrentStep(1);
        onClose();
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const unitPrice = parseFloat(e.target.value) || 0;
        setData('unit_price', unitPrice);

        const prices = calculatePrices(unitPrice);
        setIgvAmount(prices.igvAmount);
        setPriceWithIgv(prices.totalPrice);
        setData('price', prices.totalPrice);
    };

    const handleHasIgvChange = (checked: boolean) => {
        setData('has_igv', checked);
    };

    const nextStep = () => {
        let isValid = false;

        switch (currentStep) {
            case 1:
                isValid = validateStep1();
                break;
            case 2:
                isValid = validateStep2();
                break;
            case 3:
                isValid = validateStep3();
                break;
            default:
                isValid = true;
        }

        if (isValid && currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            {/* Tipo de ítem */}
            <div>
                <Label htmlFor="item_type">
                    Tipo de ítem <span className="text-red-500">*</span>
                </Label>
                <select
                    id="item_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.item_type}
                    onChange={(e) => setData('item_type', e.target.value)}
                    required
                >
                    <option value="product">Producto</option>
                    <option value="service">Servicio</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                    {formData.item_type === 'product'
                        ? 'Bienes físicos que requieren control de inventario y stock'
                        : 'Servicios que no requieren manejo de inventario'}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Código */}
                <div>
                    <Label htmlFor="code">
                        Código <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="Generando código..."
                            required
                            className={validationErrors.code ? 'border-red-500' : ''}
                            disabled={isLoadingCode || !isEditMode}
                        />
                        {isLoadingCode && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                            </div>
                        )}
                    </div>
                    {validationErrors.code && <p className="text-sm text-red-500">{validationErrors.code}</p>}
                </div>

                {/* Unidad de medida */}
                <div>
                    <Label htmlFor="unit_type">
                        Unidad de medida <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="unit_type"
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                            validationErrors.unit_type ? 'border-red-500' : ''
                        }`}
                        value={formData.unit_type}
                        onChange={(e) => setData('unit_type', e.target.value)}
                        required
                    >
                        {unitTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {validationErrors.unit_type && <p className="text-sm text-red-500">{validationErrors.unit_type}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                        {formData.item_type === 'product'
                            ? 'Unidad física de medida (kg, unidad, metro, etc.)'
                            : 'Unidad de servicio (horas, sesiones, etc.)'}
                    </p>
                </div>
            </div>

            {/* Nombre */}
            <div>
                <Label htmlFor="name">
                    Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder={formData.item_type === 'product' ? 'Nombre del producto' : 'Nombre del servicio'}
                    required
                    className={validationErrors.name ? 'border-red-500' : ''}
                />
                {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
            </div>

            {/* Descripción */}
            <div>
                <Label htmlFor="description">Descripción</Label>
                <textarea
                    id="description"
                    className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder={formData.item_type === 'product' ? 'Descripción detallada del producto' : 'Descripción detallada del servicio'}
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            {/* Categoría */}
            <div>
                <Label htmlFor="category_id">
                    Categoría <span className="text-red-500">*</span>
                </Label>
                <select
                    id="category_id"
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                        validationErrors.category_id ? 'border-red-500' : ''
                    }`}
                    value={formData.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                    required
                >
                    <option value="">Seleccione una categoría</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {validationErrors.category_id && <p className="text-sm text-red-500">{validationErrors.category_id}</p>}
            </div>

            {/* Código de barras - Solo para productos */}
            {formData.item_type === 'product' && (
                <div>
                    <Label htmlFor="barcode">Código de barras</Label>
                    <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setData('barcode', e.target.value)}
                        placeholder="Código de barras (opcional)"
                    />
                    <p className="mt-1 text-xs text-gray-500">Para identificación y control de productos físicos</p>
                </div>
            )}

            {/* Marca y Modelo - Solo para productos */}
            {formData.item_type === 'product' && (
                <div className="grid grid-cols-2 gap-4">
                    {/* Marca */}
                    <div>
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                            id="brand"
                            value={formData.brand}
                            onChange={(e) => setData('brand', e.target.value)}
                            placeholder="Marca del producto (opcional)"
                        />
                    </div>

                    {/* Modelo */}
                    <div>
                        <Label htmlFor="model">Modelo</Label>
                        <Input
                            id="model"
                            value={formData.model}
                            onChange={(e) => setData('model', e.target.value)}
                            placeholder="Modelo del producto (opcional)"
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {/* Stock - Solo para productos */}
                {formData.item_type === 'product' && (
                    <div>
                        <Label htmlFor="stock">
                            Stock <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="stock"
                            type="number"
                            min="0"
                            step="1"
                            value={formData.stock}
                            onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                            required
                            className={validationErrors.stock ? 'border-red-500' : ''}
                        />
                        {validationErrors.stock && <p className="text-sm text-red-500">{validationErrors.stock}</p>}
                        <p className="mt-1 text-xs text-gray-500">Cantidad disponible en inventario</p>
                    </div>
                )}

                {/* Costo */}
                <div className={formData.item_type === 'service' ? 'col-span-2' : ''}>
                    <Label htmlFor="cost">{formData.item_type === 'product' ? 'Costo de adquisición' : 'Costo del servicio'}</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            {formData.currency === 'PEN' ? 'S/' : '$'}
                        </span>
                        <Input
                            id="cost"
                            type="number"
                            min="0"
                            step="0.01"
                            className="pl-8"
                            value={formData.cost}
                            onChange={(e) => setData('cost', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        {formData.item_type === 'product'
                            ? 'Costo de compra o fabricación del producto'
                            : 'Costo asociado a la prestación del servicio'}
                    </p>
                </div>
            </div>

            {/* Estado (solo en modo edición) */}
            {isEditMode && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                    <Label htmlFor="is_active" className="text-sm font-normal">
                        {formData.item_type === 'product' ? 'Producto activo' : 'Servicio activo'}
                    </Label>
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <div className="rounded-md border border-gray-200 p-4 dark:border-gray-800">
                <h3 className="mb-2 text-sm font-medium">
                    Configuración de precios e impuestos
                    {formData.item_type === 'service' && <span className="ml-2 text-xs text-blue-600">(Servicio)</span>}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {/* Moneda */}
                    <div>
                        <Label htmlFor="currency">
                            Moneda <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="currency"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={formData.currency}
                            onChange={(e) => setData('currency', e.target.value)}
                            required
                        >
                            {currencies.map((currency) => (
                                <option key={currency.value} value={currency.value}>
                                    {currency.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de IGV */}
                    <div>
                        <Label htmlFor="igv_type">
                            Tipo de IGV <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="igv_type"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={formData.igv_type}
                            onChange={(e) => setData('igv_type', e.target.value)}
                            required
                        >
                            {igvTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    {/* Valor unitario (sin IGV) */}
                    <div>
                        <Label htmlFor="unit_price">
                            {formData.item_type === 'product' ? 'Valor unitario (sin IGV)' : 'Precio del servicio (sin IGV)'}{' '}
                            <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                {formData.currency === 'PEN' ? 'S/' : '$'}
                            </span>
                            <Input
                                id="unit_price"
                                type="number"
                                min="0"
                                step="0.01"
                                className={`pl-8 ${validationErrors.unit_price ? 'border-red-500' : ''}`}
                                value={formData.unit_price}
                                onChange={handlePriceChange}
                                required
                            />
                        </div>
                        {validationErrors.unit_price && <p className="text-sm text-red-500">{validationErrors.unit_price}</p>}
                    </div>
                </div>

                {/* Checkbox para incluir IGV */}
                <div className="mt-4 flex items-center space-x-2">
                    <Checkbox id="has_igv" checked={formData.has_igv} onCheckedChange={handleHasIgvChange} />
                    <Label htmlFor="has_igv" className="text-sm font-normal">
                        El precio ingresado incluye IGV
                    </Label>
                </div>

                {/* Resumen de cálculos */}
                <div className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500">{formData.item_type === 'product' ? 'Valor unitario:' : 'Precio base:'}</span>
                            <div className="font-medium">
                                {formData.currency === 'PEN' ? 'S/ ' : '$ '}
                                {Number(formData.unit_price).toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">IGV (18%):</span>
                            <div className="font-medium">
                                {formData.currency === 'PEN' ? 'S/ ' : '$ '}
                                {Number(igvAmount).toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">{formData.item_type === 'product' ? 'Precio de venta:' : 'Precio final:'}</span>
                            <div className="font-medium">
                                {formData.currency === 'PEN' ? 'S/ ' : '$ '}
                                {Number(priceWithIgv).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Actualice los datos del producto para la facturación electrónica.'
                            : 'Ingrese los datos del producto para la facturación electrónica.'}
                    </DialogDescription>
                </DialogHeader>

                <Stepper steps={STEPS} currentStep={currentStep} />

                <div className="py-4">
                    <StepperContent step={1} currentStep={currentStep}>
                        {renderStep1()}
                    </StepperContent>

                    <StepperContent step={2} currentStep={currentStep}>
                        {renderStep2()}
                    </StepperContent>

                    <StepperContent step={3} currentStep={currentStep}>
                        {renderStep3()}
                    </StepperContent>

                    <DialogFooter className="mt-6">
                        {currentStep > 1 && (
                            <Button type="button" variant="outline" onClick={prevStep} disabled={processing}>
                                Anterior
                            </Button>
                        )}
                        {currentStep < STEPS.length ? (
                            <Button type="button" onClick={nextStep} disabled={processing}>
                                Siguiente
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleSubmit} disabled={processing}>
                                {isEditMode ? 'Actualizar Producto' : 'Guardar Producto'}
                            </Button>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

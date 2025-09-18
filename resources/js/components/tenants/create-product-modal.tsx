"use client";

import { ApiResponse } from "@/common/interfaces/api.interface";
import { NextCodeResponse, Product, ProductFormData, ProductModalProps } from "@/common/interfaces/tenant/products.interface";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper, StepperContent } from "@/components/ui/stepper";
import Api from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";

const STEPS = [
    { title: "Información Básica", description: "Datos principales del producto" },
    { title: "Detalles Adicionales", description: "Información complementaria" },
    { title: "Precios e Impuestos", description: "Configuración de precios" },
];

const IGV_OPTIONS = [
    { value: '0', label: '0%' },
    { value: '1', label: '15%' },
];


interface ApiError {
    response?: {
        data?: {
            errors?: Record<string, string>;
        };
    };
}

export default function ProductModal({ isOpen, onClose, categories, unitTypes, product, onSuccess }: ProductModalProps) {
    const isEditMode = !!product;
    const [currentStep, setCurrentStep] = useState(1);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [isLoadingCode, setIsLoadingCode] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState<ProductFormData>({
        code: "Generando código...",
        name: "",
        description: "",
        item_type: "product",
        unit_price: 0,
        price: 0,
        cost: 0,
        stock: 0,
        min_stock: 0,
        track_inventory: true,
        unit_type: "UNI",
        vat_rate: "1",
        ice_rate: "",
        irbpnr_rate: "",
        has_igv: true,
        category_id: "",
        category: "",
        brand: "",
        model: "",
        barcode: "",
        sku: "",
        active: true,
    });

    const [taxAmount, setTaxAmount] = useState(0);
    const [priceWithTax, setPriceWithTax] = useState(0);

    const setData = useCallback((key: keyof ProductFormData, value: string | number | boolean) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const reset = useCallback(() => {
        setFormData({
            code: "Generando código...",
            name: "",
            description: "",
            item_type: "product",
            unit_price: 0,
            price: 0,
            cost: 0,
            stock: 0,
            min_stock: 0,
            track_inventory: true,
            unit_type: "UNI",
            vat_rate: "1",
            ice_rate: "",
            irbpnr_rate: "",
            has_igv: true,
            category_id: "",
            category: "",
            brand: "",
            model: "",
            barcode: "",
            sku: "",
            active: true,
        });
    }, []);

    const fetchNextCode = useCallback(async () => {
        if (isEditMode) return;
        try {
            setIsLoadingCode(true);
            const response = await Api.get<ApiResponse<NextCodeResponse>>("/v1/products/next-code");
            if (!response.data.success) {
                toast.error("Error al obtener el código");
                return;
            }
            setData("code", response.data.data.code);
        } catch (error) {
            console.error("Error al obtener el código:", error);
        } finally {
            setIsLoadingCode(false);
        }
    }, [isEditMode, setData]);

    useEffect(() => {
        if (isOpen && !isEditMode) fetchNextCode();
    }, [isOpen, isEditMode, fetchNextCode]);

    const calculatePrices = useCallback((basePrice: number) => {
        const vatPercentage = formData.vat_rate === "1" ? 0.15 : 0;
        const tax = formData.has_igv ? basePrice * vatPercentage : 0;
        const total = basePrice + tax;
        return {
            basePrice: parseFloat(basePrice.toFixed(2)),
            taxAmount: parseFloat(tax.toFixed(2)),
            totalPrice: parseFloat(total.toFixed(2)),
        };
    }, [formData.vat_rate, formData.has_igv]);

    useEffect(() => {
        const prices = calculatePrices(Number(formData.unit_price));
        setTaxAmount(prices.taxAmount);
        setPriceWithTax(prices.totalPrice);
        setData("price", prices.totalPrice);
    }, [formData.unit_price, calculatePrices, setData]);

    useEffect(() => {
        if (product) {
            setFormData({
                code: product.code || "",
                name: product.name || "",
                description: product.description || "",
                item_type: product.item_type || "product",
                unit_price: product.unit_price || 0,
                price: product.price || 0,
                cost: product.cost || 0,
                stock: product.stock || 0,
                min_stock: product.min_stock || 0,
                track_inventory: product.track_inventory !== undefined ? product.track_inventory : true,
                unit_type: product.unit_type || "UNI",
                vat_rate: product.vat_rate || "1",
                ice_rate: product.ice_rate || "",
                irbpnr_rate: product.irbpnr_rate || "",
                has_igv: product.has_igv !== undefined ? product.has_igv : true,
                category_id: product.category_id ? String(product.category_id) : "",
                brand: product.brand || "",
                model: product.model || "",
                barcode: product.barcode || "",
                sku: product.sku || "",
                active: product.active !== undefined ? product.active : true,
            });
        } else reset();
        setCurrentStep(1);
    }, [product, isOpen, reset]);

    // Validaciones simples
    const validateStep1 = () => {
        const required = ["code", "name", "item_type", "unit_type"];
        const errors: { [key: string]: string } = {};
        required.forEach((f) => { if (!formData[f]) errors[f] = "Este campo es requerido"; });
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = () => {
        const required = ["category_id"];
        if (formData.item_type === "product") required.push("stock");
        const errors: { [key: string]: string } = {};
        required.forEach((f) => { if (!formData[f]) errors[f] = "Este campo es requerido"; });
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = () => {
        const required = ["unit_price"];
        const errors: { [key: string]: string } = {};
        required.forEach((f) => {
            if (typeof formData[f] === "number") {
                if (formData[f] <= 0) errors[f] = "El valor debe ser mayor a 0";
            } else if (!formData[f]) {
                errors[f] = "Este campo es requerido";
            }
        });
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep !== STEPS.length) { nextStep(); return; }
        if (!validateStep3()) return;

        setProcessing(true);
        try {
            if (isEditMode && product) {
                const res = await Api.put<ApiResponse<Product>>(`/v1/products/${product.id}`, formData);
                onSuccess?.(res.data, true);
            } else {
                const res = await Api.post<ApiResponse<Product>>("/v1/products", formData);
                onSuccess?.(res.data, false);
            }
            reset();
            onClose();
        } catch (err) {
            console.error(err);
            const apiError = err as ApiError;
            if (apiError.response?.data?.errors) {
                setValidationErrors(apiError.response.data.errors);
                const firstError = Object.values(apiError.response.data.errors)[0];
                toast.error(firstError || "Error al procesar el formulario");
            } else {
                toast.error("Error al procesar la solicitud");
            }
        } finally { setProcessing(false); }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        setData("unit_price", val);
        const prices = calculatePrices(val);
        setTaxAmount(prices.taxAmount);
        setPriceWithTax(prices.totalPrice);
        setData("price", prices.totalPrice);
    };

    const handleVatChange = (value: string) => {
        setData("vat_rate", value);
        const prices = calculatePrices(Number(formData.unit_price));
        setTaxAmount(prices.taxAmount);
        setPriceWithTax(prices.totalPrice);
        setData("price", prices.totalPrice);
    };

    const nextStep = () => {
        let valid = false;
        switch (currentStep) {
            case 1: valid = validateStep1(); break;
            case 2: valid = validateStep2(); break;
            case 3: valid = validateStep3(); break;
            default: valid = true;
        }
        if (valid && currentStep < STEPS.length) setCurrentStep(currentStep + 1);
    };
    const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
    const handleClose = () => { reset(); setCurrentStep(1); onClose(); };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Actualice los datos del producto." : "Ingrese los datos del producto."}
                    </DialogDescription>
                </DialogHeader>

                <Stepper steps={STEPS} currentStep={currentStep} />
                <div className="py-4">
                    <StepperContent step={1} currentStep={currentStep}>
                        {/* --- Step 1: Información Básica --- */}
                        <div className="space-y-4">
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

                                <div>
                                    <Label htmlFor="unit_type">
                                        Unidad de medida <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="unit_type"
                                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${validationErrors.unit_type ? 'border-red-500' : ''
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
                    </StepperContent>

                    <StepperContent step={2} currentStep={currentStep}>
                        {/* --- Step 2: Detalles Adicionales --- */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="category_id">
                                    Categoría <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="category_id"
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${validationErrors.category_id ? 'border-red-500' : ''
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

                            <div className="grid grid-cols-3 gap-4">
                            {formData.item_type === 'product' && (
                                <div className="col-span-1">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={formData.sku}
                                        onChange={(e) => setData("sku", e.target.value)}
                                        placeholder="SKU del producto (opcional)"
                                    />
                                </div>
                                )}
                                {formData.item_type === 'product' && (
                                    <div className="col-span-1">
                                        <Label htmlFor="brand">Marca</Label>
                                        <Input
                                            id="brand"
                                            value={formData.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                            placeholder="Marca del producto (opcional)"
                                        />
                                        {validationErrors.brand && <p className="text-sm text-red-500">{validationErrors.brand}</p>}
                                        <p className="mt-1 text-xs text-gray-500">Marca del producto (opcional)</p>
                                    </div>
                                )}
                                {formData.item_type === 'product' && (
                                    <div className="col-span-1">
                                        <Label htmlFor="model">Modelo</Label>
                                        <Input
                                            id="model"
                                            value={formData.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                            placeholder="Modelo del producto (opcional)"
                                        />
                                        {validationErrors.model && <p className="text-sm text-red-500">{validationErrors.model}</p>}
                                        <p className="mt-1 text-xs text-gray-500">Modelo del producto (opcional)</p>
                                    </div>

                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {formData.item_type === 'service' && (
                                    <div className="col-span-1">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={formData.sku}
                                        onChange={(e) => setData("sku", e.target.value)}
                                        placeholder="SKU del producto"
                                    />
                                    {validationErrors.sku && <p className="text-sm text-red-500">{validationErrors.sku}</p>}
                                    <p className="mt-1 text-xs text-gray-500">SKU del producto (opcional)</p>
                                </div>
                                )}
                                {/* Stock - Solo para productos */}
                                <div className="col-span-1">
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
                                {formData.item_type === 'product' && (
                                    <div className="col-span-1">
                                        <Label htmlFor="min_stock">Stock mínimo <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="min_stock"
                                            type="number"
                                            min="0"
                                            value={formData.min_stock}
                                            onChange={(e) => setData("min_stock", parseInt(e.target.value) || 0)}
                                            required
                                            className={validationErrors.min_stock ? 'border-red-500' : ''}
                                        />
                                        {validationErrors.min_stock && <p className="text-sm text-red-500">{validationErrors.min_stock}</p>}
                                        <p className="mt-1 text-xs text-gray-500">Cantidad mínima en inventario</p>
                                    </div>

                                )}

                                {/* Costo */}
                                <div className={formData.item_type === 'service' ? 'col-span-1' : ''}>
                                    <Label htmlFor="cost">{formData.item_type === 'product' ? 'Costo de adquisición' : 'Costo del servicio'}</Label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                            $
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
                                    <Checkbox id="active" checked={formData.active} onCheckedChange={(checked) => setData('active', !!checked)} />
                                    <Label htmlFor="active" className="text-sm font-normal">
                                        {formData.item_type === 'product' ? 'Producto activo' : 'Servicio activo'}
                                    </Label>
                                </div>
                            )}
                        </div>
                    </StepperContent>

                    <StepperContent step={3} currentStep={currentStep}>
                        {/* --- Step 3: Precios e Impuestos --- */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="vat_rate">IVA</Label>
                                <select
                                    id="vat_rate"
                                    value={formData.vat_rate}
                                    onChange={(e) => handleVatChange(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {IGV_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="unit_price">Precio unitario</Label>
                                    <Input
                                        id="unit_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.unit_price}
                                        onChange={handlePriceChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cost">Costo</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={(e) => setData("cost", parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 rounded-md bg-gray-50 p-3">
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Precio base:</span>
                                        <div className="font-medium">${Number(formData.unit_price).toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">IVA:</span>
                                        <div className="font-medium">${Number(taxAmount).toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Precio final:</span>
                                        <div className="font-medium">${Number(priceWithTax).toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </StepperContent>

                    <DialogFooter className="mt-6 flex justify-end space-x-2">
                        {currentStep > 1 && <Button type="button" variant="outline" onClick={prevStep}>Anterior</Button>}
                        {currentStep < STEPS.length
                            ? <Button type="button" onClick={nextStep}>Siguiente</Button>
                            : <Button type="button" onClick={handleSubmit}>{isEditMode ? "Actualizar" : "Guardar"}</Button>}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

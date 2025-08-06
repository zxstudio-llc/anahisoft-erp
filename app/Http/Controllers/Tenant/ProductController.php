<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Category;
use App\Models\Tenant\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Muestra la lista de productos
     */
    public function index()
    {
        return Inertia::render('Tenant/Products/Index');
    }

    /**
     * Muestra el formulario para crear un producto
     */
    public function create()
    {
        // Obtener categorías para el formulario
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Unidades de medida para el formulario
        $unitTypes = [
            ['value' => 'NIU', 'label' => 'Unidad'],
            ['value' => 'KGM', 'label' => 'Kilogramo'],
            ['value' => 'LTR', 'label' => 'Litro'],
            ['value' => 'MTR', 'label' => 'Metro'],
            ['value' => 'GLL', 'label' => 'Galón'],
            ['value' => 'BX', 'label' => 'Caja'],
            ['value' => 'PK', 'label' => 'Paquete'],
        ];

        // Tipos de IGV según catálogo SUNAT
        $igvTypes = [
            ['value' => '10', 'label' => 'Gravado - Operación Onerosa'],
            ['value' => '20', 'label' => 'Exonerado - Operación Onerosa'],
            ['value' => '30', 'label' => 'Inafecto - Operación Onerosa'],
            ['value' => '40', 'label' => 'Exportación'],
        ];

        // Monedas disponibles
        $currencies = [
            ['value' => 'PEN', 'label' => 'Soles'],
            ['value' => 'USD', 'label' => 'Dólares'],
        ];

        return Inertia::render('Tenant/Products/Create', [
            'categories' => $categories,
            'unit_types' => $unitTypes,
            'igv_types' => $igvTypes,
            'currencies' => $currencies,
        ]);
    }


    /**
     * Muestra los detalles de un producto
     */
    public function show(Product $product)
    {
        $product->load('category');

        return Inertia::render('Tenant/Products/Show', [
            'product' => $product,
            'price_data' => [
                'price_without_igv' => $product->price_without_igv,
                'igv_amount' => $product->igv_amount,
                'price_with_igv' => $product->price_with_igv,
            ],
        ]);
    }

    /**
     * Muestra el formulario para editar un producto
     */
    public function edit(Product $product)
    {
        // Cargar la categoría del producto
        $product->load('category');

        // Obtener categorías para el formulario
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Unidades de medida para el formulario
        $unitTypes = [
            ['value' => 'NIU', 'label' => 'Unidad'],
            ['value' => 'KGM', 'label' => 'Kilogramo'],
            ['value' => 'LTR', 'label' => 'Litro'],
            ['value' => 'MTR', 'label' => 'Metro'],
            ['value' => 'GLL', 'label' => 'Galón'],
            ['value' => 'BX', 'label' => 'Caja'],
            ['value' => 'PK', 'label' => 'Paquete'],
        ];

        // Tipos de IGV según catálogo SUNAT
        $igvTypes = [
            ['value' => '10', 'label' => 'Gravado - Operación Onerosa'],
            ['value' => '20', 'label' => 'Exonerado - Operación Onerosa'],
            ['value' => '30', 'label' => 'Inafecto - Operación Onerosa'],
            ['value' => '40', 'label' => 'Exportación'],
        ];

        // Monedas disponibles
        $currencies = [
            ['value' => 'PEN', 'label' => 'Soles'],
            ['value' => 'USD', 'label' => 'Dólares'],
        ];

        return Inertia::render('Tenant/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'unit_types' => $unitTypes,
            'igv_types' => $igvTypes,
            'currencies' => $currencies,
        ]);
    }
}

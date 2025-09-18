<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Category;
use App\Models\Tenant\Products;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{

    /**
     * Listar productos
     */
    public function index(Request $request)
    {
        $query = Products::with('category');

        // Obtener parámetros desde params[] o directamente
        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $categoryId = $params['category_id'] ?? $request->input('category_id');
        $isActive = isset($params['is_active']) ? $params['is_active'] : $request->input('is_active');
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'created_at');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'desc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);

        // Filtros
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if (!empty($categoryId)) {
            $query->where('category_id', $categoryId);
        }

        if ($isActive !== null) {
            $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
        }

        // Ordenamiento
        $query->orderBy($sortField, $sortOrder);

        // Paginación
        $products = $query->paginate($perPage)->withQueryString();

        // Obtener categorías para filtros
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Unidades de medida para filtros
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

        return response()->json([
            'products' => $products,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'is_active' => $isActive,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
            ],
            'categories' => $categories,
            'unit_types' => $unitTypes,
            'currencies' => $currencies,
        ]);
    }



    /**
     * Mostrar un producto
     */
    public function show($id)
    {
        $product = Products::with('category')->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Crear un nuevo producto
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:products,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'item_type' => 'required|in:product,service',
            'unit_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'stock' => 'required_if:item_type,product|integer|min:0',
            'min_stock' => 'required_if:item_type,product|integer|min:0',
            'track_inventory' => 'boolean',
            'vat_rate' => 'required|numeric|min:0',
            'ice_rate' => 'nullable|numeric|min:0',
            'irbpnr_rate' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|min:0',
            'unit_type' => 'required|string|max:4',
            'has_igv' => 'required|boolean',
            'category_id' => 'nullable|exists:categories,id',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'active' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $product = Products::create($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Producto creado correctamente',
                'data' => $product
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el producto: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Actualiza un producto
     */
    public function update(Request $request, Products $product)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:products,code,' . $product->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'item_type' => 'required|in:product,service',
            'unit_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'stock' => 'required_if:item_type,product|integer|min:0',
            'min_stock' => 'required_if:item_type,product|integer|min:0',
            'track_inventory' => 'boolean',
            'vat_rate' => 'required|numeric|min:0',
            'ice_rate' => 'nullable|numeric|min:0',
            'irbpnr_rate' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|min:0',
            'unit_type' => 'required|string|max:4',
            'has_igv' => 'required|boolean',
            'category_id' => 'nullable|exists:categories,id',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'active' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $product->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Producto actualizado correctamente',
                'data' => $product
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el producto: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Elimina un producto
     */
    public function destroy(Products $product)
    {
        try {
            
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el producto: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * FUNCIONES ADICIONALES
     */

    /**
     * Obtiene el siguiente código de producto disponible.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function nextCode()
    {
        try {
            // Obtener el último código numérico usando una subconsulta para evitar recursión
            $lastCode = DB::table('products')
                ->whereRaw("code ~ '^[0-9]+$'")
                ->orderByRaw('CAST(code AS INTEGER) DESC')
                ->value('code');

            // Si no hay códigos previos o el último no es numérico, empezar desde 1
            if (!$lastCode || !is_numeric($lastCode)) {
                return response()->json([
                    'success' => true,
                    'data' => ['code' => '000001']
                ]);
            }

            // Incrementar el último código
            $nextCode = str_pad((int)$lastCode + 1, 6, '0', STR_PAD_LEFT);

            return response()->json([
                'success' => true,
                'data' => ['code' => $nextCode]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al generar el código de producto: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el código: ' . $e->getMessage()
            ], 500);
        }
    }
}

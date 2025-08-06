<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Listar categorías
     */
    public function index(Request $request)
    {
        $params = $request->input('params', []);
        $query = Category::query();

        // Filtros
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($params['is_active'])) {
            $query->where('is_active', filter_var($params['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        // Ordenamiento
        $sortField = $params['sort_field'] ?? 'name';
        $sortOrder = $params['sort_order'] ?? 'asc';
        $query->orderBy($sortField, $sortOrder);

        // Paginación
        $perPage = $params['per_page'] ?? 10;
        $categories = $query->withCount('products')->paginate($perPage)->withQueryString();

        return response()->json([
            'success' => true,
            'categories' => $categories,
            'filters' => [
                'search' => $params['search'] ?? '',
                'is_active' => isset($params['is_active']) ? filter_var($params['is_active'], FILTER_VALIDATE_BOOLEAN) : null,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int)$perPage,
            ],
        ]);
    }

    /**
     * Mostrar una categoría
     */
    public function show($id)
    {
        $category = Category::withCount('products')->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Crear una nueva categoría
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = Category::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Categoría creada correctamente',
            'data' => $category
        ], 201);
    }

    /**
     * Actualizar una categoría
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada correctamente',
            'data' => $category
        ]);
    }

    /**
     * Eliminar una categoría
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        // Verificar si tiene productos asociados
        $productsCount = $category->products()->count();
        if ($productsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la categoría porque tiene productos asociados'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoría eliminada correctamente'
        ]);
    }
}

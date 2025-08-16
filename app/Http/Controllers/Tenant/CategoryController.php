<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Muestra la lista de categorías
     */
    public function index()
    {
        return Inertia::render('Tenant/Categories/Index');
    }

    /**
     * Muestra el formulario para crear una categoría
     */
    public function create()
    {
        return Inertia::render('Tenant/Categories/Create');
    }


    /**
     * Muestra los detalles de una categoría
     */
    public function show(Category $category)
    {
        $category->loadCount('products');

        return Inertia::render('Tenant/Categories/Show', [
            'category' => $category,
        ]);
    }

    /**
     * Muestra el formulario para editar una categoría
     */
    public function edit(Category $category)
    {
        return Inertia::render('Tenant/Categories/Edit', [
            'category' => $category,
        ]);
    }
}

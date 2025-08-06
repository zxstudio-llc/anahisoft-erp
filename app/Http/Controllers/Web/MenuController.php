<?php

namespace App\Http\Controllers\Web;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\News;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::with(['items' => function($query) {
            $query->with('children')->whereNull('parent_id')->orderBy('order');
        }])->get();

        return Inertia::render('app/menus/index', [
            'menus' => $menus,
            'availablePages' => Page::where('is_active', true)
                             ->select('id', 'title', 'slug')
                             ->get(),
            'availableCategories' => Category::select('id', 'name', 'slug')->get(),
            'menuItemTypes' => MenuItem::getTypes()
        ]);
    }

    public function create()
    {
        return Inertia::render('app/menus/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        Menu::create($data);
        return redirect()->route('admin.menus.index')->with('success', 'Menú creado correctamente');
    }

    public function show(Menu $menu)
    {
        $menu->load(['items' => function($query) {
            $query->with('children')->whereNull('parent_id')->orderBy('order');
        }]);

        // Obtener páginas disponibles para agregar al menú
        $availablePages = Page::where('is_active', true)
                             ->select('id', 'title', 'slug')
                             ->get();

        $availableCategories = Category::select('id', 'name', 'slug')->get();

        return Inertia::render('app/menus/show', [
            'menu' => $menu,
            'availablePages' => $availablePages,
            'availableCategories' => $availableCategories,
            'menuItemTypes' => MenuItem::getTypes()
        ]);
    }

    public function edit(Menu $menu)
    {
        return Inertia::render('app/menus/edit', [
            'menu' => $menu
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $menu->update($data);
        return redirect()->route('admin.menus.index')->with('success', 'Menú actualizado correctamente');
    }

    public function destroy(Menu $menu)
    {
        // Eliminar todos los items del menú
        $menu->items()->delete();
        $menu->delete();
        
        return back()->with('success', 'Menú eliminado correctamente');
    }
    
    public function updateOrder(Request $request, Menu $menu)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.id' => 'required|exists:menu_items,id,menu_id,'.$menu->id,
                'items.*.order' => 'required|integer|min:1',
                'items.*.parent_id' => 'nullable|exists:menu_items,id,menu_id,'.$menu->id
            ]);

            DB::beginTransaction();

            foreach ($validated['items'] as $itemData) {
                if ($itemData['parent_id'] && $this->wouldCreateLoop($itemData['id'], $itemData['parent_id'])) {
                    throw new \Exception("Invalid parent assignment");
                }

                MenuItem::where('id', $itemData['id'])
                    ->update([
                        'order' => $itemData['order'],
                        'parent_id' => $itemData['parent_id']
                    ]);
            }

            DB::commit();

            // Devuelve los datos actualizados
            return redirect()->back()->with([
                'success' => 'Order updated successfully',
                'menu' => $menu->fresh()->load(['items' => function($query) {
                    $query->with('children')->whereNull('parent_id')->orderBy('order');
                }])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Error updating order: '.$e->getMessage()
            ]);
        }
    }

    private function wouldCreateLoop($itemId, $parentId)
    {
        if ($itemId == $parentId) return true;
        
        $current = MenuItem::find($parentId);
        while ($current) {
            if ($current->id == $itemId) return true;
            $current = $current->parent;
        }
        return false;
    }
    
    public function getMenuForFrontend($location = null)
    {
        $query = Menu::active()->with(['rootItems.children']);
        
        if ($location) {
            $query->byLocation($location);
        }

        return $query->first();
    }
}
<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Post;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuItemController extends Controller
{
    /**
     * Obtener todos los elementos de un menú específico
     */
    public function index(Menu $menu)
    {
        try {
            $items = $menu->items()
                ->with(['children' => function($query) {
                    $query->orderBy('order');
                }])
                ->whereNull('parent_id')
                ->orderBy('order')
                ->get();

            return response()->json([
                'success' => true,
                'items' => $items,
                'menu' => $menu
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar los elementos del menú: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Almacenar un nuevo elemento en el menú
     */
    public function store(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'url' => 'nullable|string',
            'type' => 'required|in:' . implode(',', array_keys(MenuItem::getTypes())),
            'object_id' => 'nullable|integer',
            'target' => 'nullable|in:_self,_blank',
            'css_class' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'parent_id' => 'nullable|exists:menu_items,id',
            'is_active' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            // Calcular el orden si no se proporciona
            $order = $validated['order'] ?? ($menu->items()->max('order') + 1 ?? 0);

            $menuItem = new MenuItem([
                'menu_id' => $menu->id, // Asegurar que menu_id está establecido
                'label' => $validated['label'],
                'url' => $validated['url'] ?? null,
                'type' => $validated['type'],
                'object_id' => $validated['object_id'] ?? null,
                'target' => $validated['target'] ?? '_self',
                'css_class' => $validated['css_class'] ?? null,
                'order' => $order,
                'parent_id' => $validated['parent_id'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Validar que el parent_id pertenece al mismo menú
            if ($menuItem->parent_id) {
                $parent = MenuItem::where('id', $menuItem->parent_id)
                                ->where('menu_id', $menu->id)
                                ->first();
                
                if (!$parent) {
                    DB::rollBack();
                    return back()->withErrors(['parent_id' => 'El elemento padre no es válido']);
                }
            }

            // Generar label automáticamente si es necesario
            if (empty($menuItem->label)) {
                $menuItem->label = $this->generateLabelFromObject($menuItem->type, $menuItem->object_id);
            }

            // Generar URL automáticamente si es necesario
            if (empty($menuItem->url)) {
                $menuItem->url = $this->generateUrlFromObject($menuItem->type, $menuItem->object_id);
            }

            $menuItem->save();
            DB::commit();

            return back()->with('success', 'Elemento añadido al menú');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear el elemento: '.$e->getMessage()]);
        }
    }

    /**
     * Actualizar un elemento del menú
     */
    public function update(Request $request, MenuItem $menuItem)
    {
        if (!$menuItem->exists) {
            return response()->json([
                'success' => false,
                'message' => 'El elemento del menú no existe'
            ], 404);
        }
        
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'url' => 'nullable|string',
            'target' => 'nullable|in:_self,_blank',
            'css_class' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'parent_id' => 'nullable|exists:menu_items,id',
            'is_active' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            $menuItem->label = $validated['label'];
            $menuItem->url = $validated['url'] ?? $menuItem->url;
            $menuItem->target = $validated['target'] ?? $menuItem->target;
            $menuItem->css_class = $validated['css_class'] ?? $menuItem->css_class;
            $menuItem->order = $validated['order'] ?? $menuItem->order;
            $menuItem->is_active = $validated['is_active'] ?? $menuItem->is_active;

            if (isset($validated['parent_id'])) {
                if ($validated['parent_id'] == $menuItem->id) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Un elemento no puede ser padre de sí mismo'
                    ], 422);
                }

                $parent = MenuItem::where('id', $validated['parent_id'])
                                ->where('menu_id', $menuItem->menu_id)
                                ->first();
                if (!$parent) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'El elemento padre no es válido'
                    ], 422);
                }

                if ($this->wouldCreateLoop($menuItem->id, $validated['parent_id'])) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Esta asignación crearía un bucle infinito'
                    ], 422);
                }

                $menuItem->parent_id = $validated['parent_id'];
            }

            $menuItem->save();
            DB::commit();

            if ($request->header('X-Inertia')) {
                return back()->with('success', 'Elemento actualizado correctamente');
            }
        
            return response()->json([
                'success' => true,
                'message' => 'Elemento actualizado',
                'menuItem' => $menuItem
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el elemento: '.$e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un elemento del menú
     */
    public function destroy(MenuItem $menuItem)
    {
        DB::beginTransaction();
        try {
            // Mover los hijos al padre del elemento eliminado
            $menuItem->children()->update(['parent_id' => $menuItem->parent_id]);
            
            $menuItem->delete();
            DB::commit();

            return back()->with('success', 'Elemento eliminado del menú');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al eliminar el elemento: '.$e->getMessage()]);
        }
    }

    /**
     * Agregar página al menú
     */
    public function addPage(Request $request, Menu $menu)
    {
        $request->validate([
            'page_ids' => 'required|array',
            'page_ids.*' => 'exists:pages,id',
            'parent_id' => 'nullable|exists:menu_items,id'
        ]);

        DB::beginTransaction();
        try {
            $maxOrder = $menu->items()->max('order') ?? 0;
            $parentId = $request->input('parent_id', null);

            foreach ($request->page_ids as $pageId) {
                $page = Page::findOrFail($pageId);
                
                // Verificar que la página no esté ya en el menú
                $exists = $menu->items()
                              ->where('type', MenuItem::TYPE_PAGE)
                              ->where('object_id', $pageId)
                              ->exists();
                
                if (!$exists) {
                    MenuItem::create([
                        'menu_id' => $menu->id,
                        'label' => $page->title,
                        'url' => route('pages.show', $page->slug),
                        'type' => MenuItem::TYPE_PAGE,
                        'object_id' => $pageId,
                        'order' => ++$maxOrder,
                        'parent_id' => $parentId,
                        'is_active' => true
                    ]);
                }
            }

            DB::commit();
            return back()->with('success', 'Páginas añadidas al menú');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al agregar páginas: '.$e->getMessage()]);
        }
    }

    /**
     * Agregar categoría al menú
     */
    public function addCategory(Request $request, Menu $menu)
    {
        $request->validate([
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'parent_id' => 'nullable|exists:menu_items,id'
        ]);

        DB::beginTransaction();
        try {
            $maxOrder = $menu->items()->max('order') ?? 0;
            $parentId = $request->input('parent_id', null);

            foreach ($request->category_ids as $categoryId) {
                $category = Category::findOrFail($categoryId);
                
                $exists = $menu->items()
                              ->where('type', MenuItem::TYPE_CATEGORY)
                              ->where('object_id', $categoryId)
                              ->exists();
                
                if (!$exists) {
                    MenuItem::create([
                        'menu_id' => $menu->id,
                        'label' => $category->name,
                        'url' => route('categories.show', $category->slug),
                        'type' => MenuItem::TYPE_CATEGORY,
                        'object_id' => $categoryId,
                        'order' => ++$maxOrder,
                        'parent_id' => $parentId,
                        'is_active' => true
                    ]);
                }
            }

            DB::commit();
            return back()->with('success', 'Categorías añadidas al menú');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al agregar categorías: '.$e->getMessage()]);
        }
    }

    /**
     * Almacenar múltiples elementos en el menú (operación por lotes)
     */
    public function storeBatch(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.label' => 'required|string|max:255',
            'items.*.url' => 'nullable|string',
            'items.*.type' => 'required|in:' . implode(',', array_keys(MenuItem::getTypes())),
            'items.*.object_id' => 'nullable|integer',
            'items.*.target' => 'nullable|in:_self,_blank',
            'items.*.css_class' => 'nullable|string|max:255',
            'items.*.order' => 'required|integer|min:0',
            'items.*.parent_id' => 'nullable|exists:menu_items,id',
            'items.*.is_active' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            $createdItems = [];
            $currentMaxOrder = $menu->items()->max('order') ?? 0;

            foreach ($validated['items'] as $itemData) {
                // Calcular el orden si no se proporciona
                $order = $itemData['order'] ?? ++$currentMaxOrder;

                $menuItem = new MenuItem([
                    'menu_id' => $menu->id,
                    'label' => $itemData['label'],
                    'url' => $itemData['url'] ?? null,
                    'type' => $itemData['type'],
                    'object_id' => $itemData['object_id'] ?? null,
                    'target' => $itemData['target'] ?? '_self',
                    'css_class' => $itemData['css_class'] ?? null,
                    'order' => $order,
                    'parent_id' => $itemData['parent_id'] ?? null,
                    'is_active' => $itemData['is_active'] ?? true,
                ]);

                // Validar parent_id si existe
                if ($menuItem->parent_id) {
                    $parent = MenuItem::where('id', $menuItem->parent_id)
                                    ->where('menu_id', $menu->id)
                                    ->first();
                    
                    if (!$parent) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'El elemento padre no es válido para uno de los items'
                        ], 422);
                    }
                }

                // Generar label y URL si es necesario
                if (empty($menuItem->label)) {
                    $menuItem->label = $this->generateLabelFromObject($menuItem->type, $menuItem->object_id);
                }

                if (empty($menuItem->url)) {
                    $menuItem->url = $this->generateUrlFromObject($menuItem->type, $menuItem->object_id);
                }

                $menuItem->save();
                $createdItems[] = $menuItem;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Elementos creados exitosamente',
                'items' => $createdItems
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear los elementos: '.$e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar múltiples elementos del menú (operación por lotes)
     */
    public function updateBatch(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:menu_items,id,menu_id,'.$menu->id,
            'items.*.label' => 'required|string|max:255',
            'items.*.url' => 'nullable|string',
            'items.*.target' => 'nullable|in:_self,_blank',
            'items.*.css_class' => 'nullable|string|max:255',
            'items.*.order' => 'required|integer|min:0',
            'items.*.parent_id' => 'nullable|exists:menu_items,id',
            'items.*.is_active' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            $updatedItems = [];

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::find($itemData['id']);
                
                if (!$menuItem || $menuItem->menu_id != $menu->id) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Uno de los elementos no pertenece a este menú'
                    ], 422);
                }

                $menuItem->label = $itemData['label'];
                $menuItem->url = $itemData['url'] ?? $menuItem->url;
                $menuItem->target = $itemData['target'] ?? $menuItem->target;
                $menuItem->css_class = $itemData['css_class'] ?? $menuItem->css_class;
                $menuItem->order = $itemData['order'];
                $menuItem->is_active = $itemData['is_active'] ?? $menuItem->is_active;

                if (isset($itemData['parent_id'])) {
                    if ($itemData['parent_id'] == $menuItem->id) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Un elemento no puede ser padre de sí mismo'
                        ], 422);
                    }

                    $parent = MenuItem::where('id', $itemData['parent_id'])
                                    ->where('menu_id', $menu->id)
                                    ->first();
                    if (!$parent) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'El elemento padre no es válido para uno de los items'
                        ], 422);
                    }

                    if ($this->wouldCreateLoop($menuItem->id, $itemData['parent_id'])) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Esta asignación crearía un bucle infinito en uno de los items'
                        ], 422);
                    }

                    $menuItem->parent_id = $itemData['parent_id'];
                }

                $menuItem->save();
                $updatedItems[] = $menuItem;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Elementos actualizados exitosamente',
                'items' => $updatedItems
            ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Error al actualizar los elementos: '.$e->getMessage()
                ], 500);
            }
        }

    /**
     * Generar label automáticamente basado en el tipo y objeto
     */
    private function generateLabelFromObject($type, $objectId)
    {
        switch ($type) {
            case MenuItem::TYPE_PAGE:
                $page = Page::find($objectId);
                return $page ? $page->title : 'Página';
            
            case MenuItem::TYPE_POST:
                $post = Post::find($objectId);
                return $post ? $post->title : 'Artículo';
            
            case MenuItem::TYPE_CATEGORY:
                $category = Category::find($objectId);
                return $category ? $category->name : 'Categoría';
            
            default:
                return 'Elemento de menú';
        }
    }

    /**
     * Generar URL automáticamente basado en el tipo y objeto
     */
    private function generateUrlFromObject($type, $objectId)
    {
        switch ($type) {
            case MenuItem::TYPE_PAGE:
                $page = Page::find($objectId);
                return $page ? route('pages.show', $page->slug) : '#';
            
            case MenuItem::TYPE_POST:
                $post = Post::find($objectId);
                return $post ? route('posts.show', $post->slug) : '#';
            
            case MenuItem::TYPE_CATEGORY:
                $category = Category::find($objectId);
                return $category ? route('categories.show', $category->slug) : '#';
            
            default:
                return '#';
        }
    }

    /**
     * Verificar si asignar un parent_id crearía un bucle
     */
    private function wouldCreateLoop($itemId, $parentId)
    {
        $currentParent = MenuItem::find($parentId);
        
        while ($currentParent) {
            if ($currentParent->id == $itemId) {
                return true;
            }
            $currentParent = $currentParent->parent;
        }
        
        return false;
    }
}
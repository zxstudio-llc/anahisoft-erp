<?php

namespace App\Http\Controllers\Web;

use App\Models\Seo;
use App\Models\Page;
use App\Models\News;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SeoController extends Controller
{
    public function index()
    {
        $seoEntries = Seo::with('model')
            ->latest()
            ->paginate(15);
            
        return inertia('app/seo/index', compact('seoEntries'));
    }

    public function create()
    {
        $availableModels = Seo::getAvailableModelTypes();
        $pages = Page::active()->ordered()->get(['id', 'title', 'slug']);
        $news = News::published()->latest()->get(['id', 'title', 'slug']);
        
        return inertia('app/seo/create', compact('availableModels', 'pages', 'news'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'route' => 'required|string|unique:seo,route',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'author' => 'nullable|string',
            'robots' => 'nullable|string',
            'keywords' => 'nullable|string',
            'canonical_url' => 'nullable|url',
            'model_type' => 'nullable|string',
            'model_id' => 'nullable|integer',
        ]);

        // Validar que el modelo existe si se especifica
        if ($data['model_type'] && $data['model_id']) {
            $modelClass = $data['model_type'];
            if (!class_exists($modelClass) || !$modelClass::find($data['model_id'])) {
                return back()->withErrors(['model_id' => 'El modelo especificado no existe.']);
            }
        } else {
            // SEO Global
            $data['model_type'] = null;
            $data['model_id'] = null;
        }

        Seo::create($data);
        
        return redirect()->route('admin.seo.index')->with('success', 'Meta SEO creado exitosamente.');
    }

    public function edit(Seo $seo)
    {
        $availableModels = Seo::getAvailableModelTypes();
        $pages = Page::active()->ordered()->get(['id', 'title', 'slug']);
        $news = News::published()->latest()->get(['id', 'title', 'slug']);
        
        return inertia('app/seo/edit', compact('seo', 'availableModels', 'pages', 'news'));
    }

    public function update(Request $request, Seo $seo)
    {
        $data = $request->validate([
            'route' => 'required|string|unique:seo,route,' . $seo->id,
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'author' => 'nullable|string',
            'robots' => 'nullable|string',
            'keywords' => 'nullable|string',
            'canonical_url' => 'nullable|url',
            'model_type' => 'nullable|string',
            'model_id' => 'nullable|integer',
        ]);

        // Validar que el modelo existe si se especifica
        if ($data['model_type'] && $data['model_id']) {
            $modelClass = $data['model_type'];
            if (!class_exists($modelClass) || !$modelClass::find($data['model_id'])) {
                return back()->withErrors(['model_id' => 'El modelo especificado no existe.']);
            }
        } else {
            // SEO Global
            $data['model_type'] = null;
            $data['model_id'] = null;
        }

        $seo->update($data);
        
        return redirect()->route('admin.seo.index')->with('success', 'Meta SEO actualizado exitosamente.');
    }

    public function destroy(Seo $seo)
    {
        $seo->delete();
        return back()->with('success', 'Meta SEO eliminado exitosamente.');
    }

    /**
     * API para obtener registros de un modelo específico
     */
    public function getModelRecords(Request $request)
    {
        $modelType = $request->get('model_type');
        
        if (!$modelType || !class_exists($modelType)) {
            return response()->json([]);
        }
        
        $records = $modelType::select('id', 'title', 'slug')
            ->orderBy('title')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'title' => $record->title,
                    'slug' => $record->slug,
                ];
            });
            
        return response()->json($records);
    }
}
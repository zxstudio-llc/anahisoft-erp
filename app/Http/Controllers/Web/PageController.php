<?php

namespace App\Http\Controllers\Web;

use App\Models\Page;
use App\Models\Banner;
use App\Models\Testimonial;
use App\Models\News;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        try {
            return Inertia::render('app/pages/index', [
                'pages' => Page::orderBy('title')->paginate(10),
                'templates' => Page::getAvailableTemplates(),
            ]);
        } catch (\Exception $e) {
            \Log::error('PageController@index error: ' . $e->getMessage());
            abort(500, 'Error al cargar las páginas');
        }
    }

    public function create()
    {
        return Inertia::render('app/pages/create', [
            'banners' => Banner::with('media')
                ->select([
                    'id',
                    'title',
                    'subtitle',
                    'link',
                    'is_active',
                    'published_at',
                ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($banner) {
                    return [
                        'id' => $banner->id,
                        'title' => $banner->title,
                        'subtitle' => $banner->subtitle,
                        'url' => $banner->link,
                        'is_active' => $banner->is_active,
                        'published_at' => $banner->published_at,
                        'image' => $banner->getFirstMediaUrl('banners_covers')
                    ];
                }),
            'testimonials' => Testimonial::where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'name', 'position', 'message', 'photo']),
            'news' => News::with('media')
                ->select([
                    'id',
                    'title',
                    'excerpt',
                    'slug',
                    'is_published',
                    'published_at',
                ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($news) {
                    return [
                        'id' => $news->id,
                        'title' => $news->title,
                        'excerpt' => $news->excerpt,
                        'slug' => $news->slug,
                        'is_published' => $news->is_published,
                        'published_at' => $news->published_at,
                        'image' => $news->getFirstMediaUrl('news_covers')
                    ];
                }),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:pages|max:255',
            'content' => 'nullable|string',
            'template' => 'required|string|in:' . implode(',', array_keys(Page::getAvailableTemplates())),
            'template_data' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'meta_image' => 'nullable|string|max:255',
        ]);

        if (isset($data['template_data'])) {
            $data['template_data'] = $this->sanitizeTemplateData($data['template_data']);
        }

        $page = Page::create($data);
        
        $page->getOrCreateSeo();

        return redirect()->route('admin.pages.index')
            ->with('success', 'Página creada correctamente');
    }

    public function edit(Page $page)
    {
        return Inertia::render('app/pages/edit', [
            'page' => $page->load('seo'),
            'templates' => Page::getAvailableTemplates(),
            'banners' => Banner::with('media')
                ->select([
                    'id',
                    'title',
                    'subtitle',
                    'link',
                    'is_active',
                    'published_at',
                ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($banner) {
                    return [
                        'id' => $banner->id,
                        'title' => $banner->title,
                        'subtitle' => $banner->subtitle,
                        'url' => $banner->link,
                        'is_active' => $banner->is_active,
                        'published_at' => $banner->published_at,
                        'image' => $banner->getFirstMediaUrl('banners_covers')
                    ];
                }),
            'testimonials' => Testimonial::where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'name', 'position', 'message', 'photo']),
            'news' => News::with('media')
                ->select([
                    'id',
                    'title',
                    'excerpt',
                    'slug',
                    'is_published',
                    'published_at',
                ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($news) {
                    return [
                        'id' => $news->id,
                        'title' => $news->title,
                        'excerpt' => $news->excerpt,
                        'slug' => $news->slug,
                        'is_published' => $news->is_published,
                        'published_at' => $news->published_at,
                        'image' => $news->getFirstMediaUrl('news_covers')
                    ];
                }),
        ]);
    }

    public function update(Request $request, Page $page)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:pages,slug,' . $page->id . '|max:255',
            'content' => 'nullable|string',
            'template' => 'required|string|in:' . implode(',', array_keys(Page::getAvailableTemplates())),
            'template_data' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'meta_image' => 'nullable|string|max:255',
        ]);

        if (isset($data['template_data'])) {
            $data['template_data'] = $this->sanitizeTemplateData($data['template_data']);
        }

        $page->update($data);
        
        if ($page->seo) {
            $page->seo->update([
                'title' => $data['meta_title'] ?? $data['title'],
                'description' => $data['meta_description'] ?? $page->getMetaDescription(),
                'image' => $data['meta_image'],
            ]);
        } else {
            $page->getOrCreateSeo();
        }

        return redirect()->route('admin.pages.index')
            ->with('success', 'Página actualizada correctamente');
    }

    public function destroy(Page $page)
    {
        $page->seo()->delete();
        $page->delete();
        
        return back()->with('success', 'Página eliminada correctamente');
    }
    
    public function show(Page $page)
    {
        if (!$page->is_active && !auth()->check()) {
            abort(404);
        }
        
        return Inertia::render($page->getTemplateView(), [
            'page' => $page,
            'seo' => $page->getOrCreateSeo(),
        ]);
    }

    /**
     * Sanitiza y valida los datos del template
     */
    private function sanitizeTemplateData(array $templateData): array
    {
        $sanitized = [];
        
        foreach ($templateData as $key => $value) {
            if (is_string($value)) {
                $sanitized[$key] = trim($value);
            }
            elseif (is_array($value) || is_object($value)) {
                $sanitized[$key] = $value;
            }
            elseif (is_bool($value) || is_numeric($value)) {
                $sanitized[$key] = $value;
            }
            else {
                $sanitized[$key] = (string) $value;
            }
        }
        
        return $sanitized;
    }

    /**
     * Obtiene la vista previa de un template (opcional - para desarrollo)
     */
    public function previewTemplate(Request $request)
    {
        $request->validate([
            'template' => 'required|string',
            'template_data' => 'nullable|array',
            'title' => 'required|string',
        ]);

        // Crear página temporal para preview
        $tempPage = new Page([
            'title' => $request->title,
            'template' => $request->template,
            'template_data' => $request->template_data ?? [],
            'is_active' => true,
        ]);

        return Inertia::render($tempPage->getTemplateView(), [
            'page' => $tempPage,
            'seo' => (object) [
                'title' => $request->title,
                'description' => 'Vista previa del template',
                'image' => null,
            ],
            'isPreview' => true,
        ]);
    }
}
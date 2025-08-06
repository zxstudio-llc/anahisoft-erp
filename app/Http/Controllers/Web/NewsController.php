<?php

namespace App\Http\Controllers\Web;

use App\Models\News;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index()
    {
        return Inertia::render('app/news/index', [
            'news' => News::with('media')
                ->latest()
                ->paginate(10)
                ->through(function ($news) {
                    return [
                        'id' => $news->id,
                        'title' => $news->title,
                        'slug' => $news->slug,
                        'excerpt' => $news->excerpt,
                        'content' => $news->content,
                        'is_published' => $news->is_published,
                        'published_at' => $news->published_at?->toDateTimeString(),
                        'image_url' => $news->image_url ?? null,
                        'created_at' => $news->created_at->toDateTimeString(),
                        'updated_at' => $news->updated_at->toDateTimeString(),
                    ];
                })
        ]);
    }

    public function create()
    {
        return Inertia::render('app/news/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'slug' => 'required|unique:news',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'published_at' => 'nullable|date',
            'is_published' => 'boolean',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        $news = News::create($data);

        if ($request->hasFile('cover_image')) {
            $news->addMediaFromRequest('cover_image')
                ->toMediaCollection('news_covers');
        }

        return redirect()->route('admin.news.index')
            ->with('success', 'Noticia creada correctamente');
    }


    public function edit(News $news)
    {
        return Inertia::render('app/news/edit', [
            'news' => $news->only([
                'id', 'title', 'slug', 'excerpt', 'content',
                'published_at', 'is_published',
            ]) + ['image_url' => $news->image_url],
        ]);
    }
    

    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug,'.$news->id,
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'published_at' => 'nullable|date',
            'is_published' => 'boolean',
            'image' => 'nullable|image|max:5120',
            'remove_image' => 'nullable|boolean',
            'collection_name' => 'nullable|string'
        ]);

        if ($request->input('remove_image')) {
            // Eliminar la imagen existente
            $news->clearMediaCollection('news_covers');
        } elseif ($request->hasFile('image')) {
            // Reemplazar la imagen existente
            $news->clearMediaCollection('news_covers');
            $news->addMediaFromRequest('image')
                ->toMediaCollection('news_covers');
        }
    
        $news->update($validated);
    
        // if ($request->hasFile('image')) {
        //     // Eliminar la imagen anterior si existe
        //     $news->clearMediaCollection('news_covers');
            
        //     // Agregar la nueva imagen
        //     $news->addMediaFromRequest('image')
        //         ->toMediaCollection('news_covers');
        // }
    
        return redirect()->route('admin.news.index')
            ->with('success', 'Noticia actualizada correctamente');
    }


    public function destroy(News $news)
    {
        $news->delete();
        return back()->with('success', 'Noticia eliminada');
    }
}

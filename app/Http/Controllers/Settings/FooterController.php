<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Footer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FooterController extends Controller
{
    public function index()
    {
        $footer = Footer::firstOrCreate([], [
            'name' => 'Default Footer',
            'template' => array_key_first(config('footer.templates')),
            'content' => [],
            'is_active' => true
        ]);
        
        return Inertia::render('app/settings/footers/manage', [
            'footer' => $footer,
            'templates' => config('footer.templates'),
            'defaultContent' => config('footer.templates.'.$footer->template.'.default_content', [])
        ]);
    }

    public function update(Request $request, Footer $footer)
{
    // Validación inicial
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'template' => 'required|in:'.implode(',', array_keys(config('footer.templates'))),
        'content' => 'required', // Cambiamos a required sin tipo array
        'logo' => 'nullable|image|mimes:jpeg,png,svg|max:2048',
        'brands.*' => 'nullable|image|mimes:jpeg,png,svg|max:2048'
    ]);

    // Procesamiento del contenido
    $content = $validated['content'];
    
    // Si es string, decodificamos
    if (is_string($content)) {
        $content = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return back()->withErrors([
                'content' => 'El contenido del footer no tiene un formato válido'
            ]);
        }
    }
    
    // Validamos que el contenido decodificado sea un array
    if (!is_array($content)) {
        return back()->withErrors([
            'content' => 'El contenido debe ser un array válido'
        ]);
    }

    // Actualizamos el contenido validado
    $validated['content'] = $content;

    // Manejo del logo
    if ($request->hasFile('logo')) {
        $footer->clearMediaCollection('footer_logo');
        $footer->addMediaFromRequest('logo')
            ->toMediaCollection('footer_logo');
    }

    // Manejo de marcas
    if ($request->hasFile('brands')) {
        foreach ($request->file('brands') as $index => $brandFile) {
            $media = $footer->addMedia($brandFile)
                ->toMediaCollection('footer_brands');
            
            if (!isset($validated['content']['brands'])) {
                $validated['content']['brands'] = [];
            }
            
            $validated['content']['brands'][$index] = [
                'media_id' => $media->id,
                'image' => $media->getUrl(),
                'alt' => $validated['content']['brands'][$index]['alt'] ?? '',
                'url' => $validated['content']['brands'][$index]['url'] ?? ''
            ];
        }
    }

    $footer->update($validated);

    return redirect()->back()
        ->with('success', 'Footer actualizado correctamente');
}
}
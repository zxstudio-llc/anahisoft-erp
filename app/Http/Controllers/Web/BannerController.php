<?php

namespace App\Http\Controllers\Web;

use App\Models\Banner;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BannerController extends Controller
{
    public function index()
    {
        return Inertia::render('app/banners/index', [
            'banners' => Banner::with('media')
                ->latest()
                ->paginate(10)
                ->through(function ($banner) {
                    return [
                        'id' => $banner->id,
                        'title' => $banner->title,
                        'subtitle' => $banner->subtitle,
                        'link' => $banner->link,
                        'cta' => $banner->cta,
                        'is_active' => $banner->is_active,
                        'published_at' => $banner->published_at?->toDateTimeString(),
                        'image_url' => $banner->image_url,
                        'created_at' => $banner->created_at->toDateTimeString(),
                        'updated_at' => $banner->updated_at->toDateTimeString(),
                    ];
                })
        ]);
    }

    public function create()
    {
        return Inertia::render('app/banners/create');
    }

    public function store(Request $request)
    {
        $request->merge([
            'cta' => $request->has('cta') ? json_decode($request->input('cta'), true) : null,
        ]);

        $data = $request->validate([
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'image' => [
                'required',
                'image',
                'max:5120',
                function ($attribute, $value, $fail) use ($request) {
                    $imageInfo = getimagesize($value->getPathname());
                    $width = $imageInfo[0];
                    $height = $imageInfo[1];
                    if ($width !== (int) $request->input('width') || $height !== (int) $request->input('height')) {
                        $fail("La imagen debe tener dimensiones exactas de {$request->input('width')}x{$request->input('height')} px.");
                    }
                }
            ],
            'link' => 'nullable|url',
            'cta' => 'nullable|array',
            'published_at' => 'nullable|date',
            'is_active' => 'boolean',
            'width' => 'required|integer',
            'height' => 'required|integer',
        ]);

        $banner = Banner::create($data);

        if ($request->hasFile('image')) {
            $banner->addMediaFromRequest('image')
                ->toMediaCollection('banners_covers');
        }

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner creado correctamente');
    }

    public function edit($id)
    {
        $banner = Banner::with('media')->findOrFail($id);
        
        // Debug final
        logger()->debug('Banner data', [
            'from_db' => $banner->toArray(),
            'media' => $banner->getFirstMedia('banners_covers')?->getUrl()
        ]);
        
        return Inertia::render('app/banners/edit', [
            'banner' => [
                'id' => $banner->id,
                'title' => $banner->title,
                'subtitle' => $banner->subtitle,
                'link' => $banner->link,
                'cta' => $banner->cta,
                'is_active' => (bool)$banner->is_active,
                'published_at' => $banner->published_at?->format('Y-m-d\TH:i'),
                'image_url' => $banner->getFirstMediaUrl('banners_covers'),
                'width' => $banner->width,
                'height' => $banner->height,
            ]
        ]);
    }

    public function update(Request $request, $id)
{
    $banner = Banner::findOrFail($id);
        // Add null check for safety
        if (!$banner) {
            return redirect()->route('admin.banners.index')
                ->with('error', 'Banner no encontrado');
        }
    
        // Debug: Log de datos recibidos
        logger()->debug('Update request data', [
            'banner_id' => $banner->id,
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
            'remove_image' => $request->input('remove_image'),
            'has_image_file' => $request->hasFile('image')
        ]);
    
        $request->merge([
            'cta' => $request->has('cta') ? json_decode($request->input('cta'), true) : null,
        ]);
        
        $validated = $request->validate([
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'image' => [
                'nullable',
                'image',
                'max:5120',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value) {
                        $imageInfo = getimagesize($value->getPathname());
                        $width = $imageInfo[0];
                        $height = $imageInfo[1];
                        if ($width !== (int) $request->input('width') || $height !== (int) $request->input('height')) {
                            $fail("La imagen debe tener dimensiones exactas de {$request->input('width')}x{$request->input('height')} px.");
                        }
                    }
                }
            ],
            'link' => 'nullable|url',
            'cta' => 'nullable|array',
            'published_at' => 'nullable|date',
            'is_active' => 'boolean',
            'remove_image' => 'nullable|boolean',
            'width' => 'required|integer',
            'height' => 'required|integer',
        ]);
    
        // Debug: Log después de validación
        logger()->debug('Validated data', [
            'validated' => $validated,
            'remove_image_boolean' => $request->boolean('remove_image'),
        ]);
    
        try {
            // Get current media count before operations
            $currentMediaCount = $banner->getMedia('banners_covers')->count();
            
            logger()->debug('Current media state', [
                'banner_id' => $banner->id,
                'current_media_count' => $currentMediaCount
            ]);
    
            // Manejar la eliminación/actualización de imagen
            $removeImage = $request->boolean('remove_image') || $request->input('remove_image') === '1' || $request->input('remove_image') === 'true';
            
            if ($removeImage) {
                logger()->debug('Removing image from banner', ['banner_id' => $banner->id]);
                // Solo eliminar la imagen, no subir nueva
                $banner->clearMediaCollection('banners_covers');
                
                // Refresh the model to get updated state
                $banner = Banner::findOrFail($banner->id);
                
                logger()->debug('Image removed, media count after removal', [
                    'media_count' => $banner->getMedia('banners_covers')->count()
                ]);
            } elseif ($request->hasFile('image')) {
                logger()->debug('Adding new image to banner', ['banner_id' => $banner->id]);
                // Reemplazar imagen existente con nueva
                $banner->clearMediaCollection('banners_covers');
                $banner->addMediaFromRequest('image')
                    ->toMediaCollection('banners_covers');
                
                // Refresh the model to get updated state
                $banner = $banner->fresh();
                
                logger()->debug('New image added, media count after addition', [
                    'media_count' => $banner?->getMedia('banners_covers')?->count() ?? 0

                ]);
            }
    
            // Remover campos de imagen de los datos validados antes de actualizar
            unset($validated['image'], $validated['remove_image']);
            
            $banner->update($validated);
    
            logger()->debug('Banner updated successfully', [
                'banner_id' => $banner->id,
                'final_media_count' => $banner->fresh()->getMedia('banners_covers')->count()
            ]);
    
            return redirect()->route('admin.banners.index')
                ->with('success', 'Banner actualizado correctamente');
                
        } catch (\Exception $e) {
            logger()->error('Error updating banner', [
                'banner_id' => $banner->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('admin.banners.index')
                ->with('error', 'Error al actualizar el banner: ' . $e->getMessage());
        }
    }

    public function destroy(Banner $banner)
    {
        $banner->delete();
        return back()->with('success', 'Banner eliminado');
    }
}
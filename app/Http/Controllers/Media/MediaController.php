<?php

namespace App\Http\Controllers\Media;

use App\Http\Controllers\Controller;
use App\Http\Requests\Media\{
    StoreMediaRequest,
    UpdateMediaRequest,
    DeleteMediaRequest,
    ListMediaRequest,
    TransformMediaRequest
};
use App\Models\Media\Media;
use App\Models\Media\UnattachedMedia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Image\Image;
use Spatie\Image\Manipulations;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Storage;
use GuzzleHttp\Client;
use GuzzleHttp\TransferStats;

class MediaController extends Controller
{
    public function index(ListMediaRequest $request)
    {
        $validated = $request->validated();

        $visibleFilters = [
            'trashed' => $validated['trashed'] !== 'without' ? $validated['trashed'] : null,
            'search' => !empty($validated['search']) ? $validated['search'] : null,
            'collection' => !empty($validated['collection']) ? $validated['collection'] : null,
            'mime_type' => !empty($validated['mime_type']) ? $validated['mime_type'] : null,
        ];

        $query = Media::query()
            ->when($validated['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($validated['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->when(!empty($validated['search']), fn($q) => $q->where('name', 'like', "%{$validated['search']}%"))
            ->when(!empty($validated['collection']), fn($q) => $q->where('collection_name', $validated['collection']))
            ->when(!empty($validated['mime_type']), fn($q) => $q->where('mime_type', 'like', "{$validated['mime_type']}%"))
            ->orderBy($validated['sort_by'], $validated['sort_direction']);

        return Inertia::render('app/media/index', [
            'media' => $query->paginate($validated['per_page']),
            'filters' => array_filter($visibleFilters),
            'defaultFilters' => [
                'per_page' => $validated['per_page'],
                'sort_by' => $validated['sort_by'],
                'sort_direction' => $validated['sort_direction'],
            ]
        ]);
    }

    public function store(StoreMediaRequest $request)
    {
        try {
            $validated = $request->validated();
            $collectionName = $validated['collection_name'] ?? 'default';

            if ($request->has('external_url')) {
                $media = $this->handleExternalMedia(
                    $request,
                    $validated['external_url'],
                    $validated['name'] ?? basename($validated['external_url']),
                    $validated['collection_name'] ?? 'default',
                    $validated['custom_properties'] ?? []
                );
            } else {
                $media = $this->uploadMedia($request);
            }

            // Asegurar que siempre devolvemos una respuesta consistente
            $responseData = [
                'success' => true,
                'message' => 'Media uploaded successfully',
                'data' => [
                    'original_url' => $media->getFullUrl(), // Asegúrate de usar getFullUrl()
                    'id' => $media->id,
                    'name' => $media->name,
                    'collection_name' => $media->collection_name
                ],
            ];

            if ($request->wantsJson()) {
                return response()->json($responseData);
            }

            return redirect()->route('admin.media.index')
                ->with('success', $responseData['message']);

        } catch (\Exception $e) {
            $errorMessage = 'Error uploading file: '.$e->getMessage();
            
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage
                ], 500);
            }

            return back()->with('error', $errorMessage);
        }
    }

    public function edit(Media $media)
    {
        return Inertia::render('app/media/edit', [
            'media' => $media->load('model')
        ]);
    }

    public function update(UpdateMediaRequest $request, Media $media)
    {
        try {
            $this->updateMedia($media, $request->validated());

            return back()->with('success', 'Media updated successfully');

        } catch (\Exception $e) {
            return back()->with('error', 'Error updating media: '.$e->getMessage());
        }
    }

    public function listImages(Request $request)
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
        ]);

        $query = Media::query()
            ->where('mime_type', 'like', 'image/%')
            ->when($validated['search'] ?? null, fn($q, $search) => $q
                ->where('name', 'like', "%{$search}%"))
            ->orderBy('created_at', 'desc');

        return response()->json([
            'images' => $query->paginate($validated['per_page'] ?? 15)
        ]);
    }

    public function trashed(Request $request)
    {
        return Inertia::render('app/media/trashed', [
            'trashedMedia' => Media::onlyTrashed()
                ->when($request->input('search'), fn($q, $search) => $q
                    ->where('name', 'like', "%{$search}%"))
                ->orderBy('deleted_at', 'desc')
                ->paginate($request->input('per_page', 30)),
            'filters' => $request->only(['search'])
        ]);
    }

    public function trash(Media $media)
    {
        $media->delete();
        return redirect()->route('admin.media.index')
            ->with('success', 'Media moved to trash');
    }

    public function restore(Request $request, $id)
    {
        $media = Media::withTrashed()->findOrFail($id);
        
        // Registrar en el log de actividad
        activity()
            ->causedBy($request->user())
            ->performedOn($media)
            ->log('Media restored from trash');
        
        $media->restore();
    
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Media restored successfully',
                'data' => $media
            ]);
        }
    
        return redirect()->route('admin.media.index')
            ->with('success', 'Media restored successfully');
    }

    public function destroy(DeleteMediaRequest $request, $id)
    {
        $media = Media::withTrashed()->findOrFail($id);
        $validated = $request->validated();

        try {
            if ($validated['permanent'] ?? false) {
                $media->forceDelete();

                activity()
                    ->causedBy($request->user())
                    ->withProperties([
                        'reason' => $validated['reason'],
                        'original' => $media->toArray()
                    ])
                    ->log('Media permanently deleted');
            } else {
                $media->delete();
            }

            return $this->successResponse(
                $validated['permanent']
                    ? 'Media permanently deleted'
                    : 'Media moved to trash',
                $validated['permanent']
                    ? 'admin.media.trashed'
                    : 'admin.media.index',
                wantsJson: $request->wantsJson()
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error deleting media: ' . $e->getMessage(),
                route: 'admin.media.index',
                wantsJson: $request->wantsJson()
            );
        }
    }

    public function forceDelete($id)
    {
        try {
            $media = Media::onlyTrashed()->findOrFail($id);
            
            // Registrar en el log de actividad
            activity()
                ->causedBy(auth()->user())
                ->performedOn($media)
                ->log('Media permanently deleted');
            
            // Eliminar archivos físicos si es necesario
            if (Storage::disk($media->disk)->exists($media->getPath())) {
                Storage::disk($media->disk)->delete($media->getPath());
            }
            
            // Eliminar conversiones si existen
            if ($media->generated_conversions) {
                foreach ($media->generated_conversions as $conversion) {
                    $path = $media->getPath($conversion);
                    if (Storage::disk($media->disk)->exists($path)) {
                        Storage::disk($media->disk)->delete($path);
                    }
                }
            }
            
            $media->forceDelete();
            
            return $this->successResponse(
                'Media permanently deleted',
                route: 'admin.media.index',
                wantsJson: request()->wantsJson()
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error deleting media: ' . $e->getMessage(),
                route: 'admin.media.index',
                wantsJson: request()->wantsJson()
            );
        }
    }

    protected function uploadMedia(Request $request)
    {
        $validated = $request->validated();
        $collectionName = $validated['collection_name'] ?? 'default';
        $customProperties = $validated['custom_properties'] ?? [];
        $uploadedMedia = [];
    
        // Verificar que se haya subido al menos un archivo
        if (!$request->hasFile('files') && !$request->hasFile('file')) {
            throw new \Exception("No files were uploaded");
        }
    
        // Manejar múltiples archivos
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $uploadedMedia[] = $this->processSingleFile(
                    $file,
                    $validated['name'] ?? $file->getClientOriginalName(),
                    $collectionName,
                    $customProperties,
                    $request->model_type,
                    $request->model_id
                );
            }
            return $uploadedMedia;
        }
    
        // Manejar un solo archivo
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            return $this->processSingleFile(
                $file,
                $validated['name'] ?? $file->getClientOriginalName(),
                $collectionName,
                $customProperties,
                $request->model_type,
                $request->model_id
            );
        }
    
        throw new \Exception("No valid files were uploaded");
    }

    protected function processSingleFile($file, $name, $collectionName, $customProperties, $modelType = null, $modelId = null)
{
    // Verificar que el archivo sea válido
    if (!$file->isValid()) {
        throw new \Exception("Invalid file uploaded: " . $file->getClientOriginalName());
    }

    // Verificar el MIME type real del archivo
    $mimeType = $file->getMimeType();
    if ($mimeType === 'text/html') {
        // Forzar nueva detección si el MIME type es incorrecto
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file->getPathname());
        finfo_close($finfo);
    }

    // Determinar el modelo destino
    if ($modelType && $modelId) {
        $model = $modelType::find($modelId);
        if ($model) {
            $media = $model->addMedia($file)
                ->usingName($name)
                ->withCustomProperties(array_merge(
                    $customProperties,
                    ['original_mime' => $mimeType]
                ))
                ->toMediaCollection($collectionName);
            return $media;
        }
    }

    // Usar modelo UnattachedMedia por defecto
    $unattachedMedia = UnattachedMedia::firstOrCreate(['id' => 1]);
    $media = $unattachedMedia->addMedia($file)
        ->usingName($name)
        ->withCustomProperties(array_merge(
            $customProperties,
            ['original_mime' => $mimeType]
        ))
        ->toMediaCollection($collectionName);

    // Forzar la actualización del MIME type en la base de datos
    \DB::table('media')
        ->where('id', $media->id)
        ->update(['mime_type' => $mimeType]);

    $media->refresh();

    return $media;
}

    protected function handleExternalMedia($request, $externalUrl, $name, $collectionName, $customProperties)
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'media_');

        try {
            $client = new \GuzzleHttp\Client([
                'timeout' => 30,
                'connect_timeout' => 10,
                'verify' => false
            ]);

            $startTime = microtime(true);
            $timingData = [
                'initial_url' => $externalUrl,
                'start_time' => $startTime
            ];

            $response = $client->get($externalUrl, [
                'sink' => $tempFile,
                'on_stats' => function (\GuzzleHttp\TransferStats $stats) use (&$timingData, $startTime) {
                    $timingData = array_merge($timingData, [
                        'effective_url' => (string) $stats->getEffectiveUri(),
                        'redirect_count' => $stats->getHandlerStat('redirect_count') ?? 0,
                        'name_lookup_time' => $stats->getHandlerStat('namelookup_time') ?? 0,
                        'connect_time' => $stats->getHandlerStat('connect_time') ?? 0,
                        'pre_transfer_time' => $stats->getHandlerStat('pretransfer_time') ?? 0,
                        'start_transfer_time' => $stats->getHandlerStat('starttransfer_time') ?? 0,
                        'app_connect_time' => $stats->getHandlerStat('appconnect_time') ?? 0,
                        'redirect_time' => $stats->getHandlerStat('redirect_time') ?? 0,
                        'total_time' => $stats->getTransferTime(),
                        'response_code' => $stats->getResponse()->getStatusCode(),
                        'return_keyword' => $stats->getResponse()->getReasonPhrase(),
                        'end_time' => microtime(true),
                        'calculated_total_time' => microtime(true) - $startTime
                    ]);

                    $effectiveUrl = (string) $stats->getEffectiveUri();
                    $host = parse_url($effectiveUrl, PHP_URL_HOST);
                    if ($host && filter_var($host, FILTER_VALIDATE_DOMAIN)) {
                        $ips = @dns_get_record($host, DNS_A);
                        if ($ips !== false) {
                            $timingData['resolved_ips'] = array_column($ips, 'ip');
                        }
                    }
                }
            ]);

            $customProperties['timing_details'] = $timingData;

            $model = ($request->model_type && $request->model_id)
                ? $request->model_type::find($request->model_id)
                : UnattachedMedia::firstOrCreate(['id' => 1]);

            if (!$model) {
                throw new \Exception("Target model not found");
            }

            $media = $model->addMedia($tempFile)
                ->usingName($name)
                ->withCustomProperties($customProperties)
                ->toMediaCollection($collectionName);

            return $media;

        } catch (\Exception $e) {
            $customProperties['timing_details'] = array_merge(
                $timingData ?? [],
                [
                    'error' => $e->getMessage(),
                    'end_time' => microtime(true),
                    'calculated_total_time' => microtime(true) - $startTime,
                    'response_code' => 0,
                    'return_keyword' => 'error: ' . $e->getMessage()
                ]
            );

            try {
                $errorMedia = UnattachedMedia::firstOrCreate(['id' => 1])
                    ->addMedia($tempFile)
                    ->usingName('error_' . $name)
                    ->withCustomProperties($customProperties)
                    ->toMediaCollection('failed_downloads');
            } catch (\Exception $e) {
                \Log::error('Failed to save error media: ' . $e->getMessage());
            }

            throw new \Exception("Error processing external URL: " . $e->getMessage());

        } finally {
            if (file_exists($tempFile)) {
                @unlink($tempFile);
            }
        }
    }

    protected function forceSaveCustomProperties($media, $customProperties)
    {
        $media->custom_properties = $customProperties;
        $media->save();

        \DB::table('media')
            ->where('id', $media->id)
            ->update(['custom_properties' => json_encode($customProperties)]);

        $media->refresh();
        \Log::debug('Custom properties saved:', [
            'media_id' => $media->id,
            'custom_properties' => $media->custom_properties,
            'db_check' => \DB::table('media')->find($media->id)->custom_properties
        ]);
    }

    protected function updateMedia(Media $media, array $validated)
    {
        if (isset($validated['name'])) {
            $media->name = $validated['name'];
        }

        if (isset($validated['custom_properties'])) {
            $media->custom_properties = array_merge(
                $media->custom_properties ?? [],
                $validated['custom_properties']
            );
        }

        if (isset($validated['crop'])) {
            Image::load($media->getPath())
                ->crop(
                    Manipulations::CROP_CENTER,
                    (int)($validated['crop']['width'] ?? 100),
                    (int)($validated['crop']['height'] ?? 100),
                    (int)($validated['crop']['x'] ?? 0),
                    (int)($validated['crop']['y'] ?? 0)
                )->save();
        }

        if (isset($validated['resize'])) {
            Image::load($media->getPath())
                ->width((int)($validated['resize']['width'] ?? 100))
                ->height((int)($validated['resize']['height'] ?? 100))
                ->save();
        }

        $media->save();
    }

    public function checkExists(Request $request)
    {
        $exists = Media::where('name', $request->name)
            ->where('size', $request->size)
            ->exists();

        return response()->json([
            'exists' => $exists,
            'url' => $exists ? Media::where('name', $request->name)->first()->url : null
        ]);
    }

    public function transform(TransformMediaRequest $request, Media $media)
    {
        $validated = $request->validated();

        try {
            $path = $media->getPath();
            $image = Image::load($path);

            foreach ($validated['operations'] as $operation) {
                switch ($operation['type']) {
                    case 'crop':
                        $image->crop(
                            Manipulations::CROP_CENTER,
                            $operation['width'],
                            $operation['height'],
                            $operation['x'] ?? 0,
                            $operation['y'] ?? 0
                        );
                        break;

                    case 'resize':
                        $image->width($operation['width'])
                              ->height($operation['height']);
                        break;

                    case 'rotate':
                        $image->rotate($operation['angle']);
                        break;

                    case 'filter':
                        $image->{$operation['filter']}();
                        break;

                    case 'optimize':
                        $image->optimize([
                            'quality' => $operation['quality']
                        ]);
                        break;
                }
            }

            $image->save();

            if (!($validated['preserve_original'] ?? false)) {
                $media->size = filesize($path);
                $media->save();
            }

            return $this->successResponse(
                'Media transformed successfully',
                resource: $media->fresh(),
                wantsJson: $request->wantsJson()
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error transforming media: ' . $e->getMessage(),
                wantsJson: $request->wantsJson()
            );
        }
    }

    protected function successResponse(
        string $message,
        string $route = null,
        $resource = null,
        bool $wantsJson = false
    ) {
        if ($wantsJson) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $resource
            ]);
        }

        return $route
            ? redirect()->route($route)->with('success', $message)
            : back()->with('success', $message);
    }

    protected function errorResponse(
        string $message,
        string $route = null,
        bool $wantsJson = false
    ) {
        if ($wantsJson) {
            return response()->json([
                'success' => false,
                'message' => $message
            ], 500);
        }

        return $route
            ? redirect()->route($route)->with('error', $message)
            : back()->with('error', $message);
    }
}

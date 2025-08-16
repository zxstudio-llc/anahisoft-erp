<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Image\Manipulations;

class News extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'title', 
        'slug', 
        'excerpt', 
        'content', 
        'published_at', 
        'is_published',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_published' => 'boolean',
    ];

    /**
     * Relación con la categoría
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relación polimórfica con SEO
     */
    public function seo(): MorphOne
    {
        return $this->morphOne(Seo::class, 'model');
    }

    /**
     * Obtener o crear datos SEO para la noticia
     */
    public function getOrCreateSeo()
    {
        return $this->seo ?? $this->seo()->create([
            'route' => '/news/' . $this->slug,
            'title' => $this->title,
            'description' => $this->excerpt ?? $this->getMetaDescription(),
        ]);
    }

    /**
     * Generar meta descripción automática desde el contenido
     */
    public function getMetaDescription(): string
    {
        if ($this->content) {
            return substr(strip_tags($this->content), 0, 160);
        }
        return '';
    }

    /**
     * Scope para noticias publicadas
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
                    ->where('published_at', '<=', now());
    }

    /**
     * Scope para ordenar por fecha de publicación
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    public function getImageUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('news_covers');
        return $media ? $media->getFullUrl() : null;
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('news_covers')
            ->singleFile()
            ->useDisk('public');
        
        $this->addMediaCollection('news_content_images')
            ->useDisk('public');
    }
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(368)
            ->height(232)
            ->sharpen(10)
            ->nonQueued(); 
    }
}
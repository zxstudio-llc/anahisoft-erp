<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Testimonial extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'name', 
        'position', 
        'message', 
        'is_active',
        'photo' // Si decides usar string en lugar de media library
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Obtener la URL de la foto
     */
    public function getPhotoUrlAttribute(): ?string
    {
        if ($this->photo) {
            return asset('storage/' . $this->photo);
        }
        
        // Si usas media library
        $media = $this->getFirstMedia('testimonial_photos');
        return $media ? $media->getFullUrl() : null;
    }

    /**
     * Configuración de Media Library
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('testimonial_photos')
            ->singleFile()
            ->useDisk('public');
    }

    /**
     * Conversiones de imagen
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(100)
            ->height(100)
            ->sharpen(10);
    }

    /**
     * Scope para testimonios activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para ordenar por creación
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
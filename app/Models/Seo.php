<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Seo extends Model
{
    protected $table = 'seo';

    protected $fillable = [
        'model_type',
        'model_id',
        'route',
        'title',
        'description',
        'image',
        'author',
        'robots',
        'keywords',
        'canonical_url',
    ];

    /**
     * Relación polimórfica
     */
    public function model(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Verificar si es SEO global (no asociado a ningún modelo)
     */
    public function isGlobal(): bool
    {
        return is_null($this->model_type) && is_null($this->model_id);
    }

    /**
     * Scope para SEO global
     */
    public function scopeGlobal($query)
    {
        return $query->whereNull('model_type')->whereNull('model_id');
    }

    /**
     * Scope para SEO de páginas
     */
    public function scopeForPages($query)
    {
        return $query->where('model_type', Page::class);
    }

    /**
     * Scope para SEO de noticias
     */
    public function scopeForNews($query)
    {
        return $query->where('model_type', News::class);
    }

    /**
     * Buscar SEO por ruta
     */
    public static function findByRoute(string $route): ?self
    {
        return static::where('route', $route)->first();
    }

    /**
     * Obtener tipos de modelo disponibles
     */
    public static function getAvailableModelTypes(): array
    {
        return [
            '' => 'SEO Global',
            Page::class => 'Páginas',
            News::class => 'Noticias',
        ];
    }
}
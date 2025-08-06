<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Page extends Model 
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'template',
        'template_data',
        'is_active',
        'sort_order',
        'meta_title',
        'meta_description',
        'meta_image',
    ];

    protected $casts = [
        'template_data' => 'array',
        'is_active' => 'boolean',
    ];

    public function seo(): MorphOne
    {
        return $this->morphOne(Seo::class, 'model');
    }

    public function getOrCreateSeo()
    {
        return $this->seo ?? $this->seo()->create([
            'route' => '/' . $this->slug,
            'title' => $this->meta_title ?? $this->title,
            'description' => $this->meta_description ?? $this->getMetaDescription(),
            'image' => $this->meta_image,
        ]);
    }

    public function getMetaDescription(): string
    {
        if ($this->meta_description) {
            return $this->meta_description;
        }
        
        if ($this->content) {
            return substr(strip_tags($this->content), 0, 160);
        }
        
        return '';
    }

    public static function getAvailableTemplates(): array
    {
        return [
            'default' => 'Template por Defecto',
            'landing' => 'Landing Page',
            'about' => 'Acerca de Nosotros',
            'contact' => 'Contáctanos',
            'services' => 'Servicios',
            'portfolio' => 'Portafolio',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('title');
    }

    public function getTemplateView(): string
    {
        return "pages.admin.pages.templates.{$this->template}";
    }
}
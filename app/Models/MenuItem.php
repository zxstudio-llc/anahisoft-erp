<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    protected $fillable = [
        'menu_id',
        'label',
        'url',
        'type',
        'object_id',
        'target',
        'css_class',
        'order',
        'parent_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    // Constantes para tipos de elementos
    const TYPE_CUSTOM = 'custom';
    const TYPE_PAGE = 'page';
    const TYPE_POST = 'post';
    const TYPE_CATEGORY = 'category';
    const TYPE_EXTERNAL = 'external';

    public static function getTypes()
    {
        return [
            self::TYPE_CUSTOM => 'Enlace personalizado',
            self::TYPE_PAGE => 'Página',
            self::TYPE_POST => 'Artículo',
            self::TYPE_CATEGORY => 'Categoría',
            self::TYPE_EXTERNAL => 'Enlace externo',
        ];
    }

    /**
     * Relación con el menú padre
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Relación con el elemento padre
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    /**
     * Relación con los elementos hijos
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')
                    ->where('is_active', true)
                    ->orderBy('order');
    }

    /**
     * Relación polimórfica para obtener el objeto relacionado
     */
    public function object()
    {
        switch ($this->type) {
            case self::TYPE_PAGE:
                return $this->belongsTo(Page::class, 'object_id');
            case self::TYPE_POST:
                return $this->belongsTo(Post::class, 'object_id');
            case self::TYPE_CATEGORY:
                return $this->belongsTo(Category::class, 'object_id');
            default:
                return null;
        }
    }

    /**
     * Obtener la URL final del elemento
     */
    public function getFinalUrl()
    {
        if ($this->url) {
            return $this->url;
        }

        // Si es un objeto, obtener su URL
        switch ($this->type) {
            case self::TYPE_PAGE:
                $page = Page::find($this->object_id);
                return $page ? route('pages.show', $page->slug) : '#';
            
            case self::TYPE_POST:
                $post = Post::find($this->object_id);
                return $post ? route('posts.show', $post->slug) : '#';
            
            case self::TYPE_CATEGORY:
                $category = Category::find($this->object_id);
                return $category ? route('categories.show', $category->slug) : '#';
            
            default:
                return '#';
        }
    }

    /**
     * Scope para elementos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para elementos raíz
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Obtener la profundidad del elemento en la jerarquía
     */
    public function getDepth()
    {
        $depth = 0;
        $parent = $this->parent;
        
        while ($parent) {
            $depth++;
            $parent = $parent->parent;
        }
        
        return $depth;
    }

    /**
     * Verificar si tiene hijos
     */
    public function hasChildren()
    {
        return $this->children()->exists();
    }
}
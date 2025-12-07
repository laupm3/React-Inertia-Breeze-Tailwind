<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    /** @use HasFactory<\Database\Factories\LinkFactory> */
    use HasFactory;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'description',
        'route_name',
        'icon',
        'weight',
        'is_recent',
        'is_important',
        'permission_id',
        'parent_id',
        'requires_employee'
    ];

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_recent' => 'boolean',
        'is_important' => 'boolean',
        'requires_employee' => 'boolean',
        'weight' => 'integer',
    ];

    /**
     * Obtiene el permiso asociado con este enlace.
     */
    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }

    /**
     * Obtiene el enlace padre de este enlace.
     */
    public function parent()
    {
        return $this->belongsTo(Link::class, 'parent_id');
    }

    /**
     * Obtiene los enlaces hijos de este enlace.
     */
    public function children()
    {
        return $this->hasMany(Link::class, 'parent_id');
    }

    /**
     * Método eager loading para obtener los enlaces hijos de forma recursiva.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }
}

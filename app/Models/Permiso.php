<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    /** @use HasFactory<\Database\Factories\PermisoFactory> */
    use HasFactory;

    protected $fillable = [
        'categoria_id',
        'nombre',
        'nombre_oficial',
        'descripcion',
        'descripcion_oficial',
        'duracion',
        'retribuido',
        'yearly_limited'
    ];

    protected $table = 'permisos';

    protected $casts = [
        'retribuido' => 'boolean',
        'duracion' => 'integer',
        'yearly_limited' => 'boolean',
    ];

    /**
     * Get the permission requests for the permission.
     */
    public function solicitudes()
    {
        return $this->hasMany(SolicitudPermiso::class);
    }

    /**
     * Get the category of the permission request.
     */
    public function categoria()
    {
        return $this->belongsTo(PermisoCategoria::class, 'categoria_id');
    }

    /**
     * Scope a query to exclude vacations.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeExceptVacaciones($query)
    {
        return $query->where('nombre', '!=', 'Vacaciones');
    }
}

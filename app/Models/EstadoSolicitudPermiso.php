<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoSolicitudPermiso extends Model
{
    /** @use HasFactory<\Database\Factories\EstadoSolicitudPermisoFactory> */
    use HasFactory;

    protected $fillable = ['nombre'];

    protected $table = 'estado_solicitud_permisos';

    /**
     * Get the permission requests for the state.
     */
    public function solicitudesPermiso()
    {
        return $this->hasMany(SolicitudPermiso::class);
    }
}

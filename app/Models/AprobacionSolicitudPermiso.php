<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AprobacionSolicitudPermiso extends Model
{
    /** @use HasFactory<\Database\Factories\AprobacionSolicitudPermisoFactory> */
    use HasFactory;

    protected $table = 'aprobacion_solicitud_permisos';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'solicitud_permiso_id',
        'user_id',
        'tipo_aprobacion',
        'aprobado',
        'observacion',
        'is_automatic',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'aprobado' => 'boolean',
        'is_automatic' => 'boolean',
    ];

    /**
     * Get the permission request that owns the approval.
     */
    public function solicitudPermiso()
    {
        return $this->belongsTo(SolicitudPermiso::class);
    }

    /**
     * Get the user that owns the approval.
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

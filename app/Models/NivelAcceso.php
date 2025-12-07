<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Permission;

class NivelAcceso extends Model
{
    /** @use HasFactory<\Database\Factories\NivelAccesoFactory> */
    use HasFactory;

    protected $fillable = ['nombre', 'descripcion', 'permission_id'];

    protected $table = 'niveles_acceso';

    const PUBLICO = 1; // Nivel de acceso público
    const PRIVADO = 2; // Nivel de acceso privado
    const RESTRINGIDO = 3; // Nivel de acceso restringido
    const CONFIDENCIAL = 4; // Nivel de acceso confidencial

    /**
     * Get the permission that owns the access level.
     */
    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }
}

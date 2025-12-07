<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermisoCategoria extends Model
{
    /** @use HasFactory<\Database\Factories\PermisoCategoriaFactory> */
    use HasFactory;

    protected $table = 'permiso_categoria';

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the category of the permission request.
     */
    public function permisos()
    {
        return $this->hasMany(Permiso::class, 'categoria_id');
    }
}

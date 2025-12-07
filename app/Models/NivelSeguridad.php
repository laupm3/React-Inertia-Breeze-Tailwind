<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NivelSeguridad extends Model
{
    /** @use HasFactory<\Database\Factories\NivelSeguridadFactory> */
    use HasFactory;

    protected $fillable = ['nombre', 'descripcion'];

    protected $table = 'niveles_seguridad';

    const L1 = 1; // Nivel de seguridad L1
    const L2 = 2; // Nivel de seguridad L2
    const L3 = 3; // Nivel de seguridad L3

    /**
     * Get all of the ficheros for the NivelSeguridad
     */
    public function ficheros()
    {
        return $this->hasMany(File::class);
    }
}

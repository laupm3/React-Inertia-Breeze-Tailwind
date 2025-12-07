<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoCentro extends Model
{
    /** @use HasFactory<\Database\Factories\EstadoCentroFactory> */
    use HasFactory;

    protected $table = 'estado_centros';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    /**
     * Get the centers associated with the state.
     */
    public function centros()
    {
        return $this->hasMany(Centro::class);
    }
}

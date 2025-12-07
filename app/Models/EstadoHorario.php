<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EstadoHorario extends Model
{
    /** @use HasFactory<\Database\Factories\EstadoHorarioFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    protected $table = 'estado_horarios';

    /**
     * Get the horarios that have this estado.
     */
    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class);
    }
}

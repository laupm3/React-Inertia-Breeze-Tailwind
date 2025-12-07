<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Turno extends Model
{
    /** @use HasFactory<\Database\Factories\TurnoFactory> */
    use HasFactory;

    /**
     * The relationships that should be loaded by default.
     *
     * @var array<int, string>
     */
    public const RELATIONSHIPS = [
        'centro.empresa',
        'jornadaTurnos'
    ];

    protected $table = 'turnos';

    protected $fillable = [
        'centro_id',
        'nombre',
        'descripcion',
        'hora_inicio',
        'hora_fin',
        'descanso_inicio',
        'descanso_fin',
        'color'
    ];

    /**
     * Get the center of the shift.
     */
    public function centro(): BelongsTo
    {
        return $this->belongsTo(Centro::class);
    }

    /**
     * Get all of the jornadaTurnos for the Turno
     */
    public function jornadaTurnos(): HasMany
    {
        return $this->hasMany(JornadaTurno::class);
    }
}

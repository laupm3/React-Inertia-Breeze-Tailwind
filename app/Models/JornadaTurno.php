<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JornadaTurno extends Model
{
    /** @use HasFactory<\Database\Factories\JornadaTurnoFactory> */
    use HasFactory;

    protected $fillable = [
        'jornada_id',
        'turno_id',
        'modalidad_id',
        'weekday_number'
    ];

    protected $table = 'jornada_turno';

    /**
     * Get the jornada that owns the JornadaTurno
     */
    public function jornada(): BelongsTo
    {
        return $this->belongsTo(Jornada::class);
    }

    /**
     * Get the turno that owns the JornadaTurno
     */
    public function turno(): BelongsTo
    {
        return $this->belongsTo(Turno::class);
    }

    /**
     * Get the modalidad that owns the JornadaTurno
     */
    public function modalidad(): BelongsTo
    {
        return $this->belongsTo(Modalidad::class);
    }
}

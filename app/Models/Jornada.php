<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Jornada extends Model
{
    /** @use HasFactory<\Database\Factories\JornadaFactory> */
    use HasFactory;

    /**
     * The relationships that should be loaded by default.
     *
     * @var array<int, string>
     */
    public const RELATIONSHIPS = [
        'esquema',
        'jornadaTurnos.turno.centro.empresa',
        'jornadaTurnos.modalidad'
    ];

    protected $fillable = [
        'name',
        'description'
    ];

    protected $table = 'jornadas';

    /**
     * Get all of the jornadaTurnos for the Jornada
     */
    public function jornadaTurnos(): HasMany
    {
        return $this->hasMany(JornadaTurno::class);
    }

    /**
     * Get the anexo associated with the Jornada
     */
    public function anexo(): HasOne
    {
        return $this->hasOne(Anexo::class);
    }

    /**
     * Get the contrato associated with the Jornada
     */
    public function contrato(): HasOne
    {
        return $this->hasOne(Contrato::class);
    }

    /**
     * Get the esquema associated with the Jornada, all jornadaTurnos with turno and modalidad loaded
     */
    public function esquema(): HasMany
    {
        return $this->jornadaTurnos()->with(['turno.centro.empresa', 'modalidad']);
    }
}

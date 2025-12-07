<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AsignacionNotificacionesTrait;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Asignacion extends Model
{
    /** @use HasFactory<\Database\Factories\AsignacionFactory> */
    use HasFactory, AsignacionNotificacionesTrait;

    protected $table = 'asignaciones';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    /**
     * Default relationships to load when retrieving the model.
     * 
     * @var array<string>
     */
    public const RELATIONSHIPS = [
        'contratosVigentes.empleado.user'
    ];

    /**
     * Get the contracts for the assignment.
     */
    public function contratos()
    {
        return $this->hasMany(Contrato::class);
    }

    /**
     * Get the departments associated with the center through contracts avoiding duplicates.
     */
    public function empleados(): HasManyThrough
    {
        return $this->hasManyThrough(
            related: Empleado::class,
            through: Contrato::class,
            firstKey: 'asignacion_id',
            secondKey: 'id',
            localKey: 'id',
            secondLocalKey: 'empleado_id'
        )->distinct();
    }

    /**
     * Obtiene los contratos que están en vigencia en la fecha actual, es decir, que la fecha de inicio es menor o igual a la fecha actual y la fecha de fin es mayor o igual a la fecha actual o nula.
     */
    public function contratosVigentes(): HasMany
    {
        return $this->hasMany(Contrato::class)
            ->whereDate('fecha_inicio', '<=', now())
            ->where(function ($query) {
                $query->whereDate('fecha_fin', '>=', now())
                    ->orWhereNull('fecha_fin');
            });
    }
}

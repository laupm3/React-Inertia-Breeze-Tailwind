<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Notifications\Notifiable;

class Departamento extends Model
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $fillable = [
        'manager_id',
        'adjunto_id',
        'parent_department_id',
        'nombre',
        'descripcion',
    ];

    /**
     * Default relationships to load when retrieving the model.
     *
     * @var array<string>
     */
    public const RELATIONSHIPS = [
        'manager.user',
        'adjunto.user',
        'parentDepartment',
        'childDepartments',
        'contratosVigentes.empleado.user',
        'centros',
    ];

    /**
     * Get the manager that owns the Departamento
     */
    public function manager()
    {
        return $this->belongsTo(Empleado::class, 'manager_id');
    }

    /**
     * Get the adjunto that owns the Departamento
     */
    public function adjunto()
    {
        return $this->belongsTo(Empleado::class, 'adjunto_id');
    }

    /**
     * Get the parent that owns the Departamento
     */
    public function parentDepartment()
    {
        return $this->belongsTo(Departamento::class, 'parent_department_id');
    }

    /**
     * Get all of the childDepartments for the Departamento
     */
    public function childDepartments()
    {
        return $this->hasMany(Departamento::class, 'parent_department_id');
    }

    /**
     * Get the contracts that belong to the Departamento
     */
    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }

    /**
     * Obtiene los contratos que están en vigencia en la fecha actual, es decir, que la fecha de inicio es menor o igual a la fecha actual y la fecha de fin es mayor o igual a la fecha actual o nula.
     */
    public function contratosVigentes(): HasMany
    {
        return $this->hasMany(Contrato::class)
            ->where('fecha_inicio', '<=', now())
            ->where(function ($query) {
                $query->where('fecha_fin', '>=', now())
                    ->orWhereNull('fecha_fin');
            });
    }

    /**
     * Get the centers associated with the department through contracts avoiding duplicates.
     */
    public function centros(): HasManyThrough
    {
        return $this->hasManyThrough(
            related: Centro::class,
            through: Contrato::class,
            firstKey: 'departamento_id',
            secondKey: 'id',
            localKey: 'id',
            secondLocalKey: 'centro_id'
        )->distinct();
    }
}

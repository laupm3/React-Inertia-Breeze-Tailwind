<?php

namespace App\Models;

use App\Models\Empresa;
use App\Models\Contrato;
use App\Models\Empleado;
use App\Models\Direccion;
use App\Models\Departamento;
use App\Models\EstadoCentro;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Centro extends Model
{
    /** @use HasFactory<\Database\Factories\CentroFactory> */
    use HasFactory;
    use SoftDeletes;
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'empresa_id',
        'responsable_id',
        'coordinador_id',
        'estado_id',
        'direccion_id',
        'nombre',
        'email',
        'telefono',
    ];

    /**
     * Default relationships to load when retrieving the model.
     * 
     * @var array<string>
     */
    public const RELATIONSHIPS = [
        'empresa',
        'responsable.user',
        'coordinador.user',
        'estado',
        'direccion',
    ];

    /**
     * Get the company associated with the center.
     */
    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    /**
     * Get the user who is responsible for the center.
     */
    public function responsable()
    {
        return $this->belongsTo(Empleado::class, 'responsable_id');
    }

    /**
     * Get the user who is the coordinator of the center.
     */
    public function coordinador()
    {
        return $this->belongsTo(Empleado::class, 'coordinador_id');
    }

    /**
     * Get the state associated with the center.
     */
    public function estado()
    {
        return $this->belongsTo(EstadoCentro::class);
    }

    /**
     * Get the address associated with the center.
     */
    public function direccion()
    {
        return $this->belongsTo(Direccion::class);
    }

    /**
     * Get the contracts associated with the center.
     */
    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }

    /**
     * Get the departments associated with the center through contracts avoiding duplicates.
     */
    public function departamentos(): HasManyThrough
    {
        return $this->hasManyThrough(
            related: Departamento::class,
            through: Contrato::class,
            firstKey: 'centro_id',
            secondKey: 'id',
            localKey: 'id',
            secondLocalKey: 'departamento_id'
        )->distinct();
    }
}

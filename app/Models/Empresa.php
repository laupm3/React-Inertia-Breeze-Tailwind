<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasLogsEvents;

class Empresa extends Model
{
    /** @use HasFactory<\Database\Factories\EmpresaFactory> */
    use HasFactory;
    use SoftDeletes;
    use HasLogsEvents;

    protected $fillable = [
        'representante_id',
        'adjunto_id',
        'direccion_id',
        'nombre',
        'siglas',
        'cif',
        'email',
        'telefono',
    ];

    public const RELATIONSHIPS = [
        'representante.user',
        'adjunto.user',
        'direccion',
        'centros'
    ];

    /**
     * Get the representative of the company.
     */
    public function representante()
    {
        return $this->belongsTo(Empleado::class, 'representante_id');
    }

    /**
     * Get the adjunto of the company.
     */
    public function adjunto()
    {
        return $this->belongsTo(Empleado::class, 'adjunto_id');
    }

    /**
     * Get the address associated with the company.
     */
    public function direccion()
    {
        return $this->belongsTo(Direccion::class);
    }

    /**
     * Get the centers associated with the company.
     */
    public function centros()
    {
        return $this->hasMany(Centro::class);
    }

    /**
     * Get the contracts for the company.
     */
    public function contratos()
    {
        return $this->hasMany(Contrato::class);
    }
}

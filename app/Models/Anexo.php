<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Anexo extends Model
{
    /** @use HasFactory<\Database\Factories\AnexoContratoFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     * @var array<string>
     */

    protected $fillable = [
        'contrato_id',
        'jornada_id',
        'fecha_inicio',
        'fecha_fin'
    ];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'contrato_id' => 'integer',
        'jornada_id' => 'integer',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the contract that owns the annex.
     */
    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }

    /**
     * Obtiene la jornada que sirve como plantilla del anexo.
     */
    public function jornada(): BelongsTo
    {
        return $this->belongsTo(Jornada::class);
    }

    /**
     * Get the horarios that have this annex.
     */
    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class);
    }
}

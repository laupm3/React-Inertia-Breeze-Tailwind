<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modelo de Detalle de Incidencia (IncidentDetail)
 *
 */
class IncidentDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'incident_details';

    protected $fillable = [
        'incident_id',
        'quantity',
        'notes',
        'relatedDetail_type',
        'relatedDetail_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    const RELATIONSHIPS = ['incident'];

    // -- Relaciones --

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function relatedDetail(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeByRelatedDetailType($query, string $detailableType)
    {
        return $query->where('relatedDetail_type', $detailableType);
    }

}

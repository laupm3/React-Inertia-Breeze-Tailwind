<?php

namespace App\Models;

use App\Enums\AbsenceNoteStatus;
use App\Traits\Dashboard\BroadcastsDashboardUpdates;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class AbsenceNote extends Model
{
    use SoftDeletes, BroadcastsDashboardUpdates;

    /**
     * The dashboard widgets that should be updated when this model changes.
     *
     * @var array
     */
    protected array $dashboardWidgetNames = [
        'justification-stats',
        'employee-statuses',
    ];

    /**
     * Default relationships to load when retrieving the model.
     *
     * @var array
     */
    public const RELATIONSHIPS = [
        'horario.contrato.empleado.user',
        'files'
    ];

    protected $fillable = [
        'horario_id',
        'status',
        'reason',
    ];

    protected $casts = [
        'status' => AbsenceNoteStatus::class,
    ];

    /**
     * La relación directa con el horario afectado.
     */
    public function horario(): BelongsTo
    {
        return $this->belongsTo(Horario::class);
    }

    /**
     * Obtiene los ficheros adjuntos opcionales.
     */
    public function files(): MorphMany
    {
        return $this->morphMany(File::class, 'fileable');
    }

    /**
     * Un "accesor" para obtener fácilmente el empleado relacionado.
     */
    public function empleado(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->horario?->contrato?->empleado,
        );
    }
}

<?php

namespace App\Models;

use App\Models\File;
use App\Models\User;

use App\Models\IncidentDetail;
use App\Models\IncidentComment;
use App\Enums\PriorityLevel;
use App\Enums\IncidentStatus;
use App\Traits\HasLogsEvents;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Modelo de Incidencia
 *
 */
class Incident extends Model
{
    use SoftDeletes, HasFactory, HasLogsEvents;

    protected $fillable = [
        'reference_number',
        'title',
        'description',
        'reported_by_id',
        'assigned_to_id',
        'resolved_by_id',
        'tipo_incidencia_id',
        'status',
        'priority',
        'reported_at',
        'assigned_at',
        'resolved_at',
        'due_date',
        'metadata',
    ];

    protected $casts = [
        'status' => IncidentStatus::class,
        'priority' => PriorityLevel::class,
        'reported_at' => 'datetime',
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
        'due_date' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * @var array<string, string> Get the default relationships to load when querying the model.
     */
    public const RELATIONSHIPS = [
        'reportedBy',
        'assignedTo',
        'resolvedBy',
        'tipoIncidencia',
        'incidentable',
        'relatedModel',
        'details',
        'comments.createdBy',
        'comments.updatedBy',
        'files',
    ];

    // --- Relaciones ---

    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_id');
    }

    public function tipoIncidencia(): BelongsTo
    {
        return $this->belongsTo(TipoIncidencia::class);
    }

    public function incidentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function relatedModel(): MorphTo
    {
        return $this->morphTo();
    }

    public function details(): HasMany
    {
        return $this->hasMany(IncidentDetail::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(IncidentComment::class);
    }

    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }

    // --- Scopes ---

    public function scopeByTipoIncidencia($query, $tipoIncidenciaId)
    {
        return $query->where('tipo_incidencia_id', $tipoIncidenciaId);
    }

    public function scopeByModule($query, $moduleId)
    {
        return $query->whereHas('tipoIncidencia', function ($q) use ($moduleId) {
            $q->where('module_id', $moduleId);
        });
    }

    public function scopeByStatus($query, IncidentStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, PriorityLevel $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [IncidentStatus::RESOLVED, IncidentStatus::CANCELLED]);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->whereNotIn('status', [IncidentStatus::RESOLVED, IncidentStatus::CANCELLED]);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to_id', $userId);
    }

    public function scopeReportedBy($query, $userId)
    {
        return $query->where('reported_by_id', $userId);
    }

    // Métodos de utilidad
    public function isOverdue(): bool
    {
        return $this->due_date && $this->due_date->isPast() &&
            !in_array($this->status, [IncidentStatus::RESOLVED, IncidentStatus::CANCELLED]);
    }

    public function canBeAssigned(): bool
    {
        return $this->status === IncidentStatus::PENDING_REVIEW;
    }

    public function canBeResolved(): bool
    {
        return $this->status === IncidentStatus::IN_PROGRESS;
    }

    public function assignTo($userId): bool
    {
        if (!$this->canBeAssigned()) {
            return false;
        }

        return $this->update([
            'assigned_to_id' => $userId,
            'assigned_at' => now(),
            'status' => IncidentStatus::IN_PROGRESS
        ]);
    }

    public function resolve($userId, array $resolutionData = []): bool
    {
        if (!$this->canBeResolved()) {
            return false;
        }

        return $this->update([
            'resolved_by_id' => $userId,
            'resolved_at' => now(),
            'status' => IncidentStatus::RESOLVED,
            'metadata' => array_merge($this->metadata ?? [], $resolutionData)
        ]);
    }

    /**
     * Este metodo cancela una incidencia y la marca como cancelada
     * TODO: que luis decida si usar esta logica o no
     * @param mixed $userId
     * @param array $cancellationData
     * @return bool
     */
    public function cancel($userId, array $cancellationData = []): bool
    {
        if ($this->status->isFinal()) {
            return false;
        }

        return $this->update([
            'resolved_by_id' => $userId,
            'resolved_at' => now(),
            'status' => IncidentStatus::CANCELLED,
            'metadata' => array_merge($this->metadata ?? [], $cancellationData)
        ]);
    }
}

<?php

namespace App\Models;

use App\Enums\TipoAprobacion;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Dashboard\BroadcastsDashboardUpdates;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class SolicitudPermiso extends Model
{
    use HasFactory, SoftDeletes, Notifiable, BroadcastsDashboardUpdates;
    /**
     * The dashboard widgets that should be updated when this model changes.
     *
     * @var array
     */
    protected array $dashboardWidgetNames = [
        'pending-vacation-stats',
        'pending-permission-stats',
    ];

    protected $table = 'solicitud_permisos';

    protected $fillable = [
        'empleado_id',
        'permiso_id',
        'estado_id',
        'fecha_inicio',
        'fecha_fin',
        'motivo',
        'recuperable',
        'seen_at',
        'is_cancelled',
    ];

    /**
     * Relationships that should be loaded by default when the model is retrieved.
     */
    public const RELATIONSHIPS = [
        'empleado.user',
        'permiso',
        'estado',
        'aprobaciones.approvedBy.empleado',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'recuperable' => 'boolean',
        'seen_at' => 'datetime',
        'is_cancelled' => 'boolean',
    ];

    /**
     * Get the employee that owns the permission request.
     */
    public function empleado()
    {
        return $this->belongsTo(Empleado::class);
    }

    /**
     * Get the permission that owns the permission request.
     */
    public function permiso()
    {
        return $this->belongsTo(Permiso::class);
    }

    /**
     * Get the state of the permission request.
     */
    public function estado()
    {
        return $this->belongsTo(EstadoSolicitudPermiso::class, 'estado_id');
    }

    /**
     * Get the files associated with the permission request.
     */
    public function files(): MorphMany
    {
        return $this->morphMany(Folder::class, 'fileable');
    }

    /**
     * Alias for files() to support route model binding for {folder} parameter.
     */
    public function folders(): MorphMany
    {
        return $this->files();
    }

    /**
     * Get the approvals associated with the permission request.
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function aprobaciones()
    {
        return $this->hasMany(AprobacionSolicitudPermiso::class, 'solicitud_permiso_id');
    }

    /**
     * Check if the request has an approval of a specific type.
     *
     * @param string $type The approval type to check
     * @param bool|null $approved If provided, also checks the approval status
     * @return bool
     */
    public function hasApproval(string $type, ?bool $approved = null): bool
    {
        return $this->aprobaciones()
            ->where('tipo_aprobacion', $type)
            ->when($approved !== null, function ($query) use ($approved) {
                return $query->where('aprobado', $approved);
            })
            ->exists();
    }

    /**
     * Check if the request is approved by all required approvers.
     * @return bool
     */
    public function isApproved(): bool
    {
        $requiredApprovals = $this->getRequiredApprovals();

        // Cargar todas las aprobaciones positivas en una sola consulta
        $aprobacionesPositivas = $this->aprobaciones()
            ->where('aprobado', true)
            ->pluck('tipo_aprobacion')
            ->toArray();

        // Verificar que cada tipo requerido esté en el array de aprobaciones positivas
        foreach ($requiredApprovals as $tipo) {
            if (!in_array($tipo, $aprobacionesPositivas)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if the request has been approved by any approver.
     */
    public function anyApproved(): bool
    {
        return $this->aprobaciones()
            ->where('aprobado', true)
            ->exists();
    }

    /**
     * Check if the request has been denied by any approver.
     *
     * @return bool
     */
    public function isDenied(): bool
    {
        // Cargar todas las aprobaciones relevantes en una sola consulta
        $tiposRequeridos = $this->getRequiredApprovals();

        // Verificar si alguna de las aprobaciones requeridas está explícitamente denegada
        return $this->aprobaciones()
            ->whereIn('tipo_aprobacion', $tiposRequeridos)
            ->where('aprobado', false)
            ->exists();
    }

    /**
     * Get all required approvals for the permit request.
     *
     * @return array
     */
    public function getRequiredApprovals(): array
    {
        return TipoAprobacion::getAllValues();
    }

    /**
     * Check if the request has been viewed by an approver.
     */
    public function hasBeenSeen(): bool
    {
        return $this->seen_at !== null;
    }

    /**
     * Mark a work permit request as seen
     *
     * @return bool
     */
    public function markAsSeen(): bool
    {
        $this->seen_at = now();
        return $this->save();
    }

    /**
     * Toggle the cancellation request status.
     */
    public function toggleCancellationRequest()
    {
        $this->is_cancelled = !$this->is_cancelled;
        return $this->save();
    }

    /**
     * Update the status of the request based on its approvals.
     */
    public function updateStatus()
    {
        if ($this->isApproved()) {
            $this->estado_id = EstadoSolicitudPermiso::where('nombre', 'Aprobado')->first()->id;
        } elseif ($this->isDenied()) {
            $this->estado_id = EstadoSolicitudPermiso::where('nombre', 'Denegado')->first()->id;
        } else if ($this->anyApproved()) {
            $this->estado_id = EstadoSolicitudPermiso::where('nombre', 'En proceso')->first()->id;
        } else if ($this->hasBeenSeen()) {
            $this->estado_id = EstadoSolicitudPermiso::where('nombre', 'En revisión')->first()->id;
        } else {
            $this->estado_id = EstadoSolicitudPermiso::where('nombre', 'Solicitado')->first()->id;
        }

        $this->save();
    }

    /**
     * Scope to filter requests that are vacations.
     * 
     * This scope includes requests that have the 'Vacaciones' permission name
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * 
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVacaciones($query)
    {
        return $query->whereHas('permiso', function ($q) {
            $q->where('nombre', 'Vacaciones');
        });
    }

    /**
     * Scope to filter requests that are not vacations.
     *
     * This scope excludes requests that have the 'Vacaciones' permission name
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeExceptVacaciones($query)
    {
        return $query->whereDoesntHave('permiso', function ($q) {
            $q->where('nombre', 'Vacaciones');
        });
    }

    /**
     * Scope to filter vacation requests for a specific year.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $year The year to filter vacation requests
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVacacionesAnuales(Builder $query, int $year)
    {
        return $query
            ->whereYear('fecha_inicio', $year)
            ->whereHas('permiso', function ($q) {
                $q->where('nombre', 'Vacaciones');
            });
    }
}

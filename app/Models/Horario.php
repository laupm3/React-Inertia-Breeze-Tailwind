<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use App\Traits\Dashboard\BroadcastsDashboardUpdates;

class Horario extends Model
{
    /** @use HasFactory<\Database\Factories\HorarioFactory> */
    use HasFactory, BroadcastsDashboardUpdates;

    /**
     * The dashboard widgets that should be updated when this model changes.
     *
     * @var array
     */
    protected array $dashboardWidgetNames = [
        'employee-statuses',
        'clocking-stats',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'contrato_id',
        'anexo_id',
        'estado_horario_id',
        'modalidad_id',
        'turno_id',
        'solicitud_permiso_id',

        'horario_inicio',
        'horario_fin',
        'descanso_inicio',
        'descanso_fin',

        'fichaje_entrada',
        'fichaje_salida',
        'latitud_entrada',
        'longitud_entrada',
        'latitud_salida',
        'longitud_salida',
        'ip_address_entrada',
        'ip_address_salida',
        'user_agent_entrada',
        'user_agent_salida',
        'observaciones',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // 'descansos' => 'json',
        'horario_inicio' => 'datetime',
        'horario_fin' => 'datetime',
        'descanso_inicio' => 'datetime',
        'descanso_fin' => 'datetime',
        'fichaje_entrada' => 'datetime',
        'fichaje_salida' => 'datetime',
    ];

    /**
     * Default relationships to load when retrieving the model.
     *
     * @var array<string>
     */
    public const RELATIONSHIPS = [
        'contrato.empleado.user',
        'contrato.empleado.empresas',
        'contrato.empleado.departamentos',
        'contrato.empleado',
        'contrato.jornada',
        'contrato.empresa',
        'contrato.departamento',
        'contrato.asignacion',
        'anexo.jornada',
        'anexo.contrato.empleado.user',
        'anexo.contrato.asignacion',
        'estadoHorario',
        'modalidad',
        'turno.centro.empresa',
        'descansosAdicionales',
    ];
    /**
     * Get the absence note associated with the Horario.
     */
    public function absenceNote()
    {
        // Replace 'AbsenceNote' with the actual related model if different
        return $this->hasOne(AbsenceNote::class);
    }
    /**
     * Get the contrato that owns the Horario
     */
    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }

    /**
     * Get the anexo that owns the Horario
     */
    public function anexo(): BelongsTo
    {
        return $this->belongsTo(Anexo::class);
    }

    /**
     * Get the estadoHorario that owns the Horario
     */
    public function estadoHorario(): BelongsTo
    {
        return $this->belongsTo(EstadoHorario::class);
    }

    /**
     * Get the modalidad that owns the Horario
     */
    public function modalidad(): BelongsTo
    {
        return $this->belongsTo(Modalidad::class);
    }

    /**
     * Get the turno that owns the Horario
     */
    public function turno(): BelongsTo
    {
        return $this->belongsTo(Turno::class);
    }

    /**
     * Get the solicitud thourgh the solicitud-permiso relationship.
     */
    public function permiso(): HasOneThrough
    {
        return $this->hasOneThrough(
            Permiso::class,
            SolicitudPermiso::class,
            'id',
            'id',
            'solicitud_permiso_id',
            'permiso_id'
        );
    }

    /**
     * Obtiene los descanso adicionales para el horario.
     */
    public function descansosAdicionales(): HasMany
    {
        return $this->hasMany(DescansoAdicional::class);
    }

    public function solicitudPermiso()
    {
        return $this->belongsTo(SolicitudPermiso::class);
    }

    public static function obtenerHorarioActivo($contratos)
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        return static::select([
            'id',
            'horario_inicio',
            'horario_fin',
            'descanso_inicio',
            'descanso_fin',
            'estado_fichaje',
            'contrato_id',
            'turno_id'
        ])
            ->with([
                'contrato:id,asignacion_id,empresa_id',
                'contrato.asignacion:id,nombre',
                'contrato.empresa:id,nombre',
                'turno:id,centro_id',
                'turno.centro:id,nombre'
            ])
            ->where(function ($query) use ($contratos) {
                // Para cada contrato, buscamos sus horarios directos o por anexo
                $contratos->each(function ($contrato) use ($query) {
                    $query->orWhere(function ($q) use ($contrato) {
                        $q->where('contrato_id', $contrato->id)
                            ->orWhereHas('anexo.contrato', function ($subQ) use ($contrato) {
                                $subQ->where('contratos.id', $contrato->id);
                            });
                    });
                });
            })
            ->whereBetween('horario_inicio', [$todayStart, $todayEnd])
            ->get();
    }
}

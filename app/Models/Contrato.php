<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Dashboard\BroadcastsDashboardUpdates;

class Contrato extends Model
{
    /** @use HasFactory<\Database\Factories\ContratoFactory> */
    use HasFactory;
    use SoftDeletes;
    use BroadcastsDashboardUpdates;

    /**
     * The dashboard widgets that should be updated when this model changes.
     *
     * @var array
     */
    protected array $dashboardWidgetNames = [
        'employees-by-department-stats',
        'expiring-contracts-stats',
        'employee-statuses',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'empleado_id',
        'departamento_id',
        'centro_id',
        'asignacion_id',
        'tipo_contrato_id',
        'empresa_id',
        'jornada_id',
        'n_expediente',
        'fecha_inicio',
        'fecha_fin',
        'es_computable',
    ];

    // Agregar esto para convertir automáticamente las fechas a Carbon
    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Default relationships to load when retrieving the model.
     *
     * @var array<string>
     */
    public const RELATIONSHIPS = [
        'empleado.user',
        'empleado.estadoEmpleado',
        'empleado.tipoEmpleado',
        'empleado.tipoDocumento',
        'departamento',
        'centro',
        'asignacion',
        'tipoContrato',
        'empresa',
        'jornada',
        'anexos',
        'anexos.jornada'
    ];

    /**
     * Get the employee that owns the contract.
     */
    public function empleado()
    {
        return $this->belongsTo(Empleado::class);
    }

    /**
     * Get the company that owns the contract.
     */
    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    /**
     * Get the contract type that owns the contract.
     */
    public function tipoContrato()
    {
        return $this->belongsTo(TipoContrato::class);
    }

    /**
     * Get the assignment that owns the contract.
     */
    public function asignacion()
    {
        return $this->belongsTo(Asignacion::class);
    }

    /**
     * Get the department that owns the contract.
     */
    public function departamento()
    {
        return $this->belongsTo(Departamento::class);
    }

    /**
     * Get the center that owns the contract.
     */
    public function centro()
    {
        return $this->belongsTo(Centro::class);
    }

    /**
     * Get the annexes for the contract.
     */
    public function anexos(): HasMany
    {
        return $this->hasMany(Anexo::class);
    }

    /**
     * Get the permission requests for the contract.
     */
    public function solicitudesPermiso()
    {
        return $this->hasMany(SolicitudPermiso::class);
    }

    /**
     * Get the jornada that owns the Contrato
     */
    public function jornada(): BelongsTo
    {
        return $this->belongsTo(Jornada::class);
    }

    /**
     * Get the horarios for the contract.
     */
    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class);
    }

    /**
     * Get the permissions through the permission-request relationship.
     */
    public function permisos(): HasManyThrough
    {
        return $this->hasManyThrough(
            Permiso::class,
            SolicitudPermiso::class,
            'id', // Clave foránea en la tabla `solicitud_permisos` que hace referencia a `contratos`
            'id', // Clave foránea en la tabla `permisos` que hace referencia a `solicitud_permisos`
            'solicitud_permiso_id', // Clave local en la tabla `contratos`
            'permiso_id' // Clave local en la tabla `solicitud_permisos`
        );
    }

    /**
     * Calcula los días restantes hasta la fecha de fin del contrato
     */
    public function diasRestantes(): int
    {
        if (!$this->fecha_fin) {
            return PHP_INT_MAX; // Contrato indefinido
        }

        return now()->diffInDays($this->fecha_fin, false);
    }

    /**
     * Determina si el contrato está vigente
     */
    public function esVigente(): bool
    {
        return $this->fecha_inicio <= now() &&
            ($this->fecha_fin === null || $this->fecha_fin >= now());
    }
}

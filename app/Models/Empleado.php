<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\Log;
use App\Traits\HasLogsEvents;
use App\Traits\Dashboard\BroadcastsDashboardUpdates;

class Empleado extends Model
{
    /** @use HasFactory<\Database\Factories\EmpleadoFactory> */
    use HasFactory;
    use SoftDeletes;
    use HasLogsEvents;
    use BroadcastsDashboardUpdates;

    /**
     * The dashboard widgets that should be updated when this model changes.
     *
     * @var array
     */
    protected array $dashboardWidgetNames = [
        'expiring-documents-stats',
        'new-employees-stats',
        'employee-statuses',
    ];

    protected $casts = [
        'caducidad_nif' => 'datetime',
        'fecha_nacimiento' => 'date',
        'seniority_date' => 'date',
    ];

    protected $fillable = [
        'tipo_empleado_id',
        'tipo_documento_id',
        'direccion_id',
        'genero_id',
        'estado_id',
        'nombre',
        'primer_apellido',
        'segundo_apellido',
        'nif',
        'caducidad_nif',
        'email',
        'email_secundario',
        'telefono',
        'telefono_personal_movil',
        'telefono_personal_fijo',
        'extension_centrex',
        'fecha_nacimiento',
        'seniority_date',
        'niss',
        'contacto_emergencia',
        'telefono_emergencia',
        'observaciones_salud',
    ];

    /**
     * Default relationships to load when retrieving the model.
     *
     * @var array<string>
     */
    public const RELATIONSHIPS = [
        'user',
        'tipoEmpleado',
        'estadoEmpleado',
        'tipoDocumento',
        'contratos.departamento',
        'contratos.centro',
        'empresas',
        'asignaciones'
    ];

    /**
     * Get the user that owns the employee.
     */
    public function user()
    {
        return $this->hasOne(User::class);
    }

    /**
     * Get the type of employee that owns the employee.
     */
    public function tipoEmpleado()
    {
        return $this->belongsTo(TipoEmpleado::class);
    }

    /**
     * Get the gender that owns the employee.
     */
    public function genero()
    {
        return $this->belongsTo(Genero::class);
    }

    /**
     * Get the document type that owns the employee.
     */
    public function tipoDocumento()
    {
        return $this->belongsTo(TipoDocumento::class);
    }

    /**
     * Get the status that owns the employee.
     */
    public function estadoEmpleado()
    {
        return $this->belongsTo(EstadoEmpleado::class, 'estado_id');
    }

    /**
     * Get the address that owns the employee.
     */
    public function direccion()
    {
        return $this->belongsTo(Direccion::class);
    }

    /**
     * Get the companies that employee is representing.
     */
    public function comoRepresentanteEmpresas()
    {
        return $this->belongsToMany(Empresa::class);
    }

    /**
     * Get the companies that employee is attached to.
     */
    public function comoAdjuntoEmpresas()
    {
        return $this->belongsToMany(Empresa::class);
    }

    /**
     * Get the centers where the employee is responsible.
     */
    public function comoResponsableCentro()
    {
        return $this->hasMany(Centro::class, 'responsable_id');
    }

    /**
     * Get the centers where the employee is coordinator.
     */
    public function comoCoordinadorCentro()
    {
        return $this->hasMany(Centro::class, 'coordinador_id');
    }

    /**
     * Get the departments where the employee is the manager.
     */
    public function comoManagerDepartamentos()
    {
        return $this->hasMany(Departamento::class, 'manager_id');
    }

    /**
     * Get the departments where the employee is the adjunto.
     */
    public function comoAdjuntoDepartamentos()
    {
        return $this->hasMany(Departamento::class, 'adjunto_id');
    }

    /**
     * Get the contracts for the employee.
     */
    public function contratos()
    {
        return $this->hasMany(Contrato::class);
    }

    /**
     * Get the contracts for the employee that are still valid.
     */
    public function contratosVigentes()
    {
        return $this->contratos()->where('fecha_inicio', '<=', now())
            ->where(function ($query) {
                $query->where('fecha_fin', '>=', now())
                    ->orWhereNull('fecha_fin');
            });
    }

    /**
     * Get the companies for the employee though the contracts.
     */
    public function empresas(): HasManyThrough
    {
        return $this->hasManyThrough(Empresa::class, Contrato::class, 'empleado_id', 'id', 'id', 'empresa_id');
    }

    /**
     * Get the departamentos for the employee though the contracts.
     */
    public function departamentos(): HasManyThrough
    {
        return $this->hasManyThrough(Departamento::class, Contrato::class, 'empleado_id', 'id', 'id', 'departamento_id');
    }

    /**
     * Get the assignments for the employee through the contracts.
     */
    public function asignaciones(): HasManyThrough
    {
        return $this->hasManyThrough(Asignacion::class, Contrato::class, 'empleado_id', 'id', 'id', 'asignacion_id');
    }

    /**
     * Obtiene el empleado con su contrato vigente
     */
    public static function obtenerEmpleadoPorUsuario($userId)
    {
        $empleado = static::with(['contratosVigentes' => function ($query) {
            $query->orderBy('fecha_inicio', 'desc');
        }])
            ->whereHas('user', function ($query) use ($userId) {
                $query->where('id', $userId);
            })
            ->first();

        Log::info('Empleado encontrado:', [
            'empleado_id' => $empleado?->id,
            'contratos_vigentes' => $empleado?->contratosVigentes->toArray()
        ]);

        return $empleado;
    }

    /**
     * Verifica si el empleado tiene un contrato vigente
     */
    public function tieneContratoVigente(): bool
    {
        return $this->contratosVigentes()->exists();
    }

    /**
     * Get the permissions request for the employee.
     */
    public function solicitudesPermiso()
    {
        return $this->hasMany(SolicitudPermiso::class);
    }

    /**
     * Get the vacation requests for the employee.
     */
    public function vacaciones()
    {
        return $this->hasMany(SolicitudPermiso::class)->vacaciones();
    }

    /**
     * Verifica si el NIF del empleado está próximo a vencer
     */
    public function nifProximoAVencer(int $dias = 30): bool
    {
        if (!$this->caducidad_nif) {
            return false;
        }

        return $this->caducidad_nif->diffInDays(now()) <= $dias;
    }

    /**
     * Verifica si el NIF del empleado ya venció
     */
    public function nifVencido(): bool
    {
        if (!$this->caducidad_nif) {
            return false;
        }

        return $this->caducidad_nif->isPast();
    }

    /**
     * Obtiene los días restantes para el vencimiento del NIF
     */
    public function diasRestantesNIF(): ?int
    {
        if (!$this->caducidad_nif) {
            return null;
        }

        return $this->caducidad_nif->diffInDays(now());
    }

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        // Prioritize the employee's own name fields
        $employeeName = trim("{$this->nombre} {$this->primer_apellido} {$this->segundo_apellido}");
        if (!empty($employeeName)) {
            return $employeeName;
        }

        // If employee name is not available, fall back to the associated user's name
        if ($this->user) {
            return $this->user->name;
        }

        // As a last resort, return a placeholder
        return 'Nombre no disponible';
    }
}

<?php

namespace App\Services\SolicitudPermiso;

use Carbon\Carbon;
use App\Models\Permiso;
use App\Models\Empleado;
use App\Models\SolicitudPermiso;
use Illuminate\Support\Collection;
use App\Http\Resources\PermisoResource;
use Illuminate\Database\Eloquent\Builder;
use App\Http\Resources\Export\EmpleadoResource;
use App\Http\Resources\SolicitudPermisoResource;
use Illuminate\Support\Facades\Log;

class SolicitudPermisoValidationService
{
    const APPROVED_STATUS_ID = 4; // ID del estado "APROBADO"

    /**
     * Verifica si hay conflictos de fechas con otras solicitudes aprobadas
     * 
     * @param int $empleadoId ID del empleado
     * @param Carbon $fechaInicio Fecha de inicio de la solicitud
     * @param Carbon $fechaFin Fecha de fin de la solicitud
     * @param int|null $excludeSolicitudId ID de la solicitud a excluir (en caso de edición)
     * @return bool Verdadero si hay conflictos, falso en caso contrario
     */
    public function hasDateConflicts(
        int $empleadoId,
        Carbon $fechaInicio,
        Carbon $fechaFin,
        ?int $excludeSolicitudId = null
    ): bool {
        $query = SolicitudPermiso::query()
            ->where('empleado_id', $empleadoId)
            ->where('estado_id', self::APPROVED_STATUS_ID) // APROBADO
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                // 1. Fecha de inicio de la solicitud está dentro del rango de otra solicitud
                $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                    // 2. Fecha de fin de la solicitud está dentro del rango de otra solicitud
                    ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                    // 3. La solicitud abarca completamente el rango de otra solicitud
                    ->orWhere(function ($query) use ($fechaInicio, $fechaFin) {
                        $query->where('fecha_inicio', '<=', $fechaInicio)
                            ->where('fecha_fin', '>=', $fechaFin);
                    });
            });

        // Excluir la solicitud actual en caso de edición
        if ($excludeSolicitudId) {
            $query->where('id', '!=', $excludeSolicitudId);
        }

        return $query->exists();
    }

    /**
     * Obtiene los detalles de los conflictos de fechas
     * 
     * @param int $empleadoId ID del empleado
     * @param Carbon $fechaInicio Fecha de inicio de la solicitud
     * @param Carbon $fechaFin Fecha de fin de la solicitud
     * @param int|null $excludeSolicitudId ID de la solicitud a excluir (en caso de edición)
     * @return Collection Detalles de las solicitudes que tienen conflicto
     */
    public function getDateConflictDetails(
        int $empleadoId,
        Carbon $fechaInicio,
        Carbon $fechaFin,
        ?int $excludeSolicitudId = null
    ): Collection {
        $query = SolicitudPermiso::query()
            ->with(['permiso', 'estado'])
            ->where('empleado_id', $empleadoId)
            ->where('estado_id', self::APPROVED_STATUS_ID) // APROBADO
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                // 1. Fecha de inicio de la solicitud está dentro del rango de otra solicitud
                $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                    // 2. Fecha de fin de la solicitud está dentro del rango de otra solicitud
                    ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                    // 3. La solicitud abarca completamente el rango de otra solicitud
                    ->orWhere(function ($query) use ($fechaInicio, $fechaFin) {
                        $query->where('fecha_inicio', '<=', $fechaInicio)
                            ->where('fecha_fin', '>=', $fechaFin);
                    });
            });

        // Excluir la solicitud actual en caso de edición
        if ($excludeSolicitudId) {
            $query->where('id', '!=', $excludeSolicitudId);
        }

        return $query->get()->map(function ($solicitud) {
            return [
                'id' => $solicitud->id,
                'permiso' => $solicitud->permiso->nombre,
                'fecha_inicio' => $solicitud->fecha_inicio->format('Y-m-d'),
                'fecha_fin' => $solicitud->fecha_fin->format('Y-m-d'),
            ];
        });
    }

    /**
     * Verifica si las fechas son válidas según las reglas de negocio
     * 
     * @param Carbon $fechaInicio Fecha de inicio de la solicitud
     * @param Carbon $fechaFin Fecha de fin de la solicitud
     * @return array Un array con los errores encontrados, vacío si no hay errores
     */
    public function validateDates(Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $errors = [];
        $today = Carbon::today();

        // Fecha inicio debe ser hoy o posterior
        if ($fechaInicio->lt($today)) {
            $errors['fecha_inicio'] = 'La fecha de inicio debe ser hoy o posterior.';
        }

        // Fecha fin debe ser igual o posterior a fecha inicio
        if ($fechaFin->lt($fechaInicio)) {
            $errors['fecha_fin'] = 'La fecha de fin debe ser posterior o igual a la fecha de inicio.';
        }

        return $errors;
    }

    /**
     * Valida que la duración de la solicitud no supere el máximo permitido del permiso
     * 
     * @param int|Permiso $permiso ID del permiso o instancia de Permiso
     * @param Carbon $fechaInicio Fecha de inicio de la solicitud
     * @param Carbon $fechaFin Fecha de fin de la solicitud
     * @return array Un array con los errores encontrados, vacío si no hay errores
     */
    public function validateDuration(
        int|Permiso $permiso,
        Carbon $fechaInicio,
        Carbon $fechaFin
    ): array {
        $errors = [];

        $permiso = $permiso instanceof Permiso ? $permiso : Permiso::find($permiso);

        if (!$permiso || !$permiso->duracion) {
            // Si el permiso no existe o no tiene duración definida, no hay restricción
            return $errors;
        }

        // Calcular duración de la solicitud en milisegundos
        $duracionSolicitud = $fechaInicio->diffInMilliseconds($fechaFin);

        Log::info('Validating duration for SolicitudPermiso', [
            'permiso_id' => $permiso->id,
            'fecha_inicio' => $fechaInicio->toDateTimeString(),
            'fecha_fin' => $fechaFin->toDateTimeString(),
            'duracion_solicitud' => $duracionSolicitud,
            'duracion_permitida' => $permiso->duracion,
        ]);

        if ($duracionSolicitud > $permiso->duracion) {
            $errors['fecha_fin'] = sprintf(
                'La duración solicitada excede el máximo permitido para este tipo de permiso (%s).',
                $this->formatDuration($permiso->duracion)
            );
        }

        return $errors;
    }

    /**
     * Valida que la suma de solicitudes del empleado para este permiso en los años de la solicitud no supere el máximo anual permitido
     * 
     * @param int|Empleado $empleado ID del empleado o instancia de Empleado
     * @param int|Permiso $permiso ID del permiso o instancia de Permiso
     * @param Carbon $fechaInicio Fecha de inicio de la solicitud
     * @param Carbon $fechaFin Fecha de fin de la solicitud
     * @param int|null $excludeSolicitudId ID de la solicitud a excluir (en caso de edición)
     * @return array Un array con los errores encontrados, vacío si no hay errores
     */
    public function validateAnnualDuration(
        int|Empleado $empleado,
        int|Permiso $permiso,
        Carbon $fechaInicio,
        Carbon $fechaFin,
        ?int $excludeSolicitudId = null
    ): array {
        $errors = [];

        $permiso = $permiso instanceof Permiso ? $permiso : Permiso::find($permiso);

        if (!$permiso || !$permiso->yearly_limited || !$permiso->duracion) {
            // Si el permiso no existe o no está limitado anualmente o no tiene duración definida, no hay restricción
            return $errors;
        }

        // Obtener todos los años involucrados en la solicitud
        $initialYear = $fechaInicio->year;
        $finalYear = $fechaFin->year;
        $involvedYears = range($initialYear, $finalYear);

        // Validar cada año por separado
        foreach ($involvedYears as $year) {
            // Determinar el período de la solicitud que corresponde a este año
            $yearBeginning = Carbon::create($year, 1, 1)->startOfYear();
            $yearEnding = Carbon::create($year, 12, 31)->endOfYear();

            // Calcular la duración de la solicitud en el año específico
            $requestedDurationInYear = $this->calculateDurationInYear(
                $fechaInicio,
                $fechaFin,
                $yearBeginning,
                $yearEnding
            );

            // Obtener todas las solicitudes aprobadas del empleado para este permiso en el año
            $query = SolicitudPermiso::query()
                ->where('empleado_id', $empleado instanceof Empleado ? $empleado->id : $empleado)
                ->where('permiso_id', $permiso->id)
                ->where('estado_id', self::APPROVED_STATUS_ID); // APROBADO

            // Aplicar condiciones de intersección de fechas
            $query = $this->addDateIntersectionConditions($query, $yearBeginning, $yearEnding);

            // Excluir la solicitud actual en caso de edición
            if ($excludeSolicitudId) {
                $query->where('id', '!=', $excludeSolicitudId);
            }

            $solicitudesAprobadas = $query->get();

            // Calcular duración total ya utilizada en este año
            $requestsUsageInYear = $solicitudesAprobadas->sum(function ($solicitud) use ($yearBeginning, $yearEnding) {
                // Importante: Calcular solo la porción de cada solicitud que cae en este año
                return $this->calculateDurationInYear(
                    $solicitud->fecha_inicio,
                    $solicitud->fecha_fin,
                    $yearBeginning,
                    $yearEnding
                );
            });

            // Calcular duración total si se aprueba la solicitud actual
            $totalUsageWithNewRequest = $requestsUsageInYear + $requestedDurationInYear;

            if ($totalUsageWithNewRequest > $permiso->duracion) {
                $remainingDurationInYear = $permiso->duracion - $requestsUsageInYear;

                $errors['fecha_fin'] = sprintf(
                    'Esta solicitud excede el tiempo disponible para este permiso en el año %d. ' .
                        'Duración restante en %d: %s de %s total.',
                    $year,
                    $year,
                    $this->formatDuration($remainingDurationInYear),
                    $this->formatDuration($permiso->duracion)
                );

                // Detenerse en el primer error encontrado
                break;
            }
        }

        return $errors;
    }

    /**
     * Obtiene estadísticas de uso de un permiso para un empleado en un año específico
     * 
     * @param int|Empleado $empleado ID del empleado o instancia de Empleado
     * @param int|Permiso $permiso ID del permiso o instancia de Permiso
     * @param int $year Año para el cual se desean las estadísticas
     * @return array Detalles de uso del permiso, incluyendo duración utilizada, restante y porcentaje
     */
    public function getPermisoUsageStats(
        int|Empleado $empleado,
        int|Permiso $permiso,
        int $year
    ): array {
        $permiso = $permiso instanceof Permiso ? $permiso : Permiso::find($permiso);

        if (!$permiso) {
            return [];
        }

        $yearBeginning = Carbon::create($year, 1, 1)->startOfYear();
        $yearEnding = Carbon::create($year, 12, 31)->endOfYear();

        $query = SolicitudPermiso::query()
            ->where('empleado_id', $empleado instanceof Empleado ? $empleado->id : $empleado)
            ->where('permiso_id', $permiso->id)
            ->where('estado_id', self::APPROVED_STATUS_ID); // APROBADO

        // Aplicar condiciones de intersección de fechas
        $query = $this->addDateIntersectionConditions($query, $yearBeginning, $yearEnding);

        $solicitudesAprobadas = $query->get();

        // Calcular duración utilizada solo para la porción que cae en este año
        $usage = $solicitudesAprobadas->sum(function ($solicitud) use ($yearBeginning, $yearEnding) {
            return $this->calculateDurationInYear(
                $solicitud->fecha_inicio,
                $solicitud->fecha_fin,
                $yearBeginning,
                $yearEnding
            );
        });

        $remainingUsage = $permiso->duracion ? max(0, $permiso->duracion - $usage) : null;

        return [
            'permiso' => new PermisoResource($permiso), // Instancia del permiso
            'empleado' => new EmpleadoResource($empleado),
            'usage' => $usage, // Duración utilizada en milisegundos
            'formatted_usage' => $this->formatDuration($usage), // Formateo de la duración utilizada
            'remaining_usage' => $remainingUsage,
            'remaining_usage_formatted' => ($remainingUsage !== null) ? $this->formatDuration($remainingUsage) : null,
            'usage_percentage' => $permiso->duracion ? round(($usage / $permiso->duracion) * 100, 2) : 0,
            'approved_requests' => SolicitudPermisoResource::collection($solicitudesAprobadas),
            'count_approved_requests' => $solicitudesAprobadas->count(),
            'requested_year' => $year,
            'max_formatted_duration' => ($permiso->duracion) ? $this->formatDuration($permiso->duracion) : 'sin duración definida',
        ];
    }

    /**
     * Obtiene estadísticas de uso de un permiso para un empleado en múltiples años
     * 
     * @param int|Empleado $empleado ID del empleado o instancia de Empleado
     * @param int|Permiso $permiso ID del permiso o instancia de Permiso
     * @param array<int> $years Lista de años para los cuales se desean las estadísticas
     * 
     * @return array Detalles de uso del permiso por año, incluyendo duración utilizada, restante y porcentaje
     */
    public function getPermisoUsageStatsForMultipleYears(
        int|Empleado $empleado,
        int|Permiso $permiso,
        array $years
    ): array {
        $statisticsByYear = [];

        foreach ($years as $year) {
            $statisticsByYear[$year] = $this->getPermisoUsageStats($empleado, $permiso, $year);
        }

        return $statisticsByYear;
    }

    /**
     * Obtiene los años involucrados en un rango de fechas
     * 
     * @param Carbon $fechaInicio Fecha de inicio del rango
     * @param Carbon $fechaFin Fecha de fin del rango
     * @return array<int> Lista de años involucrados en el rango
     */
    public function getYearsInvolved(Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $startYear = $fechaInicio->year;
        $endYear = $fechaFin->year;

        return range($startYear, $endYear);
    }

    /**
     * Formatea una duración en milisegundos a un formato legible
     * 
     * @param int $milliseconds Duración en milisegundos
     * @return string Duración formateada como cadena
     */
    private function formatDuration(int $milliseconds): string
    {
        $seconds = $milliseconds / 1000;
        $minutes = $seconds / 60;
        $hours = $minutes / 60;
        $days = $hours / 24;

        if ($days >= 1) {
            $wholeDays = floor($days);
            $remainingHours = floor(($days - $wholeDays) * 24);

            if ($remainingHours > 0) {
                return sprintf('%d día(s) y %d hora(s)', $wholeDays, $remainingHours);
            }
            return sprintf('%d día(s)', $wholeDays);
        } elseif ($hours >= 1) {
            $wholeHours = floor($hours);
            $remainingMinutes = floor(($hours - $wholeHours) * 60);

            if ($remainingMinutes > 0) {
                return sprintf('%d hora(s) y %d minuto(s)', $wholeHours, $remainingMinutes);
            }
            return sprintf('%d hora(s)', $wholeHours);
        } elseif ($minutes >= 1) {
            return sprintf('%d minuto(s)', floor($minutes));
        } else {
            return "sin tiempo restante";
        }
    }

    /**
     * Aplica condiciones para encontrar solicitudes que intersectan con un período
     * 
     * @param \Illuminate\Database\Eloquent\Builder|\App\Models\SolicitudPermiso $query Consulta de solicitudes de permiso
     * @param Carbon $startDate Fecha de inicio del período
     * @param Carbon $endDate Fecha de fin del período
     * @return \Illuminate\Database\Eloquent\Builder|\App\Models\SolicitudPermiso Consulta modificada
     */
    private function addDateIntersectionConditions($query, Carbon $startDate, Carbon $endDate): Builder|SolicitudPermiso
    {
        $query->where(function ($query) use ($startDate, $endDate) {
            $query->where(function ($subQuery) use ($startDate, $endDate) {
                // Solicitudes que INICIAN dentro del período
                $subQuery->whereBetween('fecha_inicio', [$startDate, $endDate])
                    // Solicitudes que TERMINAN dentro del período
                    ->orWhereBetween('fecha_fin', [$startDate, $endDate])
                    // Solicitudes que ABARCAN completamente el período
                    ->orWhere(function ($innerQuery) use ($startDate, $endDate) {
                        $innerQuery->where('fecha_inicio', '<=', $startDate)
                            ->where('fecha_fin', '>=', $endDate);
                    });
            });
        });

        return $query;
    }

    /**
     * Calcula la duración en milisegundos de una solicitud que cae dentro de un año específico
     * 
     * @param Carbon $fechaInicio Fecha de inicio de la solicitud
     * @param Carbon $fechaFin Fecha de fin de la solicitud
     * @param Carbon $yearBeginning Fecha de inicio del año
     * @param Carbon $yearEnding Fecha de fin del año
     * @return int Duración en milisegundos de la solicitud dentro del año
     */
    private function calculateDurationInYear(
        Carbon $fechaInicio,
        Carbon $fechaFin,
        Carbon $yearBeginning,
        Carbon $yearEnding
    ): int {
        $beginningDateInYear = $fechaInicio->greaterThan($yearBeginning) ? $fechaInicio : $yearBeginning;
        $endingDateInYear = $fechaFin->lessThan($yearEnding) ? $fechaFin : $yearEnding;

        return $beginningDateInYear->diffInMilliseconds($endingDateInYear);
    }
}

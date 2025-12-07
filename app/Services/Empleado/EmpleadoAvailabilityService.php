<?php

namespace App\Services\Empleado;

use App\Models\Contrato;
use App\Http\Resources\ContratoResource;
use Carbon\Carbon;

class EmpleadoAvailabilityService
{
    /**
     * Obtiene los contratos disponibles para una lista de empleados en rangos de fechas específicos.
     *
     * @param array $empleadosData Array con los datos de los empleados y sus fechas.
     * @param array $dateRange Array con 'min' y 'max' del rango de fechas general.
     * @return array La estructura de datos final con la disponibilidad.
     */
    public function getAvailableContracts(array $empleadosData, array $dateRange): array
    {
        $empleadoIds = collect($empleadosData)->pluck('empleado_id')->unique()->all();

        $contratos = $this->fetchRelevantContracts($empleadoIds, $dateRange);

        $disponibilidad = [];
        foreach ($empleadosData as $empleadoData) {
            $empleadoId = $empleadoData['empleado_id'];
            $fechas = $empleadoData['fechas'];
            $contratosEmpleado = $contratos->where('empleado_id', $empleadoId);

            foreach ($fechas as $fecha) {
                $contratosDisponibles = $this->findAvailableContractsForDate($contratosEmpleado, $fecha);
                $disponibilidad[$empleadoId][$fecha->format('Y-m-d')] = ContratoResource::collection($contratosDisponibles);
            }
        }

        return [
            'disponibilidad' => $disponibilidad,
            'total_empleados' => count($empleadosData),
            'total_fechas_unicas' => collect($empleadosData)->pluck('fechas')->flatten()->unique()->count(),
            'message' => 'Consulta de contratos disponibles realizada correctamente.'
        ];
    }

    /**
     * Obtiene de la base de datos todos los contratos que podrían ser relevantes para la consulta.
     */
    private function fetchRelevantContracts(array $empleadoIds, array $dateRange): \Illuminate\Database\Eloquent\Collection
    {
        return Contrato::with(['anexos' => function ($query) use ($dateRange) {
            $query->where(function ($q) use ($dateRange) {
                $q->where('fecha_inicio', '<=', $dateRange['max'])
                    ->where(function ($subq) use ($dateRange) {
                        $subq->where('fecha_fin', '>=', $dateRange['min'])
                            ->orWhereNull('fecha_fin');
                    });
            });
        }])
            ->whereIn('empleado_id', $empleadoIds)
            ->where('fecha_inicio', '<=', $dateRange['max'])
            ->where(function ($query) use ($dateRange) {
                $query->where('fecha_fin', '>=', $dateRange['min'])
                    ->orWhereNull('fecha_fin');
            })
            ->get();
    }

    /**
     * Filtra los contratos para una fecha específica.
     */
    private function findAvailableContractsForDate(\Illuminate\Support\Collection $contratos, Carbon $fecha): \Illuminate\Support\Collection
    {
        return $contratos->filter(function ($contrato) use ($fecha) {
            return $this->isContractAvailableForDate($contrato, $fecha);
        });
    }

    /**
     * Verifica si un contrato individual está disponible en una fecha.
     */
    private function isContractAvailableForDate(Contrato $contract, Carbon $fecha): bool
    {
        $inicio = Carbon::parse($contract->fecha_inicio);
        $fin = $contract->fecha_fin ? Carbon::parse($contract->fecha_fin) : null;

        return $fecha->gte($inicio) && ($fin === null || $fecha->lte($fin));
    }
}

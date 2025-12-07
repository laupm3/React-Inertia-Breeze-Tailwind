<?php

namespace App\Services\Export;

use App\Models\Horario;
use App\Http\Resources\Export\HorarioResource;
use App\Services\Export\BaseExportService;

/**
 * Service for exporting Horarios data
 */
class HorariosExportService extends BaseExportService
{
    /**
     * Build the base query for horarios
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function buildBaseQuery()
    {
        return Horario::query()->distinct()->select([
            'id', 'contrato_id', 'anexo_id', 'estado_horario_id', 'modalidad_id', 'turno_id',
            'solicitud_permiso_id', 'horario_inicio', 'horario_fin', 'descanso_inicio', 'descanso_fin',
            'estado_fichaje', 'fichaje_entrada', 'fichaje_salida', 'latitud_entrada', 'longitud_entrada',
            'latitud_salida', 'longitud_salida', 'ip_address_entrada', 'ip_address_salida',
            'user_agent_entrada', 'user_agent_salida', 'observaciones'
        ]);
    }

    /**
     * Override getExportData to handle both horario IDs and empleado IDs
     *
     * @param array $filters
     * @param array $selectedRows
     * @param array $sorting
     * @param array $columnVisibility
     * @param string $exportType
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getExportData(array $filters = [], array $selectedRows = [], array $sorting = [], array $columnVisibility = [], string $exportType = 'filtered')
    {
        $query = $this->buildBaseQuery();

        // Si selectedRows está vacío, intentamos usar getSortedRowModel de la request
        if (empty($selectedRows)) {
            $sortedRowModel = request()->input('getSortedRowModel', []);
            if (!empty($sortedRowModel)) {
                $selectedRows = $sortedRowModel;
            }
        }

        // 1. Si hay selectedRows → SIEMPRE tratar como IDs de empleados
        if (!empty($selectedRows)) {
            // Filtrar por empleado_id en contrato
            $query->whereHas('contrato', function($q) use ($selectedRows) {
                $q->whereIn('empleado_id', $selectedRows);
            });

            // Ordenar los resultados en PHP según el orden de selectedRows
            $results = $query->get();
            $idPos = array_flip($selectedRows);
            $results = $results->sortBy(function($item) use ($idPos) {
                // Ordenar por el empleado_id del contrato
                $empleadoId = $item->contrato ? $item->contrato->empleado_id : null;
                return $idPos[$empleadoId] ?? 999999;
            })->values();
            $this->loadRelations($results, $columnVisibility);
            return $results;
        } else {
            // 2. Si NO hay selectedRows → Aplica filtros y ordenamiento
            $this->applyFilters($query, $filters);
            if (!empty($sorting)) {
                $this->applySorting($query, $sorting);
            }
            $results = $query->get();
        }

        $this->loadRelations($results, $columnVisibility);
        return $results;
    }

    /**
     * Detect if provided IDs are horario IDs or empleado IDs
     * Checks if at least one of the IDs exists in the horarios table
     *
     * @param array $ids
     * @return bool
     */
    private function detectIfHorarioIds(array $ids): bool
    {
        if (empty($ids)) {
            return false;
        }

        // Comprobar si al menos uno de los IDs existe en la tabla horarios
        $existingHorarioCount = Horario::whereIn('id', $ids)->count();
        
        // Si encontramos horarios con esos IDs, asumimos que son IDs de horarios
        // Si no encontramos ninguno, asumimos que son IDs de empleados
        return $existingHorarioCount > 0;
    }

    /**
     * Apply filters to the query
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return void
     */
    public function applyFilters($query, array $filters): void
    {
        // Aquí puedes añadir filtros según tus necesidades
    }

    /**
     * Apply sorting to the query
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $sorting
     * @return void
     */
    public function applySorting($query, array $sorting): void
    {
        // Aquí puedes añadir sorting según tus necesidades
    }

    /**
     * Load relationships based on column visibility
     *
     * @param \Illuminate\Database\Eloquent\Collection $results
     * @param array $columnVisibility
     * @return void
     */
    public function loadRelations($results, array $columnVisibility): void
    {
        $relationsToLoad = [
            'contrato.empleado', 
            'anexo.contrato.empleado', 
            'estadoHorario', 
            'modalidad', 
            'turno'
        ];
        $results->load($relationsToLoad);
    }

    /**
     * Get the resource class for export
     *
     * @return string
     */
    public function getResourceClass(): string
    {
        return HorarioResource::class;
    }

    /**
     * Get the model class
     *
     * @return string
     */
    public function getModelClass(): string
    {
        return Horario::class;
    }

    /**
     * Map visible columns for export
     *
     * @param array $columnVisibility
     * @return array
     */
    public function mapVisibleColumns(array $columnVisibility): array
    {
        // Para horarios, devolver todas las columnas disponibles por defecto
        // ya que la tabla de horarios es dinámica y no tiene columnas fijas
        return [
            'Empleado', 'Contrato', 'Anexo', 'Solicitud Permiso', 'Estado Horario', 'Modalidad', 'Turno',
            'Horario Inicio', 'Horario Fin', 'Descanso Inicio', 'Descanso Fin', 'Estado Fichaje',
            'Fichaje Entrada', 'Fichaje Salida', 'Latitud Entrada', 'Longitud Entrada',
            'Latitud Salida', 'Longitud Salida', 'IP Address Entrada', 'IP Address Salida',
            'User Agent Entrada', 'User Agent Salida', 'Observaciones'
        ];
    }

    /**
     * Get available columns for export
     *
     * @return array
     */
    public function getAvailableColumns(): array
    {
        return [
            'empleado' => 'Empleado',
            'contrato' => 'Contrato',
            'anexo' => 'Anexo',
            'solicitud_permiso_id' => 'Solicitud Permiso',
            'estadoHorario' => 'Estado Horario',
            'modalidad' => 'Modalidad',
            'turno' => 'Turno',
            'horario_inicio' => 'Horario Inicio',
            'horario_fin' => 'Horario Fin',
            'descanso_inicio' => 'Descanso Inicio',
            'descanso_fin' => 'Descanso Fin',
            'estado_fichaje' => 'Estado Fichaje',
            'fichaje_entrada' => 'Fichaje Entrada',
            'fichaje_salida' => 'Fichaje Salida',
            'latitud_entrada' => 'Latitud Entrada',
            'longitud_entrada' => 'Longitud Entrada',
            'latitud_salida' => 'Latitud Salida',
            'longitud_salida' => 'Longitud Salida',
            'ip_address_entrada' => 'IP Address Entrada',
            'ip_address_salida' => 'IP Address Salida',
            'user_agent_entrada' => 'User Agent Entrada',
            'user_agent_salida' => 'User Agent Salida',
            'observaciones' => 'Observaciones',
        ];
    }

    /**
     * Get query statistics for performance monitoring
     *
     * @param array $filters
     * @param array $selectedRows
     * @param array $sorting
     * @return array
     */
    public function getQueryStats(array $filters = [], array $selectedRows = [], array $sorting = []): array
    {
        $query = $this->buildBaseQuery();
        
        if (!empty($selectedRows)) {
            // Detectar si los IDs son de horarios o de empleados
            $areHorarioIds = $this->detectIfHorarioIds($selectedRows);
            
            if ($areHorarioIds) {
                $query->whereIn($this->getIdColumn(), $selectedRows);
            } else {
                $query->whereHas('contrato', function($q) use ($selectedRows) {
                    $q->whereIn('empleado_id', $selectedRows);
                });
            }
        } else {
            $this->applyFilters($query, $filters);
        }
        
        $totalRecords = $query->count();
        
        return [
            'total_records' => $totalRecords,
            'estimated_export_time' => $this->estimateExportTime($totalRecords),
            'use_queue' => $totalRecords > 10
        ];
    }

    /**
     * Estimate export time based on record count
     *
     * @param int $recordCount
     * @return int
     */
    protected function estimateExportTime(int $recordCount): int
    {
        // Estimación basada en experiencia: ~1000 registros por segundo
        $seconds = max(1, ceil($recordCount / 1000));
        return $seconds;
    }

    /**
     * Get suggested database indexes for optimization
     *
     * @return array
     */
    public function getSuggestedIndexes(): array
    {
        return [
            'horarios_contrato_id_index' => 'contrato_id',
            'horarios_anexo_id_index' => 'anexo_id',
            'horarios_estado_horario_id_index' => 'estado_horario_id',
            'horarios_modalidad_id_index' => 'modalidad_id',
            'horarios_turno_id_index' => 'turno_id',
            'horarios_horario_inicio_index' => 'horario_inicio',
            'horarios_horario_fin_index' => 'horario_fin',
        ];
    }

    /**
     * Get the export job class
     *
     * @return string
     */
    public function getExportJobClass(): string
    {
        return \App\Jobs\Export\ExportHorariosJob::class;
    }
}

<?php

namespace App\Services\Export;

use App\Models\Asignacion;
use App\Http\Resources\Export\AsignacionResource;
use App\Services\Export\BaseExportService;

/**
 * Service for exporting Asignaciones data
 */
class AsignacionesExportService extends BaseExportService
{
    /**
     * Build the base query for asignaciones
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function buildBaseQuery()
    {
        return Asignacion::query()->distinct()->select([
            'asignaciones.id',
            'asignaciones.nombre',
            'asignaciones.descripcion',
            'asignaciones.created_at',
            'asignaciones.updated_at'
        ]);
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
        // Filtros específicos para asignaciones
        if (isset($filters['nombre']) && !empty($filters['nombre'])) {
            $query->where('asignaciones.nombre', 'like', '%' . $filters['nombre'] . '%');
        }
        
        if (isset($filters['descripcion']) && !empty($filters['descripcion'])) {
            $query->where('asignaciones.descripcion', 'like', '%' . $filters['descripcion'] . '%');
        }
        
        if (isset($filters['empleados']) && is_array($filters['empleados']) && count($filters['empleados']) > 0) {
            $empleadoIds = $filters['empleados'];
            $query->whereHas('empleados', function($q) use ($empleadoIds) {
                $q->whereIn('empleados.id', $empleadoIds);
            });
        }
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
        if (!empty($sorting)) {
            foreach ($sorting as $sort) {
                $column = $sort['id'];
                $direction = !empty($sort['desc']) ? 'desc' : 'asc';

                $columnMap = [
                    'nombre' => 'asignaciones.nombre',
                    'descripcion' => 'asignaciones.descripcion',
                    'fecha_creacion' => 'asignaciones.created_at',
                ];
                
                if (isset($columnMap[$column])) {
                    $query->orderBy($columnMap[$column], $direction);
                }
            }
        } else {
            $query->orderBy('asignaciones.nombre', 'asc');
        }
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
        $relationsToLoad = [];
        
        // Relaciones condicionales basadas en columnVisibility
        if (!isset($columnVisibility['contratosVinculados']) || $columnVisibility['contratosVinculados']) {
            $relationsToLoad[] = 'contratos';
        }
        
        if (!isset($columnVisibility['contratosVigentes']) || $columnVisibility['contratosVigentes']) {
            $relationsToLoad[] = 'contratosVigentes.empleado.user';
        }
        
        if (!empty($relationsToLoad)) {
            $results->load($relationsToLoad);
        }
    }

    /**
     * Get the resource class for export
     *
     * @return string
     */
    public function getResourceClass(): string
    {
        return AsignacionResource::class;
    }

    /**
     * Get the model class
     *
     * @return string
     */
    public function getModelClass(): string
    {
        return Asignacion::class;
    }

    /**
     * Map visible columns for export
     *
     * @param array $columnVisibility
     * @return array
     */
    public function mapVisibleColumns(array $columnVisibility): array
    {
        // Mapeo basado en las columnas reales de la datatable de asignaciones
        $columnMapping = [
            'nombre' => ['Nombre'],
            'descripcion' => ['Descripción'],
            'contratosVinculados' => ['Contratos vinculados'],
            'contratosVigentes' => ['Empleados'],
        ];
        
        $visibleColumns = [];
        foreach ($columnMapping as $columnId => $resourceColumns) {
            $isVisible = !isset($columnVisibility[$columnId]) || $columnVisibility[$columnId] === true;
            if ($isVisible) {
                $visibleColumns = array_merge($visibleColumns, $resourceColumns);
            }
        }
        
        if (empty($visibleColumns)) {
            return ['Nombre', 'Descripción'];
        }
        
        return array_unique($visibleColumns);
    }

    /**
     * Get available columns for export
     *
     * @return array
     */
    public function getAvailableColumns(): array
    {
        return [
            'nombre' => 'Nombre asignación',
            'descripcion' => 'Descripción',
            'contratosVinculados' => 'Contratos vinculados',
            'contratosVigentes' => 'Empleados',
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
            $query->whereIn($this->getIdColumn(), $selectedRows);
        } else {
            $this->applyFilters($query, $filters);
        }

        $startTime = microtime(true);
        $count = $query->count();
        $endTime = microtime(true);

        return [
            'total_records' => $count,
            'query_time_ms' => round(($endTime - $startTime) * 1000, 2),
            'estimated_export_time_seconds' => $this->estimateExportTime($count),
            'recommended_use_queue' => $count > 1000
        ];
    }

    /**
     * Estimate export time based on record count
     *
     * @param int $recordCount
     * @return float
     */
    protected function estimateExportTime(int $recordCount): float
    {
        // Estimación basada en pruebas: ~100 registros por segundo
        return round($recordCount / 100, 2);
    }

    /**
     * Get suggested database indexes for optimization
     *
     * @return array
     */
    public function getSuggestedIndexes(): array
    {
        return [
            'asignaciones_nombre_index' => 'CREATE INDEX asignaciones_nombre_index ON asignaciones(nombre)',
            'asignaciones_descripcion_index' => 'CREATE INDEX asignaciones_descripcion_index ON asignaciones(descripcion)',
        ];
    }

    /**
     * Get the export job class
     *
     * @return string
     */
    public function getExportJobClass(): string
    {
        return \App\Jobs\Export\ExportAsignacionesJob::class;
    }
} 
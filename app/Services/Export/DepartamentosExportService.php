<?php

namespace App\Services\Export;

use App\Models\Departamento;
use App\Http\Resources\Export\DepartamentoResource;
use App\Services\Export\BaseExportService;

/**
 * Service for exporting Departamentos data
 */
class DepartamentosExportService extends BaseExportService
{
    /**
     * Build the base query for departamentos
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function buildBaseQuery()
    {
        return Departamento::query()->distinct()->select([
            'departamentos.id',
            'departamentos.nombre',
            'departamentos.descripcion',
            'departamentos.created_at',
            'departamentos.updated_at',
            'departamentos.manager_id',
            'departamentos.adjunto_id',
            'departamentos.parent_department_id'
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
        // Filtros específicos para departamentos
        if (isset($filters['nombre']) && !empty($filters['nombre'])) {
            $query->where('departamentos.nombre', 'like', '%' . $filters['nombre'] . '%');
        }
        
        if (isset($filters['descripcion']) && !empty($filters['descripcion'])) {
            $query->where('departamentos.descripcion', 'like', '%' . $filters['descripcion'] . '%');
        }
        
        if (isset($filters['parent_department']) && !empty($filters['parent_department'])) {
            $query->where('departamentos.parent_department_id', $filters['parent_department']);
        }
        
        if (isset($filters['manager']) && !empty($filters['manager'])) {
            $query->where('departamentos.manager_id', $filters['manager']);
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
                    'nombre' => 'departamentos.nombre',
                    'descripcion' => 'departamentos.descripcion',
                    'fecha_creacion' => 'departamentos.created_at',
                ];
                
                if (isset($columnMap[$column])) {
                    $query->orderBy($columnMap[$column], $direction);
                }
            }
        } else {
            $query->orderBy('departamentos.nombre', 'asc');
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
        if (!isset($columnVisibility['manager']) || $columnVisibility['manager']) {
            $relationsToLoad[] = 'manager.user';
        }
        
        if (!isset($columnVisibility['adjunto']) || $columnVisibility['adjunto']) {
            $relationsToLoad[] = 'adjunto.user';
        }
        
        if (!isset($columnVisibility['parentDepartment']) || $columnVisibility['parentDepartment']) {
            $relationsToLoad[] = 'parentDepartment';
        }
        
        if (!isset($columnVisibility['childDepartments']) || $columnVisibility['childDepartments']) {
            $relationsToLoad[] = 'childDepartments';
        }
        
        if (!isset($columnVisibility['centros']) || $columnVisibility['centros']) {
            $relationsToLoad[] = 'centros';
        }
        
        if (!isset($columnVisibility['empleados']) || $columnVisibility['empleados']) {
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
        return DepartamentoResource::class;
    }

    /**
     * Get the model class
     *
     * @return string
     */
    public function getModelClass(): string
    {
        return Departamento::class;
    }

    /**
     * Map visible columns for export
     *
     * @param array $columnVisibility
     * @return array
     */
    public function mapVisibleColumns(array $columnVisibility): array
    {
        // Mapeo basado en las columnas reales de la datatable de departamentos
        $columnMapping = [
            'departamento' => ['Nombre'],
            'empleados' => ['Nº Empleados'],
            'manager' => ['Manager'],
            'adjunto' => ['Adjunto'],
            'centros' => ['Centros'],
            'parentDepartment' => ['Departamento Padre'],
            'childDepartments' => ['Departamentos Hijos'],
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
            'departamento' => 'Departamentos',
            'empleados' => 'Nº Empleados',
            'manager' => 'Mánager',
            'adjunto' => 'Adjunto',
            'centros' => 'Centros',
            'parentDepartment' => 'Departamento Padre',
            'childDepartments' => 'Departamentos Hijos',
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
            'departamentos_nombre_index' => 'CREATE INDEX departamentos_nombre_index ON departamentos(nombre)',
            'departamentos_manager_id_index' => 'CREATE INDEX departamentos_manager_id_index ON departamentos(manager_id)',
            'departamentos_parent_id_index' => 'CREATE INDEX departamentos_parent_id_index ON departamentos(parent_id)',
        ];
    }

    /**
     * Get the export job class
     *
     * @return string
     */
    public function getExportJobClass(): string
    {
        return \App\Jobs\Export\ExportDepartamentosJob::class;
    }
} 
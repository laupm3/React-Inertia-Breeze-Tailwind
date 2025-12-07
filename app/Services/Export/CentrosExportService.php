<?php

namespace App\Services\Export;

use App\Models\Centro;
use App\Http\Resources\Export\CentroResource;
use App\Services\Export\BaseExportService;

/**
 * Service for exporting Centros data
 */
class CentrosExportService extends BaseExportService
{
    /**
     * Build the base query for centros
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function buildBaseQuery()
    {
        return Centro::query()->distinct()->select([
            'centros.id',
            'centros.nombre',
            'centros.email',
            'centros.telefono',
            'centros.created_at',
            'centros.updated_at',
            'centros.empresa_id',
            'centros.responsable_id',
            'centros.coordinador_id',
            'centros.estado_id',
            'centros.direccion_id'
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
        // Filtros específicos para centros
        if (isset($filters['nombre']) && !empty($filters['nombre'])) {
            $query->where('centros.nombre', 'like', '%' . $filters['nombre'] . '%');
        }
        
        if (isset($filters['email']) && !empty($filters['email'])) {
            $query->where('centros.email', 'like', '%' . $filters['email'] . '%');
        }
        
        if (isset($filters['empresas']) && is_array($filters['empresas']) && count($filters['empresas']) > 0) {
            $empresaIds = $filters['empresas'];
            $query->whereIn('centros.empresa_id', $empresaIds);
        }
        
        if (isset($filters['estados']) && is_array($filters['estados']) && count($filters['estados']) > 0) {
            $estadoIds = $filters['estados'];
            $query->whereIn('centros.estado_id', $estadoIds);
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
                    'nombre' => 'centros.nombre',
                    'email' => 'centros.email',
                    'telefono' => 'centros.telefono',
                    'fecha_creacion' => 'centros.created_at',
                ];
                
                if (isset($columnMap[$column])) {
                    $query->orderBy($columnMap[$column], $direction);
                }
            }
        } else {
            $query->orderBy('centros.nombre', 'asc');
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
        if (!isset($columnVisibility['empresa']) || $columnVisibility['empresa']) {
            $relationsToLoad[] = 'empresa';
        }
        
        if (!isset($columnVisibility['responsable']) || $columnVisibility['responsable']) {
            $relationsToLoad[] = 'responsable.user';
        }
        
        if (!isset($columnVisibility['coordinador']) || $columnVisibility['coordinador']) {
            $relationsToLoad[] = 'coordinador.user';
        }
        
        if (!isset($columnVisibility['estado']) || $columnVisibility['estado']) {
            $relationsToLoad[] = 'estado';
        }
        
        if (!isset($columnVisibility['direccion']) || $columnVisibility['direccion']) {
            $relationsToLoad[] = 'direccion';
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
        return CentroResource::class;
    }

    /**
     * Get the model class
     *
     * @return string
     */
    public function getModelClass(): string
    {
        return Centro::class;
    }

    /**
     * Map visible columns for export
     *
     * @param array $columnVisibility
     * @return array
     */
    public function mapVisibleColumns(array $columnVisibility): array
    {
        // Mapeo basado en las columnas reales de la datatable de centros
        $columnMapping = [
            'nombre' => ['Nombre'],
            'empresa' => ['Empresa'],
            'direccion' => ['Dirección'],
            'email' => ['Email'],
            'telefono' => ['Teléfono'],
            'estado' => ['Estado'],
            'responsable' => ['Responsable'],
            'coordinador' => ['Coordinador'],
        ];
        
        $visibleColumns = [];
        foreach ($columnMapping as $columnId => $resourceColumns) {
            $isVisible = !isset($columnVisibility[$columnId]) || $columnVisibility[$columnId] === true;
            if ($isVisible) {
                $visibleColumns = array_merge($visibleColumns, $resourceColumns);
            }
        }
        
        if (empty($visibleColumns)) {
            return ['Nombre', 'Email'];
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
            'nombre' => 'Nombre centro',
            'empresa' => 'Empresa',
            'direccion' => 'Dirección',
            'email' => 'Email',
            'telefono' => 'Teléfono',
            'estado' => 'Estado',
            'responsable' => 'Responsable',
            'coordinador' => 'Coordinador',
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
            'centros_nombre_index' => 'CREATE INDEX centros_nombre_index ON centros(nombre)',
            'centros_email_index' => 'CREATE INDEX centros_email_index ON centros(email)',
            'centros_empresa_id_index' => 'CREATE INDEX centros_empresa_id_index ON centros(empresa_id)',
        ];
    }

    /**
     * Get the export job class
     *
     * @return string
     */
    public function getExportJobClass(): string
    {
        return \App\Jobs\Export\ExportCentrosJob::class;
    }
} 
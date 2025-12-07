<?php

namespace App\Services\Export;

use App\Models\Empresa;
use App\Http\Resources\Export\EmpresaResource;
use App\Services\Export\BaseExportService;

/**
 * Service for exporting Empresas data
 */
class EmpresasExportService extends BaseExportService
{
    /**
     * Build the base query for empresas
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function buildBaseQuery()
    {
        return Empresa::query()->distinct()->select([
            'empresas.id',
            'empresas.nombre',
            'empresas.siglas',
            'empresas.cif',
            'empresas.email',
            'empresas.telefono',
            'empresas.created_at',
            'empresas.updated_at',
            'empresas.representante_id',
            'empresas.adjunto_id',
            'empresas.direccion_id'
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
        // Filtros específicos para empresas
        if (isset($filters['nombre']) && !empty($filters['nombre'])) {
            $query->where('empresas.nombre', 'like', '%' . $filters['nombre'] . '%');
        }
        
        if (isset($filters['cif']) && !empty($filters['cif'])) {
            $query->where('empresas.cif', 'like', '%' . $filters['cif'] . '%');
        }
        
        if (isset($filters['siglas']) && !empty($filters['siglas'])) {
            $query->where('empresas.siglas', 'like', '%' . $filters['siglas'] . '%');
        }
        
        if (isset($filters['centros']) && is_array($filters['centros']) && count($filters['centros']) > 0) {
            $centroIds = $filters['centros'];
            $query->whereHas('centros', function($q) use ($centroIds) {
                $q->whereIn('centros.id', $centroIds);
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
                    'nombre' => 'empresas.nombre',
                    'siglas' => 'empresas.siglas',
                    'cif' => 'empresas.cif',
                    'email' => 'empresas.email',
                    'telefono' => 'empresas.telefono',
                    'fecha_creacion' => 'empresas.created_at',
                ];
                
                if (isset($columnMap[$column])) {
                    $query->orderBy($columnMap[$column], $direction);
                }
            }
        } else {
            $query->orderBy('empresas.nombre', 'asc');
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
        
        if (!isset($columnVisibility['representante']) || $columnVisibility['representante']) {
            $relationsToLoad[] = 'representante.user';
        }
        
        if (!isset($columnVisibility['adjunto']) || $columnVisibility['adjunto']) {
            $relationsToLoad[] = 'adjunto.user';
        }
        
        if (!isset($columnVisibility['direccion']) || $columnVisibility['direccion']) {
            $relationsToLoad[] = 'direccion';
        }
        
        if (!isset($columnVisibility['centros']) || $columnVisibility['centros']) {
            $relationsToLoad[] = 'centros';
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
        return EmpresaResource::class;
    }

    /**
     * Get the model class
     *
     * @return string
     */
    public function getModelClass(): string
    {
        return Empresa::class;
    }

    /**
     * Map visible columns for export
     *
     * @param array $columnVisibility
     * @return array
     */
    public function mapVisibleColumns(array $columnVisibility): array
    {
        // Mapeo basado en las columnas reales de la datatable de empresas
        $columnMapping = [
            'nombre' => ['Nombre'],
            'siglas' => ['Siglas'],
            'cif' => ['CIF'],
            'direccion' => ['Dirección fiscal'],
            'email' => ['Email'],
            'telefono' => ['Teléfono'],
            'representante' => ['Representante'],
            'adjunto' => ['Adjunto'],
            'centros' => ['Centros'],
        ];
        
        $visibleColumns = [];
        foreach ($columnMapping as $columnId => $resourceColumns) {
            $isVisible = !isset($columnVisibility[$columnId]) || $columnVisibility[$columnId] === true;
            if ($isVisible) {
                $visibleColumns = array_merge($visibleColumns, $resourceColumns);
            }
        }
        
        if (empty($visibleColumns)) {
            return ['Nombre', 'CIF'];
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
            'nombre' => 'Nombre empresa',
            'siglas' => 'Siglas',
            'cif' => 'CIF',
            'direccion' => 'Dirección fiscal',
            'email' => 'Email',
            'telefono' => 'Teléfono',
            'representante' => 'Representante',
            'adjunto' => 'Adjunto',
            'centros' => 'Centros',
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
            'empresas_cif_index' => 'CREATE INDEX empresas_cif_index ON empresas(cif)',
            'empresas_nombre_index' => 'CREATE INDEX empresas_nombre_index ON empresas(nombre)',
            'empresas_siglas_index' => 'CREATE INDEX empresas_siglas_index ON empresas(siglas)',
        ];
    }

    /**
     * Get the export job class
     *
     * @return string
     */
    public function getExportJobClass(): string
    {
        return \App\Jobs\Export\ExportEmpresasJob::class;
    }
} 
<?php

namespace App\Services\Export;

use App\Models\Contrato;
use App\Http\Resources\Export\ContratoResource;
use App\Services\Export\BaseExportService;

/**
 * Service for exporting Contratos data
 */
class ContratosExportService extends BaseExportService
{
    /**
     * Build the base query for contratos
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function buildBaseQuery()
    {
        return Contrato::query()->distinct()->select([
            'contratos.id',
            'contratos.n_expediente',
            'contratos.fecha_inicio',
            'contratos.fecha_fin',
            'contratos.es_computable',
            'contratos.created_at',
            'contratos.updated_at',
            'contratos.empleado_id',
            'contratos.departamento_id',
            'contratos.centro_id',
            'contratos.asignacion_id',
            'contratos.tipo_contrato_id',
            'contratos.empresa_id',
            'contratos.jornada_id'
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
        // Filtros específicos para contratos
        if (isset($filters['n_expediente']) && !empty($filters['n_expediente'])) {
            $query->where('contratos.n_expediente', 'like', '%' . $filters['n_expediente'] . '%');
        }
        
        if (isset($filters['fecha_inicio']) && !empty($filters['fecha_inicio'])) {
            $query->whereDate('contratos.fecha_inicio', '>=', $filters['fecha_inicio']);
        }
        
        if (isset($filters['fecha_fin']) && !empty($filters['fecha_fin'])) {
            $query->whereDate('contratos.fecha_fin', '<=', $filters['fecha_fin']);
        }
        
        if (isset($filters['es_computable']) && $filters['es_computable'] !== '') {
            $query->where('contratos.es_computable', $filters['es_computable']);
        }
        
        if (isset($filters['empleados']) && is_array($filters['empleados']) && count($filters['empleados']) > 0) {
            $empleadoIds = $filters['empleados'];
            $query->whereIn('contratos.empleado_id', $empleadoIds);
        }
        
        if (isset($filters['empresas']) && is_array($filters['empresas']) && count($filters['empresas']) > 0) {
            $empresaIds = $filters['empresas'];
            $query->whereIn('contratos.empresa_id', $empresaIds);
        }
        
        if (isset($filters['centros']) && is_array($filters['centros']) && count($filters['centros']) > 0) {
            $centroIds = $filters['centros'];
            $query->whereIn('contratos.centro_id', $centroIds);
        }
        
        if (isset($filters['departamentos']) && is_array($filters['departamentos']) && count($filters['departamentos']) > 0) {
            $departamentoIds = $filters['departamentos'];
            $query->whereIn('contratos.departamento_id', $departamentoIds);
        }
        
        if (isset($filters['asignaciones']) && is_array($filters['asignaciones']) && count($filters['asignaciones']) > 0) {
            $asignacionIds = $filters['asignaciones'];
            $query->whereIn('contratos.asignacion_id', $asignacionIds);
        }
        
        if (isset($filters['tipos_contrato']) && is_array($filters['tipos_contrato']) && count($filters['tipos_contrato']) > 0) {
            $tipoContratoIds = $filters['tipos_contrato'];
            $query->whereIn('contratos.tipo_contrato_id', $tipoContratoIds);
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
                    'n_expediente' => 'contratos.n_expediente',
                    'fecha_inicio' => 'contratos.fecha_inicio',
                    'fecha_fin' => 'contratos.fecha_fin',
                    'es_computable' => 'contratos.es_computable',
                    'fecha_creacion' => 'contratos.created_at',
                ];
                
                if (isset($columnMap[$column])) {
                    $query->orderBy($columnMap[$column], $direction);
                }
            }
        } else {
            $query->orderBy('contratos.fecha_inicio', 'desc');
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
        if (!isset($columnVisibility['empleado']) || $columnVisibility['empleado']) {
            $relationsToLoad[] = 'empleado.user';
        }
        
        if (!isset($columnVisibility['empresa']) || $columnVisibility['empresa']) {
            $relationsToLoad[] = 'empresa';
        }
        
        if (!isset($columnVisibility['centro']) || $columnVisibility['centro']) {
            $relationsToLoad[] = 'centro';
        }
        
        if (!isset($columnVisibility['departamento']) || $columnVisibility['departamento']) {
            $relationsToLoad[] = 'departamento';
        }
        
        if (!isset($columnVisibility['asignacion']) || $columnVisibility['asignacion']) {
            $relationsToLoad[] = 'asignacion';
        }
        
        if (!isset($columnVisibility['tipoContrato']) || $columnVisibility['tipoContrato']) {
            $relationsToLoad[] = 'tipoContrato';
        }
        
        // Relaciones del empleado para columnas específicas
        if (!isset($columnVisibility['nif']) || $columnVisibility['nif'] || 
            !isset($columnVisibility['mail']) || $columnVisibility['mail'] ||
            !isset($columnVisibility['estadoEmpleado']) || $columnVisibility['estadoEmpleado'] ||
            !isset($columnVisibility['tipoEmpleado']) || $columnVisibility['tipoEmpleado']) {
            $relationsToLoad[] = 'empleado.estadoEmpleado';
            $relationsToLoad[] = 'empleado.tipoEmpleado';
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
        return ContratoResource::class;
    }

    /**
     * Get the model class
     *
     * @return string
     */
    public function getModelClass(): string
    {
        return Contrato::class;
    }

    /**
     * Map visible columns for export
     *
     * @param array $columnVisibility
     * @return array
     */
    public function mapVisibleColumns(array $columnVisibility): array
    {
        // Mapeo basado en las columnas reales de la datatable de contratos
        $columnMapping = [
            'expediente' => ['Número de Expediente'],
            'asignacion' => ['Asignación'],
            'name' => ['Empleado'],
            'tipoContrato' => ['Tipo de Contrato'],
            'fechaInicio' => ['Fecha de Inicio'],
            'fechaFin' => ['Fecha de Fin'],
            'empresa' => ['Empresa'],
            'centro' => ['Centro de trabajo'],
            'departamento' => ['Departamento'],
            'nif' => ['NIF'],
            'mail' => ['Correo electrónico'],
            'estadoEmpleado' => ['Estado del empleado'],
            'tipoEmpleado' => ['Tipo de empleado'],
        ];
        
        $visibleColumns = [];
        foreach ($columnMapping as $columnId => $resourceColumns) {
            $isVisible = !isset($columnVisibility[$columnId]) || $columnVisibility[$columnId] === true;
            if ($isVisible) {
                $visibleColumns = array_merge($visibleColumns, $resourceColumns);
            }
        }
        
        if (empty($visibleColumns)) {
            return ['Número de Expediente', 'Fecha de Inicio'];
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
            'expediente' => 'Nº Expediente',
            'asignacion' => 'Asignación',
            'name' => 'Empleado',
            'tipoContrato' => 'Tipo de contrato',
            'fechaInicio' => 'Fecha de inicio',
            'fechaFin' => 'Fecha de fin',
            'empresa' => 'Empresa',
            'centro' => 'Centro de trabajo',
            'departamento' => 'Departamento',
            'nif' => 'NIF',
            'mail' => 'Correo electrónico',
            'estadoEmpleado' => 'Estado del empleado',
            'tipoEmpleado' => 'Tipo de empleado',
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
            'contratos_n_expediente_index' => 'CREATE INDEX contratos_n_expediente_index ON contratos(n_expediente)',
            'contratos_fecha_inicio_index' => 'CREATE INDEX contratos_fecha_inicio_index ON contratos(fecha_inicio)',
            'contratos_empleado_id_index' => 'CREATE INDEX contratos_empleado_id_index ON contratos(empleado_id)',
            'contratos_empresa_id_index' => 'CREATE INDEX contratos_empresa_id_index ON contratos(empresa_id)',
        ];
    }

    /**
     * Get the export job class
     *
     * @return string
     */
    public function getExportJobClass(): string
    {
        return \App\Jobs\Export\ExportContratosJob::class;
    }
} 
<?php

namespace App\Services\Export;

use App\Models\Empleado;
use App\Http\Resources\Export\EmpleadoResource;
use App\Services\Export\BaseExportService;

/**
 * Service for exporting Empleados data
 */
class EmpleadosExportService extends BaseExportService
{
    /**
     * Build the base query for empleados
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function buildBaseQuery()
    {
        return Empleado::query()->distinct()->select([
            'empleados.id',
            'empleados.nombre',
            'empleados.primer_apellido',
            'empleados.segundo_apellido',
            'empleados.nif',
            'empleados.telefono',
            'empleados.email',
            'empleados.fecha_nacimiento',
            'empleados.created_at',
            'empleados.updated_at',
            'empleados.tipo_documento_id',
            'empleados.estado_id'
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
        // Filtros de empresas
        if (isset($filters['empresas']) && is_array($filters['empresas']) && count($filters['empresas']) > 0) {
            $empresaIds = $filters['empresas'];
            $query->whereHas('empresas', function($q) use ($empresaIds) {
                $q->whereIn('empresas.id', $empresaIds);
            });
        }

        // Filtros de departamentos
        if (isset($filters['departamentos']) && is_array($filters['departamentos']) && count($filters['departamentos']) > 0) {
            $departamentoIds = $filters['departamentos'];
            $query->whereHas('departamentos', function($q) use ($departamentoIds) {
                $q->whereIn('departamentos.id', $departamentoIds);
            });
        }

        // Filtro por NIF
        if (isset($filters['nif']) && !empty($filters['nif'])) {
            $query->where('empleados.nif', 'LIKE', '%' . $filters['nif'] . '%');
        }

        // Filtro por email
        if (isset($filters['email']) && !empty($filters['email'])) {
            $query->where('empleados.email', 'LIKE', '%' . $filters['email'] . '%');
        }

        // Filtro por teléfono
        if (isset($filters['telefono']) && !empty($filters['telefono'])) {
            $query->where('empleados.telefono', 'LIKE', '%' . $filters['telefono'] . '%');
        }

        // Filtro por nombre completo (busca en nombre, primer_apellido y segundo_apellido)
        if (isset($filters['empleado']) && !empty($filters['empleado'])) {
            $searchTerm = $filters['empleado'];
            $query->where(function($q) use ($searchTerm) {
                $q->where('empleados.nombre', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('empleados.primer_apellido', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('empleados.segundo_apellido', 'LIKE', '%' . $searchTerm . '%');
            });
        }

        // Filtro por estado
        if (isset($filters['estado_id']) && !empty($filters['estado_id'])) {
            $query->where('empleados.estado_id', $filters['estado_id']);
        }

        // Filtro por tipo de documento
        if (isset($filters['tipo_documento_id']) && !empty($filters['tipo_documento_id'])) {
            $query->where('empleados.tipo_documento_id', $filters['tipo_documento_id']);
        }

        // Filtro por fecha de nacimiento (rango)
        if (isset($filters['fecha_nacimiento']) && is_array($filters['fecha_nacimiento'])) {
            if (isset($filters['fecha_nacimiento']['from']) && !empty($filters['fecha_nacimiento']['from'])) {
                $query->where('empleados.fecha_nacimiento', '>=', $filters['fecha_nacimiento']['from']);
            }
            if (isset($filters['fecha_nacimiento']['to']) && !empty($filters['fecha_nacimiento']['to'])) {
                $query->where('empleados.fecha_nacimiento', '<=', $filters['fecha_nacimiento']['to']);
            }
        }

        // Filtro por fecha de alta (rango)
        if (isset($filters['created_at']) && is_array($filters['created_at'])) {
            if (isset($filters['created_at']['from']) && !empty($filters['created_at']['from'])) {
                $query->where('empleados.created_at', '>=', $filters['created_at']['from']);
            }
            if (isset($filters['created_at']['to']) && !empty($filters['created_at']['to'])) {
                $query->where('empleados.created_at', '<=', $filters['created_at']['to']);
            }
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

                if ($column === 'empleado') {
                    $query->orderBy('empleados.primer_apellido', $direction)
                          ->orderBy('empleados.segundo_apellido', $direction)
                          ->orderBy('empleados.nombre', $direction);
                } else {
                    $columnMap = [
                        'nif' => 'empleados.nif',
                        'telefono' => 'empleados.telefono',
                        'email' => 'empleados.email',
                        'fecha_nacimiento' => 'empleados.fecha_nacimiento',
                        'fecha_alta' => 'empleados.created_at',
                        'nombre' => 'empleados.nombre',
                        'primer_apellido' => 'empleados.primer_apellido',
                        'segundo_apellido' => 'empleados.segundo_apellido',
                        'estado_id' => 'empleados.estado_id',
                        'tipo_documento_id' => 'empleados.tipo_documento_id',
                    ];
                    
                    if (isset($columnMap[$column])) {
                        $query->orderBy($columnMap[$column], $direction);
                    }
                }
            }
        } else {
            // Ordenamiento por defecto
            $query->orderBy('empleados.primer_apellido', 'asc')
                  ->orderBy('empleados.segundo_apellido', 'asc')
                  ->orderBy('empleados.nombre', 'asc');
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
        
        // Relaciones básicas que siempre se cargan
        $relationsToLoad[] = 'tipoDocumento';
        $relationsToLoad[] = 'estadoEmpleado';
        
        // Relaciones condicionales basadas en columnVisibility
        if (!isset($columnVisibility['empresas']) || $columnVisibility['empresas']) {
            $relationsToLoad[] = 'empresas';
        }
        
        if (!isset($columnVisibility['departamentos']) || $columnVisibility['departamentos']) {
            $relationsToLoad[] = 'departamentos';
        }
        
        if (!isset($columnVisibility['user']) || $columnVisibility['user']) {
            $relationsToLoad[] = 'user';
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
        return EmpleadoResource::class;
    }

    /**
     * Get the model class
     *
     * @return string
     */
    public function getModelClass(): string
    {
        return Empleado::class;
    }

    /**
     * Map visible columns for export
     *
     * @param array $columnVisibility
     * @return array
     */
    public function mapVisibleColumns(array $columnVisibility): array
    {
        // Mapeo basado en las columnas reales de la datatable de empleados
        $columnMapping = [
            'empleado' => ['Nombre', 'Primer Apellido', 'Segundo Apellido'],
            'email' => ['Email'],
            'tipoDocumento' => ['Tipo de documento'],
            'nif' => ['NIF'],
            'caducidad' => ['Caducidad doc.'],
            'estadoEmpleado' => ['Estado del empleado'],
            'niss' => ['NISS'],
            'emailSecundario' => ['Email personal'],
            'telefono' => ['Teléfono'],
            'telefonoPersonal' => ['Tel. personal'],
            'telefonoPersonalFijo' => ['Tel. personal fijo'],
            'extension' => ['Ext. Centrex'],
            'fechaNacimiento' => ['Fecha nacimiento'],
            'contactoEmergencia' => ['Contacto emergencia'],
            'telefonoEmergencia' => ['Tel. emergencia'],
            'user' => ['Usuario asociado'],
            'empresas' => ['Empresas'],
            'departamentos' => ['Departamentos'],
        ];
        
        $visibleColumns = [];
        foreach ($columnMapping as $columnId => $resourceColumns) {
            $isVisible = !isset($columnVisibility[$columnId]) || $columnVisibility[$columnId] === true;
            if ($isVisible) {
                $visibleColumns = array_merge($visibleColumns, $resourceColumns);
            }
        }
        
        if (empty($visibleColumns)) {
            return ['Nombre', 'Primer Apellido', 'Segundo Apellido'];
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
            'empleado' => 'Nombre completo',
            'email' => 'Email corporativo',
            'tipoDocumento' => 'Tipo de documento',
            'nif' => 'Nº de documento',
            'caducidad' => 'Caducidad doc.',
            'estadoEmpleado' => 'Estado del empleado',
            'niss' => 'NISS',
            'emailSecundario' => 'Email personal',
            'telefono' => 'Teléfono',
            'telefonoPersonal' => 'Tel. personal',
            'telefonoPersonalFijo' => 'Tel. personal fijo',
            'extension' => 'Ext. Centrex',
            'fechaNacimiento' => 'Fecha nacimiento',
            'contactoEmergencia' => 'Contacto emergencia',
            'telefonoEmergencia' => 'Tel. emergencia',
            'user' => 'Usuario asociado',
            'empresas' => 'Empresas',
            'departamentos' => 'Departamentos',
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

        // Aplica los mismos filtros que la exportación real
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
            'empleados_nif_index' => 'CREATE INDEX empleados_nif_index ON empleados(nif)',
            'empleados_apellidos_nombre_index' => 'CREATE INDEX empleados_apellidos_nombre_index ON empleados(primer_apellido, segundo_apellido, nombre)',
            'empleados_email_index' => 'CREATE INDEX empleados_email_index ON empleados(email)',
            'empleados_estado_id_index' => 'CREATE INDEX empleados_estado_id_index ON empleados(estado_id)',
        ];
    }

    /**
     * Get the export job class
     *
     * @return string
     */
    public function getExportJobClass(): string
    {
        return \App\Jobs\Export\ExportEmpleadosJob::class;
    }
}

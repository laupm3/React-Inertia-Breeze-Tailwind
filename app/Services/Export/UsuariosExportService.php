<?php

namespace App\Services\Export;

use App\Models\User;
use App\Http\Resources\Export\UsuarioResource;
use App\Services\Export\BaseExportService;

/**
 * Service for exporting Usuarios data
 */
class UsuariosExportService extends BaseExportService
{
    /**
     * Build the base query for usuarios
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function buildBaseQuery()
    {
        return User::query()
            ->with(['roles']) // Cargar roles para la exportación
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.status',
                'users.created_at',
                'users.updated_at',
                'users.deleted_at'
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
        if (empty($filters)) {
            return;
        }

        foreach ($filters as $column => $value) {
            if (empty($value)) continue;

            switch ($column) {
                case 'empleado':
                    $query->where('name', 'like', "%{$value}%");
                    break;
                case 'mail':
                    $query->where('email', 'like', "%{$value}%");
                    break;
                case 'status':
                    $query->where('status', $value);
                    break;
                case 'rol':
                    $query->whereHas('roles', function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%");
                    });
                    break;
                case 'created_at':
                    $query->whereDate('created_at', $value);
                    break;
                case 'delete_at':
                    $query->whereDate('deleted_at', $value);
                    break;
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
        if (empty($sorting)) {
            return;
        }

        foreach ($sorting as $sort) {
            $column = $sort['id'];
            $direction = $sort['desc'] ? 'desc' : 'asc';

            switch ($column) {
                case 'empleado':
                    $query->orderBy('name', $direction);
                    break;
                case 'mail':
                    $query->orderBy('email', $direction);
                    break;
                case 'status':
                    $query->orderBy('status', $direction);
                    break;
                case 'rol':
                    $query->join('role_user', 'users.id', '=', 'role_user.user_id')
                          ->join('roles', 'role_user.role_id', '=', 'roles.id')
                          ->orderBy('roles.name', $direction);
                    break;
                case 'created_at':
                    $query->orderBy('created_at', $direction);
                    break;
                case 'delete_at':
                    $query->orderBy('deleted_at', $direction);
                    break;
            }
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
        
        // Cargar roles siempre
        $relationsToLoad[] = 'roles';
        
        // Cargar empleado si la columna está visible
        if (!isset($columnVisibility['empleado_asociado']) || $columnVisibility['empleado_asociado']) {
            $relationsToLoad[] = 'empleado';
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
        return UsuarioResource::class;
    }

    /**
     * Get the model class
     *
     * @return string
     */
    public function getModelClass(): string
    {
        return User::class;
    }

    /**
     * Map visible columns for export
     *
     * @param array $columnVisibility
     * @return array
     */
    public function mapVisibleColumns(array $columnVisibility): array
    {
        // Mapeo basado en las columnas reales de la datatable de usuarios
        $columnMapping = [
            'empleado' => 'empleado',
            'mail' => 'email',
            'rol' => 'roles',
            'status' => 'status',
            'empleado_asociado' => 'empleado_asociado',
            'created_at' => 'fecha_creacion',
            'delete_at' => 'ultima_actualizacion',
        ];

        // Si el array está vacío o todas las columnas son false, exporta las básicas
        if (empty($columnVisibility) || !in_array(true, array_values($columnVisibility), true)) {
            return ['empleado', 'email', 'roles', 'status'];
        }

        $visibleColumns = [];
        foreach ($columnVisibility as $column => $isVisible) {
            if ($isVisible && isset($columnMapping[$column])) {
                $visibleColumns[] = $columnMapping[$column];
            }
        }

        return $visibleColumns;
    }

    /**
     * Get available columns for export
     *
     * @return array
     */
    public function getAvailableColumns(): array
    {
        return [
            'empleado' => 'Nombre',
            'mail' => 'Correo electrónico',
            'rol' => 'Rol',
            'status' => 'Estado',
            'empleado_asociado' => 'Empleado asociado',
            'created_at' => 'Fecha de alta',
            'delete_at' => 'Fecha de baja',
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
            'users_email_index' => 'CREATE INDEX users_email_index ON users(email)',
            'users_status_index' => 'CREATE INDEX users_status_index ON users(status)',
            'users_created_at_index' => 'CREATE INDEX users_created_at_index ON users(created_at)',
        ];
    }

    /**
     * Get the export job class
     *
     * @return string
     */
    public function getExportJobClass(): string
    {
        return \App\Jobs\Export\ExportUsuariosJob::class;
    }
} 
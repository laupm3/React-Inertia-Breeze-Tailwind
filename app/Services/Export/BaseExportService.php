<?php

namespace App\Services\Export;

use Carbon\Carbon;

/**
 * Base service for export operations
 * 
 * Provides common functionality for all export services including:
 * - Data retrieval with filtering and sorting
 * - Relationship loading
 * - Query optimization
 * - Export statistics
 */
abstract class BaseExportService
{
    /**
     * Devuelve la colección de modelos a exportar, aplicando la jerarquía:
     * 1. Si hay selectedRows → Exporta SOLO esas filas (en el orden recibido)
     * 2. Si NO hay selectedRows → Aplica filtros y ordenamiento
     *
     * El orden de los IDs se respeta tanto en MySQL (FIELD) como en SQLite (ordenando en PHP).
     * Cuando hay filas seleccionadas, también se aplica el ordenamiento de getSortedRowModel.
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

        // 1. Si hay selectedRows → Exportar SOLO esas filas
        if (!empty($selectedRows)) {
            $query->whereIn($this->getIdColumn(), $selectedRows);
            
            // Aplicar ordenamiento incluso cuando hay filas seleccionadas
            if (!empty($sorting)) {
                $this->applySorting($query, $sorting);
            } else {
                // Si no hay ordenamiento específico, respetar el orden de selección
                $connection = $query->getConnection();
                $driver = $connection->getDriverName();
                if (count($selectedRows) > 1 && $driver === 'mysql') {
                    $ids = implode(',', $selectedRows);
                    $query->orderByRaw("FIELD({$this->getIdColumn()}, $ids)");
                }
            }
            
            $results = $query->get();
            
            // Si NO es MySQL y no hay ordenamiento específico, ordenar en PHP
            $connection = $query->getConnection();
            $driver = $connection->getDriverName();
            if ($driver !== 'mysql' && count($selectedRows) > 1 && empty($sorting)) {
                $idPos = array_flip($selectedRows);
                $results = $results->sortBy(function($item) use ($idPos) {
                    return $idPos[$item->id] ?? 999999;
                })->values();
            }
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
     * Devuelve el query base (debe ser implementado por el hijo)
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    abstract protected function buildBaseQuery();

    /**
     * Devuelve el nombre de la columna ID (por defecto 'id')
     *
     * @return string
     */
    public function getIdColumn(): string
    {
        return 'id';
    }

    /**
     * Aplica filtros al query (puede ser sobreescrito por el hijo)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return void
     */
    public function applyFilters($query, array $filters): void {}

    /**
     * Aplica sorting al query (puede ser sobreescrito por el hijo)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $sorting
     * @return void
     */
    public function applySorting($query, array $sorting): void {}

    /**
     * Carga relaciones según la visibilidad de columnas (puede ser sobreescrito por el hijo)
     *
     * @param \Illuminate\Database\Eloquent\Collection $results
     * @param array $columnVisibility
     * @return void
     */
    public function loadRelations($results, array $columnVisibility): void {}

    /**
     * Devuelve el nombre del resource a usar para exportar.
     *
     * @return string
     */
    abstract public function getResourceClass(): string;

    /**
     * Devuelve el modelo base para la exportación.
     *
     * @return string
     */
    abstract public function getModelClass(): string;

    /**
     * Devuelve el nombre del archivo exportado.
     *
     * @return string
     */
    public function getFilename(): string
    {
        $modelName = class_basename($this->getModelClass());
        $datetime = Carbon::now()->timezone(config('app.timezone'))->format('Y-m-d_H-i-s');
        return "export_{$modelName}_{$datetime}.xlsx";
    }

    /**
     * Mapea las columnas del frontend a las columnas del resource para la exportación.
     *
     * @param array $columnVisibility
     * @return array
     */
    abstract public function mapVisibleColumns(array $columnVisibility): array;

    /**
     * Devuelve las columnas disponibles para exportación.
     *
     * @return array
     */
    abstract public function getAvailableColumns(): array;

    /**
     * Devuelve sugerencias de índices para optimizar las consultas.
     *
     * @return array
     */
    public function getSuggestedIndexes(): array
    {
        return [];
    }

    /**
     * Devuelve el nombre de la clase del job de exportación.
     *
     * @return string
     */
    abstract public function getExportJobClass(): string;
}

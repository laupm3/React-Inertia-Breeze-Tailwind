<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for Departamento export operations
 */
class DepartamentoResource extends JsonResource
{
    /**
     * @var array
     */
    protected $visibleColumns;

    /**
     * Constructor
     *
     * @param mixed $resource
     * @param array $visibleColumns
     */
    public function __construct($resource, $visibleColumns = [])
    {
        parent::__construct($resource);
        // Asegura que sea array
        if (!is_array($visibleColumns)) {
            $visibleColumns = [];
        }
        // Limpia cualquier valor vacío o no-string
        $this->visibleColumns = array_values(array_filter($visibleColumns, function($col) {
            return !empty($col) && is_string($col);
        }));
    }

    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        // Definimos todas las columnas posibles basadas en la datatable
        $allColumns = [
            'Nombre' => $this->nombre,
            'Descripción' => $this->descripcion,
            'Manager' => $this->whenLoaded('manager', function() {
                if ($this->manager && $this->manager->user) {
                    return $this->manager->user->name ?? '';
                }
                return '';
            }, ''),
            'Adjunto' => $this->whenLoaded('adjunto', function() {
                if ($this->adjunto && $this->adjunto->user) {
                    return $this->adjunto->user->name ?? '';
                }
                return '';
            }, ''),
            'Departamento Padre' => $this->whenLoaded('parentDepartment', function() {
                return $this->parentDepartment->nombre ?? '';
            }, ''),
            'Departamentos Hijos' => $this->whenLoaded('childDepartments', function() {
                return $this->childDepartments
                    ? $this->childDepartments->pluck('nombre')->implode(';')
                    : '';
            }, ''),
            'Centros' => $this->whenLoaded('centros', function() {
                return $this->centros->pluck('nombre')->implode(', ');
            }, ''),
            'Nº Empleados' => $this->whenLoaded('contratosVigentes', function() {
                return $this->contratosVigentes
                    ? $this->contratosVigentes->pluck('empleado_id')->unique()->count()
                    : 0;
            }, 0)
        ];

        // Si no hay columnas visibles especificadas, devolvemos solo las columnas básicas
        if (empty($this->visibleColumns)) {
            return array_intersect_key($allColumns, array_flip(['Nombre', 'Descripción']));
        }

        // Filtramos solo las columnas que están en la lista de visibles
        $filteredColumns = [];
        foreach ($this->visibleColumns as $columnName) {
            if (isset($allColumns[$columnName])) {
                $filteredColumns[$columnName] = $allColumns[$columnName];
            } else {
                // Si la columna está en visibleColumns pero no en allColumns, la añadimos vacía
                $filteredColumns[$columnName] = '';
            }
        }

        // Devolver siempre todas las columnas visibles, aunque el valor sea vacío
        return $filteredColumns;
    }
} 
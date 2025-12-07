<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for Asignacion export operations
 */
class AsignacionResource extends JsonResource
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
        $this->visibleColumns = $visibleColumns;
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
            'Contratos vinculados' => $this->whenLoaded('contratos', function() {
                return $this->contratos->pluck('n_expediente')->implode(', ');
            }, ''),
            'Empleados' => $this->whenLoaded('contratosVigentes', function() {
                return $this->contratosVigentes->map(function($contratoVigente) {
                    return $contratoVigente->empleado ? $contratoVigente->empleado->user ? $contratoVigente->empleado->user->name : '' : '';
                })->filter()->implode(', ');
            }, ''),
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
            }
        }

        return $filteredColumns;
    }
} 
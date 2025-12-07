<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for Contrato export operations
 */
class ContratoResource extends JsonResource
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
            'Número de Expediente' => $this->n_expediente,
            'Asignación' => $this->whenLoaded('asignacion', function() {
                return $this->asignacion->nombre ?? '';
            }, ''),
            'Empleado' => $this->whenLoaded('empleado', function() {
                if ($this->empleado && $this->empleado->user) {
                    return $this->empleado->user->name ?? '';
                }
                return '';
            }, ''),
            'Tipo de Contrato' => $this->whenLoaded('tipoContrato', function() {
                return $this->tipoContrato->nombre ?? '';
            }, ''),
            'Fecha de Inicio' => $this->fecha_inicio ? $this->fecha_inicio->format('d/m/Y') : '',
            'Fecha de Fin' => $this->fecha_fin ? $this->fecha_fin->format('d/m/Y') : '',
            'Empresa' => $this->whenLoaded('empresa', function() {
                return $this->empresa->nombre ?? '';
            }, ''),
            'Centro de trabajo' => $this->whenLoaded('centro', function() {
                return $this->centro->nombre ?? '';
            }, ''),
            'Departamento' => $this->whenLoaded('departamento', function() {
                return $this->departamento->nombre ?? '';
            }, ''),
            'NIF' => $this->whenLoaded('empleado', function() {
                return $this->empleado->nif ?? '';
            }, ''),
            'Correo electrónico' => $this->whenLoaded('empleado', function() {
                return $this->empleado->email ?? '';
            }, ''),
            'Estado del empleado' => $this->whenLoaded('empleado', function() {
                return $this->empleado->estadoEmpleado->nombre ?? '';
            }, ''),
            'Tipo de empleado' => $this->whenLoaded('empleado', function() {
                return $this->empleado->tipoEmpleado->nombre ?? '';
            }, ''),
        ];

        // Si no hay columnas visibles especificadas, devolvemos solo las columnas básicas
        if (empty($this->visibleColumns)) {
            return array_intersect_key($allColumns, array_flip(['Número de Expediente', 'Fecha de Inicio']));
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
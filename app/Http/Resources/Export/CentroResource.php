<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for Centro export operations
 */
class CentroResource extends JsonResource
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
            'Email' => $this->email,
            'Teléfono' => $this->telefono,
            'Empresa' => $this->whenLoaded('empresa', function() {
                return $this->empresa->nombre ?? '';
            }, ''),
            'Responsable' => $this->whenLoaded('responsable', function() {
                if ($this->responsable && $this->responsable->user) {
                    return $this->responsable->user->name ?? '';
                }
                return '';
            }, ''),
            'Coordinador' => $this->whenLoaded('coordinador', function() {
                if ($this->coordinador && $this->coordinador->user) {
                    return $this->coordinador->user->name ?? '';
                }
                return '';
            }, ''),
            'Estado' => $this->whenLoaded('estado', function() {
                return $this->estado->nombre ?? '';
            }, ''),
            'Dirección' => $this->whenLoaded('direccion', function() {
                if ($this->direccion) {
                    return str_replace([",", "\r", "\n", "\t"], [';', ' ', ' ', ' '], $this->direccion->full_address ?? '');
                }
                return '';
            }, ''),
        ];

        // Si no hay columnas visibles especificadas, devolvemos solo las columnas básicas
        if (empty($this->visibleColumns)) {
            return array_intersect_key($allColumns, array_flip(['Nombre', 'Email']));
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
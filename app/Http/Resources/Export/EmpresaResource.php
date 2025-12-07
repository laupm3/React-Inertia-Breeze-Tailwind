<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for Empresa export operations
 */
class EmpresaResource extends JsonResource
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
            'Siglas' => $this->siglas,
            'CIF' => $this->cif,
            'Dirección fiscal' => $this->whenLoaded('direccion', function () {
                return $this->direccion ? ($this->direccion->full_address ?? '') : '';
            }, ''),
            'Email' => $this->email,
            'Teléfono' => $this->telefono,
            'Representante' => $this->whenLoaded('representante', function() {
                if ($this->representante && $this->representante->user) {
                    return $this->representante->user->name ?? '';
                }
                return '';
            }, ''),
            'Adjunto' => $this->whenLoaded('adjunto', function() {
                if ($this->adjunto && $this->adjunto->user) {
                    return $this->adjunto->user->name ?? '';
                }
                return '';
            }, ''),
            'Centros' => $this->whenLoaded('centros', function() {
                return $this->centros->pluck('nombre')->implode(', ');
            }, ''),
        ];

        // Si no hay columnas visibles especificadas, devolvemos solo las columnas básicas
        if (empty($this->visibleColumns)) {
            return array_intersect_key($allColumns, array_flip(['Nombre', 'CIF']));
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
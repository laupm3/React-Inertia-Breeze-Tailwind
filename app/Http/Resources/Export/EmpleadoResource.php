<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for Empleado export operations
 */
class EmpleadoResource extends JsonResource
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
            'Primer Apellido' => $this->primer_apellido,
            'Segundo Apellido' => $this->segundo_apellido,
            'NIF' => $this->nif,
            'Email' => $this->email,
            'Teléfono' => $this->telefono,
            'Tipo de documento' => $this->whenLoaded('tipoDocumento', function() {
                return $this->tipoDocumento->nombre ?? '';
            }, ''),
            'Estado del empleado' => $this->whenLoaded('estadoEmpleado', function() {
                return $this->estadoEmpleado->nombre ?? '';
            }, ''),
            'Empresas' => $this->whenLoaded('empresas', function() {
                return $this->empresas->pluck('nombre')->implode(', ');
            }, ''),
            'Departamentos' => $this->whenLoaded('departamentos', function() {
                return $this->departamentos->pluck('nombre')->implode(', ');
            }, ''),
            'Caducidad doc.' => $this->caducidad_nif ? $this->caducidad_nif->format('d/m/Y') : '',
            'NISS' => $this->niss,
            'Email personal' => $this->email_secundario,
            'Tel. personal' => $this->telefono_personal_movil,
            'Tel. personal fijo' => $this->telefono_personal_fijo,
            'Ext. Centrex' => $this->extension_centrex,
            'Fecha nacimiento' => $this->fecha_nacimiento ? $this->fecha_nacimiento->format('d/m/Y') : '',
            'Contacto emergencia' => $this->contacto_emergencia,
            'Tel. emergencia' => $this->telefono_emergencia,
            'Usuario asociado' => $this->whenLoaded('user', function() {
                return $this->user ? $this->user->name : 'Sin usuario asociado';
            }, 'Sin usuario asociado'),
        ];

        // Si no hay columnas visibles especificadas, devolvemos solo las columnas básicas
        if (empty($this->visibleColumns)) {
            return array_intersect_key($allColumns, array_flip(['Nombre', 'Primer Apellido', 'Segundo Apellido']));
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

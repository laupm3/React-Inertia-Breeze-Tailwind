<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for Usuario export operations
 */
class UsuarioResource extends JsonResource
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
            'empleado' => $this->name,
            'email' => $this->email,
            'status' => \App\Enums\UserStatus::from((int)$this->status)->label(),
            'roles' => $this->roles ? $this->roles->pluck('name')->join(', ') : 'Sin rol',
            'empleado_asociado' => $this->whenLoaded('empleado', function() {
                if ($this->empleado) {
                    return $this->empleado->nombre . ' ' . $this->empleado->primer_apellido . ' ' . $this->empleado->segundo_apellido;
                }
                return 'Sin empleado asociado';
            }, 'Sin empleado asociado'),
            'fecha_creacion' => $this->created_at ? $this->created_at->format('d/m/Y H:i:s') : null,
            'ultima_actualizacion' => $this->updated_at ? $this->updated_at->format('d/m/Y H:i:s') : null,
        ];

        // Si no hay columnas visibles, devuelve las básicas
        if (empty($this->visibleColumns)) {
            return array_intersect_key($allColumns, array_flip(['empleado', 'email', 'roles', 'status']));
        }

        // Filtra solo las columnas visibles
        $filtered = [];
        foreach ($this->visibleColumns as $col) {
            if (isset($allColumns[$col])) {
                $filtered[$col] = $allColumns[$col];
            }
        }

        return $filtered;
    }
} 
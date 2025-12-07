<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermisoResource extends JsonResource
{
    /**
     * Indicates if the resource's collection keys should not be wrapped.
     */
    public static $wrap = false;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'nombre_oficial' => $this->nombre_oficial,
            'descripcion' => $this->descripcion,
            'descripcion_oficial' => $this->descripcion_oficial,
            'duracion' => $this->duracion,
            'retribuido' => $this->retribuido,
            'categoria' => $this->whenLoaded(
                relationship: 'categoria',
                value: fn() => new PermisoCategoriaResource($this->categoria),
                default: null
            ),
            'yearly_limited' => $this->yearly_limited,
        ];
    }
}

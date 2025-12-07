<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AsignacionResource extends JsonResource
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
            'descripcion' => $this->descripcion,
            'empleados' => $this->whenLoaded(
                'empleados',
                fn() => EmpleadoResource::collection($this->empleados),
                null
            ),
            'contratosVigentes' => $this->whenLoaded(
                'contratosVigentes',
                fn() => ContratoResource::collection($this->contratosVigentes),
                null
            ),
            'contratos' => $this->whenLoaded(
                'contratos',
                fn() => ContratoResource::collection($this->contratos),
                null
            ),
        ];
    }
}

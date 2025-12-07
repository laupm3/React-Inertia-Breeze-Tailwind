<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CentroResource extends JsonResource
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
            'email' => $this->email,
            'telefono' => $this->telefono,
            'responsable' => $this->whenLoaded('responsable', fn() => new EmpleadoResource($this->responsable), null),
            'coordinador' => $this->whenLoaded('coordinador', fn() => new EmpleadoResource($this->coordinador), null),
            'direccion' => $this->whenLoaded('direccion', fn() => new DireccionResource($this->direccion), null),
            'empresa' => $this->whenLoaded('empresa', fn() => new EmpresaResource($this->empresa), null),
            'estado' => $this->whenLoaded('estado', fn() => new EstadoCentroResource($this->estado), null),
            'departamentos' => $this->whenLoaded(
                relationship: 'departamentos',
                value: fn() => DepartamentoResource::collection($this->departamentos),
                default: null
            ),
            'contratos' => $this->whenLoaded(
                relationship: 'contratos',
                value: fn() => ContratoResource::collection($this->contratos),
                default: null
            )
        ];
    }
}

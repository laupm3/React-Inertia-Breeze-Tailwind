<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmpresaResource extends JsonResource
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
            'siglas' => $this->siglas,
            'cif' => $this->cif,
            'email' => $this->email,
            'telefono' => $this->telefono,
            'representante' => $this->whenLoaded('representante', fn() => new EmpleadoResource($this->representante), null),
            'adjunto' => $this->whenLoaded('adjunto', fn() => new EmpleadoResource($this->adjunto), null),
            'direccion' => $this->whenLoaded('direccion', fn() => new DireccionResource($this->direccion), null),
            'centros' => $this->whenLoaded(
                'centros',
                fn() => CentroResource::collection($this->centros),
                null
            ),
        ];
    }
}

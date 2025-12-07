<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnexoResource extends JsonResource
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
            'jornada_id' => $this->jornada_id,
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'is_vigente' => ($this->fecha_inicio <= now() && ($this->fecha_fin >= now() || $this->fecha_fin === null)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'contrato_id' => $this->contrato_id,
            'contrato' => new ContratoResource($this->whenLoaded('contrato')),
            'jornada' => new JornadaResource($this->whenLoaded('jornada')),
        ];
    }
}

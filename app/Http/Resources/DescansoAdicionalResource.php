<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DescansoAdicionalResource extends JsonResource
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
            'descanso_inicio' => $this->descanso_inicio,
            'descanso_fin' => $this->descanso_fin,
            'latitud_inicio' => $this->latitud_inicio,
            'longitud_inicio' => $this->longitud_inicio,
            'latitud_fin' => $this->latitud_fin,
            'longitud_fin' => $this->longitud_fin,
            'ip_address_inicio' => $this->ip_address_inicio,
            'ip_address_fin' => $this->ip_address_fin,
            'user_agent_inicio' => $this->user_agent_inicio,
            'user_agent_fin' => $this->user_agent_fin,
            'horario' => $this->whenLoaded(
                relationship: 'horario',
                value: fn() => new HorarioResource($this->horario),
                default: null
            ),
        ];
    }
}

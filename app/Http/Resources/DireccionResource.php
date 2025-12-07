<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DireccionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_address' => $this->full_address,
            'latitud' => $this->latitud,
            'longitud' => $this->longitud,
            'codigo_postal' => $this->codigo_postal,
            'numero' => $this->numero,
            'piso' => $this->piso,
            'puerta' => $this->puerta,
            'escalera' => $this->escalera,
            'bloque' => $this->bloque,
        ];
    }
}

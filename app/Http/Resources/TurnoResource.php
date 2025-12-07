<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TurnoResource extends JsonResource
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
            'horaInicio' => Carbon::parse($this->hora_inicio)->format('H:i'),
            'horaFin' => Carbon::parse($this->hora_fin)->format('H:i'),
            'descansoInicio' => ($this->descanso_inicio) ? Carbon::parse($this->descanso_inicio)->format('H:i') : null,
            'descansoFin' => ($this->descanso_inicio) ? Carbon::parse($this->descanso_fin)->format('H:i') : null,
            'color' => $this->color,
            'centro' => $this->whenLoaded(
                'centro',
                fn() => new CentroResource($this->centro),
                null
            )
        ];
    }
}

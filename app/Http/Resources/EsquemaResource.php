<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EsquemaResource extends JsonResource
{
    /**
     * Indicates if the resource's collection keys should not be wrapped.
     */
    public static $wrap = false;

    /**
     * Weekdays names, format ISO 8601 (Monday = 0, Sunday = 6)
     */
    const WEEKDAYS = [
        0 => 'Lunes',
        1 => 'Martes',
        2 => 'Miércoles',
        3 => 'Jueves',
        4 => 'Viernes',
        5 => 'Sábado',
        6 => 'Domingo'
    ];

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
            'turno_id' => $this->turno_id,
            'modalidad_id' => $this->modalidad_id,
            'weekday_number' => (int) $this->weekday_number,
            'weekday_name' => self::WEEKDAYS[(int) $this->weekday_number],
            'turno'  => $this->whenLoaded(
                'turno',
                fn() => new TurnoResource($this->turno),
                null
            ),
            'centro' => $this->whenLoaded('turno', function () {
                // Check if user relationship is loaded in turno
                if (!$this->turno->relationLoaded('centro')) {
                    return null;
                }

                return new CentroResource($this->turno->centro);
            }, null),
            'modalidad' => $this->whenLoaded(
                'modalidad',
                fn() => new ModalidadResource($this->modalidad),
                null
            ),
        ];
    }
}

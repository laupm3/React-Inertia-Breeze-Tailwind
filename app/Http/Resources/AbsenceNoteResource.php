<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsenceNoteResource extends JsonResource
{
    public static $wrap = false;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'reason' => $this->reason,
            'created_at' => $this->created_at,

            // Estructura de empleado simplificada. Solo devolvemos lo que la UI necesita.
            'empleado' => $this->when(
                $this->relationLoaded('horario') && $this->horario?->contrato?->empleado,
                function () {
                    $empleado = $this->horario->contrato->empleado;
                    return [
                        'id' => $empleado->id,
                        'full_name' => $empleado->fullName,
                        'profile_photo_url' => $empleado->user?->profile_photo_url,
                    ];
                }
            ),

            'files' => $this->whenLoaded('files', fn() => FileResource::collection($this->files)),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AprobacionSolicitudPermisoResource extends JsonResource
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
            'tipo_aprobacion' => $this->tipo_aprobacion,
            'aprobado' => $this->aprobado,
            'observacion' => $this->observacion,
            'is_automatic' => $this->is_automatic,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'solicitudPermiso' => $this->whenLoaded(
                relationship: 'solicitudPermiso',
                value: fn() => new SolicitudPermisoResource($this->solicitudPermiso),
                default: null
            ),
            'approvedBy' => $this->whenLoaded(
                relationship: 'approvedBy',
                value: fn() => new UserResource($this->approvedBy),
                default: null
            ),
        ];
    }
}

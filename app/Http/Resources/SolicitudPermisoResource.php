<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\FolderResource;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudPermisoResource extends JsonResource
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
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'motivo' => $this->motivo,
            'seen_at' => $this->seen_at,
            'recuperable' => $this->recuperable,
            'is_automatic' => $this->is_automatic,
            'is_cancelled' => $this->is_cancelled,
            'empleado' => $this->whenLoaded(
                relationship: 'empleado',
                value: fn() => new EmpleadoResource($this->empleado),
                default: null
            ),
            'permiso' => $this->whenLoaded(
                relationship: 'permiso',
                value: fn() => new PermisoResource($this->permiso),
                default: null
            ),
            'estado' => $this->whenLoaded(
                relationship: 'estado',
                value: fn() => new EstadoPermisoResource($this->estado),
                default: null
            ),
            'aprobaciones' => $this->whenLoaded(
                relationship: 'aprobaciones',
                value: fn() => AprobacionSolicitudPermisoResource::collection($this->aprobaciones),
                default: null
            ),
            'files' => $this->whenLoaded(
                relationship: 'files',
                value: fn() => FolderResource::collection($this->files),
                default: null
            ),
            'files_count' => $this->when(
                condition: $this->whenCounted('files'),
                value: $this->files_count,
                default: null
            ),
        ];
    }
}

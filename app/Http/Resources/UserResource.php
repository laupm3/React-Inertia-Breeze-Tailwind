<?php

namespace App\Http\Resources;

use App\Enums\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'profile_photo_url' => $this->profile_photo_url,
            'profile_photo_path' => $this->profile_photo_path,
            'status' => [
                'id' => $this->status->value,
                'name' => $this->status->name,
                'label' => $this->status->label(),
            ],
            'empleado' => $this->whenLoaded(
                'empleado',
                fn() => new EmpleadoResource($this->empleado),
                null
            ),
            'role' => $this->whenLoaded(
                'roles',
                fn() => $this->roles->isNotEmpty() ? new RoleResource($this->roles->first()) : null
            ),
            'departamentos' => $this->whenLoaded('empleado', function () {
                if (!$this->empleado?->relationLoaded('contratos')) {
                    return null;
                }
                return DepartamentoResource::collection($this->empleado->contratos->pluck('departamento')->filter()->unique('id'));
            }, null),
            'centros' => $this->whenLoaded('empleado', function () {
                if (!$this->empleado?->relationLoaded('contratos')) {
                    return null;
                }
                return CentroResource::collection($this->empleado->contratos->pluck('centro')->filter()->unique('id'));
            }, null),
            'asignaciones' => $this->whenLoaded('empleado', function () {
                if (!$this->empleado?->relationLoaded('asignaciones')) {
                    return null;
                }
                return AsignacionResource::collection($this->empleado->asignaciones);
            }, null),
            'contratos' => $this->whenLoaded('empleado', function () {
                if (!$this->empleado?->relationLoaded('contratos')) {
                    return null;
                }
                return ContratoResource::collection($this->empleado->contratos);
            }, null),
            'membership' => $this->whenLoaded(
                'membership',
                fn() => new MembershipResource($this->membership),
                null
            )
        ];
    }
}

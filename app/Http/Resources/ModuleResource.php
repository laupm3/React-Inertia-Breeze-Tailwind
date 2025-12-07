<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModuleResource extends JsonResource
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
            'description' => $this->description,
            'permissions' => $this->whenLoaded(
                'permissions',
                fn() => PermissionResource::collection($this->permissions),
                null
            ),
            'permissions_count' => $this->when(
                $this->relationLoaded('permissions'),
                $this->permissions_count,
                null
            ),
            'roles' => $this->whenLoaded(
                'roles',
                fn() => RoleResource::collection($this->roles),
                null
            ),
        ];
    }
}

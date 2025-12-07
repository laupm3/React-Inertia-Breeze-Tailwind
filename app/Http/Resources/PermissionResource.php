<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'title' => $this->title,
            'roles' => $this->whenLoaded(
                'roles',
                fn() => RoleResource::collection($this->roles),
                null
            ),
            'users' => $this->whenLoaded(
                'users',
                fn() => UserResource::collection($this->users),
                null
            ),
            'module' => $this->whenLoaded(
                'module',
                fn() => new ModuleResource($this->module),
                null
            ),
        ];
    }
}

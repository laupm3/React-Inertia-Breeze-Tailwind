<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
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
            'users' => $this->whenLoaded(
                'users',
                fn() => UserResource::collection($this->users),
                null
            ),
            'permissions' => $this->whenLoaded(
                'permissions',
                fn() => PermissionResource::collection($this->permissions),
                null
            ),
            'users_count' => $this->when(
                $this->relationLoaded('users'),
                $this->users_count,
                null
            ),
            'permissions_count' => $this->when(
                $this->relationLoaded('permissions'),
                $this->permissions_count,
                null
            ),
            'modules' => $this->whenLoaded('permissions', function () {
                // Check if module relationship is loaded in permissions
                if (!$this->permissions->first()?->relationLoaded('module')) {
                    return null;
                }

                return $this->permissions
                    ->pluck('module')
                    ->unique('id')
                    ->filter()
                    ->each(
                        function ($module) {
                            /**
                             * @var \App\Models\Module $module
                             */
                            $module->setRelation(
                                'permissions',
                                $this->permissions->where('module_id', $module->id)
                            );
                            $module->permissions->each(
                                fn($permission) => $permission->unsetRelation('module')
                            );
                        }
                    )
                    ->pipe(function ($modules) {
                        return ModuleResource::collection($modules);
                    });
            }, null),
        ];
    }
}

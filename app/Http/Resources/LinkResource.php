<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LinkResource extends JsonResource
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
            'route_name' => $this->route_name,
            'icon' => $this->icon,
            'weight' => $this->weight,
            'is_recent' => $this->is_recent,
            'is_important' => $this->is_important,
            'requires_employee' => $this->requires_employee,
            'parent_id' => $this->parent_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'children' => $this->whenLoaded(
                relationship: 'children',
                value: fn() => LinkResource::collection($this->children),
                default: null
            ),
            'parent' => $this->whenLoaded(
                relationship: 'parent',
                value: fn() => new LinkResource($this->parent),
                default: null
            ),
            'permission' => $this->whenLoaded(
                relationship: 'permission',
                value: fn() => new PermissionResource($this->permission),
                default: null
            ),
        ];
    }
}

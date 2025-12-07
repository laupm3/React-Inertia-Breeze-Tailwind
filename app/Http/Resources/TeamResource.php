<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
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
            'icon' => $this->icon,
            'bg_color' => $this->bg_color,
            'icon_color' => $this->icon_color,
            'personal_team' => $this->personal_team,
            'owner' => $this->whenLoaded(
                relationship: 'owner',
                value: fn() => new UserResource($this->owner),
                default: null
            ),
            'users' => $this->whenLoaded(
                relationship: 'users',
                value: fn() => UserResource::collection($this->users),
                default: null
            ),
            'teamInvitations' => $this->whenLoaded(
                relationship: 'teamInvitations',
                value: fn() => InvitationResource::collection($this->teamInvitations),
                default: null
            )
        ];
    }
}

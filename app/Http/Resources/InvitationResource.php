<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvitationResource extends JsonResource
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
            'email' => $this->email,
            'team_id' => $this->team_id,
            'role' => $this->role,
            'team' => $this->whenLoaded(
                relationship: 'team',
                value: fn() => new TeamResource($this->team),
                default: null
            ),
            'user' => $this->whenLoaded(
                relationship: 'user',
                value: fn() => new UserResource($this->user),
                default: null
            ),
        ];
    }
}

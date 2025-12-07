<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class PublicUserResource extends JsonResource
{
    /**
     * Transforma el recurso en un array.
     *
     * Define una vista "pública" y segura del modelo User.
     * Solo expone los datos mínimos necesarios para identificar a un usuario
     * sin revelar información sensible como email, estado, roles, etc.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'profile_photo_url' => $this->profile_photo_url,
        ];
    }
}

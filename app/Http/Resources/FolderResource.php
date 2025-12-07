<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FolderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'hash' => $this->hash,
            'name' => $this->name,
            'extension' => $this->extension,
            'size' => $this->size,
            'description' => $this->description,
            'is_erasable' => $this->is_erasable,
            'is_visible' => $this->is_visible,
            'is_sharable' => $this->is_sharable,
            'user_id' => $this->user_id,
            'created_by' => $this->created_by,
            'user' => $this->whenLoaded(
                relationship: 'user',
                value: fn() => new UserResource($this->user),
                default: null
            ),
            'createdBy' => $this->whenLoaded(
                relationship: 'createdBy',
                value: fn() => new UserResource($this->createdBy),
                default: null
            ),
            'nivelAcceso' => $this->whenLoaded(
                relationship: 'nivelAcceso',
                value: fn() => new NivelAccesoResource($this->nivelAcceso),
                default: null
            ),
            'nivelSeguridad' => $this->whenLoaded(
                relationship: 'nivelSeguridad',
                value: fn() => new NivelSeguridadResource($this->nivelSeguridad),
                default: null
            ),
            'tipoFichero' => $this->tipo_fichero_id === 1 ? 'CARPETA' : 'FICHERO',
            'children' => $this->whenLoaded(
                relationship: 'children',
                value: fn() => FolderResource::collection($this->children),
                default: null
            ),
            'parent' => $this->whenLoaded(
                relationship: 'parent',
                value: fn() => new FolderResource($this->parent),
                default: null
            ),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class FileResource extends JsonResource
{

    /**
     * The "data" wrapper that should be applied.
     *
     * @var string|null
     */
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        //return parent::toArray($request);
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'created_by' => $this->createdBy->name, // Assuming the User model has a 'name' attribute
            'nivel_acceso_id' => $this->nivel_acceso_id,
            'tipo_fichero_id' => $this->tipo_fichero_id,
            'nivel_seguridad_id' => $this->nivel_seguridad_id,
            'parent_id' => $this->parent_id,
            'extension_id' => $this->extension_id,
            'hash' => $this->hash,
            'nombre' => $this->nombre,
            'path' => $this->path,
            'size' => $this->size,
            'qty_ficheros' => $this->qty_ficheros,
            'is_erasable' => $this->is_erasable,
            'is_visible' => $this->is_visible,
            'is_sharable' => $this->is_sharable,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            /* 'download_url' => URL::temporarySignedRoute('admin.files.download', now()
            ->addMinutes(1), ['hash' => $this->hash]), */
        ];
    }
}

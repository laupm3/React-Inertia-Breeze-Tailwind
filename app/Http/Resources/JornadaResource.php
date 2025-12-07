<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JornadaResource extends JsonResource
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
            'esquema' => $this->whenLoaded(
                'esquema',
                fn() => EsquemaResource::collection($this->esquema->sortBy('weekday_number')->keyBy('weekday_number')),
                null
            ),
            'centros' => $this->whenLoaded(
                relationship: 'esquema',
                default: null,
                value: function () {
                    return $this->esquema
                        ->pluck('turno')
                        ->pluck('centro')
                        ->unique('id')
                        ->filter()
                        ->pipe(function ($centros) {
                            return CentroResource::collection($centros);
                        });
                }
            ),
            'empresas' => $this->whenLoaded(
                relationship: 'esquema',
                default: null,
                value: function () {
                    return $this->esquema
                        ->pluck('turno')
                        ->pluck('centro')
                        ->pluck('empresa')
                        ->unique('id')
                        ->filter()
                        ->pipe(function ($empresas) {
                            return EmpresaResource::collection($empresas);
                        });
                }
            ),
            'modalidades' => $this->whenLoaded(
                relationship: 'esquema',
                default: null,
                value: function () {
                    return $this->esquema
                        ->pluck('modalidad')
                        ->unique('id')
                        ->filter()
                        ->pipe(function ($modalidades) {
                            return ModalidadResource::collection($modalidades);
                        });
                }
            ),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartamentoResource extends JsonResource
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
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'manager' => $this->whenLoaded('manager', fn() => new EmpleadoResource($this->manager), null),
            'adjunto' => $this->whenLoaded('adjunto', fn() => new EmpleadoResource($this->adjunto), null),
            'direccion' => $this->whenLoaded('direccion', fn() => new DireccionResource($this->direccion), null),
            'contratos' => $this->whenLoaded(
                'contratos',
                fn() => ContratoResource::collection($this->contratos),
                null
            ),
            'contratosVigentes' => $this->whenLoaded(
                relationship: 'contratosVigentes',
                value: fn() => ContratoResource::collection($this->contratosVigentes),
                default: null
            ),
            'centros' => $this->whenLoaded(
                relationship: 'centros',
                value: fn() => CentroResource::collection($this->centros),
                default: null
            ),
            'parentDepartment' => $this->whenLoaded(
                relationship: 'parentDepartment',
                value: fn() => new DepartamentoResource($this->parentDepartment),
                default: null
            ),
            'childDepartments' => $this->whenLoaded(
                relationship: 'childDepartments',
                value: fn() => DepartamentoResource::collection($this->childDepartments),
                default: null
            ),
        ];
    }
}

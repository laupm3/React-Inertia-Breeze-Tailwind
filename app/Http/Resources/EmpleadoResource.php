<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmpleadoResource extends JsonResource
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
            'primerApellido' => $this->primer_apellido,
            'segundoApellido' => $this->segundo_apellido == null ? '' : $this->segundo_apellido,
            'nombreCompleto' => trim("$this->nombre $this->primer_apellido $this->segundo_apellido"),
            'nif' => $this->nif,
            'caducidadNif' => $this->caducidad_nif,
            'email' => $this->email,
            'emailSecundario' => $this->email_secundario,
            'telefono' => $this->telefono,
            'telefono_personal_movil' => $this->telefono_personal_movil,
            'telefono_personal_fijo' => $this->telefono_personal_fijo,
            'extension_centrex' => $this->extension_centrex,
            'fechaNacimiento' => $this->fecha_nacimiento,
            'niss' => $this->niss,
            'contactoEmergencia' => $this->contacto_emergencia,
            'telefonoEmergencia' => $this->telefono_emergencia,
            'user' => $this->whenLoaded(
                relationship: 'user',
                value: fn() => new UserResource($this->user),
                default: null
            ),
            'estadoEmpleado' => $this->whenLoaded(
                'estadoEmpleado',
                fn() => new EstadoEmpleadoResource($this->estadoEmpleado),
                null
            ),
            'tipoDocumento' => $this->whenLoaded(
                'tipoDocumento',
                fn() => new TipoDocumentoResource($this->tipoDocumento),
                null
            ),
            'tipoEmpleado' => $this->whenLoaded(
                'tipoEmpleado',
                fn() => new TipoEmpleadoResource($this->tipoEmpleado),
                null
            ),
            'empresas' => $this->whenLoaded(
                'empresas',
                fn() => EmpresaResource::collection($this->empresas),
                null
            ),
            'departamentos' => $this->whenLoaded('contratos', function () {
                // Check if departamento relationship is loaded in contratos
                if (!$this->contratos->first()?->relationLoaded('departamento')) {
                    return null;
                }

                return $this->contratos
                    ->pluck('departamento')
                    ->unique('id')
                    ->filter()
                    ->pipe(function ($departamentos) {
                        return DepartamentoResource::collection($departamentos);
                    });
            }, null) ?? $this->whenLoaded(
                'departamentos',
                fn() => DepartamentoResource::collection($this->departamentos),
                null
            ),
            'contratos' => $this->whenLoaded(
                'contratos',
                fn() => ContratoResource::collection($this->contratos),
                null
            ),
            'centros' => $this->whenLoaded('contratos', function () {
                // Check if centro relationship is loaded in contratos
                if (!$this->contratos->first()?->relationLoaded('centro')) {
                    return null;
                }

                return $this->contratos
                    ->pluck('centro')
                    ->unique('id')
                    ->filter()
                    ->pipe(function ($centros) {
                        return CentroResource::collection($centros);
                    });
            }, null),
            'asignaciones' => $this->whenLoaded(
                'asignaciones',
                fn() => AsignacionResource::collection($this->asignaciones),
                null
            ),
            'direccion' => $this->whenLoaded(
                'direccion',
                fn() => new DireccionResource($this->direccion),
                null
            ),
            'genero' => $this->whenLoaded(
                'genero',
                fn() => new GeneroEmpleadoResource($this->genero),
                null
            ),
            'observacionesSalud' => $this->when(
                $request->user() && $request->user()->hasRole(['Administrator', 'Super Admin']),
                $this->observaciones_salud
            ),
        ];
    }
}

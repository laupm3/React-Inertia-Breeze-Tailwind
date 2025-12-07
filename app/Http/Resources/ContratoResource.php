<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContratoResource extends JsonResource
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
            'fechaInicio' => $this->fecha_inicio,
            'fechaFin' => $this->fecha_fin,
            'n_expediente' => $this->n_expediente,
            'is_vigente' => ($this->fecha_inicio <= now() && ($this->fecha_fin >= now() || $this->fecha_fin === null)),
            'es_computable' => (bool) $this->es_computable,
            'user' => $this->whenLoaded('empleado', function () {
                // Check if user relationship is loaded in empleado
                if (!$this->empleado->relationLoaded('user')) {
                    return null;
                }

                return new UserResource($this->empleado->user);
            }, null),
            'empleado' => $this->whenLoaded(
                'empleado',
                fn() => new EmpleadoResource($this->empleado),
                null
            ),
            'estadoEmpleado' => $this->whenLoaded('empleado', function () {
                // Check if estadoEmpleado relationship is loaded in empleado
                if (!$this->empleado->relationLoaded('estadoEmpleado')) {
                    return null;
                }

                return new EstadoEmpleadoResource($this->empleado->estadoEmpleado);
            }, null),
            'tipoEmpleado' => $this->whenLoaded('empleado', function () {
                // Check if tipoEmpleado relationship is loaded in empleado
                if (!$this->empleado->relationLoaded('tipoEmpleado')) {
                    return null;
                }

                return new TipoEmpleadoResource($this->empleado->tipoEmpleado);
            }, null),
            'tipoDocumento' => $this->whenLoaded('empleado', function () {
                // Check if tipoDocumento relationship is loaded in empleado
                if (!$this->empleado->relationLoaded('tipoDocumento')) {
                    return null;
                }

                return new TipoDocumentoResource($this->empleado->tipoDocumento);
            }, null),
            'empresa' => $this->whenLoaded(
                'empresa',
                fn() => new EmpresaResource($this->empresa),
                null
            ),
            'departamento' => $this->whenLoaded(
                'departamento',
                fn() => new DepartamentoResource($this->departamento),
                null
            ),
            'centro' => $this->whenLoaded(
                'centro',
                fn() => new CentroResource($this->centro),
                null
            ),
            'asignacion' => $this->whenLoaded(
                'asignacion',
                fn() => new AsignacionResource($this->asignacion),
                null
            ),
            'jornada' => $this->whenLoaded(
                'jornada',
                fn() => new JornadaResource($this->jornada),
                null
            ),
            'tipoContrato' => $this->whenLoaded(
                'tipoContrato',
                fn() => new TipoContratoResource($this->tipoContrato),
                null
            ),
            'anexos' => $this->whenLoaded(
                'anexos',
                fn() => AnexoResource::collection($this->anexos),
                null
            ),
            'anexos_count' => $this->when(
                $this->whenCounted('anexos'),
                $this->anexos_count,
                null
            ),
        ];
    }
}

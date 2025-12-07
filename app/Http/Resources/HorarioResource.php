<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\Fichaje\EstadisticaService;
use App\Models\Horario;

class HorarioResource extends JsonResource
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
            // Son los valores propios del horario
            'id' => $this->id,
            'horario_inicio' => $this->horario_inicio,
            'horario_fin' => $this->horario_fin,
            'descanso_inicio' => $this->descanso_inicio,
            'descanso_fin' => $this->descanso_fin,
            'hora_inicio' => Carbon::parse($this->horario_inicio)->format('H:i'),
            'hora_fin' => Carbon::parse($this->horario_fin)->format('H:i'),
            'weekday_number' => Carbon::parse($this->horario_inicio)->isoWeekday(),
            'fecha_inicio' => ($this->horario_inicio) ? Carbon::parse($this->horario_inicio)->format('Y-m-d') : null,
            'fecha_fin' => ($this->horario_fin) ? Carbon::parse($this->horario_fin)->format('Y-m-d') : null,

            // Helpers para las horas de inicio y de fin
            'horarioInicio' => Carbon::parse($this->horario_inicio)->format('H:i'),
            'horarioFin' => Carbon::parse($this->horario_fin)->format('H:i'),
            'fichajeEntrada' => ($this->fichaje_entrada) ? Carbon::parse($this->fichaje_entrada)->format('H:i') : null,
            'fichajeSalida' => ($this->fichaje_salida) ? Carbon::parse($this->fichaje_salida)->format('H:i') : null,
            'descansoInicio' => ($this->descanso_inicio) ? Carbon::parse($this->descanso_inicio)->format('H:i') : null,
            'descansoFin' => ($this->descanso_fin) ? Carbon::parse($this->descanso_fin)->format('H:i') : null,

            // Son los valores propios del fichaje

            'fichaje_entrada' => $this->fichaje_entrada,
            'fichaje_salida' => $this->fichaje_salida,

            'latitud_entrada' => $this->latitud_entrada,
            'longitud_entrada' => $this->longitud_entrada,
            'latitud_salida' => $this->latitud_salida,
            'longitud_salida' => $this->longitud_salida,

            'user_agent_entrada' => $this->user_agent_entrada,
            'user_agent_salida' => $this->user_agent_salida,

            'ip_address_entrada' => $this->ip_address_entrada,
            'ip_address_salida' => $this->ip_address_salida,

            'observaciones' => $this->observaciones,

            // Las relaciones que contiene el horario
            'contrato' => $this->whenLoaded(
                'contrato',
                fn() => new ContratoResource($this->contrato),
                null
            ) ?? $this->whenLoaded(
                relationship: 'anexo',
                value: function () {
                    // Check if contrato relationship is loaded in anexo
                    if (!$this->anexo->relationLoaded('contrato')) {
                        return null;
                    }

                    return new ContratoResource($this->anexo->contrato);
                },
                default: null
            ),
            'empleado' => $this->whenLoaded(
                relationship: 'contrato',
                value: function () {
                    // Check if empleado relationship is loaded in contrato
                    if (!$this->contrato->relationLoaded('empleado')) {
                        return null;
                    }

                    return new EmpleadoResource($this->contrato->empleado);
                },
                default: null
            ) ?? $this->whenLoaded(
                relationship: 'anexo',
                value: function () {
                    // Check if contrato relationship is loaded in anexo
                    if (!$this->anexo->relationLoaded('contrato')) {
                        return null;
                    }

                    return new EmpleadoResource($this->anexo->contrato->empleado);
                },
                default: null
            ),
            'anexo' => $this->whenLoaded(
                relationship: 'anexo',
                value: fn() => new AnexoResource($this->anexo),
                default: null
            ),
            'estadoHorario' => $this->whenLoaded(
                relationship: 'estadoHorario',
                value: fn() => new EstadoHorarioResource($this->estadoHorario),
                default: null
            ),
            'modalidad' => $this->whenLoaded(
                relationship: 'modalidad',
                value: fn() => new ModalidadResource($this->modalidad),
                default: null
            ),
            'turno' => $this->whenLoaded(
                relationship: 'turno',
                value: fn() => new TurnoResource($this->turno),
                default: null
            ),
            'centro' => $this->whenLoaded(
                relationship: 'turno',
                value: function () {
                    // Check if user relationship is loaded in turno
                    if (!$this->turno->relationLoaded('centro')) {
                        return null;
                    }

                    return new CentroResource($this->turno->centro);
                },
                default: null
            ),
            // Los descansos adicionales son una relación de 1 a muchos
            'descansosAdicionales' => $this->whenLoaded(
                relationship: 'descansosAdicionales',
                value: fn() => DescansoAdicionalResource::collection($this->descansosAdicionales),
                default: null
            ),
        ];
    }

    /**
     * Devuelve un array con los datos de un fichaje
     * @param \App\Models\Horario $horario
     * @return array
     */
    public static function fichaje(Horario $horario): array
    {
        return [
            'horario_id' => $horario->id,
            'hora_entrada' => Carbon::parse($horario->horario_inicio)->format('H:i'),
            'hora_salida' => Carbon::parse($horario->horario_fin)->format('H:i'),
            'fecha_inicio' => Carbon::parse($horario->horario_inicio)->format('Y-m-d'),
            'fecha_fin' => Carbon::parse($horario->horario_fin)->format('Y-m-d'),
            'descanso_inicio' => ($horario->descanso_inicio) ? Carbon::parse($horario->descanso_inicio)->format('H:i') : null,
            'descanso_fin' => ($horario->descanso_inicio) ? Carbon::parse($horario->descanso_fin)->format('H:i') : null,
            'estado_fichaje' => $horario->estado_fichaje ?? 'pendiente',
            'tiempo_total' => app(EstadisticaService::class)->calcularTiempoTotal($horario),
            'tiempo_restante' => app(EstadisticaService::class)->calcularTiempoRestante($horario),
            'asignacion' => $horario->contrato?->asignacion?->nombre,
            'centro' => $horario->turno?->centro?->nombre,
            'empresa' => $horario->contrato?->empresa?->nombre
        ];
    }
}

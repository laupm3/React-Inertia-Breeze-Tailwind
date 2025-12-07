<?php

namespace App\Services\Fichaje;

use App\Models\Horario;
use Illuminate\Support\Carbon;
use App\Events\Fichaje\FichajeIniciar;
use App\Events\Fichaje\FichajeFinalizar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Jobs\TransicionAutomaticaHorario;

class FichajeService
{
    public function __construct(
        private ValidacionService $validacionService,
        private DescansoService $descansoService
    ) {}

    /**
     * Ejecuta una acción de fichaje
     */
    public function ejecutarAccion(string $accion, int $horarioId, ?array $coordenadas): array
    {
        // Obtener el horario y el contrato asociado asociado al horario
        $horario = Horario::with(['contrato.empleado'])->findOrFail($horarioId);

        // Interpretar fechas en zona horaria de Madrid
        $horaInicio = Carbon::createFromFormat('Y-m-d H:i:s', $horario->horario_inicio, 'Europe/Madrid');
        $horaFin = Carbon::createFromFormat('Y-m-d H:i:s', $horario->horario_fin, 'Europe/Madrid');

        // Calcular rangos permitidos
        $now = now()->setTimezone('Europe/Madrid');
        $inicioPermitido = $horaInicio->copy()->subMinutes(30);
        $finPermitido = $horaFin->copy()->addMinutes(30);

        Log::info('Validando horario para fichaje', [
            'horario_id' => $horarioId,
            'hora_actual' => $now->format('Y-m-d H:i:s'),
            'hora_inicio' => $horaInicio->format('Y-m-d H:i:s'),
            'hora_fin' => $horaFin->format('Y-m-d H:i:s'),
            'inicio_permitido' => $inicioPermitido->format('Y-m-d H:i:s'),
            'fin_permitido' => $finPermitido->format('Y-m-d H:i:s'),
            'accion' => $accion
        ]);

        // Validaciones de horario
        if ($now->lt($inicioPermitido)) {
            Log::warning('Fichaje demasiado temprano', [
                'diferencia_minutos' => $now->diffInMinutes($inicioPermitido)
            ]);
            throw new \Exception('demasiado pronto', 422);
        }

        if ($now->gt($finPermitido)) {
            Log::warning('Fichaje demasiado tarde', [
                'diferencia_minutos' => $now->diffInMinutes($finPermitido)
            ]);
            throw new \Exception('demasiado tarde', 422);
        }

        return match($accion) {
            'iniciar' => $this->iniciar($horario, $coordenadas),
            'finalizar' => $this->finalizar($horario, $coordenadas),
            'descanso_obligatorio' => $this->iniciarDescansoObligatorio($horario),
            'descanso_adicional' => $this->iniciarDescansoAdicional($horario),
            'reanudar' => $this->reanudarDescanso($horario),
            default => throw new \Exception('Acción no válida')
        };
    }

    /**
     * Inicia el fichaje del horario
     */
    public function iniciar(Horario $horario, array $coordenadas): array
    {
        if ($horario->estado_fichaje !== 'sin_iniciar') {
            throw new \Exception('El fichaje ya ha sido iniciado', '422.1');
        }

        DB::transaction(function () use ($horario, $coordenadas) {
            $horario->fichaje_entrada = now()->setTimezone('Europe/Madrid');
            $horario->latitud_entrada = $coordenadas['latitud'];
            $horario->longitud_entrada = $coordenadas['longitud'];
            $horario->ip_address_entrada = request()->ip();
            $horario->user_agent_entrada = request()->userAgent();
            $horario->estado_fichaje = 'en_curso';
            $horario->save();

            // Buscar y programar transición al siguiente horario si existe
            if ($siguienteHorario = $this->buscarSiguienteHorario($horario)) {
                $horaTransicion = Carbon::createFromFormat('Y-m-d H:i:s', $horario->horario_fin, 'Europe/Madrid');
                TransicionAutomaticaHorario::dispatch($horario, $siguienteHorario)
                    ->delay($horaTransicion);
            }

            event(new FichajeIniciar($horario, $coordenadas));
        });

        return ['horario' => $horario->fresh()];
    }

    /**
     * Finaliza el fichaje del horario
     */
    public function finalizar(Horario $horario, array $coordenadas): array
    {
        if (!in_array($horario->estado_fichaje, ['en_curso', 'en_pausa'])) {
            throw new \Exception('No se puede finalizar el fichaje en su estado actual', '422.2');
        }

        DB::transaction(function () use ($horario, $coordenadas) {
            // Si hay un descanso activo, finalizarlo
            if ($horario->estado_fichaje === 'en_pausa') {
                $this->reanudarDescanso($horario);
            }

            $horario->fichaje_salida = now()->setTimezone('Europe/Madrid');
            $horario->latitud_salida = $coordenadas['latitud'];
            $horario->longitud_salida = $coordenadas['longitud'];
            $horario->ip_address_salida = request()->ip();
            $horario->user_agent_salida = request()->userAgent();
            $horario->estado_fichaje = 'finalizado';

            $horario->save();

            event(new FichajeFinalizar($horario, $coordenadas));
        });

        // Buscar siguiente horario si existe
        $siguienteHorario = $this->buscarSiguienteHorario($horario);

        return [
            'horario' => $horario->fresh(),
            'siguiente_horario' => $siguienteHorario
        ];
    }

    /**
     * Inicia un descanso obligatorio
     */
    private function iniciarDescansoObligatorio(Horario $horario): array
    {
        return $this->descansoService->iniciarDescanso($horario, 'obligatorio');
    }

    /**
     * Inicia un descanso adicional
     */
    private function iniciarDescansoAdicional(Horario $horario): array
    {
        return $this->descansoService->iniciarDescanso($horario, 'adicional');
    }

    /**
     * Reanuda un descanso activo
     */
    private function reanudarDescanso(Horario $horario): array
    {
        return $this->descansoService->finalizarDescanso($horario);
    }

    /**
     * Busca el siguiente horario consecutivo si existe
     */
    private function buscarSiguienteHorario(Horario $horario): ?Horario
    {
        $empleadoId = $horario->contrato->empleado_id;

        // Obtener todos los horarios del día del empleado
        $horariosDelDia = Horario::whereHas('contrato', function($query) use ($empleadoId) {
                $query->where('empleado_id', $empleadoId);
            })
            ->whereDate('horario_inicio', Carbon::parse($horario->horario_inicio)->format('Y-m-d'))
            ->orderBy('horario_inicio', 'asc')
            ->get();

        // Encontrar el horario actual en la secuencia y obtener el siguiente
        $indiceActual = $horariosDelDia->search(function($h) use ($horario) {
            return $h->id === $horario->id;
        });

        if ($indiceActual !== false && $indiceActual < ($horariosDelDia->count() - 1)) {
            return $horariosDelDia[$indiceActual + 1];
        }

        return null;
    }

    /**
     * Valida si se puede realizar una acción de fichaje
     */
    public function validarFichaje(Horario $horario): array
    {
        // Asegurarnos de que todas las fechas estén en la misma zona horaria
        $currentTime = now()->setTimezone('Europe/Madrid');
        $horaInicio = Carbon::parse($horario->horario_inicio)->setTimezone('Europe/Madrid');
        $horaFin = Carbon::parse($horario->horario_fin)->setTimezone('Europe/Madrid');

        // Permitir fichar 30 minutos antes
        $inicioPermitido = $horaInicio->copy()->subMinutes(30);

        Log::info('Validación de fichaje', [
            'hora_actual' => $currentTime->format('Y-m-d H:i:s'),
            'hora_inicio' => $horaInicio->format('Y-m-d H:i:s'),
            'inicio_permitido' => $inicioPermitido->format('Y-m-d H:i:s'),
            'diferencia_minutos' => $currentTime->diffInMinutes($inicioPermitido, false),
            'es_antes_inicio' => $currentTime->lt($inicioPermitido)
        ]);

        // Si la hora actual es anterior al inicio permitido
        if ($currentTime->lt($inicioPermitido)) {
            $minutosRestantes = $currentTime->diffInMinutes($inicioPermitido);
            return [
                'valido' => false,
                'mensaje' => "Aún no es hora de empezar tu jornada. Faltan {$minutosRestantes} minutos."
            ];
        }

        // Si la hora actual es posterior al fin permitido
        if ($currentTime->gt($horaFin)) {
            return [
                'valido' => false,
                'mensaje' => 'Tu jornada ha terminado'
            ];
        }

        return ['valido' => true];
    }

    /**
     * Validación específica para el middleware
     */
    public function ejecutarValidacion(Horario $horario): array
    {
        // Asegurarnos de que todas las fechas estén en la zona horaria de Madrid
        $now = Carbon::now('Europe/Madrid');

        // Convertir la hora de inicio a objeto Carbon en zona horaria de Madrid
        $horaInicio = Carbon::createFromFormat(
            'Y-m-d H:i:s',
            $horario->horario_inicio,
            'Europe/Madrid'
        );

        // Calcular el inicio permitido (30 minutos antes)
        $inicioPermitido = $horaInicio->copy()->subMinutes(30);

        Log::info('Validación de acceso a fichaje', [
            'hora_actual_madrid' => $now->format('Y-m-d H:i:s'),
            'hora_inicio_original' => $horario->horario_inicio,
            'hora_inicio_madrid' => $horaInicio->format('Y-m-d H:i:s'),
            'inicio_permitido' => $inicioPermitido->format('Y-m-d H:i:s'),
            'es_antes_inicio' => $now->lt($inicioPermitido),
            'diferencia_minutos' => $now->diffInMinutes($inicioPermitido),
            'timezone_actual' => $now->timezone->getName()
        ]);

        if ($now->lt($inicioPermitido)) {
            $minutosRestantes = $now->diffInMinutes($inicioPermitido);
            return [
                'valido' => false,
                'mensaje' => "Aún no es hora de empezar tu jornada. Faltan {$minutosRestantes} minutos."
            ];
        }

        return ['valido' => true];
    }
}

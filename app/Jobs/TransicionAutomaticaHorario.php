<?php

namespace App\Jobs;

use App\Models\Horario;
use App\Services\Fichaje\FichajeService;
use App\Services\Fichaje\DescansoService;
use App\Services\Fichaje\TransicionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TransicionAutomaticaHorario implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private Horario $horarioActual,
        private Horario $horarioSiguiente
    ) {}

    public function handle(
        FichajeService $fichajeService,
        DescansoService $descansoService,
        TransicionService $transicionService
    ): void {
        try {
            Log::info('TransicionAutomaticaHorario', [
                'horario_actual' => $this->horarioActual->id,
                'horario_siguiente' => $this->horarioSiguiente->id
            ]);
            // 1. Validaciones iniciales
            if (!$this->validarEstados()) {
                return;
            }

            DB::transaction(function () use ($fichajeService, $descansoService, $transicionService) {
                // 2. Verificar si hay descanso activo
                $descansoActivo = $descansoService->obtenerDescansoActivo($this->horarioActual);
                
                if ($descansoActivo) {
                    // Manejar descanso entre horarios
                    $transicionService->transferirDescanso(
                        $this->horarioActual,
                        $this->horarioSiguiente,
                        $descansoActivo
                    );
                } else {
                    // 3. Finalizar horario actual
                    $fichajeService->finalizar($this->horarioActual, [
                        'latitud' => $this->horarioActual->ultima_latitud ?? 0,
                        'longitud' => $this->horarioActual->ultima_longitud ?? 0,
                        'transicion_automatica' => true
                    ]);

                    // 4. Iniciar horario siguiente
                    $fichajeService->iniciar($this->horarioSiguiente, [
                        'latitud' => $this->horarioActual->ultima_latitud ?? 0,
                        'longitud' => $this->horarioActual->ultima_longitud ?? 0,
                        'transicion_automatica' => true
                    ]);
                }
            });

            Log::info('Transición automática completada', [
                'horario_actual' => $this->horarioActual->id,
                'horario_siguiente' => $this->horarioSiguiente->id,
                'tiene_descanso_activo' => isset($descansoActivo)
            ]);

        } catch (\Exception $e) {
            Log::error('Error en transición automática:', [
                'error' => $e->getMessage(),
                'horario_actual' => $this->horarioActual->id,
                'horario_siguiente' => $this->horarioSiguiente->id
            ]);

            throw $e;
        }
    }

    private function validarEstados(): bool
    {
        // Verificar que el horario actual sigue en curso
        if ($this->horarioActual->estado_fichaje !== 'en_curso') {
            Log::warning('Transición cancelada: horario actual no está en curso', [
                'horario_actual' => $this->horarioActual->id,
                'estado' => $this->horarioActual->estado_fichaje
            ]);
            return false;
        }

        // Verificar que el horario siguiente no esté iniciado
        if ($this->horarioSiguiente->estado_fichaje !== 'sin_iniciar') {
            Log::warning('Transición cancelada: horario siguiente ya iniciado', [
                'horario_siguiente' => $this->horarioSiguiente->id,
                'estado' => $this->horarioSiguiente->estado_fichaje
            ]);
            return false;
        }

        return true;
    }
}
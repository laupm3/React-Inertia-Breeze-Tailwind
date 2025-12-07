<?php

namespace App\Listeners\Fichaje;

use Illuminate\Support\Facades\Log;
use App\Events\Fichaje\FichajePausar;
use App\Events\Fichaje\FichajeEnCurso;
use App\Events\Fichaje\FichajeIniciar;
use App\Events\Fichaje\FichajeReanudar;
use App\Events\Fichaje\FichajeFinalizar;
use App\Traits\FichajeNotificacionesTrait;
use Illuminate\Contracts\Queue\ShouldQueue;

class FichajeListener implements ShouldQueue
{
    use FichajeNotificacionesTrait;
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle($event): void
    {
        try {
            if ($event instanceof FichajeIniciar) {
                $this->procesarInicio($event);
            } elseif ($event instanceof FichajePausar) {
                $this->procesarPausa($event);
            } elseif ($event instanceof FichajeReanudar) {
                $this->procesarReanudacion($event);
            } elseif ($event instanceof FichajeFinalizar) {
                $this->procesarFinalizacion($event);
            } elseif ($event instanceof FichajeEnCurso) {
                $this->procesarActualizacion($event);
            }
        } catch (\Exception $e) {
            Log::error("Error en FichajeListener: {$e->getMessage()}", [
                'evento' => get_class($event),
                'horario_id' => $event->horario->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Procesar evento de inicio de fichaje
     */
    protected function procesarInicio(FichajeIniciar $event): void
    {
        Log::info("Procesando evento de inicio de fichaje", [
            'horario_id' => $event->horario->id,
            'empleado' => $this->getEmpleadoNombre($event->horario),
            'timestamp' => now()->toIso8601String()
        ]);

        // Notificar a los administradores
        $this->notifyAdminsAboutFichaje($event->horario, 'iniciar');

        // Notificar a los managers
        $this->notifyManagersAboutFichaje($event->horario, 'iniciar');
    }

    /**
     * Procesar evento de pausa de fichaje
     */
    protected function procesarPausa(FichajePausar $event): void
    {
        Log::info("Procesando evento de pausa de fichaje", [
            'horario_id' => $event->horario->id,
            'empleado' => $this->getEmpleadoNombre($event->horario),
            'timestamp' => now()->toIso8601String()
        ]);

        // Notificar a los administradores
        $this->notifyAdminsAboutFichaje($event->horario, 'pausar');

        // Notificar a los managers
        $this->notifyManagersAboutFichaje($event->horario, 'pausar');
    }

    /**
     * Procesar evento de reanudación de fichaje
     */
    protected function procesarReanudacion(FichajeReanudar $event): void
    {
        Log::info("Procesando evento de reanudación de fichaje", [
            'horario_id' => $event->horario->id,
            'empleado' => $this->getEmpleadoNombre($event->horario),
            'timestamp' => now()->toIso8601String()
        ]);

        // Notificar a los administradores
        $this->notifyAdminsAboutFichaje($event->horario, 'reanudar');
        // Notificar a los managers
        $this->notifyManagersAboutFichaje($event->horario, 'reanudar');
    }

    /**
     * Procesar evento de finalización de fichaje
     */
    protected function procesarFinalizacion(FichajeFinalizar $event): void
    {
        Log::info("Procesando evento de finalización de fichaje", [
            'horario_id' => $event->horario->id,
            'empleado' => $this->getEmpleadoNombre($event->horario),
            'timestamp' => now()->toIso8601String()
        ]);
        // Notificar a los administradores
        $this->notifyAdminsAboutFichaje($event->horario, 'finalizar');
        // Notificar a los managers
        $this->notifyManagersAboutFichaje($event->horario, 'finalizar');
    }

    /**
     * Procesar evento de actualización de fichaje
     */
    protected function procesarActualizacion(FichajeEnCurso $event): void
    {
        Log::info("Procesando evento de actualización de fichaje", [
            'horario_id' => $event->horario->id,
            'empleado' => $this->getEmpleadoNombre($event->horario),
            'timestamp' => now()->toIso8601String()
        ]);

        // Notificar a los administradores
        $this->notifyAdminsAboutFichaje($event->horario, 'update');
        // Notificar a los managers
        $this->notifyManagersAboutFichaje($event->horario, 'update');
    }
}
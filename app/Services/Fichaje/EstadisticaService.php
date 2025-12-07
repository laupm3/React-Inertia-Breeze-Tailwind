<?php

namespace App\Services\Fichaje;

use App\Models\Horario;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class EstadisticaService
{
    /**
     * new
     * Obtiene las estadísticas de los horarios
     */
    public function obtenerEstadisticas(Collection $horarios): array
    {
        $estadisticas = [];

        foreach ($horarios as $horario) {
            $estadisticas[] = [
                'horario_id' => $horario->id,
                'tiempo_restante' => $this->calcularTiempoRestante($horario),
                'tiempo_total' => $this->calcularTiempoTotal($horario),
                'tiempo_descanso' => $this->calcularTiempoDescanso($horario)
            ];
        }

        return $estadisticas;
    }

    /**
     * Calcula el tiempo total de la jornada en segundos
     */
    public function calcularTiempoTotal(Horario $horario): int
    {
        $horaActual = now()->setTimezone('Europe/Madrid');
        $horaInicio = Carbon::createFromFormat('Y-m-d H:i:s', $horario->horario_inicio, 'Europe/Madrid');
        $horaFin = Carbon::createFromFormat('Y-m-d H:i:s', $horario->horario_fin, 'Europe/Madrid');
        $descansoInicio = $horario->descanso_inicio ?
            Carbon::createFromFormat('Y-m-d H:i:s', $horario->descanso_inicio, 'Europe/Madrid') : null;
        $descansoFin = $horario->descanso_fin ?
            Carbon::createFromFormat('Y-m-d H:i:s', $horario->descanso_fin, 'Europe/Madrid') : null;

        // Calcular tiempo restante para fichaje en curso
        $tiempoTotal = abs($horaFin->diffInSeconds($horaInicio));

        if ($descansoInicio && $descansoFin && $horaActual->lt($descansoFin)) {
            $tiempoDescansoRestante = $horaActual->gt($descansoInicio)
                ? abs($descansoFin->diffInSeconds($horaActual))
                : abs($descansoFin->diffInSeconds($descansoInicio));
            $tiempoTotal -= $tiempoDescansoRestante;
        }

        return $tiempoTotal;
    }

    /**
     * Calcula el tiempo restante de la jornada en segundos
     */
    public function calcularTiempoRestante(Horario $horario): int
    {
        $horaActual = now()->setTimezone('Europe/Madrid');
        $horaInicio = Carbon::createFromFormat('Y-m-d H:i:s', $horario->horario_inicio, 'Europe/Madrid');
        $horaFin = Carbon::createFromFormat('Y-m-d H:i:s', $horario->horario_fin, 'Europe/Madrid');
        $descansoInicio = $horario->descanso_inicio ?
            Carbon::createFromFormat('Y-m-d H:i:s', $horario->descanso_inicio, 'Europe/Madrid') : null;
        $descansoFin = $horario->descanso_fin ?
            Carbon::createFromFormat('Y-m-d H:i:s', $horario->descanso_fin, 'Europe/Madrid') : null;

        // Calcular tiempo total de la jornada
        $tiempoTotal = abs($horaFin->diffInSeconds($horaInicio));
        $tiempoDescansoObligatorio = $descansoInicio && $descansoFin
            ? abs($descansoFin->diffInSeconds($descansoInicio))
            : 0;
        $tiempoJornadaTotal = $tiempoTotal - $tiempoDescansoObligatorio;

        // Si el estado es "sin_iniciar" o ya pasó la hora de fin
        if ($horario->estado_fichaje === 'sin_iniciar' || $horaActual->gt($horaFin)) {
            return $tiempoJornadaTotal;
        }

        // Si ya finalizó el fichaje, calcular tiempo restante basado en el tiempo trabajado
        if ($horario->fichaje_salida) {
            $tiempoTrabajado = abs(Carbon::parse($horario->fichaje_salida)->diffInSeconds(Carbon::parse($horario->fichaje_entrada)));
            return max(0, $tiempoJornadaTotal - $tiempoTrabajado);
        }

        // Calcular tiempo restante para fichaje en curso
        $tiempoRestante = abs($horaFin->diffInSeconds($horaActual));

        // Restar tiempo de descanso obligatorio pendiente
        if ($descansoInicio && $descansoFin && $horaActual->lt($descansoFin)) {
            $tiempoDescansoRestante = $horaActual->gt($descansoInicio)
                ? abs($descansoFin->diffInSeconds($horaActual))
                : abs($descansoFin->diffInSeconds($descansoInicio));
            $tiempoRestante -= $tiempoDescansoRestante;
        }

        // Restar tiempo de descansos adicionales
        $tiempoDescansos = $this->calcularTiempoDescanso($horario);

        return max(0, $tiempoRestante - $tiempoDescansos);
    }

    /**
     * Calcula el tiempo total de descansos adicionales en segundos
     */
    private function calcularTiempoDescanso(Horario $horario): int
    {
        return $horario->descansosAdicionales()
            ->whereNotNull('descanso_fin')
            ->get()
            ->sum(function ($descanso) {
                $inicio = Carbon::createFromFormat('Y-m-d H:i:s', $descanso->descanso_inicio, 'Europe/Madrid');
                $fin = Carbon::createFromFormat('Y-m-d H:i:s', $descanso->descanso_fin, 'Europe/Madrid');
                return abs($fin->diffInSeconds($inicio));
            });
    }
}

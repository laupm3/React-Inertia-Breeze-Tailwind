<?php

namespace App\Services\Fichaje;

use App\Models\Horario;
use App\Models\DescansoAdicional;
use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Este servicio se encarga de validar si el usuario puede fichar, tomar descansos obligatorios
 */

class ValidacionService
{
    private const MINUTOS_ANTICIPACION = 15; // Configurable

    /**
     * Obtiene los horarios activos para los contratos dados
     *
     * @param Collection $contratos
     * @return Collection
     */
    public function obtenerHorariosActivos(Collection $contratos): Collection
    {
        return Horario::obtenerHorarioActivo($contratos);
    }

    /**
     * Verifica si puede fichar en algún horario
     * Solo puede fichar si:
     * - El horario está sin iniciar
     * - Está dentro del rango de tiempo permitido
     */
    public function puedeFichar(Collection $horarios): bool
    {
        return $horarios->contains(function ($horario) {
            if ($horario->estado_fichaje !== 'sin_iniciar') {
                return false;
            }

            $horaInicio = Carbon::createFromFormat('Y-m-d H:i:s', $horario->horario_inicio, 'Europe/Madrid');
            $horaPermitida = $horaInicio->copy()->subMinutes(self::MINUTOS_ANTICIPACION);
            $horaLimite = $horaInicio->copy()->addMinutes(self::MINUTOS_ANTICIPACION);

            return now()->setTimezone('Europe/Madrid')->between($horaPermitida, $horaLimite);
        });
    }

    /**
     * Verifica si puede tomar descanso obligatorio
     * Solo puede tomarlo si:
     * - El horario está en curso
     * - Tiene configurado descanso obligatorio
     * - No ha tomado ya el descanso obligatorio
     */
    public function puedeTomarDescansoObligatorio(Collection $horarios): bool
    {
        return $horarios->contains(function ($horario) {
            if ($horario->estado_fichaje !== 'en_curso') {
                return false;
            }

            // Verifica si tiene configurado descanso obligatorio
            if (!$horario->descanso_inicio || !$horario->descanso_fin) {
                return false;
            }

            // Verifica si ya tomó el descanso obligatorio
            return !DescansoAdicional::descansoObligatorioTomadoHoy($horario);
        });
    }

    /**
     * Verifica si puede tomar descanso
     * Solo puede tomarlo si:
     * - El horario está en curso
     * - No está en otro tipo de descanso
     */
    public function puedeTomarDescanso(Collection $horarios): bool
    {
        return $horarios->contains(function ($horario) {
            if ($horario->estado_fichaje !== 'en_curso') {
                return false;
            }

            // Verifica que no esté en ningún tipo de descanso
            return !DescansoAdicional::obtenerDescansoActivo($horario);
        });
    }
} 
<?php

namespace App\Services;

use App\Enums\AbsenceNoteStatus;
use App\Events\Horario\RetrasoDetectado;
use App\Events\Horario\AusenciaMayorDetectada;
use App\Models\Horario;
use App\Services\AbsenceNote\AbsenceNoteService;
use Illuminate\Support\Facades\Log;

class RetrasosService
{
    /**
     * Constructor
     */
    public function __construct(
        protected AbsenceNoteService $absenceNoteService
    ) {}

    /**
     * Verifica si hay retrasos y ejecuta las acciones correspondientes
     *
     * @param Horario $horario
     * @return void
     */
    public function verificarRetrasos(Horario $horario): void
    {
        // Si no hay fichaje de entrada o no hay horario programado, no hay retraso
        if (!$horario->fichaje_entrada || !$horario->horario_inicio) {
            return;
        }

        // Si el fichaje es anterior o igual al horario programado, no hay retraso
        if ($horario->fichaje_entrada <= $horario->horario_inicio) {
            return;
        }

        $minutosRetraso = $this->getMinutosRetraso($horario);

        // Retraso mayor a 60 minutos - Ausencia Mayor
        if ($this->tieneAusenciaMayor($horario)) {
            Log::info('⚠️ Detectada ausencia mayor', [
                'horario_id' => $horario->id,
                'minutos_retraso' => $minutosRetraso
            ]);

            // Crear nota de ausencia automáticamente
            $this->crearNotaAusencia($horario, $minutosRetraso);

            // Emitir evento para notificaciones
            event(new AusenciaMayorDetectada($horario, $minutosRetraso));
            return;
        }

        // Retraso entre 15 y 60 minutos - Retraso Significativo
        if ($this->tieneRetrasoSignificativo($horario)) {
            Log::info('🕒 Detectado retraso significativo', [
                'horario_id' => $horario->id,
                'minutos_retraso' => $minutosRetraso
            ]);

            // Emitir evento para notificaciones
            event(new RetrasoDetectado($horario, $minutosRetraso));
            return;
        }

        // Retraso menor a 15 minutos - No significativo
        Log::info('ℹ️ Retraso menor detectado (no significativo)', [
            'horario_id' => $horario->id,
            'minutos_retraso' => $minutosRetraso
        ]);
    }

    /**
     * Crea una nota de ausencia automática por retraso significativo
     *
     * @param Horario $horario
     * @param int $minutosRetraso
     * @return void
     */
    private function crearNotaAusencia(Horario $horario, int $minutosRetraso): void
    {
        // Verificar si ya existe una nota para este horario
        if ($this->tieneNotaAusencia($horario)) {
            Log::info('Ya existe una nota de ausencia para este horario', [
                'horario_id' => $horario->id
            ]);
            return;
        }

        \App\Models\AbsenceNote::create([
            'horario_id' => $horario->id,
            'status' => 'pendiente',
            'reason' => "Retraso detectado: {$minutosRetraso} minutos",
        ]);

        Log::info('Nota de ausencia creada automáticamente', [
            'horario_id' => $horario->id
        ]);
    }

    /**
     * Procesa fichajes nuevos o actualizados para detectar retrasos
     *
     * @param Horario $horario
     * @return void
     */
    public function procesarFichaje(Horario $horario): void
    {
        // Si ya hay una nota de ausencia aprobada, no verificamos retrasos
        if ($this->tieneNotaAusencia($horario) && $horario->absenceNote->status == AbsenceNoteStatus::APPROVED) {
            return;
        }

        $this->verificarRetrasos($horario);
    }

    /**
     * Determina si el horario tiene un retraso significativo (>15 min)
     *
     * @param Horario $horario
     * @return bool
     */
    public function tieneRetrasoSignificativo(Horario $horario): bool
    {
        if (!$horario->fichaje_entrada || !$horario->horario_inicio) {
            return false;
        }

        $retraso = $this->getMinutosRetraso($horario);
        return $retraso > 15 && $retraso <= 60;
    }

    /**
     * Determina si el horario tiene una ausencia mayor (>1h de retraso)
     *
     * @param Horario $horario
     * @return bool
     */
    public function tieneAusenciaMayor(Horario $horario): bool
    {
        if (!$horario->fichaje_entrada || !$horario->horario_inicio) {
            return false;
        }

        $retraso = $this->getMinutosRetraso($horario);
        return $retraso > 60;
    }

    /**
     * Obtiene los minutos de retraso en el fichaje de entrada
     *
     * @param Horario $horario
     * @return int|null
     */
    public function getMinutosRetraso(Horario $horario): ?int
    {
        if (!$horario->fichaje_entrada || !$horario->horario_inicio) {
            return null;
        }

        if ($horario->fichaje_entrada <= $horario->horario_inicio) {
            return 0; // No hay retraso
        }

        return $horario->fichaje_entrada->diffInMinutes($horario->horario_inicio);
    }

    /**
     * Verifica si el horario requiere justificante
     *
     * @param Horario $horario
     * @return bool
     */
    public function requiereJustificante(Horario $horario): bool
    {
        return $this->tieneAusenciaMayor($horario) ||
               ($horario->estadoHorario && $horario->estadoHorario->name === 'Absentismo');
    }

    /**
     * Verifica si ya existe una nota de ausencia para este horario
     *
     * @param Horario $horario
     * @return bool
     */
    public function tieneNotaAusencia(Horario $horario): bool
    {
        return $horario->absenceNote()->exists();
    }

    /**
     * Marca el horario como justificado
     *
     * @param Horario $horario
     * @return bool
     */
    public function marcarComoJustificado(Horario $horario): bool
    {
        $estadoJustificado = \App\Models\EstadoHorario::where('name', 'Justificado')->first();

        if (!$estadoJustificado) {
            return false;
        }

        $horario->estado_horario_id = $estadoJustificado->id;
        return $horario->save();
    }
}

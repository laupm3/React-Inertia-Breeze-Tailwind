<?php

namespace App\Services\Fichaje;

use App\Models\Horario;
use App\Models\DescansoAdicional;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 *  Esta clase se encarga de manejar la transición de descansos entre horarios.
 */

class TransicionService
{
    public function __construct(
        private FichajeService $fichajeService,
        private DescansoService $descansoService
    ) {}

    /**
     * Transfiere un descanso activo entre horarios
     */
    public function transferirDescanso(
        Horario $horarioActual,
        Horario $horarioSiguiente,
        DescansoAdicional $descansoActivo
    ): void {
        $momentoTransicion = Carbon::createFromFormat('Y-m-d H:i:s', $horarioActual->horario_fin, 'Europe/Madrid');
        
        DB::transaction(function () use ($horarioActual, $horarioSiguiente, $descansoActivo, $momentoTransicion) {
            // 1. Finalizar descanso en horario actual
            $descansoActivo->descanso_fin = $momentoTransicion;
            $descansoActivo->save();

            // 2. Crear nuevo descanso en horario siguiente
            $nuevoDescanso = new DescansoAdicional([
                'tipo_descanso' => $descansoActivo->tipo_descanso,
                'descanso_inicio' => $momentoTransicion,
                'ip_address_inicio' => $descansoActivo->ip_address_inicio,
                'user_agent_inicio' => $descansoActivo->user_agent_inicio,
                'observaciones' => "Continuación del descanso {$descansoActivo->id} del horario anterior"
            ]);

            $horarioSiguiente->descansosAdicionales()->save($nuevoDescanso);

            // 3. Actualizar estados
            $horarioActual->estado_fichaje = 'finalizado';
            $horarioActual->save();

            $horarioSiguiente->estado_fichaje = 'en_descanso';
            $horarioSiguiente->save();

            Log::info('Descanso transferido entre horarios', [
                'descanso_original' => $descansoActivo->id,
                'nuevo_descanso' => $nuevoDescanso->id,
                'horario_actual' => $horarioActual->id,
                'horario_siguiente' => $horarioSiguiente->id
            ]);
        });
    }

    /**
     * Verifica si dos horarios son consecutivos
     */
    public function sonHorariosConsecutivos(Horario $h1, Horario $h2): bool
    {
        $fin = Carbon::createFromFormat('Y-m-d H:i:s', $h1->horario_fin, 'Europe/Madrid');
        $inicio = Carbon::createFromFormat('Y-m-d H:i:s', $h2->horario_inicio, 'Europe/Madrid');
        return $fin->format('Y-m-d H:i') === $inicio->format('Y-m-d H:i');
    }

    /**
     * Obtiene el siguiente horario si existe
     */
    public function obtenerSiguienteHorario(Horario $horario): ?Horario
    {
        return Horario::where('empleado_id', $horario->empleado_id)
            ->where('horario_inicio', $horario->horario_fin)
            ->where('estado_fichaje', 'sin_iniciar')
            ->first();
    }
} 
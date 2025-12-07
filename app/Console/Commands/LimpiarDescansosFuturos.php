<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DescansoAdicional;
use App\Models\Horario;
use Carbon\Carbon;

class LimpiarDescansosFuturos extends Command
{
    protected $signature = 'horarios:limpiarDatosFuturos  {--force : Forzar la limpieza sin confirmación}';
    protected $description = 'Limpia descansos y fichajes de horarios futuros, previa confirmación del usuario.';

    // Incluir atributo --force para evitar confirmación en entornos de producción

    public function handle()
    {
        $tomorrow = Carbon::now()->addDay(1)->startOfDay(); // Fecha de mañana a las 00:00:00

        // Selecciona todos los horarios futuros
        $horariosFuturos = Horario::where('horario_inicio', '>', $tomorrow)->pluck('id');
        $totalHorarios = $horariosFuturos->count();
        $totalDescansos = DescansoAdicional::whereIn('horario_id', $horariosFuturos)->count();

        // Mostrar resumen y pedir confirmación
        $this->info("Resumen de limpieza:");
        $this->line(" - Datos de horarios futuros a Eliminar: $totalHorarios");

        if ($totalHorarios === 0 && $totalDescansos === 0) {
            $this->info("No hay datos futuros que limpiar. Operación cancelada.");
            return 0;
        }

        if (!$this->option('force')) {
            if (!$this->confirm('¿Deseas continuar con la limpieza de estos datos?', false)) {
                $this->info("Operación cancelada por el usuario.");
                return 0;
            }
        }

        // Ejecutar limpieza
        $deletedDescansos = DescansoAdicional::whereIn('horario_id', $horariosFuturos)->delete();
        $updatedHorarios = Horario::whereIn('id', $horariosFuturos)->update([
            'fichaje_entrada' => null,
            'fichaje_salida' => null,
            'latitud_entrada' => null,
            'longitud_entrada' => null,
            'latitud_salida' => null,
            'longitud_salida' => null,
            'ip_address_entrada' => null,
            'ip_address_salida' => null,
            'user_agent_entrada' => null,
            'user_agent_salida' => null,
        ]);

        // Mostrar resultado final
        $this->info("Limpieza completada.");
        $this->line(" - Horarios actualizados: $updatedHorarios");

        return 0;
    }
}

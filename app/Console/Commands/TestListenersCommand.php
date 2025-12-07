<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Horario;
use App\Events\Horario\RetrasoDetectado;
use App\Events\Horario\AusenciaMayorDetectada;
use Illuminate\Support\Facades\Log;

class TestListenersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'listeners:test {horario_id} {--retraso=30}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ejecuta los listeners para probar las notificaciones';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $horarioId = $this->argument('horario_id');
        $minutosRetraso = $this->option('retraso');

        $horario = Horario::find($horarioId);

        if (!$horario) {
            $this->error("No se encontró el horario con ID {$horarioId}");
            return;
        }

        $this->info("Ejecutando listener para RetrasoDetectado...");
        event(new RetrasoDetectado($horario, $minutosRetraso));

        $this->info("Ejecutando listener para AusenciaMayorDetectada...");
        event(new AusenciaMayorDetectada($horario, $minutosRetraso));

        $this->info("Listeners ejecutados. Revisa los logs para más detalles.");
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Horario;
use App\Services\RetrasosService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class VerificarRetrasosCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'horarios:verificar-retrasos
                            {--desde=today : Fecha desde la que verificar (formato Y-m-d)}
                            {--hasta=today : Fecha hasta la que verificar (formato Y-m-d)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica retrasos en horarios para un rango de fechas';

    /**
     * Execute the console command.
     */
    public function handle(RetrasosService $retrasosService)
    {
        $desde = Carbon::parse($this->option('desde'))->startOfDay();
        $hasta = Carbon::parse($this->option('hasta'))->endOfDay();

        $this->info("Verificando retrasos desde {$desde->format('Y-m-d')} hasta {$hasta->format('Y-m-d')}");

        // Obtenemos horarios con fichaje de entrada y sin nota de ausencia
        $query = Horario::whereNotNull('fichaje_entrada')
            ->whereBetween('horario_inicio', [$desde, $hasta])
            ->whereDoesntHave('absenceNote')
            ->orderBy('horario_inicio');

        $total = $query->count();
        $this->info("Se encontraron {$total} horarios para verificar");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $query->chunk(100, function ($horarios) use ($retrasosService, $bar) {
            foreach ($horarios as $horario) {
                $retrasosService->procesarFichaje($horario);
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info('Verificación de retrasos completada');

        return Command::SUCCESS;
    }
}

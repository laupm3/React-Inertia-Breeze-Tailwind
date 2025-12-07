<?php

namespace App\Console\Commands;

use App\Events\Contrato\ContratoProximoAVencer;
use App\Events\Contrato\ContratoVencido;
use App\Models\Contrato;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class VerificarContratosCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contratos:verificar
                            {--solo-vencidos : Verificar solo contratos vencidos}
                            {--solo-proximos : Verificar solo contratos próximos a vencer}
                            {--dias-retrasados=1 : Verificar contratos vencidos en los últimos N días}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica contratos vencidos y próximos a vencer';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando verificación de contratos...');

        try {
            $soloVencidos = $this->option('solo-vencidos');
            $soloProximos = $this->option('solo-proximos');
            $diasRetrasados = (int)$this->option('dias-retrasados');

            // Si no se especifica ninguna opción específica, ejecutar todas las verificaciones
            $verificarVencidos = !$soloProximos;
            $verificarProximos = !$soloVencidos;

            $totalProcesados = 0;

            // Verificar contratos vencidos
            if ($verificarVencidos) {
                $totalProcesados += $this->verificarContratosVencidos($diasRetrasados);
            }

            // Verificar contratos próximos a vencer
            if ($verificarProximos) {
                $totalProcesados += $this->verificarContratosProximosAVencer();
            }

            $this->info("Total de contratos procesados: $totalProcesados");
            Log::info('Verificación de contratos completada', ['total_procesados' => $totalProcesados]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error durante la verificación de contratos: {$e->getMessage()}");
            Log::error('Error en verificación de contratos', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Command::FAILURE;
        }
    }

    /**
     * Verifica contratos que vencen hoy o en los últimos días
     *
     * @param int $diasRetrasados Verificar contratos vencidos hace N días
     * @return int Número de contratos procesados
     */
    private function verificarContratosVencidos(int $diasRetrasados = 1): int
    {
        $fechaInicio = Carbon::today()->subDays($diasRetrasados - 1);
        $fechaFin = Carbon::today();

        $contratosVencidos = Contrato::whereBetween('fecha_fin', [$fechaInicio, $fechaFin])
            ->get();

        $count = 0;
        foreach ($contratosVencidos as $contrato) {
            event(new ContratoVencido($contrato));
            $count++;
        }

        $diasMsg = $diasRetrasados > 1 ? "hoy y en los últimos " . ($diasRetrasados - 1) . " días" : "hoy";
        $this->info("Se han procesado {$count} contratos vencidos $diasMsg");

        return $count;
    }

    /**
     * Verifica contratos próximos a vencer en días específicos
     *
     * @return int Número de contratos procesados
     */
    private function verificarContratosProximosAVencer(): int
    {
        // Días de anticipación para notificar
        $diasAnticipacion = [15, 7, 3];
        $totalProcesados = 0;

        foreach ($diasAnticipacion as $dias) {
            $fecha = Carbon::today()->addDays($dias);

            $contratosProximosAVencer = Contrato::where('fecha_fin', $fecha)
                ->get();

            $count = 0;
            foreach ($contratosProximosAVencer as $contrato) {
                event(new ContratoProximoAVencer($contrato, $dias));
                $count++;
            }

            $this->info("Se han procesado {$count} contratos que vencen en $dias días");
            $totalProcesados += $count;
        }

        return $totalProcesados;
    }
}

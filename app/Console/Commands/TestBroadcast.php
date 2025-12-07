<?php

namespace App\Console\Commands;

use App\Models\Horario;
use Illuminate\Console\Command;
use App\Events\Fichaje\FichajeIniciar;
use App\Events\Fichaje\FichajePausar;
use App\Events\Fichaje\FichajeReanudar;
use App\Events\Fichaje\FichajeFinalizar;
use App\Events\Fichaje\FichajeEnCurso;
use Illuminate\Support\Facades\Log;

class TestBroadcast extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'broadcast:test {tipo=inicio} {horario_id?} {--datos=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba eventos de broadcasting';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Obtener el horario para la prueba
            $horario_id = $this->argument('horario_id');
            
            if (!$horario_id) {
                $latestHorario = Horario::latest()->first();
                
                if (!$latestHorario) {
                    $this->error('No se encontró ningún horario para probar');
                    return 1;
                }
                
                $horario_id = $latestHorario->id;
                $this->info("Usando el horario más reciente: #{$horario_id}");
            }
            
            $horario = Horario::find($horario_id);
            if (!$horario) {
                $this->error("Horario #{$horario_id} no encontrado en la base de datos");
                return 1;
            }
            
            // Obtener datos personalizados
            $datosJson = $this->option('datos') ?? '{}';
            $datos = [];
            
            try {
                $datos = json_decode($datosJson, true, 512, JSON_THROW_ON_ERROR);
                if (!is_array($datos)) {
                    $datos = ['mensaje' => $datosJson];
                }
            } catch (\JsonException $e) {
                $this->warn("Error al decodificar JSON: {$e->getMessage()}");
                $this->warn("Usando datos como texto simple");
                $datos = ['mensaje' => $datosJson];
            }
            
            // Obtener el tipo de evento a disparar
            $tipo = $this->argument('tipo');
            
            $this->info("Disparando evento de fichaje '{$tipo}' para horario #{$horario->id}...");
            $this->info("Datos: " . json_encode($datos, JSON_PRETTY_PRINT));
            
            // Disparar el evento apropiado
            switch ($tipo) {
                case 'inicio':
                    event(new FichajeIniciar($horario, $datos));
                    break;
                    
                case 'pausa':
                    event(new FichajePausar($horario, $datos));
                    break;
                    
                case 'reanudar':
                    event(new FichajeReanudar($horario, $datos));
                    break;
                    
                case 'fin':
                    event(new FichajeFinalizar($horario, $datos));
                    break;
                    
                case 'update':
                    event(new FichajeEnCurso($horario, 'update', $datos));
                    break;
                    
                default:
                    $this->error("Tipo de evento '{$tipo}' no válido");
                    return 1;
            }
            
            $this->info('✓ Evento disparado correctamente');
            return 0;
            
        } catch (\Exception $e) {
            $this->error("Error al ejecutar el comando: {$e->getMessage()}");
            $this->line("En archivo: {$e->getFile()}:{$e->getLine()}");
            $this->line("Traza: " . $e->getTraceAsString());
            Log::error('Error en comando broadcast:test', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
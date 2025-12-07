<?php

namespace App\Console\Commands;

use App\Services\Storage\R2DiagnosticService;
use Illuminate\Console\Command;

class R2DiagnosticCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'r2:diagnostic 
                            {--test-folder-id= : ID de un folder específico para probar}
                            {--force-delete= : Ruta específica para eliminación forzada}
                            {--save-log : Guardar resultados en archivo de log}
                            {--quick : Ejecutar solo pruebas básicas}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ejecuta diagnósticos completos de R2 Cloudflare para detectar problemas de conectividad y permisos';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $diagnosticService = new R2DiagnosticService();

        $this->info('🔍 Iniciando diagnóstico de R2 Cloudflare...');
        $this->newLine();

        // Verificar si es una prueba específica
        if ($this->option('test-folder-id')) {
            return $this->handleFolderTest($diagnosticService);
        }

        if ($this->option('force-delete')) {
            return $this->handleForceDelete($diagnosticService);
        }

        // Diagnóstico completo o rápido
        if ($this->option('quick')) {
            $this->handleQuickDiagnostic($diagnosticService);
        } else {
            $this->handleFullDiagnostic($diagnosticService);
        }

        return 0;
    }

    /**
     * Maneja el diagnóstico completo
     */
    protected function handleFullDiagnostic(R2DiagnosticService $service): void
    {
        $this->info('Ejecutando diagnóstico completo...');
        $this->newLine();

        $results = $service->runFullDiagnostic();
        
        foreach ($results as $result) {
            if (str_starts_with($result, '✅')) {
                $this->info($result);
            } elseif (str_starts_with($result, '❌')) {
                $this->error($result);
            } elseif (str_starts_with($result, '⚠️')) {
                $this->warn($result);
            } elseif (str_starts_with($result, '🧹') || str_starts_with($result, '🔍')) {
                $this->comment($result);
            } else {
                $this->line($result);
            }
        }

        if ($this->option('save-log')) {
            $logPath = $service->saveResultsToLog();
            $this->newLine();
            $this->info("📄 Resultados guardados en: {$logPath}");
        }
    }

    /**
     * Maneja el diagnóstico rápido
     */
    protected function handleQuickDiagnostic(R2DiagnosticService $service): void
    {
        $this->info('Ejecutando diagnóstico rápido...');
        $this->newLine();

        // Solo ejecutar pruebas básicas
        $service->testConfiguration();
        $service->testConnectivity();
        $service->testBucketPermissions();
        $service->testCrudOperations();

        $results = $service->getResultsAsString();
        
        foreach (explode("\n", $results) as $result) {
            if (empty($result)) continue;
            
            if (str_starts_with($result, '✅')) {
                $this->info($result);
            } elseif (str_starts_with($result, '❌')) {
                $this->error($result);
            } elseif (str_starts_with($result, '⚠️')) {
                $this->warn($result);
            } else {
                $this->line($result);
            }
        }
    }

    /**
     * Maneja la prueba con un folder específico
     */
    protected function handleFolderTest(R2DiagnosticService $service): int
    {
        $folderId = $this->option('test-folder-id');
        
        $this->info("🔍 Probando con Folder ID: {$folderId}");
        $this->newLine();

        $results = $service->testWithRealFolder((int)$folderId);
        
        foreach ($results as $result) {
            if (str_starts_with($result, '✅')) {
                $this->info($result);
            } elseif (str_starts_with($result, '❌')) {
                $this->error($result);
            } elseif (str_starts_with($result, '⚠️')) {
                $this->warn($result);
            } else {
                $this->line($result);
            }
        }

        // Preguntar si se quiere probar eliminación
        if (str_contains($service->getResultsAsString(), 'existe en R2')) {
            $this->newLine();
            $this->warn('⚠️  ATENCIÓN: El archivo existe en R2');
            
            if ($this->confirm('¿Quieres probar la eliminación de este archivo? (IRREVERSIBLE)')) {
                $this->error('🚨 Esta operación es IRREVERSIBLE');
                
                if ($this->confirm('¿Estás SEGURO de que quieres eliminar este archivo?')) {
                    // Aquí iría la lógica de eliminación de prueba
                    $this->info('Función de eliminación de prueba no implementada por seguridad');
                    $this->comment('Usa --force-delete con la ruta específica si necesitas eliminar');
                }
            }
        }

        return 0;
    }

    /**
     * Maneja la eliminación forzada
     */
    protected function handleForceDelete(R2DiagnosticService $service): int
    {
        $path = $this->option('force-delete');
        
        $this->error("🚨 ELIMINACIÓN FORZADA");
        $this->error("Ruta: {$path}");
        $this->newLine();
        
        $this->warn('Esta operación eliminará permanentemente el archivo de R2');
        
        if (!$this->confirm('¿Estás ABSOLUTAMENTE SEGURO?')) {
            $this->info('Operación cancelada');
            return 1;
        }

        $results = $service->forceDeleteTest($path);
        
        foreach ($results as $result) {
            if (str_starts_with($result, '✅')) {
                $this->info($result);
            } elseif (str_starts_with($result, '❌')) {
                $this->error($result);
            } elseif (str_starts_with($result, '⚠️')) {
                $this->warn($result);
            } else {
                $this->line($result);
            }
        }

        return 0;
    }
}

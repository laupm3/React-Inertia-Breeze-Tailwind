<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\FolderSeeder;
use Illuminate\Support\Facades\Log;

class SeedHRStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hr:seed-structure {--force : Forzar la recreación sin confirmación}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia y recrea completamente la estructura de carpetas de Recursos Humanos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🏗️  Comando de recreación de estructura HR');
        $this->newLine();

        // Mostrar advertencia
        $this->warn('⚠️  ADVERTENCIA: Este comando eliminará TODA la estructura HR existente');
        $this->warn('   y recreará completamente el árbol de carpetas desde cero.');
        $this->newLine();

        // Confirmar si no se usa --force
        if (!$this->option('force')) {
            if (!$this->confirm('¿Estás seguro de que deseas continuar?')) {
                $this->info('❌ Operación cancelada');
                return 0;
            }
        }

        $this->info('🚀 Iniciando recreación de estructura HR...');
        $this->newLine();

        // Verificar prerrequisitos
        if (!$this->checkPrerequisites()) {
            return 1;
        }

        try {
            // Crear una instancia del seeder y ejecutarlo
            $seeder = new FolderSeeder();
            
            // Mostrar progreso más detallado
            $this->info('📋 Configurando SQLite para mejor rendimiento...');
            $this->info('🧹 Limpiando estructura HR existente...');
            $this->info('🏗️  Recreando estructura de carpetas...');
            $this->info('👥 Procesando empleados...');
            $this->info('🏢 Creando carpetas de centros y empresas...');
            $this->newLine();

            // Ejecutar seeder con captura de tiempo
            $startTime = microtime(true);
            $seeder->run();
            $endTime = microtime(true);
            $executionTime = round($endTime - $startTime, 2);

            $this->newLine();
            $this->info("✅ Estructura HR recreada exitosamente en {$executionTime} segundos");
            
            // Mostrar estadísticas
            $this->displayStatistics();
            
            return 0;

        } catch (\Exception $e) {
            $this->newLine();
            $this->error('❌ Error durante la recreación: ' . $e->getMessage());
            
            // Mostrar información adicional si es un error de base de datos
            if ($this->isDatabaseLockError($e)) {
                $this->newLine();
                $this->warn('💡 Sugerencias para resolver el error de base de datos bloqueada:');
                $this->line('   • Cierra todas las conexiones a la base de datos');
                $this->line('   • Espera unos segundos e intenta nuevamente');
                $this->line('   • Verifica que no haya procesos Laravel ejecutándose');
                $this->line('   • Considera usar: php artisan queue:restart');
            }
            
            Log::error('Error en comando hr:seed-structure', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return 1;
        }
    }

    /**
     * Verifica los prerrequisitos necesarios para ejecutar el comando
     */
    protected function checkPrerequisites(): bool
    {
        $this->info('🔍 Verificando prerrequisitos...');
        
        try {
            // Verificar usuario Super Admin
            $superAdmin = \App\Models\User::role('Super Admin')->first();
            if (!$superAdmin) {
                $this->error('❌ No se encontró un usuario con rol "Super Admin"');
                $this->line('   Crea un usuario con este rol antes de continuar');
                return false;
            }

            // Verificar niveles de seguridad
            $nivelesSeguridad = \App\Models\NivelSeguridad::count();
            if ($nivelesSeguridad === 0) {
                $this->error('❌ No se encontraron niveles de seguridad');
                $this->line('   Ejecuta: php artisan db:seed --class=NivelSeguridadSeeder');
                return false;
            }

            // Verificar niveles de acceso
            $nivelesAcceso = \App\Models\NivelAcceso::count();
            if ($nivelesAcceso === 0) {
                $this->error('❌ No se encontraron niveles de acceso');
                $this->line('   Ejecuta: php artisan db:seed --class=NivelAccesoSeeder');
                return false;
            }

            // Verificar empleados
            $empleados = \App\Models\Empleado::count();
            if ($empleados === 0) {
                $this->warn('⚠️  No se encontraron empleados - se creará estructura base únicamente');
            }

            $this->info('✅ Prerrequisitos verificados correctamente');
            return true;

        } catch (\Exception $e) {
            $this->error('❌ Error verificando prerrequisitos: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica si un error es debido a bloqueo de base de datos
     */
    protected function isDatabaseLockError(\Exception $e): bool
    {
        $message = strtolower($e->getMessage());
        return strpos($message, 'database is locked') !== false ||
               strpos($message, 'database locked') !== false ||
               strpos($message, 'sqlite busy') !== false;
    }

    /**
     * Muestra estadísticas de la estructura creada
     */
    protected function displayStatistics(): void
    {
        $this->newLine();
        $this->info('📊 Estadísticas de la estructura creada:');
        
        try {
            // Contar carpetas HR
            $totalCarpetas = \App\Models\Folder::where('path', 'LIKE', 'hr%')
                ->carpetas() // Usar el scope de carpetas
                ->count();
                
            // Contar archivos HR
            $totalArchivos = \App\Models\Folder::where('path', 'LIKE', 'hr%')
                ->archivos() // Usar el scope de archivos
                ->count();
                
            // Contar empleados procesados
            $carpetasEmpleados = \App\Models\Folder::where('path', 'LIKE', 'hr/Empleados/%')
                ->where('path', 'NOT LIKE', 'hr/Empleados/%/%') // Solo nivel directo
                ->count();

            $this->table(
                ['Métrica', 'Cantidad'],
                [
                    ['Total de carpetas', $totalCarpetas],
                    ['Total de archivos', $totalArchivos],
                    ['Carpetas de empleados', $carpetasEmpleados],
                    ['Total de elementos', $totalCarpetas + $totalArchivos]
                ]
            );

        } catch (\Exception $e) {
            $this->warn('No se pudieron obtener las estadísticas: ' . $e->getMessage());
        }
    }
}

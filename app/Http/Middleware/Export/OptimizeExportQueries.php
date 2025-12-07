<?php

namespace App\Http\Middleware\Export;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OptimizeExportQueries
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Solo aplicar optimizaciones para rutas de exportación
        if ($this->isExportRoute($request)) {
            $this->applyDatabaseOptimizations();
        }

        return $next($request);
    }

    /**
     * Verificar si la ruta es de exportación
     *
     * @param Request $request
     * @return bool
     */
    protected function isExportRoute(Request $request): bool
    {
        $path = $request->path();
        return str_contains($path, 'export/empleados');
    }

    /**
     * Aplicar optimizaciones de base de datos para exportaciones
     *
     * @return void
     */
    protected function applyDatabaseOptimizations(): void
    {
        // Estas optimizaciones son específicas para MySQL
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        try {
            // Configurar timeouts más largos para exportaciones
            DB::statement('SET SESSION wait_timeout = 300'); // 5 minutos
            DB::statement('SET SESSION interactive_timeout = 300');
            
            // Configurar buffer pool para optimizar consultas grandes
            DB::statement('SET SESSION innodb_buffer_pool_size = 1073741824'); // 1GB si está disponible
            
            // Deshabilitar autocommit para mejor rendimiento en transacciones grandes
            DB::statement('SET SESSION autocommit = 0');
            
            // Configurar tamaño de paquete para transferencias grandes
            DB::statement('SET SESSION net_buffer_length = 1048576'); // 1MB
            
            // Configurar timeout de lectura para consultas largas
            DB::statement('SET SESSION net_read_timeout = 300');
            
            // Configurar timeout de escritura para consultas largas
            DB::statement('SET SESSION net_write_timeout = 300');
            
            // Optimizar para consultas de solo lectura
            DB::statement('SET SESSION transaction_isolation = "READ-COMMITTED"');
            
        } catch (\Exception $e) {
            // Silently fail if optimizations cannot be applied
        }
    }

    /**
     * Restaurar configuraciones después de la exportación
     *
     * @param Request $request
     * @param mixed $response
     * @return void
     */
    public function terminate($request, $response): void
    {
        if ($this->isExportRoute($request)) {
            // Solo restaurar si el driver es MySQL
            if (DB::connection()->getDriverName() !== 'mysql') {
                return;
            }

            try {
                // Restaurar configuraciones por defecto
                DB::statement('SET SESSION autocommit = 1');
                
            } catch (\Exception $e) {
                // Silently fail if restoration cannot be completed
            }
        }
    }
} 
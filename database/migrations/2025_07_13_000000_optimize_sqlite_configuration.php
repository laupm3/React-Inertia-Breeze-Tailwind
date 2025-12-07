<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Solo ejecutar si la base de datos es SQLite
        if (DB::connection()->getDriverName() === 'sqlite') {
            $this->optimizeSQLiteConfiguration();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Solo ejecutar si la base de datos es SQLite
        if (DB::connection()->getDriverName() === 'sqlite') {
            $this->resetSQLiteConfiguration();
        }
    }

    /**
     * Optimiza la configuración de SQLite para mejor rendimiento
     */
    protected function optimizeSQLiteConfiguration(): void
    {
        try {
            // Configurar timeout para bloqueos
            DB::unprepared('PRAGMA busy_timeout = 30000;');
            
            // Configurar modo WAL para mejor concurrencia
            DB::unprepared('PRAGMA journal_mode = WAL;');
            
            // Configurar sincronización para mejor rendimiento
            DB::unprepared('PRAGMA synchronous = NORMAL;');
            
            // Aumentar cache para mejor rendimiento
            DB::unprepared('PRAGMA cache_size = 10000;');
            
            // Almacenar temporales en memoria
            DB::unprepared('PRAGMA temp_store = MEMORY;');
            
            // Configurar checkpoint automático
            DB::unprepared('PRAGMA wal_autocheckpoint = 1000;');
            
            echo "SQLite optimizado exitosamente\n";
        } catch (\Exception $e) {
            echo "Error optimizando SQLite: " . $e->getMessage() . "\n";
        }
    }

    /**
     * Resetea la configuración de SQLite a valores por defecto
     */
    protected function resetSQLiteConfiguration(): void
    {
        try {
            // Resetear a valores por defecto
            DB::unprepared('PRAGMA busy_timeout = 0;');
            DB::unprepared('PRAGMA journal_mode = DELETE;');
            DB::unprepared('PRAGMA synchronous = FULL;');
            DB::unprepared('PRAGMA cache_size = 2000;');
            DB::unprepared('PRAGMA temp_store = DEFAULT;');
            DB::unprepared('PRAGMA wal_autocheckpoint = 1000;');
            
            echo "SQLite resetado a configuración por defecto\n";
        } catch (\Exception $e) {
            echo "Error reseteando SQLite: " . $e->getMessage() . "\n";
        }
    }
};

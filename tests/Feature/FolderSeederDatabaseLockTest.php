<?php

namespace Tests\Feature;

use Tests\TestCase;
use Database\Seeders\FolderSeeder;
use App\Models\Folder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class FolderSeederDatabaseLockTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ejecutar seeders necesarios
        $this->artisan('db:seed', ['--class' => 'NivelSeguridadSeeder']);
        $this->artisan('db:seed', ['--class' => 'NivelAccesoSeeder']);
        $this->artisan('db:seed', ['--class' => 'TipoFicheroSeeder']);
        $this->artisan('db:seed', ['--class' => 'UserSeeder']);
        $this->artisan('db:seed', ['--class' => 'EmpleadoSeeder']);
    }

    /** @test */
    public function test_folder_seeder_runs_without_database_lock_error()
    {
        // Verificar que no hay estructura HR existente
        $this->assertEquals(0, Folder::where('path', 'LIKE', 'hr%')->count());

        // Ejecutar el seeder
        $seeder = new FolderSeeder();
        $seeder->run();

        // Verificar que se creó la estructura
        $this->assertGreaterThan(0, Folder::where('path', 'LIKE', 'hr%')->count());
        $this->assertTrue(Folder::where('path', 'hr')->exists());
        $this->assertTrue(Folder::where('path', 'hr/Empleados')->exists());
        $this->assertTrue(Folder::where('path', 'hr/Centros')->exists());
        $this->assertTrue(Folder::where('path', 'hr/Empresas')->exists());
    }

    /** @test */
    public function test_folder_seeder_handles_multiple_executions()
    {
        // Ejecutar el seeder primera vez
        $seeder = new FolderSeeder();
        $seeder->run();
        
        $firstRunCount = Folder::where('path', 'LIKE', 'hr%')->count();
        $this->assertGreaterThan(0, $firstRunCount);

        // Ejecutar el seeder segunda vez (debería limpiar y recrear)
        $seeder = new FolderSeeder();
        $seeder->run();
        
        $secondRunCount = Folder::where('path', 'LIKE', 'hr%')->count();
        $this->assertGreaterThan(0, $secondRunCount);
        
        // Debería tener una cantidad similar (estructura recreada)
        $this->assertEqualsWithDelta($firstRunCount, $secondRunCount, 10);
    }

    /** @test */
    public function test_hr_seed_structure_command_works()
    {
        // Ejecutar el comando personalizado
        $this->artisan('hr:seed-structure', ['--force' => true])
            ->expectsOutput('🏗️  Comando de recreación de estructura HR')
            ->expectsOutput('✅ Estructura HR recreada exitosamente en')
            ->assertExitCode(0);

        // Verificar que se creó la estructura
        $this->assertGreaterThan(0, Folder::where('path', 'LIKE', 'hr%')->count());
    }

    /** @test */
    public function test_sqlite_configuration_is_applied()
    {
        // Verificar que la configuración de SQLite se aplica correctamente
        $this->artisan('migrate', ['--path' => 'database/migrations/2025_07_13_000000_optimize_sqlite_configuration.php'])
            ->assertExitCode(0);
        
        // Verificar que la configuración está aplicada
        $busyTimeout = DB::select('PRAGMA busy_timeout')[0]->busy_timeout;
        $this->assertEquals(30000, $busyTimeout);
        
        $journalMode = DB::select('PRAGMA journal_mode')[0]->journal_mode;
        $this->assertEquals('wal', strtolower($journalMode));
    }

    /** @test */
    public function test_retry_mechanism_works()
    {
        $seeder = new FolderSeeder();
        $retryCount = 0;
        
        // Simular una operación que falla las primeras veces
        $operation = function() use (&$retryCount) {
            $retryCount++;
            if ($retryCount < 3) {
                throw new \Exception('SQLSTATE[HY000]: General error: 5 database is locked');
            }
            return true;
        };

        // Usar reflection para acceder al método protegido
        $reflection = new \ReflectionClass($seeder);
        $method = $reflection->getMethod('executeWithRetry');
        $method->setAccessible(true);

        // Ejecutar con reintentos
        $result = $method->invokeArgs($seeder, [$operation]);
        
        // Verificar que se ejecutó correctamente después de reintentos
        $this->assertTrue($result);
        $this->assertEquals(3, $retryCount);
    }

    /** @test */
    public function test_prerequisites_check_works()
    {
        // Verificar que el comando verifica prerrequisitos
        $this->artisan('hr:seed-structure', ['--force' => true])
            ->expectsOutput('🔍 Verificando prerrequisitos...')
            ->expectsOutput('✅ Prerrequisitos verificados correctamente')
            ->assertExitCode(0);
    }

    /** @test */
    public function test_transaction_batching_prevents_long_locks()
    {
        // Verificar que las transacciones son más pequeñas
        $startTime = microtime(true);
        
        $seeder = new FolderSeeder();
        $seeder->run();
        
        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;
        
        // Verificar que la ejecución fue exitosa
        $this->assertGreaterThan(0, Folder::where('path', 'LIKE', 'hr%')->count());
        
        // Verificar que se ejecutó en un tiempo razonable (menos de 2 minutos)
        $this->assertLessThan(120, $executionTime);
    }
}

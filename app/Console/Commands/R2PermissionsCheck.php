<?php

namespace App\Console\Commands;

use App\Services\Storage\R2DiagnosticService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Aws\S3\S3Client;
use Aws\S3\Exception\S3Exception;

class R2PermissionsCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'r2:permissions 
                            {--detailed : Mostrar información detallada de permisos}
                            {--test-delete : Probar operación de eliminación con archivo temporal}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica específicamente los permisos de eliminación en R2 Cloudflare';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔐 Verificando permisos de R2 Cloudflare...');
        $this->newLine();

        $disk = Storage::disk(config('filesystems.default'));
        $bucket = config('filesystems.disks.r2_cloudfare.bucket');

        // Información básica
        $this->line("Bucket: {$bucket}");
        $this->line("Disco: " . config('filesystems.default'));
        $this->line("Entorno: " . app()->environment());
        $this->newLine();

        // Verificar configuración
        if (!$this->checkConfiguration()) {
            return 1;
        }

        // Crear cliente S3 directo
        try {
            $s3Client = $this->createS3Client();
            $this->info('✅ Cliente S3 creado exitosamente');
        } catch (\Exception $e) {
            $this->error('❌ Error creando cliente S3: ' . $e->getMessage());
            return 1;
        }

        // Verificar permisos específicos
        $this->checkSpecificPermissions($s3Client, $bucket);

        // Prueba de eliminación si se solicita
        if ($this->option('test-delete')) {
            $this->newLine();
            $this->warn('🧪 Probando operación de eliminación...');
            $this->testDeleteOperation($disk);
        }

        return 0;
    }

    /**
     * Verifica la configuración básica
     */
    protected function checkConfiguration(): bool
    {
        $config = config('filesystems.disks.r2_cloudfare');
        
        $this->comment('--- CONFIGURACIÓN ---');
        
        $issues = [];
        
        if (empty($config['key'])) {
            $issues[] = 'AWS_ACCESS_KEY_ID no configurado';
        } else {
            $this->info('✅ Access Key configurado');
        }
        
        if (empty($config['secret'])) {
            $issues[] = 'AWS_SECRET_ACCESS_KEY no configurado';
        } else {
            $this->info('✅ Secret Key configurado');
        }
        
        if (empty($config['bucket'])) {
            $issues[] = 'AWS_BUCKET no configurado';
        } else {
            $this->info('✅ Bucket configurado: ' . $config['bucket']);
        }
        
        if (empty($config['endpoint'])) {
            $issues[] = 'AWS_ENDPOINT no configurado';
        } else {
            $this->info('✅ Endpoint configurado: ' . $config['endpoint']);
        }
        
        if (!empty($issues)) {
            $this->newLine();
            $this->error('❌ Problemas de configuración encontrados:');
            foreach ($issues as $issue) {
                $this->error("   - {$issue}");
            }
            return false;
        }
        
        $this->newLine();
        return true;
    }

    /**
     * Crea el cliente S3
     */
    protected function createS3Client(): S3Client
    {
        $config = config('filesystems.disks.r2_cloudfare');

        return new S3Client([
            'credentials' => [
                'key' => $config['key'],
                'secret' => $config['secret'],
            ],
            'region' => $config['region'],
            'version' => 'latest',
            'endpoint' => $config['endpoint'],
            'use_path_style_endpoint' => $config['use_path_style_endpoint'] ?? true,
            'http' => [
                'verify' => $config['http']['verify'] ?? false
            ]
        ]);
    }

    /**
     * Verifica permisos específicos
     */
    protected function checkSpecificPermissions(S3Client $s3Client, string $bucket): void
    {
        $this->comment('--- PERMISOS ESPECÍFICOS ---');
        
        $permissions = [
            'ListBucket' => function() use ($s3Client, $bucket) {
                return $s3Client->listObjectsV2([
                    'Bucket' => $bucket,
                    'MaxKeys' => 1
                ]);
            },
            'GetObject' => function() use ($s3Client, $bucket) {
                // Intentar obtener un objeto que probablemente no existe
                try {
                    $s3Client->headObject([
                        'Bucket' => $bucket,
                        'Key' => 'test-permission-check.txt'
                    ]);
                } catch (S3Exception $e) {
                    if ($e->getStatusCode() === 404) {
                        // 404 es esperado, significa que tenemos permiso GET
                        return ['status' => 'ok', 'message' => 'Permiso GET confirmado (404 esperado)'];
                    }
                    throw $e;
                }
                return ['status' => 'ok', 'message' => 'Permiso GET confirmado'];
            },
            'PutObject' => function() use ($s3Client, $bucket) {
                $testKey = 'permission-test-' . time() . '.txt';
                return $s3Client->putObject([
                    'Bucket' => $bucket,
                    'Key' => $testKey,
                    'Body' => 'Test permission check',
                    'Metadata' => [
                        'test' => 'permission-check',
                        'created-at' => now()->toIsoString()
                    ]
                ]);
            },
            'DeleteObject' => function() use ($s3Client, $bucket) {
                // Buscar el archivo que acabamos de crear
                $testKey = null;
                $listResult = $s3Client->listObjectsV2([
                    'Bucket' => $bucket,
                    'Prefix' => 'permission-test-',
                    'MaxKeys' => 1
                ]);
                
                if (!empty($listResult['Contents'])) {
                    $testKey = $listResult['Contents'][0]['Key'];
                    
                    return $s3Client->deleteObject([
                        'Bucket' => $bucket,
                        'Key' => $testKey
                    ]);
                }
                
                throw new \Exception('No se encontró archivo de prueba para eliminar');
            }
        ];

        foreach ($permissions as $permissionName => $test) {
            try {
                $result = $test();
                
                if (is_array($result) && isset($result['status'])) {
                    $this->info("✅ {$permissionName}: " . $result['message']);
                } else {
                    $statusCode = $result['@metadata']['statusCode'] ?? 'unknown';
                    $this->info("✅ {$permissionName}: OK (HTTP {$statusCode})");
                }
                
            } catch (S3Exception $e) {
                $errorCode = $e->getAwsErrorCode();
                $statusCode = $e->getStatusCode();
                
                if (in_array($errorCode, ['AccessDenied', 'Forbidden'])) {
                    $this->error("❌ {$permissionName}: ACCESO DENEGADO ({$errorCode})");
                } else {
                    $this->warn("⚠️  {$permissionName}: Error inesperado - {$errorCode} (HTTP {$statusCode})");
                }
                
                if ($this->option('detailed')) {
                    $this->line("   Mensaje: " . $e->getAwsErrorMessage());
                }
                
            } catch (\Exception $e) {
                $this->error("❌ {$permissionName}: Error - " . $e->getMessage());
            }
        }
    }

    /**
     * Prueba específica de operación de eliminación
     */
    protected function testDeleteOperation($disk): void
    {
        $this->comment('--- PRUEBA DE ELIMINACIÓN ---');
        
        $testKey = 'diagnostic/delete-test-' . time() . '.txt';
        $testContent = 'Archivo de prueba para eliminación - ' . now()->toIsoString();
        
        try {
            // 1. Crear archivo
            $this->line("1. Creando archivo: {$testKey}");
            $putResult = $disk->put($testKey, $testContent);
            
            if (!$putResult) {
                $this->error('❌ No se pudo crear el archivo de prueba');
                return;
            }
            
            $this->info('✅ Archivo creado');
            
            // 2. Verificar que existe
            $this->line('2. Verificando existencia...');
            if (!$disk->exists($testKey)) {
                $this->error('❌ El archivo no se encuentra después de crearlo');
                return;
            }
            
            $this->info('✅ Archivo confirmado');
            
            // 3. Intentar eliminación
            $this->line('3. Intentando eliminación...');
            $deleteResult = $disk->delete($testKey);
            
            if ($deleteResult) {
                $this->info('✅ Comando delete() devolvió true');
                
                // 4. Verificar eliminación real
                $this->line('4. Verificando eliminación...');
                sleep(2); // Dar tiempo para propagación
                
                if ($disk->exists($testKey)) {
                    $this->error('❌ PROBLEMA DETECTADO: El archivo aún existe después del delete()');
                    $this->error('   Esto indica un problema de permisos o propagación en R2');
                    
                    // Intentar eliminación manual
                    $this->warn('   Intentando eliminación con cliente S3 directo...');
                    
                    try {
                        $s3Client = $this->createS3Client();
                        $bucket = config('filesystems.disks.r2_cloudfare.bucket');
                        
                        $directDeleteResult = $s3Client->deleteObject([
                            'Bucket' => $bucket,
                            'Key' => $testKey
                        ]);
                        
                        $statusCode = $directDeleteResult['@metadata']['statusCode'];
                        $this->info("   Cliente directo HTTP: {$statusCode}");
                        
                        // Verificar nuevamente
                        sleep(1);
                        if (!$disk->exists($testKey)) {
                            $this->info('   ✅ Eliminación exitosa con cliente directo');
                        } else {
                            $this->error('   ❌ Aún existe incluso con cliente directo');
                        }
                        
                    } catch (\Exception $e) {
                        $this->error('   ❌ Error con cliente directo: ' . $e->getMessage());
                    }
                } else {
                    $this->info('✅ Archivo eliminado correctamente');
                }
            } else {
                $this->error('❌ Comando delete() devolvió false');
                $this->error('   Esto indica un problema directo de permisos');
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Error durante la prueba: ' . $e->getMessage());
            
            // Intentar limpiar
            try {
                if ($disk->exists($testKey)) {
                    $disk->delete($testKey);
                }
            } catch (\Exception $cleanupError) {
                $this->warn('⚠️  No se pudo limpiar archivo de prueba');
            }
        }
    }
}

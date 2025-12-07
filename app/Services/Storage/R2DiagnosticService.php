<?php

namespace App\Services\Storage;

use App\Models\Folder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Aws\S3\Exception\S3Exception;
use Aws\S3\S3Client;
use Illuminate\Support\Collection;

/**
 * Servicio de diagnóstico para R2 Cloudflare
 * 
 * Permite realizar pruebas exhaustivas de conectividad, permisos y operaciones
 * para detectar problemas en producción con R2 Cloudflare.
 */
class R2DiagnosticService
{
    protected \Illuminate\Contracts\Filesystem\Filesystem $disk;
    protected string $bucket;
    protected ?S3Client $s3Client = null;
    protected array $diagnosticResults = [];

    public function __construct()
    {
        $this->disk = Storage::disk(config('filesystems.default'));
        $this->bucket = config('filesystems.disks.r2_cloudfare.bucket');
    }

    /**
     * Obtener cliente S3 directo
     */
    protected function getS3Client(): S3Client
    {
        if ($this->s3Client === null) {
            $config = config('filesystems.disks.r2_cloudfare');

            $this->s3Client = new S3Client([
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

        return $this->s3Client;
    }

    /**
     * Ejecuta diagnóstico completo de R2 Cloudflare
     */
    public function runFullDiagnostic(): array
    {
        $this->diagnosticResults = [];

        $this->addResult('=== DIAGNÓSTICO R2 CLOUDFLARE ===');
        $this->addResult('Fecha: ' . now()->format('Y-m-d H:i:s'));
        $this->addResult('Entorno: ' . app()->environment());
        
        // 1. Verificar configuración
        $this->testConfiguration();
        
        // 2. Verificar conectividad
        $this->testConnectivity();
        
        // 3. Verificar permisos del bucket
        $this->testBucketPermissions();
        
        // 4. Pruebas de operaciones CRUD
        $this->testCrudOperations();
        
        // 5. Pruebas específicas de eliminación (el problema reportado)
        $this->testDeleteOperations();
        
        // 6. Verificar estructura plana
        $this->testFlatStructure();
        
        // 7. Pruebas de papelera
        $this->testTrashOperations();

        return $this->diagnosticResults;
    }

    /**
     * Verifica la configuración de R2
     */
    public function testConfiguration(): void
    {
        $this->addResult("\n--- CONFIGURACIÓN ---");
        
        $config = config('filesystems.disks.r2_cloudfare');
        
        $this->addResult("Disco por defecto: " . config('filesystems.default'));
        $this->addResult("Bucket: " . ($this->bucket ?: 'NO CONFIGURADO'));
        $this->addResult("Región: " . ($config['region'] ?? 'NO CONFIGURADO'));
        $this->addResult("Endpoint: " . ($config['endpoint'] ?? 'NO CONFIGURADO'));
        $this->addResult("Use path style: " . ($config['use_path_style_endpoint'] ? 'true' : 'false'));
        $this->addResult("SSL Verify: " . ($config['http']['verify'] ? 'true' : 'false'));
        
        // Verificar que las credenciales estén configuradas (sin mostrarlas)
        $this->addResult("Access Key configurado: " . (!empty($config['key']) ? 'SÍ' : 'NO'));
        $this->addResult("Secret Key configurado: " . (!empty($config['secret']) ? 'SÍ' : 'NO'));
        
        if (empty($config['key']) || empty($config['secret'])) {
            $this->addResult("❌ ERROR: Credenciales AWS no configuradas");
        }
    }

    /**
     * Prueba la conectividad básica con R2
     */
    public function testConnectivity(): void
    {
        $this->addResult("\n--- CONECTIVIDAD ---");
        
        try {
            $s3Client = $this->getS3Client();
            
            // Ping básico al servicio
            $result = $s3Client->headBucket(['Bucket' => $this->bucket]);
            $this->addResult("✅ Conectividad con R2: OK");
            $this->addResult("HTTP Status: " . $result['@metadata']['statusCode']);
            
        } catch (S3Exception $e) {
            $this->addResult("❌ Error de conectividad:");
            $this->addResult("   Código: " . $e->getAwsErrorCode());
            $this->addResult("   Mensaje: " . $e->getAwsErrorMessage());
            $this->addResult("   HTTP Status: " . $e->getStatusCode());
        } catch (\Exception $e) {
            $this->addResult("❌ Error general de conectividad:");
            $this->addResult("   " . $e->getMessage());
        }
    }

    /**
     * Verifica permisos del bucket
     */
    public function testBucketPermissions(): void
    {
        $this->addResult("\n--- PERMISOS DEL BUCKET ---");
        
        try {
            $s3Client = $this->getS3Client();
            
            // Listar objetos (permiso de lectura)
            try {
                $result = $s3Client->listObjectsV2([
                    'Bucket' => $this->bucket,
                    'MaxKeys' => 1
                ]);
                $this->addResult("✅ Permiso LIST: OK");
            } catch (S3Exception $e) {
                $this->addResult("❌ Permiso LIST: FALLO");
                $this->addResult("   " . $e->getAwsErrorMessage());
            }
            
            // Verificar permisos específicos usando ACL
            try {
                $result = $s3Client->getBucketAcl(['Bucket' => $this->bucket]);
                $this->addResult("✅ Permiso GET_ACL: OK");
            } catch (S3Exception $e) {
                $this->addResult("⚠️  Permiso GET_ACL: LIMITADO (puede ser normal en R2)");
            }
            
        } catch (\Exception $e) {
            $this->addResult("❌ Error verificando permisos:");
            $this->addResult("   " . $e->getMessage());
        }
    }

    /**
     * Prueba operaciones CRUD básicas
     */
    public function testCrudOperations(): void
    {
        $this->addResult("\n--- OPERACIONES CRUD ---");
        
        $testKey = 'diagnostic/test-' . time() . '.txt';
        $testContent = 'Prueba de diagnóstico R2 - ' . now()->toIsoString();
        
        try {
            // CREATE (PUT)
            $putResult = $this->disk->put($testKey, $testContent);
            if ($putResult) {
                $this->addResult("✅ CREATE (PUT): OK");
            } else {
                $this->addResult("❌ CREATE (PUT): FALLO");
                return;
            }
            
            // READ (GET)
            $content = $this->disk->get($testKey);
            if ($content === $testContent) {
                $this->addResult("✅ READ (GET): OK");
            } else {
                $this->addResult("❌ READ (GET): FALLO - Contenido no coincide");
            }
            
            // EXISTS
            if ($this->disk->exists($testKey)) {
                $this->addResult("✅ EXISTS: OK");
            } else {
                $this->addResult("❌ EXISTS: FALLO");
            }
            
            // SIZE
            $size = $this->disk->size($testKey);
            if ($size > 0) {
                $this->addResult("✅ SIZE: OK ($size bytes)");
            } else {
                $this->addResult("❌ SIZE: FALLO");
            }
            
            // DELETE
            $deleteResult = $this->disk->delete($testKey);
            if ($deleteResult) {
                $this->addResult("✅ DELETE: OK");
                
                // Verificar que realmente se eliminó
                if (!$this->disk->exists($testKey)) {
                    $this->addResult("✅ DELETE VERIFICADO: El archivo ya no existe");
                } else {
                    $this->addResult("⚠️  DELETE PARCIAL: El comando devolvió true pero el archivo aún existe");
                }
            } else {
                $this->addResult("❌ DELETE: FALLO");
            }
            
        } catch (\Exception $e) {
            $this->addResult("❌ Error en operaciones CRUD:");
            $this->addResult("   " . $e->getMessage());
            
            // Limpiar el archivo de prueba si existe
            try {
                if ($this->disk->exists($testKey)) {
                    $this->disk->delete($testKey);
                    $this->addResult("🧹 Archivo de prueba limpiado");
                }
            } catch (\Exception $cleanupError) {
                $this->addResult("⚠️  No se pudo limpiar el archivo de prueba: " . $cleanupError->getMessage());
            }
        }
    }

    /**
     * Pruebas específicas de eliminación (problema reportado)
     */
    protected function testDeleteOperations(): void
    {
        $this->addResult("\n--- PRUEBAS ESPECÍFICAS DE ELIMINACIÓN ---");
        
        // Probar diferentes tipos de eliminación
        $testCases = [
            'files/test-file-' . time() . '.txt',
            'folders/test-folder-' . time() . '.directory',
            'trash/files/test-trash-file-' . time() . '.txt',
            'diagnostic/nested/deep/test-' . time() . '.txt'
        ];
        
        foreach ($testCases as $index => $testPath) {
            $this->addResult("\nPrueba eliminación #" . ($index + 1) . ": $testPath");
            
            try {
                // Crear archivo
                $content = "Test content for deletion - " . now()->toIsoString();
                $putResult = $this->disk->put($testPath, $content);
                
                if (!$putResult) {
                    $this->addResult("❌ No se pudo crear el archivo de prueba");
                    continue;
                }
                
                $this->addResult("✅ Archivo creado");
                
                // Verificar que existe
                if (!$this->disk->exists($testPath)) {
                    $this->addResult("❌ El archivo no se encuentra después de crearlo");
                    continue;
                }
                
                // Intentar eliminación
                $deleteResult = $this->disk->delete($testPath);
                
                if ($deleteResult) {
                    $this->addResult("✅ Comando delete devolvió true");
                    
                    // Verificar eliminación real
                    sleep(1); // Dar tiempo para que se propague
                    if ($this->disk->exists($testPath)) {
                        $this->addResult("❌ PROBLEMA: El archivo aún existe después del delete");
                    } else {
                        $this->addResult("✅ Archivo eliminado correctamente");
                    }
                } else {
                    $this->addResult("❌ Comando delete devolvió false");
                }
                
            } catch (S3Exception $e) {
                $this->addResult("❌ Error S3 en eliminación:");
                $this->addResult("   Código: " . $e->getAwsErrorCode());
                $this->addResult("   Mensaje: " . $e->getAwsErrorMessage());
                $this->addResult("   HTTP Status: " . $e->getStatusCode());
            } catch (\Exception $e) {
                $this->addResult("❌ Error general en eliminación:");
                $this->addResult("   " . $e->getMessage());
            }
        }
    }

    /**
     * Verifica el funcionamiento de la estructura plana por hash
     */
    protected function testFlatStructure(): void
    {
        $this->addResult("\n--- ESTRUCTURA PLANA POR HASH ---");
        
        // Simular archivos con la estructura real del sistema
        $testHash = md5('test-file-' . time());
        $testExtension = 'txt';
        
        $filePath = "files/{$testHash}.{$testExtension}";
        $folderPath = "folders/{$testHash}.directory";
        
        try {
            // Probar archivo
            $this->addResult("Probando estructura de archivo: $filePath");
            $this->disk->put($filePath, 'Test file content');
            
            if ($this->disk->exists($filePath)) {
                $this->addResult("✅ Archivo en estructura plana: OK");
                $this->disk->delete($filePath);
            } else {
                $this->addResult("❌ Archivo en estructura plana: FALLO");
            }
            
            // Probar carpeta (marcador)
            $this->addResult("Probando estructura de carpeta: $folderPath");
            $this->disk->put($folderPath, '');
            
            if ($this->disk->exists($folderPath)) {
                $this->addResult("✅ Carpeta en estructura plana: OK");
                $this->disk->delete($folderPath);
            } else {
                $this->addResult("❌ Carpeta en estructura plana: FALLO");
            }
            
        } catch (\Exception $e) {
            $this->addResult("❌ Error en estructura plana:");
            $this->addResult("   " . $e->getMessage());
        }
    }

    /**
     * Prueba operaciones de papelera
     */
    protected function testTrashOperations(): void
    {
        $this->addResult("\n--- OPERACIONES DE PAPELERA ---");
        
        $testHash = md5('trash-test-' . time());
        $originalPath = "files/{$testHash}.txt";
        $trashPath = "trash/files/{$testHash}.txt";
        
        try {
            // Crear archivo original
            $content = 'Test content for trash operations';
            $this->disk->put($originalPath, $content);
            
            if (!$this->disk->exists($originalPath)) {
                $this->addResult("❌ No se pudo crear archivo para prueba de papelera");
                return;
            }
            
            $this->addResult("✅ Archivo original creado");
            
            // Simular movimiento a papelera (GET + PUT + DELETE)
            $originalContent = $this->disk->get($originalPath);
            
            // Mover a papelera con metadata
            $options = [
                'ContentType' => 'text/plain',
                'Metadata' => [
                    'original-path' => $originalPath,
                    'deleted-at' => now()->toIso8601String(),
                    'deleted-by' => '1'
                ]
            ];
            
            $trashPutResult = $this->disk->put($trashPath, $originalContent, $options);
            
            if ($trashPutResult) {
                $this->addResult("✅ Archivo copiado a papelera");
                
                // Eliminar original
                $deleteOriginalResult = $this->disk->delete($originalPath);
                
                if ($deleteOriginalResult) {
                    $this->addResult("✅ Archivo original eliminado");
                    
                    // Verificar que está en papelera
                    if ($this->disk->exists($trashPath)) {
                        $this->addResult("✅ Archivo confirmado en papelera");
                        
                        // Limpiar papelera
                        $this->disk->delete($trashPath);
                        $this->addResult("🧹 Papelera limpiada");
                    } else {
                        $this->addResult("❌ Archivo no encontrado en papelera");
                    }
                } else {
                    $this->addResult("❌ No se pudo eliminar archivo original");
                }
            } else {
                $this->addResult("❌ No se pudo copiar archivo a papelera");
            }
            
        } catch (\Exception $e) {
            $this->addResult("❌ Error en operaciones de papelera:");
            $this->addResult("   " . $e->getMessage());
            
            // Limpiar archivos de prueba
            try {
                $this->disk->delete($originalPath);
                $this->disk->delete($trashPath);
            } catch (\Exception $cleanupError) {
                // Ignorar errores de limpieza
            }
        }
    }

    /**
     * Prueba con un registro real de la base de datos
     */
    public function testWithRealFolder(int $folderId): array
    {
        $this->diagnosticResults = [];
        
        $folder = Folder::find($folderId);
        
        if (!$folder) {
            $this->addResult("❌ Folder con ID $folderId no encontrado");
            return $this->diagnosticResults;
        }
        
        $this->addResult("=== PRUEBA CON REGISTRO REAL ===");
        $this->addResult("ID: $folder->id");
        $this->addResult("Nombre: $folder->name");
        $this->addResult("Hash: $folder->hash");
        $this->addResult("Tipo: " . ($folder->esCarpeta() ? 'Carpeta' : 'Archivo'));
        $this->addResult("Extensión: " . ($folder->extension ?? 'N/A'));
        
        $physicalPath = $folder->esCarpeta() ? 
            "folders/{$folder->hash}.directory" : 
            "files/{$folder->hash}.{$folder->extension}";
            
        $this->addResult("Ruta física: $physicalPath");
        
        try {
            // Verificar existencia
            if ($this->disk->exists($physicalPath)) {
                $this->addResult("✅ El archivo/carpeta existe en R2");
                
                // Obtener metadata
                try {
                    $size = $this->disk->size($physicalPath);
                    $this->addResult("Tamaño: $size bytes");
                } catch (\Exception $e) {
                    $this->addResult("⚠️  No se pudo obtener el tamaño: " . $e->getMessage());
                }
                
                // Probar eliminación (¡CUIDADO!)
                $this->addResult("\n⚠️  ATENCIÓN: Esta prueba eliminará el archivo real");
                $this->addResult("Si continúas, el archivo se eliminará permanentemente");
                
            } else {
                $this->addResult("❌ El archivo/carpeta NO existe en R2");
                $this->addResult("Esto podría indicar:");
                $this->addResult("- El archivo nunca se subió a R2");
                $this->addResult("- Ya fue eliminado de R2");
                $this->addResult("- Hay un problema con la estructura de rutas");
            }
            
        } catch (\Exception $e) {
            $this->addResult("❌ Error verificando archivo real:");
            $this->addResult("   " . $e->getMessage());
        }
        
        return $this->diagnosticResults;
    }

    /**
     * Fuerza la eliminación de un archivo usando el cliente S3 directo
     */
    public function forceDeleteTest(string $path): array
    {
        $this->diagnosticResults = [];
        
        $this->addResult("=== ELIMINACIÓN FORZADA ===");
        $this->addResult("Ruta: $path");
        
        try {
            $s3Client = $this->getS3Client();
            
            // Verificar que existe primero
            try {
                $s3Client->headObject([
                    'Bucket' => $this->bucket,
                    'Key' => $path
                ]);
                $this->addResult("✅ Objeto confirmado que existe");
            } catch (S3Exception $e) {
                if ($e->getStatusCode() === 404) {
                    $this->addResult("❌ Objeto no existe");
                    return $this->diagnosticResults;
                }
                throw $e;
            }
            
            // Eliminación directa con cliente S3
            $result = $s3Client->deleteObject([
                'Bucket' => $this->bucket,
                'Key' => $path
            ]);
            
            $this->addResult("✅ Comando deleteObject ejecutado");
            $this->addResult("HTTP Status: " . $result['@metadata']['statusCode']);
            
            // Verificar eliminación
            sleep(1);
            try {
                $s3Client->headObject([
                    'Bucket' => $this->bucket,
                    'Key' => $path
                ]);
                $this->addResult("❌ PROBLEMA: El objeto aún existe después del deleteObject");
            } catch (S3Exception $e) {
                if ($e->getStatusCode() === 404) {
                    $this->addResult("✅ Objeto eliminado exitosamente");
                } else {
                    $this->addResult("⚠️  Error verificando eliminación: " . $e->getAwsErrorMessage());
                }
            }
            
        } catch (S3Exception $e) {
            $this->addResult("❌ Error S3 en eliminación forzada:");
            $this->addResult("   Código: " . $e->getAwsErrorCode());
            $this->addResult("   Mensaje: " . $e->getAwsErrorMessage());
            $this->addResult("   HTTP Status: " . $e->getStatusCode());
        } catch (\Exception $e) {
            $this->addResult("❌ Error general:");
            $this->addResult("   " . $e->getMessage());
        }
        
        return $this->diagnosticResults;
    }

    /**
     * Agrega un resultado al array de diagnósticos
     */
    protected function addResult(string $message): void
    {
        $this->diagnosticResults[] = $message;
    }

    /**
     * Obtiene todos los resultados como string
     */
    public function getResultsAsString(): string
    {
        return implode("\n", $this->diagnosticResults);
    }

    /**
     * Guarda los resultados en un archivo de log
     */
    public function saveResultsToLog(?string $filename = null): string
    {
        $filename = $filename ?? 'r2-diagnostic-' . now()->format('Y-m-d-H-i-s') . '.log';
        $logPath = storage_path("logs/{$filename}");
        
        file_put_contents($logPath, $this->getResultsAsString());
        
        return $logPath;
    }
}

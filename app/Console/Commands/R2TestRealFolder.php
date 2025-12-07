<?php

namespace App\Console\Commands;

use App\Models\Folder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Aws\S3\S3Client;
use Aws\S3\Exception\S3Exception;

class R2TestRealFolder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'r2:test-folder 
                            {folder-id : ID del folder a probar}
                            {--dry-run : Solo verificar, no eliminar}
                            {--force : Forzar eliminación sin confirmación}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba operaciones de R2 con un folder real de la base de datos';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $folderId = $this->argument('folder-id');
        $folder = Folder::find($folderId);

        if (!$folder) {
            $this->error("❌ Folder con ID {$folderId} no encontrado");
            return 1;
        }

        $this->info("🔍 Analizando Folder ID: {$folderId}");
        $this->newLine();

        // Mostrar información del folder
        $this->displayFolderInfo($folder);

        // Verificar existencia en R2
        $exists = $this->checkR2Existence($folder);

        if (!$exists) {
            $this->warn('El archivo/carpeta no existe en R2. No hay nada que probar.');
            return 0;
        }

        // Mostrar rutas físicas
        $this->displayPhysicalPaths($folder);

        // Si es dry-run, no continuar
        if ($this->option('dry-run')) {
            $this->info('🔍 Modo dry-run activado. No se realizarán modificaciones.');
            return 0;
        }

        // Probar eliminación
        return $this->testDeletion($folder);
    }

    /**
     * Muestra información del folder
     */
    protected function displayFolderInfo(Folder $folder): void
    {
        $this->comment('--- INFORMACIÓN DEL FOLDER ---');
        $this->line("ID: {$folder->id}");
        $this->line("Nombre: {$folder->name}");
        $this->line("Tipo: " . ($folder->esCarpeta() ? 'Carpeta' : 'Archivo'));
        $this->line("Hash: {$folder->hash}");
        $this->line("Extensión: " . ($folder->extension ?? 'N/A'));
        $this->line("Tamaño: " . ($folder->size ?? 'N/A') . ' bytes');
        $this->line("Ruta: {$folder->path}");
        $this->line("Usuario propietario: " . ($folder->user_id ?? 'N/A'));
        $this->line("Creado: " . $folder->created_at);
        $this->line("Actualizado: " . $folder->updated_at);
        $this->newLine();
    }

    /**
     * Verifica si existe en R2
     */
    protected function checkR2Existence(Folder $folder): bool
    {
        $this->comment('--- VERIFICACIÓN EN R2 ---');
        
        $disk = Storage::disk(config('filesystems.default'));
        $physicalPath = $this->getPhysicalPath($folder);
        
        try {
            $exists = $disk->exists($physicalPath);
            
            if ($exists) {
                $this->info("✅ Existe en R2: {$physicalPath}");
                
                // Obtener información adicional
                try {
                    $size = $disk->size($physicalPath);
                    $this->line("Tamaño en R2: {$size} bytes");
                    
                    if ($folder->size && $folder->size != $size) {
                        $this->warn("⚠️  Discrepancia de tamaño: DB={$folder->size}, R2={$size}");
                    }
                } catch (\Exception $e) {
                    $this->warn("⚠️  No se pudo obtener el tamaño: " . $e->getMessage());
                }
                
                return true;
            } else {
                $this->warn("❌ NO existe en R2: {$physicalPath}");
                return false;
            }
            
        } catch (\Exception $e) {
            $this->error("❌ Error verificando existencia: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Muestra las rutas físicas
     */
    protected function displayPhysicalPaths(Folder $folder): void
    {
        $this->comment('--- RUTAS FÍSICAS ---');
        
        $physicalPath = $this->getPhysicalPath($folder);
        $trashPath = $this->getPhysicalTrashPath($folder);
        
        $this->line("Ruta actual: {$physicalPath}");
        $this->line("Ruta papelera: {$trashPath}");
        $this->newLine();
    }

    /**
     * Prueba la eliminación
     */
    protected function testDeletion(Folder $folder): int
    {
        $this->comment('--- PRUEBA DE ELIMINACIÓN ---');
        
        if (!$this->option('force')) {
            $this->warn('🚨 ATENCIÓN: Esta operación eliminará permanentemente el archivo de R2');
            $this->warn('El registro en la base de datos NO se eliminará.');
            $this->newLine();
            
            if (!$this->confirm('¿Continuar con la eliminación?')) {
                $this->info('Operación cancelada');
                return 0;
            }
        }

        $disk = Storage::disk(config('filesystems.default'));
        $physicalPath = $this->getPhysicalPath($folder);

        // Método 1: Eliminación con Facade Storage
        $this->line('1. Probando eliminación con Storage facade...');
        
        try {
            $result = $disk->delete($physicalPath);
            
            if ($result) {
                $this->info('✅ Storage::delete() devolvió true');
                
                // Verificar eliminación
                sleep(2);
                if ($disk->exists($physicalPath)) {
                    $this->error('❌ PROBLEMA: El archivo aún existe después del delete()');
                } else {
                    $this->info('✅ Eliminación confirmada con Storage facade');
                    return 0;
                }
            } else {
                $this->error('❌ Storage::delete() devolvió false');
            }
        } catch (\Exception $e) {
            $this->error('❌ Error con Storage facade: ' . $e->getMessage());
        }

        // Método 2: Eliminación directa con cliente S3
        $this->line('2. Probando eliminación con cliente S3 directo...');
        
        try {
            $s3Client = $this->createS3Client();
            $bucket = config('filesystems.disks.r2_cloudfare.bucket');
            
            $result = $s3Client->deleteObject([
                'Bucket' => $bucket,
                'Key' => $physicalPath
            ]);
            
            $statusCode = $result['@metadata']['statusCode'];
            $this->info("Cliente S3 HTTP Status: {$statusCode}");
            
            // Verificar eliminación
            sleep(2);
            if (!$disk->exists($physicalPath)) {
                $this->info('✅ Eliminación exitosa con cliente S3 directo');
                return 0;
            } else {
                $this->error('❌ El archivo aún existe incluso con cliente S3 directo');
            }
            
        } catch (S3Exception $e) {
            $this->error('❌ Error S3: ' . $e->getAwsErrorCode() . ' - ' . $e->getAwsErrorMessage());
        } catch (\Exception $e) {
            $this->error('❌ Error con cliente S3: ' . $e->getMessage());
        }

        // Método 3: Información de debug
        $this->line('3. Información de debug...');
        $this->showDebugInfo($folder, $physicalPath);

        return 1;
    }

    /**
     * Muestra información de debug
     */
    protected function showDebugInfo(Folder $folder, string $physicalPath): void
    {
        try {
            $s3Client = $this->createS3Client();
            $bucket = config('filesystems.disks.r2_cloudfare.bucket');
            
            // Obtener metadata del objeto
            $this->line('Obteniendo metadata del objeto...');
            
            $headResult = $s3Client->headObject([
                'Bucket' => $bucket,
                'Key' => $physicalPath
            ]);
            
            $this->line('Metadata encontrada:');
            foreach ($headResult['Metadata'] ?? [] as $key => $value) {
                $this->line("  {$key}: {$value}");
            }
            
            $this->line('Headers importantes:');
            $this->line('  ETag: ' . ($headResult['ETag'] ?? 'N/A'));
            $this->line('  ContentLength: ' . ($headResult['ContentLength'] ?? 'N/A'));
            $this->line('  LastModified: ' . ($headResult['LastModified'] ?? 'N/A'));
            $this->line('  StorageClass: ' . ($headResult['StorageClass'] ?? 'N/A'));
            
        } catch (S3Exception $e) {
            $this->error('Error obteniendo metadata: ' . $e->getAwsErrorMessage());
        }
    }

    /**
     * Obtiene la ruta física del folder
     */
    protected function getPhysicalPath(Folder $folder): string
    {
        if ($folder->esCarpeta()) {
            return "folders/{$folder->hash}.directory";
        } else {
            return "files/{$folder->hash}.{$folder->extension}";
        }
    }

    /**
     * Obtiene la ruta física en papelera
     */
    protected function getPhysicalTrashPath(Folder $folder): string
    {
        if ($folder->esCarpeta()) {
            return "trash/folders/{$folder->hash}.directory";
        } else {
            return "trash/files/{$folder->hash}.{$folder->extension}";
        }
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
}

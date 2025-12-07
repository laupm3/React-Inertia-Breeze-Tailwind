<?php

namespace App\Services\Storage;

use App\Models\Folder;
use App\Interfaces\FileStorageInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Aws\S3\Exception\S3Exception;
use Aws\S3\S3Client;

/**
 * Implementación del almacenamiento de archivos en Amazon S3
 */
class S3FileStorage implements FileStorageInterface
{
    /**
     * Instancia del disco S3
     */
    protected \Illuminate\Contracts\Filesystem\Filesystem $disk;
    /**
     * Nombre del bucket S3
     */
    protected string $bucket;
    /**
     * Cliente S3 para operaciones directas
     */
    protected ?S3Client $s3Client = null;

    /**
     * Límite máximo de objetos por operación batch
     */
    const MAX_BATCH_DELETE_SIZE = 1000;

    public function __construct()
    {
        $this->disk = Storage::disk(config('filesystems.default'));
        $this->bucket = config('filesystems.disks.r2_cloudfare.bucket');
    }

    /**
     * Obtener cliente S3 directo solo cuando sea necesario
     * 
     * @return S3Client
     */
    protected function getS3Client(): S3Client
    {
        if ($this->s3Client === null) {
            // Crear cliente S3 usando la configuración de Laravel
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
            ]);
        }

        return $this->s3Client;
    }

    /**
     * Convierte un objeto Folder en una clave S3
     * 
     * @param Folder $folder
     * @return string
     */
    public function getPhysicalPath(Folder $folder): string
    {
        return $folder->esCarpeta() ?
            $this->getPhysicalDirectoryPath($folder) :
            $this->getPhysicalFilePath($folder);
    }

    /**
     * Rutas para papelera en S3
     * 
     * @param Folder $folder
     * @return string
     */
    public function getPhysicalTrashPath(Folder $folder): string
    {
        return $folder->esCarpeta() ?
            $this->getPhysicalDirectoryTrashPath($folder) :
            $this->getPhysicalFileTrashPath($folder);
    }

    /**
     * Clave S3 para carpetas (estructura plana)
     * 
     * @param Folder $folder
     * @return string
     */
    public function getPhysicalDirectoryPath(Folder $folder): string
    {
        // ✅ Cambiar de jerárquica a plana
        return 'folders/' . $folder->hash . '.directory';
    }

    /**
     * Clave S3 para archivos (ya es plana)
     * 
     * @param Folder $file
     * @return string
     */
    protected function getPhysicalFilePath(Folder $file): string
    {
        return 'files/' . $file->hash . '.' . $file->extension;
    }

    /**
     * Clave S3 para carpetas en papelera (estructura plana)
     * 
     * @param Folder $folder
     * @return string
     */
    public function getPhysicalDirectoryTrashPath(Folder $folder): string
    {
        return 'trash/folders/' . $folder->hash . '.directory';
    }

    /**
     * Clave S3 para archivos en papelera (ya es plana)
     * 
     * @param Folder $file
     * @return string
     */
    protected function getPhysicalFileTrashPath(Folder $file): string
    {
        return 'trash/files/' . $file->hash . '.' . $file->extension;
    }

    /**
     * Obtiene la ruta de almacenamiento completa
     * 
     * @param Folder $folder Carpeta o archivo para el que obtener la ruta de almacenamiento
     * @return string Ruta completa en el sistema de archivos
     */
    public function getStoragePath(Folder $folder): string
    {
        return $this->disk->get($this->getPhysicalPath($folder));
    }

    /**
     * Crea un directorio en S3 usando un marcador
     * 
     * @param Folder $folder
     * @return bool
     */
    public function createDirectory(Folder $folder): bool
    {
        try {
            $markerPath = $this->getPhysicalDirectoryPath($folder);
            return $this->disk->put($markerPath, '');
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'createDirectory',
                exception: $e,
                folder: $folder
            );
            return false;
        }
    }

    /**
     * Elimina un directorio en S3
     * 
     * @param Folder $folder Carpeta a eliminar
     * @param bool $recursive Si se deben eliminar los contenidos recursivamente
     * @return bool
     */
    public function deleteDirectory(Folder $folder, bool $recursive = true): bool
    {
        try {
            $markerPath = $this->getPhysicalDirectoryPath($folder);
            return $this->disk->delete($markerPath);
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'deleteDirectory',
                exception: $e,
                folder: $folder
            );
            return false;
        }
    }

    /**
     * Verifica si un directorio existe en S3
     * 
     * @param Folder $folder Carpeta a verificar
     * @return bool
     */
    public function directoryExists(Folder $folder): bool
    {
        try {
            $markerPath = $this->getPhysicalPath($folder);

            Log::debug('S3 directoryExists attempt', [
                'folder_id' => $folder->id,
                'folder_hash' => $folder->hash,
                'marker_path' => $markerPath,
                'bucket' => $this->bucket
            ]);

            // ✅ ROBUSTO: Múltiples niveles de try-catch
            try {
                $exists = $this->disk->exists($markerPath);

                Log::debug('S3 directoryExists result', [
                    'marker_path' => $markerPath,
                    'exists' => $exists
                ]);

                return $exists;
            } catch (\League\Flysystem\UnableToCheckExistence $e) {
                Log::error('S3 UnableToCheckExistence', [
                    'folder_id' => $folder->id,
                    'marker_path' => $markerPath,
                    'error' => $e->getMessage(),
                ]);

                // ✅ FALLBACK: Asumir que no existe si no se puede verificar
                return false;
            } catch (\Aws\S3\Exception\S3Exception $e) {
                Log::error('S3 AWS Exception', [
                    'folder_id' => $folder->id,
                    'marker_path' => $markerPath,
                    'aws_error_code' => $e->getAwsErrorCode(),
                    'aws_error_message' => $e->getAwsErrorMessage(),
                    'status_code' => $e->getStatusCode()
                ]);

                // ✅ Si es error 404, el directorio no existe
                if ($e->getStatusCode() === 404) {
                    return false;
                }

                // ✅ Para otros errores, lanzar excepción
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('S3 directoryExists general error', [
                'folder_id' => $folder->id,
                'error' => $e->getMessage(),
                'exception_type' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            // ✅ FALLBACK: Asumir que no existe
            return false;
        }
    }

    /**
     * Guarda un archivo en S3 con options gratuitos optimizados
     * 
     * @param Folder $file Archivo a guardar
     * @param mixed $content Contenido del archivo (string o recurso)
     * @return bool
     */
    public function putFile(Folder $file, $content): bool
    {
        try {
            $markerPath = $this->getPhysicalFilePath($file);

            // ✅ OPTIONS GRATUITOS optimizados
            $options = $this->buildOptimizedOptions($file);

            $success = $this->disk->put($markerPath, $content, $options);

            if (!$success) {
                $this->logS3Warning(
                    operation: 'putFile',
                    reason: 'Failed to put file in S3',
                    folder: $file
                );
            }

            return (bool)$success;
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'putFile',
                exception: $e,
                folder: $file
            );
            return false;
        }
    }

    /**
     * Guarda un archivo en S3 a partir de una ruta local con options gratuitos optimizados
     * 
     * @param Folder $file Archivo a guardar
     * @param string $sourcePath Ruta local del archivo a subir
     * @return bool
     */
    public function putFileFromPath(Folder $file, string $sourcePath): bool
    {
        try {
            if (!file_exists($sourcePath) || !is_readable($sourcePath)) {
                $this->logS3Warning(
                    operation: 'putFileFromPath',
                    reason: 'Source file not found or not readable',
                    folder: $file,
                    additionalContext: ['source_path' => $sourcePath]
                );
                return false;
            }

            $destinationPath = $this->getPhysicalFilePath($file);

            $options = $this->buildOptimizedOptions($file);

            $success = $this->disk->putFileAs(
                path: dirname($destinationPath),
                file: new \Illuminate\Http\File($sourcePath),
                name: basename($destinationPath),
                options: $options
            );

            if ($success) {
                $this->logS3Success('putFileFromPath', $file, [
                    'source_path' => $sourcePath,
                    'destination_path' => $destinationPath,
                    'options_used' => array_keys($options)
                ]);
            } else {
                $this->logS3Warning('putFileFromPath', 'Failed to put file in S3 from path', $file, [
                    'source_path' => $sourcePath
                ]);
            }

            return (bool)$success;
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'putFileFromPath',
                exception: $e,
                folder: $file,
                additionalContext: ['source_path' => $sourcePath]
            );
            return false;
        }
    }

    /**
     * Obtiene el tamaño del archivo en S3
     * 
     * @param Folder $folder Carpeta o archivo a verificar
     * @return int|null Tamaño del archivo en bytes o null si no existe
     */
    public function getFileSize(Folder $folder): int|null
    {
        try {
            $markerPath = $this->getPhysicalPath($folder);

            if (!$this->disk->exists($markerPath)) {
                return null;
            }

            return $this->disk->size($markerPath);
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'getFileSize',
                exception: $e,
                folder: $folder
            );
            return null;
        }
    }

    /**
     * Obtiene el contenido de un archivo desde S3
     * 
     * @param Folder $file Archivo a obtener
     * @return string|null Contenido del archivo o null si no existe
     */
    public function getFile(Folder $file): ?string
    {
        try {
            $markerPath = $this->getPhysicalFilePath($file);

            if (!$this->disk->exists($markerPath)) {
                $this->logS3Warning(
                    operation: 'getFile',
                    reason: 'File not found in S3',
                    folder: $file
                );
                return null;
            }

            $content = $this->disk->get($markerPath);

            // Validar que el contenido no esté vacío
            if ($content === false || $content === null) {
                $this->logS3Warning(
                    operation: 'getFile',
                    reason: 'File exists but content is empty',
                    folder: $file
                );
                return null;
            }

            return $content;
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'getFile',
                exception: $e,
                folder: $file
            );
            return null;
        }
    }

    /**
     * Elimina un archivo en S3 
     * 
     * @param Folder $file Archivo a eliminar
     * @return bool True si se eliminó correctamente, false en caso contrario
     */
    public function deleteFile(Folder $file): bool
    {
        try {
            $markerPath = $this->getPhysicalFilePath($file);
            $success = $this->disk->delete($markerPath);

            if (!$success) {
                $this->logS3Warning(
                    operation: 'deleteFile',
                    reason: 'Could not delete file in S3',
                    folder: $file
                );
            }

            return (bool) $success;
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'deleteFile',
                exception: $e,
                folder: $file,
                additionalContext: [
                    "Código: " . $e->getAwsErrorCode(),
                    "Mensaje: " . $e->getAwsErrorMessage(),
                    "HTTP Status: " . $e->getStatusCode(),
                ]
            );
            return false;
        }
    }

    /**
     * Mueve un directorio en S3 - VERSIÓN OPTIMIZADA para estructura plana
     * 
     * Esta función no mueve físicamente el directorio, ya que en la estructura plana
     * el hash del directorio no cambia. Solo verifica que exista y crea un marcador
     * 
     * @param Folder $folder Carpeta destino  
     * @param string $oldPath Ruta anterior (solo para logging)
     * @return bool
     */
    public function moveDirectory(Folder $folder, string $oldPath): bool
    {
        try {
            $markerPath = $this->getPhysicalDirectoryPath($folder);

            // Verificar que el directorio exista en S3
            if (!$this->disk->exists($markerPath)) {
                // ✅ Si no existe, crearlo
                $this->logS3Warning(
                    operation: 'moveDirectory',
                    reason: 'Directory marker not found, creating new one',
                    folder: $folder,
                    additionalContext: [
                        'old_path' => $oldPath,
                        'markerPath' => $markerPath
                    ]
                );
                return $this->createDirectory($folder);
            }

            // Si existe, no hay nada que mover
            $this->logS3Success(
                operation: 'moveDirectory',
                folder: $folder,
                additionalContext: [
                    'old_path' => $oldPath,
                    'markerPath' => $markerPath,
                    'action' => 'no_physical_move_required',
                    'reason' => 'flat_structure_hash_unchanged'
                ]
            );

            return true;
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'moveDirectory',
                exception: $e,
                folder: $folder,
                additionalContext: [
                    'old_path' => $oldPath
                ]
            );
            return false;
        }
    }

    /**
     * Mueve un archivo en S3 - VERSIÓN OPTIMIZADA para estructura plana
     * 
     * @param Folder $file Archivo destino
     * @param string $oldPath Ruta anterior (solo para logging)
     * @return bool
     */
    public function moveFile(Folder $file, string $oldPath): bool
    {
        $markerPath = $this->getPhysicalFilePath($file);
        try {
            // Verificar que el directorio exista en S3
            if (!$this->disk->exists($markerPath)) {
                // ✅ Si no existe, crearlo
                $this->logS3Warning(
                    operation: 'moveFile',
                    reason: 'File not found in S3',
                    folder: $file,
                    additionalContext: [
                        'old_path' => $oldPath,
                        'markerPath' => $markerPath
                    ]
                );
                return false;
            }

            // Si existe, no hay nada que mover
            $this->logS3Success(
                operation: 'moveFile',
                folder: $file,
                additionalContext: [
                    'old_path' => $oldPath,
                    'markerPath' => $markerPath,
                    'action' => 'no_physical_move_required',
                    'reason' => 'flat_structure_hash_unchanged'
                ]
            );

            return true;
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'moveFile',
                exception: $e,
                folder: $file,
                additionalContext: [
                    'old_path' => $oldPath
                ]
            );
            return false;
        }
    }

    /**
     * Mueve un elemento individual a la papelera en S3/R2
     * 
     * @param Folder $folder Elemento a mover a la papelera
     * @return bool Si la operación fue exitosa
     */
    public function moveToTrash(Folder $folder): bool
    {
        $sourcePath = $this->getPhysicalPath($folder);
        $trashPath = $this->getPhysicalTrashPath($folder);

        try {
            // Verificación básica de existencia
            if (!$this->disk->exists($sourcePath)) {
                $this->logS3Warning(
                    operation: 'moveToTrash',
                    reason: 'Source not found in S3',
                    folder: $folder
                );
                return false;
            }

            // ✅ BIFURCACIÓN: Tratamiento diferente para carpetas y archivos
            if ($folder->esCarpeta()) {
                // ✅ PARA CARPETAS: Movimiento simplificado (son marcadores vacíos)
                $directoryContent = $this->disk->get($sourcePath);

                // Escribir en papelera con metadata básica
                $options = [
                    'ContentType' => 'application/directory',
                    'CacheControl' => 'no-cache',
                    'Metadata' => [
                        // ✅ TODA la metadata en un solo lugar
                        'original-path' => $sourcePath,
                        'deleted-at' => now()->toIso8601String(),
                        'folder-id' => (string)$folder->id,
                        'deleted-by' => Auth::id() ? (string)Auth::id() : '1',
                        'item-type' => $folder->esCarpeta() ? 'directory' : 'file',
                        'item-name' => $folder->name,
                        'parent-id' => $folder->parent_id ? (string)$folder->parent_id : 'root',
                    ]
                ];

                $putSuccess = $this->disk->put($trashPath, $directoryContent, $options);

                if ($putSuccess) {
                    // Eliminar original
                    $this->disk->delete($sourcePath);

                    $this->logS3Success(
                        operation: 'moveToTrash',
                        folder: $folder,
                        additionalContext: [
                            'method' => 'directory_marker',
                            'is_directory' => true
                        ]
                    );

                    return true;
                }

                return false;
            } else {
                // ✅ PARA ARCHIVOS: Método actual con contenido real
                $content = $this->disk->get($sourcePath);

                // ✅ SOLO: Escribir en papelera (PUT) con metadata R2-compatible
                $options = [
                    'ContentType' => $folder->getMimeType(),
                    'CacheControl' => 'no-cache',
                    'Metadata' => [
                        'original-path' => $sourcePath,
                        'deleted-at' => now()->toIso8601String(),
                        'folder-id' => (string)$folder->id,
                        'deleted-by' => Auth::id() ? (string)Auth::id() : '1',
                        'item-type' => $folder->esCarpeta() ? 'directory' : 'file',
                        'item-name' => $folder->name,
                        'parent-id' => $folder->parent_id ? (string)$folder->parent_id : 'root',
                    ]
                ];

                $putSuccess = $this->disk->put($trashPath, $content, $options);

                if (!$putSuccess) {
                    $this->logS3Warning(
                        operation: 'moveToTrash',
                        reason: 'Failed to write file to trash',
                        folder: $folder,
                        additionalContext: [
                            'source_path' => $sourcePath,
                            'trash_path' => $trashPath,
                            'content_size' => strlen($content)
                        ]
                    );
                    return false;
                }

                // ✅ SOLO: Eliminar original (DELETE)
                $deleteSuccess = $this->disk->delete($sourcePath);

                if (!$deleteSuccess) {
                    $this->logS3Warning(
                        operation: 'moveToTrash',
                        reason: 'Failed to delete source after successful copy to trash',
                        folder: $folder,
                        additionalContext: [
                            'source_path' => $sourcePath,
                            'trash_path' => $trashPath
                        ]
                    );

                    // ✅ ROLLBACK: Eliminar la copia en trash si no se pudo eliminar el original
                    $rollbackSuccess = $this->disk->delete($trashPath);
                    $this->logS3Warning(
                        operation: 'moveToTrash',
                        reason: 'Rollback performed - removed file from trash',
                        folder: $folder,
                        additionalContext: [
                            'rollback_success' => $rollbackSuccess,
                            'trash_path' => $trashPath
                        ]
                    );
                    return false;
                }

                $this->logS3Success(
                    operation: 'moveToTrash',
                    folder: $folder,
                    additionalContext: [
                        'source_path' => $sourcePath,
                        'trash_path' => $trashPath,
                        'method' => 'get_put_delete',
                        'content_size' => strlen($content)
                    ]
                );

                return true;
            }
        } catch (\Exception $e) {
            $this->logS3Error(
                operation: 'moveToTrash',
                exception: $e,
                folder: $folder,
                additionalContext: [
                    'source_path' => $sourcePath,
                    'trash_path' => $trashPath
                ]
            );
            return false;
        }
    }

    /**
     * Crea metadata para papelera usando metadata S3 estándar compatible con R2
     * 
     * @param Folder $folder Elemento individual
     * @param string $trashPath Ruta en papelera
     */
    protected function createTrashMetadata(Folder $folder, string $trashPath): void
    {
        try {
            // ✅ CAMBIAR: Usar metadata S3 estándar compatible con R2
            $options = [
                'ContentType' => 'application/json',
                'ContentDisposition' => 'attachment; filename="metadata.json"',
                'CacheControl' => 'no-cache',

                // ✅ CORRECTO: Usar x-amz-meta-* para metadata personalizada
                'Metadata' => [
                    'original-path' => $this->getPhysicalPath($folder),
                    'deleted-at' => now()->toIso8601String(),
                    'folder-id' => (string)$folder->id,
                    'deleted-by' => Auth::id() ? (string)Auth::id() : '1',
                    'item-type' => $folder->esCarpeta() ? 'directory' : 'file',
                    'item-name' => $folder->name,
                    'parent-id' => $folder->parent_id ? (string)$folder->parent_id : 'root',
                ]
            ];

            // Metadata mínima individual
            $minimalMetadata = [
                'id' => $folder->id,
                'path' => $folder->path,
                'name' => $folder->name,
                'type' => $folder->esCarpeta() ? 'directory' : 'file',
                'deleted_at' => now()->toIso8601String(),
                'deleted_by' => Auth::id() ?? 1,
                'parent_id' => $folder->parent_id,
                'size' => $folder->size,
                'extension' => $folder->extension,
                'hash' => $folder->hash,
            ];

            $success = $this->disk->put(
                path: $trashPath . '.metadata',
                contents: json_encode($minimalMetadata, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
                options: $options
            );

            if ($success) {
                $this->logS3Success(
                    operation: 'createTrashMetadata',
                    folder: $folder,
                    additionalContext: [
                        'trash_path' => $trashPath,
                        'metadata_size' => strlen(json_encode($minimalMetadata)),
                        'metadata_keys' => array_keys($options['Metadata'])
                    ]
                );
            } else {
                $this->logS3Warning(
                    operation: 'createTrashMetadata',
                    reason: 'Failed to create metadata file',
                    folder: $folder,
                    additionalContext: [
                        'trash_path' => $trashPath . '.metadata'
                    ]
                );
            }
        } catch (\Exception $e) {
            $this->logS3Error(
                operation: 'createTrashMetadata',
                exception: $e,
                folder: $folder,
                additionalContext: [
                    'trash_path' => $trashPath . '.metadata'
                ]
            );
        }
    }

    /**
     * Lista elementos en la papelera de S3 con sus metadatos
     * 
     * @param int|null $limit Límite de elementos a retornar
     * @param int $offset Desde qué posición empezar
     * @return array Lista de elementos en la papelera con metadatos
     * 
     * @todo Pendiente de implementación, no es necesario por ahora
     */
    public function listTrashItems(?int $limit = null, int $offset = 0): array
    {
        return [];
    }

    /**
     * Restaura un elemento individual desde la papelera en S3/R2 (SOLO GET/PUT/DELETE)
     * 
     * @param Folder $folder Elemento a restaurar
     * @param string|null $customDestination Ruta personalizada de destino (opcional)
     * @return bool Si la operación fue exitosa
     */
    public function restoreFromTrash(Folder $folder, ?string $customDestination = null): bool
    {
        $trashPath = $this->getPhysicalTrashPath($folder);
        $metadataPath = $trashPath . '.metadata';

        try {
            // Verificar que el elemento existe en la papelera
            if (!$this->disk->exists($trashPath)) {
                $this->logS3Warning(
                    operation: 'restoreFromTrash',
                    reason: 'Element not found in trash',
                    folder: $folder,
                    additionalContext: [
                        'trash_path' => $trashPath,
                        'metadata_path' => $metadataPath
                    ]
                );
                return false;
            }

            // Determinar la ruta de destino
            $destinationPath = $customDestination ?? $this->getPhysicalPath($folder);

            // Verificar conflictos - no sobrescribir archivos existentes
            if ($this->disk->exists($destinationPath)) {
                $this->logS3Warning(
                    operation: 'restoreFromTrash',
                    reason: 'Destination already exists',
                    folder: $folder,
                    additionalContext: [
                        'trash_path' => $trashPath,
                        'destination_path' => $destinationPath,
                        'conflict' => true
                    ]
                );
                return false;
            }

            // ✅ SOLO: Leer desde papelera (GET)
            $content = $this->disk->get($trashPath);

            if ($content === false || $content === null) {
                $this->logS3Warning(
                    operation: 'restoreFromTrash',
                    reason: 'Failed to read content from trash',
                    folder: $folder,
                    additionalContext: [
                        'trash_path' => $trashPath
                    ]
                );
                return false;
            }

            // ✅ SOLO: Escribir en destino (PUT)
            $options = [
                'ContentType' => $folder->getMimeType(),
                'CacheControl' => $this->getCacheControl($folder),
            ];

            $putSuccess = $this->disk->put($destinationPath, $content, $options);

            if (!$putSuccess) {
                $this->logS3Warning(
                    operation: 'restoreFromTrash',
                    reason: 'Failed to write to destination',
                    folder: $folder,
                    additionalContext: [
                        'trash_path' => $trashPath,
                        'destination_path' => $destinationPath
                    ]
                );
                return false;
            }

            // ✅ SOLO: Eliminar de papelera (DELETE)
            $deleteSuccess = $this->disk->delete($trashPath);

            if (!$deleteSuccess) {
                $this->logS3Warning(
                    operation: 'restoreFromTrash',
                    reason: 'Failed to delete item from trash after restore',
                    folder: $folder,
                    additionalContext: [
                        'trash_path' => $trashPath,
                        'destination_path' => $destinationPath
                    ]
                );
            }

            // ✅ SOLO: Eliminar metadata (DELETE)
            if ($this->disk->exists($metadataPath)) {
                $deletedMetadata = $this->disk->delete($metadataPath);

                if (!$deletedMetadata) {
                    $this->logS3Warning(
                        operation: 'restoreFromTrash',
                        reason: 'Failed to delete metadata after restore',
                        folder: $folder,
                        additionalContext: [
                            'metadata_path' => $metadataPath
                        ]
                    );
                }
            }

            $this->logS3Success(
                operation: 'restoreFromTrash',
                folder: $folder,
                additionalContext: [
                    'trash_path' => $trashPath,
                    'destination_path' => $destinationPath,
                    'method' => 'get_put_delete',
                    'content_size' => strlen($content)
                ]
            );

            return $putSuccess;
        } catch (\Exception $e) {
            $this->logS3Error(
                operation: 'restoreFromTrash',
                exception: $e,
                folder: $folder,
                additionalContext: [
                    'trash_path' => $trashPath,
                    'destination_path' => $destinationPath ?? 'unknown'
                ]
            );
            return false;
        }
    }

    /**
     * Elimina permanentemente elementos antiguos de la papelera en S3
     * 
     * @param int $olderThanDays Eliminar elementos más antiguos que este número de días
     * @return int Número de elementos eliminados
     * 
     * @todo Pendiente de implementación, no es necesario por ahora
     */
    public function emptyTrash(int $olderThanDays = 30): int
    {
        return 0;
    }

    /**
     * Eliminación batch para carpetas con muchos archivos
     * 
     * @param Folder $folder Carpeta a eliminar
     * @param array $files Lista de archivos a eliminar
     * @return bool Resultado de la operación
     */
    protected function batchDeleteDirectory(Folder $folder, array $files): bool
    {
        $markerPath = $this->getPhysicalPath($folder);

        try {
            $totalFiles = count($files);
            $successfulDeletes = 0;

            $this->logS3Operation(
                level: 'info',
                message: 'Starting batch delete operation',
                context: [
                    'operation' => 'batchDeleteDirectory',
                    'folder_id' => $folder->id,
                    'total_files' => $totalFiles,
                    'batch_size' => self::MAX_BATCH_DELETE_SIZE
                ],
                exception: null,
                folder: $folder
            );

            $chunks = array_chunk($files, self::MAX_BATCH_DELETE_SIZE);

            foreach ($chunks as $chunkIndex => $chunk) {
                $success = $this->batchDeleteS3Objects($chunk);

                if ($success) {
                    $successfulDeletes += count($chunk);
                    $this->logS3Operation(
                        level: 'debug',
                        message: 'Batch chunk processed successfully',
                        context: [
                            'chunk_index' => $chunkIndex + 1,
                            'chunk_size' => count($chunk),
                        ]
                    );
                } else {
                    $this->logS3Operation(
                        level: 'error',
                        message: 'Batch chunk failed',
                        context: [
                            'chunk_index' => $chunkIndex + 1,
                            'chunk_size' => count($chunk)
                        ]
                    );
                }
            }

            $markerDeleted = $this->disk->delete($markerPath);

            $this->logS3Batch(
                operation: 'batchDeleteDirectory',
                totalItems: $totalFiles,
                successfulItems: $successfulDeletes,
                additionalContext: [
                    'marker_deleted' => $markerDeleted,
                    'chunks_processed' => count($chunks)
                ]
            );

            return $markerDeleted && $successfulDeletes === $totalFiles;
        } catch (S3Exception $e) {
            $this->logS3Error(
                operation: 'batchDeleteDirectory',
                exception: $e,
                folder: $folder,
                additionalContext: [
                    'total_files' => count($files),
                    'successful_deletes' => $successfulDeletes ?? 0
                ]
            );
            return false;
        }
    }

    /**
     * Elimina múltiples objetos S3 usando la API batch nativa
     * (Método híbrido: usa AWS SDK para operaciones batch)
     * 
     * @param array $keys Claves de los objetos a eliminar
     * @return bool Resultado de la operación
     * @throws \InvalidArgumentException Si se excede el límite de 1000 objetos
     */
    protected function batchDeleteS3Objects(array $keys): bool
    {
        if (empty($keys)) {
            return true;
        }

        if (count($keys) > self::MAX_BATCH_DELETE_SIZE) {
            throw new \InvalidArgumentException('Máximo 1000 objetos por operación batch');
        }

        try {
            $s3Client = $this->getS3Client();

            // Preparar la estructura para la operación batch
            $objects = array_map(function ($key) {
                return ['Key' => $key];
            }, $keys);

            // Ejecutar eliminación batch usando AWS SDK
            $result = $s3Client->deleteObjects(args: [
                'Bucket' => $this->bucket,
                'Delete' => [
                    'Objects' => $objects,
                    'Quiet' => false // Para obtener respuesta detallada
                ]
            ]);

            // Verificar si hubo errores
            $errors = $result['Errors'] ?? [];
            if (!empty($errors)) {
                Log::error('Errores en eliminación batch S3', [
                    'errors' => $errors,
                    'keys_count' => count($keys)
                ]);
                return false;
            }

            $deleted = $result['Deleted'] ?? [];
            Log::info('Objetos eliminados con batch S3', [
                'deleted_count' => count($deleted),
                'requested_count' => count($keys)
            ]);

            return count($deleted) === count($keys);
        } catch (\Aws\Exception\AwsException $e) {
            Log::error('Error AWS en eliminación batch', [
                'error_code' => $e->getAwsErrorCode(),
                'error_message' => $e->getMessage(),
                'keys_count' => count($keys)
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Error general en eliminación batch', [
                'error' => $e->getMessage(),
                'keys_count' => count($keys)
            ]);
            return false;
        }
    }

    /**
     * Registra logs específicos para operaciones S3 con contexto enriquecido
     * 
     * @param string $level Nivel de log (info, error, warning, debug)
     * @param string $message Mensaje principal
     * @param array $context Contexto adicional
     * @param \Exception|null $exception Excepción si aplica
     * @param Folder|null $folder Carpeta/archivo relacionado
     * @return void
     */
    protected function logS3Operation(
        string $level,
        string $message,
        array $context = [],
        ?\Exception $exception = null,
        ?Folder $folder = null
    ): void {
        // Construir contexto base S3
        $s3Context = [
            'storage_type' => 's3',
            'bucket' => $this->bucket,
            'region' => config('filesystems.disks.s3.region'),
            'timestamp' => now()->toIso8601String(),
        ];

        // Agregar información del folder si está disponible
        if ($folder) {
            $s3Context['folder_context'] = [
                'folder_id' => $folder->id,
                'folder_type' => $folder->esCarpeta() ? 'directory' : 'file',
                'folder_name' => $folder->name,
                'folder_path' => $folder->path,
                'folder_hash' => $folder->hash,
                'folder_size' => $folder->size,
                'folder_extension' => $folder->extension,
                'physical_path' => $this->getPhysicalPath($folder),
            ];
        }

        // Agregar información de la excepción si existe
        if ($exception) {
            $s3Context['exception_context'] = [
                'exception_type' => get_class($exception),
                'exception_message' => $exception->getMessage(),
                'exception_file' => $exception->getFile(),
                'exception_line' => $exception->getLine(),
            ];

            // Información específica de S3Exception
            if ($exception instanceof S3Exception) {
                $s3Context['s3_error_context'] = [
                    'aws_error_code' => $exception->getAwsErrorCode(),
                    'aws_error_type' => $exception->getAwsErrorType(),
                    'aws_error_message' => $exception->getAwsErrorMessage(),
                    'status_code' => $exception->getStatusCode(),
                    'response_headers' => $exception->getResponse() ? $exception->getResponse()->getHeaders() : [],
                ];
            }
        }

        // Agregar información del usuario actual
        if (Auth::check()) {
            $s3Context['user_context'] = [
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name ?? 'Unknown',
                'user_email' => Auth::user()->email ?? 'Unknown',
            ];
        }

        // Combinar todos los contextos
        $fullContext = array_merge($s3Context, $context);

        // Registrar el log según el nivel
        switch ($level) {
            case 'info':
                Log::info($message, $fullContext);
                break;
            case 'error':
                Log::error($message, $fullContext);
                break;
            case 'warning':
                Log::warning($message, $fullContext);
                break;
            case 'debug':
                Log::debug($message, $fullContext);
                break;
            default:
                Log::info($message, $fullContext);
        }
    }

    /**
     * Log específico para operaciones exitosas
     * 
     * @param string $operation Nombre de la operación (ej. 'upload', 'delete')
     * @param Folder $folder Carpeta/archivo relacionado
     * @param array $additionalContext Contexto adicional para enriquecer el log
     * @return void
     */
    protected function logS3Success(string $operation, Folder $folder, array $additionalContext = []): void
    {
        $this->logS3Operation(
            level: 'info',
            message: "S3 {$operation} operation completed successfully",
            context: [
                'operation' => $operation,
                'operation_status' => 'success',
                ...$additionalContext
            ],
            exception: null,
            folder: $folder
        );
    }

    /**
     * Log específico para errores S3
     * 
     * @param string $operation Nombre de la operación (ej. 'upload', 'delete')
     * @param \Exception $exception Excepción capturada
     * @param Folder|null $folder Carpeta/archivo relacionado
     * @param array $additionalContext Contexto adicional para enriquecer el log
     * @return void
     */
    protected function logS3Error(string $operation, \Exception $exception, ?Folder $folder = null, array $additionalContext = []): void
    {
        $this->logS3Operation(
            level: 'error',
            message: "S3 {$operation} operation failed",
            context: [
                'operation' => $operation,
                'operation_status' => 'failed',
                ...$additionalContext
            ],
            exception: $exception,
            folder: $folder
        );
    }

    /**
     * Log específico para advertencias S3
     * 
     * @param string $operation Nombre de la operación (ej. 'upload', 'delete')
     * @param string $reason Razón de la advertencia
     * @param Folder|null $folder Carpeta/archivo relacionado
     * @param array $additionalContext Contexto adicional para enriquecer el log
     * @return void
     */
    protected function logS3Warning(string $operation, string $reason, ?Folder $folder = null, array $additionalContext = []): void
    {
        $this->logS3Operation(
            level: 'warning',
            message: "S3 {$operation} operation warning: {$reason}",
            context: [
                'operation' => $operation,
                'operation_status' => 'warning',
                'warning_reason' => $reason,
                ...$additionalContext
            ],
            exception: null,
            folder: $folder
        );
    }

    /**
     * Log específico para operaciones batch
     * 
     * @param string $operation Nombre de la operación (ej. 'upload', 'delete')
     * @param int $totalItems Total de items procesados
     * @param int $successfulItems Cantidad de items exitosos
     * @param array $additionalContext Contexto adicional para enriquecer el log
     * @return void
     */
    protected function logS3Batch(string $operation, int $totalItems, int $successfulItems, array $additionalContext = []): void
    {
        $this->logS3Operation(
            level: $successfulItems === $totalItems ? 'info' : 'warning',
            message: "S3 batch {$operation} completed",
            context: [
                'operation' => $operation,
                'operation_type' => 'batch',
                'total_items' => $totalItems,
                'successful_items' => $successfulItems,
                'failed_items' => $totalItems - $successfulItems,
                'success_rate' => round(($successfulItems / $totalItems) * 100, 2) . '%',
                ...$additionalContext
            ]
        );
    }

    /**
     * Construye options optimizados para S3 (SIN COSTO)
     * 
     * @param Folder $file Archivo o carpeta
     * @return array Opciones optimizadas para S3
     */
    protected function buildOptimizedOptions(Folder $file): array
    {
        $options = [
            'ContentType' => $file->getMimeType(),
            'ContentDisposition' => $file->getContentDisposition(),
            'CacheControl' => $this->getCacheControl($file),
        ];

        // ✅ Headers de seguridad para ciertos tipos (gratis)
        if ($this->needsSecurityHeaders($file)) {
            $options['X-Content-Type-Options'] = 'nosniff';
        }

        return $options;
    }

    /**
     * Determina Cache-Control optimizado
     * 
     * @param Folder $file Archivo o carpeta
     * @return string Cache-Control optimizado
     */
    protected function getCacheControl(Folder $file): string
    {
        // ✅ Archivos estáticos: Cache muy largo
        if ($file->isFileStatic()) {
            return 'max-age=31536000, immutable'; // 1 año
        }

        // ✅ Documentos importantes: Cache medio
        if ($file->isDocumentFile()) {
            return 'max-age=86400'; // 1 día
        }

        // ✅ Archivos temporales: Sin cache
        if ($this->isTemporaryFile($file)) {
            return 'no-cache, no-store';
        }

        // ✅ Por defecto: Cache estándar
        return 'max-age=86400'; // 1 día
    }

    /**
     * Determina si necesita headers de seguridad
     * 
     * @param Folder $file Archivo o carpeta
     * @return bool True si necesita headers de seguridad, false en caso contrario
     */
    protected function needsSecurityHeaders(Folder $file): bool
    {
        $riskyTypes = [
            'text/html',
            'text/javascript',
            'application/javascript',
            'application/x-javascript',
            'text/xml',
            'application/xml'
        ];

        return in_array($file->getMimeType(), $riskyTypes);
    }

    /**
     * Determina si es un archivo temporal
     * 
     * @param Folder $file Archivo o carpeta a verificar
     * @return bool True si es un archivo temporal, false en caso contrario
     */
    protected function isTemporaryFile(Folder $file): bool
    {
        $tempPrefixes = ['tmp_', 'temp_', 'cache_'];
        $tempExtensions = ['tmp', 'temp', 'cache'];

        $name = strtolower($file->name);
        $extension = strtolower($file->extension);

        foreach ($tempPrefixes as $prefix) {
            if (str_starts_with($name, $prefix)) {
                return true;
            }
        }

        return in_array($extension, $tempExtensions);
    }
}

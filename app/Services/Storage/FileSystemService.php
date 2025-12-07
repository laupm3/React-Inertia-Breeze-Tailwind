<?php

namespace App\Services\Storage;

use App\Models\Folder;
use Illuminate\Support\Facades\Log;
use App\Interfaces\FileStorageInterface;
use App\Services\Storage\LocalFileStorage;

class FileSystemService
{
    /**
     * Implementación de almacenamiento a usar
     */
    protected FileStorageInterface $storage;

    /**
     * Si el logging detallado está habilitado
     */
    protected bool $verboseLogging;

    /**
     * Constructor que inicializa la implementación de almacenamiento
     */
    public function __construct(?FileStorageInterface $storage = null)
    {
        Log::alert('FileSystemService initialized with storage: ' . get_class($storage));
        // Si no se proporciona una implementación, usar la local por defecto
        $this->storage = $storage ?: new LocalFileStorage();
        $this->verboseLogging = config('app.debug', false);
    }

    /**
     * Crea un directorio físico para la carpeta
     */
    public function createDirectory(Folder $folder): bool
    {
        return $this->executeStorageOperation(
            fn() => $this->storage->createDirectory($folder),
            'crear directorio',
            $folder
        );
    }

    /**
     * Elimina un directorio físico correspondiente a la carpeta
     */
    public function deleteDirectory(Folder $folder, bool $forceDelete = false): bool
    {
        if (!$forceDelete) {
            return $this->moveToTrash($folder);
        }

        return $this->executeStorageOperation(
            fn() => $this->storage->deleteDirectory($folder),
            'eliminar directorio',
            $folder
        );
    }

    /**
     * Mueve un directorio físico cuando la carpeta se ha movido
     */
    public function moveDirectory(Folder $folder, string $oldPath): bool
    {
        return $this->executeStorageOperation(
            fn() => $this->storage->moveDirectory($folder, $oldPath),
            'mover directorio',
            $folder,
            ['old_path' => $oldPath]
        );
    }

    /**
     * Guarda un archivo físico en el sistema
     */
    public function putFile(Folder $file, $content): bool
    {
        if (!$file->esArchivo()) {
            return false;
        }

        return $this->executeStorageOperation(
            fn() => $this->storage->putFile($file, $content),
            'guardar archivo',
            $file
        );
    }

    /**
     * Guarda un archivo físico en el sistema a partir de una ruta local
     * 
     * @param Folder $file Modelo del archivo a guardar
     * @param string $sourcePath Ruta local al archivo fuente
     * @return bool Si la operación fue exitosa
     */
    public function putFileFromPath(Folder $file, string $sourcePath): bool
    {
        // 1. Validar que el modelo sea un archivo (responsabilidad del servicio)
        if (!$file->esArchivo()) {
            Log::error("Se intentó guardar un directorio como archivo", [
                'file_id' => $file->id,
                'path' => $file->path
            ]);
            return false;
        }

        // 2. Delegar completamente la operación física al almacenamiento
        return $this->executeStorageOperation(
            fn() => $this->storage->putFileFromPath($file, $sourcePath),
            'guardar archivo desde ruta local',
            $file,
            ['source_path' => $sourcePath]
        );
    }

    /**
     * Obtiene un archivo del sistema
     */
    public function getFile(Folder $file)
    {
        if (!$file->esArchivo()) {
            return false;
        }

        return $this->executeStorageOperation(
            fn() => $this->storage->getFile($file),
            'leer archivo',
            $file,
            [],
            false // No convertir fallos en false, mantener el resultado original
        );
    }

    /**
     * Verifica si un directorio físico existe
     * 
     * @param Folder $folder Carpeta o archivo a verificar
     * @return bool Si el directorio existe
     */
    public function directoryExists(Folder $folder): bool
    {
        return $this->storage->directoryExists($folder);
    }

    /**
     * Verifica si el directorio físico existe y lo crea si no existe
     */
    public function ensureDirectoryExists(Folder $folder): bool
    {
        if (!$folder->esCarpeta()) {
            return false;
        }

        if ($this->storage->directoryExists($folder)) {
            return true;
        }

        return $this->createDirectory($folder);
    }

    /**
     * Mueve una carpeta a la papelera de reciclaje para soft deletes
     */
    protected function moveToTrash(Folder $folder): bool
    {
        return $this->executeStorageOperation(
            fn() => $this->storage->moveToTrash($folder),
            'mover a papelera',
            $folder
        );
    }

    /**
     * Restaura una carpeta desde la papelera de reciclaje
     * @param Folder $folder Carpeta a restaurar
     * @param string|null $customDestination Ruta personalizada de destino (opcional)
     * 
     * @return bool Si la operación fue exitosa
     */
    public function restoreFromTrash(Folder $folder, ?string $customDestination = null): bool
    {
        return $this->executeStorageOperation(
            fn() => $this->storage->restoreFromTrash($folder, $customDestination),
            'restaurar de papelera',
            $folder,
            ['custom_destination' => $customDestination]
        );
    }

    /**
     * Elimina un archivo físico del sistema
     */
    public function deleteFile(Folder $file, bool $forceDelete = false): bool
    {
        if (!$file->esArchivo()) {
            return false;
        }

        if (!$forceDelete) {
            return $this->moveToTrash($file);
        }

        return $this->executeStorageOperation(
            fn() => $this->storage->deleteFile($file),
            'eliminar archivo',
            $file
        );
    }

    /**
     * Lista elementos en la papelera con sus metadatos
     *
     * @param int|null $limit Límite de elementos a retornar
     * @param int $offset Desde qué posición empezar
     * @return array Lista de elementos en la papelera con metadatos o array vacío en caso de error
     */
    public function listTrashItems(?int $limit = null, int $offset = 0): array
    {
        // Ejecutar la operación con manejo de errores
        $result = $this->executeStorageOperation(
            fn() => $this->storage->listTrashItems($limit, $offset),
            'listar elementos en papelera',
            // Necesitamos pasar una instancia de Folder para la gestión de errores, creamos una temporal
            $this->createTemporaryFolderForLogging(),
            [
                'limit' => $limit,
                'offset' => $offset
            ],
            // Si hay un error, devolver array vacío en lugar de false
            false
        );

        // Si hay un error o el resultado es null, devolver un array vacío 
        // para asegurar un comportamiento consistente
        return $result ?? [];
    }

    /**
     * Crea un objeto Folder temporal para usar en operaciones que no tienen
     * una carpeta específica pero necesitan cumplir con la firma de executeStorageOperation
     * 
     * @return Folder
     */
    protected function createTemporaryFolderForLogging(): Folder
    {
        // Crear un objeto temporal para propósitos de logging
        $folder = new Folder();
        $folder->id = 0;
        $folder->path = 'papelera';
        $folder->hash = 'trash';

        return $folder;
    }

    /**
     * Sincroniza todas las carpetas para asegurar que existen físicamente
     * 
     * @param bool $prioritizeRecent Si debe priorizar carpetas modificadas recientemente
     * @param int|null $limit Límite de carpetas a procesar (null para todas)
     * @return array Estadísticas de la operación
     */
    public function syncAllDirectories(bool $prioritizeRecent = true, ?int $limit = null): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'skipped' => 0,
            'failed_folders' => [], // Para guardar información sobre fallos
        ];

        // Comenzar a medir el tiempo
        $startTime = microtime(true);

        // Query base
        $query = Folder::carpetas();

        // Aplicar priorización si se solicita
        if ($prioritizeRecent) {
            $query->orderBy('updated_at', 'desc');
        }

        // Aplicar límite si se especifica
        if ($limit !== null) {
            $query->limit($limit);
        }

        Log::info("Iniciando sincronización de directorios físicos" .
            ($prioritizeRecent ? " (priorizando recientes)" : "") .
            ($limit !== null ? " (limitado a $limit carpetas)" : ""));

        // Procesar en chunks para evitar problemas de memoria
        $query->chunk(100, function ($folders) use (&$results) {
            foreach ($folders as $folder) {
                try {
                    if ($this->ensureDirectoryExists($folder)) {
                        $results['success']++;

                        // Logging detallado solo en modo verbose
                        if ($this->verboseLogging) {
                            Log::debug("Carpeta sincronizada correctamente: {$folder->path} (ID: {$folder->id})");
                        }
                    } else {
                        $results['failed']++;

                        // Siempre registrar fallos
                        Log::warning("Falló la sincronización de carpeta: {$folder->path} (ID: {$folder->id})");

                        // Guardar información sobre fallos (limitado a 50 para evitar logs enormes)
                        if (count($results['failed_folders']) < 50) {
                            $results['failed_folders'][] = [
                                'id' => $folder->id,
                                'path' => $folder->path,
                                'hash' => $folder->hash,
                                'created_at' => $folder->created_at->toDateTimeString(),
                                'updated_at' => $folder->updated_at->toDateTimeString(),
                            ];
                        }
                    }

                    // Log progreso cada 1000 carpetas
                    if (($results['success'] + $results['failed']) % 1000 === 0) {
                        Log::info("Progreso: {$results['success']} éxitos, {$results['failed']} fallos");
                    }
                } catch (\Exception $e) {
                    $results['failed']++;
                    $this->logException('sincronizar carpeta', $e, $folder);
                }
            }
        });

        // Calcular tiempo total
        $totalTime = round(microtime(true) - $startTime, 2);
        $totalProcessed = $results['success'] + $results['failed'];

        // Log resultados finales
        Log::info("Sincronización de directorios completada en {$totalTime}s. " .
            "Procesados: {$totalProcessed}, " .
            "Éxitos: {$results['success']}, " .
            "Fallos: {$results['failed']}");

        // Si hubo fallos, registrar más detalles
        if ($results['failed'] > 0 && !empty($results['failed_folders'])) {
            Log::warning("Detalle de carpetas con fallos: " . json_encode($results['failed_folders']));
        }

        return $results;
    }

    /**
     * Ejecuta una operación de almacenamiento con manejo uniforme de errores
     * 
     * @param callable $operation Función a ejecutar
     * @param string $operationName Nombre de la operación (para logs)
     * @param Folder $folder Carpeta o archivo involucrado
     * @param array $extraContext Contexto adicional para logs
     * @param bool $convertFailToFalse Si debe convertir fallos en false
     * @return mixed Resultado de la operación o false en caso de error
     */
    protected function executeStorageOperation(
        callable $operation,
        string $operationName,
        Folder $folder,
        array $extraContext = [],
        bool $convertFailToFalse = true
    ) {
        try {
            $result = $operation();

            // Manejar fallos específicos (cuando la operación retorna false)
            if ($convertFailToFalse && $result === false && $this->verboseLogging) {
                Log::warning("No se pudo {$operationName} para: {$folder->path}");
            }

            return $result;
        } catch (\Exception $e) {
            $this->logException($operationName, $e, $folder, $extraContext);
            return $convertFailToFalse ? false : null;
        }
    }

    /**
     * Registra una excepción con el nivel de detalle apropiado
     */
    protected function logException(
        string $operation,
        \Exception $e,
        Folder $folder,
        array $extraContext = []
    ): void {
        $context = ['path' => $folder->path];

        // Solo incluir detalles completos si el logging detallado está activado
        if ($this->verboseLogging) {
            $context = array_merge($context, [
                'folder_id' => $folder->id,
                'exception_class' => get_class($e),
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        } else {
            $context['folder_id'] = $folder->id;
        }

        // Añadir cualquier contexto extra proporcionado
        if (!empty($extraContext)) {
            $context = array_merge($context, $extraContext);
        }

        Log::error("Error al {$operation}: " . $e->getMessage(), $context);
    }

    /**
     * Obtiene la ruta física de una carpeta (delegando al almacenamiento)
     */
    public function getPhysicalPath(Folder $folder): string
    {
        // Si el método existe en la interfaz, usarlo
        if (method_exists($this->storage, 'getPhysicalPath')) {
            return $this->storage->getPhysicalPath($folder);
        }

        // Implementación alternativa (básica) si no existe
        $basePath = $folder->esCarpeta() ? 'folders/' : 'files/';
        return $basePath . $folder->hash;
    }

    /**
     * Cambia la implementación de almacenamiento en tiempo de ejecución
     */
    public function useStorage(FileStorageInterface $storage): self
    {
        $this->storage = $storage;
        return $this;
    }

    /**
     * Habilita o deshabilita el logging detallado
     */
    public function setVerboseLogging(bool $verbose): self
    {
        $this->verboseLogging = $verbose;
        return $this;
    }

    /**
     * Verifica si el logging detallado está habilitado
     * 
     * @return bool
     */
    public function isVerboseLoggingEnabled(): bool
    {
        return $this->verboseLogging;
    }

    /**
     * Genera una ruta de almacenamiento para una carpeta
     * 
     * @param Folder $folder Carpeta o archivo para la que obtener la ruta
     * @return string Ruta completa al archivo o directorio en el sistema de almacenamiento
     */
    public function getStoragePath(Folder $folder): string
    {
        return $this->executeStorageOperation(
            fn() => $this->storage->getStoragePath($folder),
            'eliminar archivo',
            $folder
        );
    }

    /**
     * Obtiene el tamaño del archivo físico
     * 
     * @param Folder $file Carpeta o archivo para el que obtener el tamaño
     * @return int|null Tamaño del archivo en bytes o null si no es un archivo
     */
    public function getFileSize(Folder $file): ?int
    {
        return $this->executeStorageOperation(
            fn() => $this->storage->getFileSize($file),
            'obtener tamaño de archivo',
            $file,
            [],
            false // No convertir fallos en null, mantener el resultado original
        );
    }
}

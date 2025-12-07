<?php

namespace App\Services\Storage;

use App\Models\User;
use App\Models\Folder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Interfaces\FileStorageInterface;

/**
 * Implementación del almacenamiento de archivos en el sistema local
 */
class LocalFileStorage implements FileStorageInterface
{
    /**
     * Disco de almacenamiento utilizado para operaciones de archivos
     *
     * @var \Illuminate\Contracts\Filesystem\Filesystem
     */
    protected \Illuminate\Contracts\Filesystem\Filesystem $disk;

    /**
     * Constructor que inicializa el disco de almacenamiento
     */
    public function __construct()
    {
        $this->disk = Storage::disk(config('filesystems.default', 'local'));
    }

    /**
     * Convierte un objeto Folder en una ruta física (genérico)
     */
    public function getPhysicalPath(Folder $folder): string
    {
        return $folder->esCarpeta() ?
            $this->getPhysicalDirectoryPath($folder) :
            $this->getPhysicalFilePath($folder);
    }

    /**
     * Convierte un objeto Folder en una ruta física (genérico)
     */
    public function getPhysicalTrashPath(Folder $folder): string
    {
        return $folder->esCarpeta() ?
            $this->getPhysicalDirectoryTrashPath($folder) :
            $this->getPhysicalFileTrashPath($folder);
    }

    /**
     * Obtiene la ruta física específica para carpetas
     */
    public function getPhysicalDirectoryPath(Folder $folder): string
    {
        return 'folders/' . $folder->hash;
    }

    /**
     * Convierte un objeto Folder (archivo) en una ruta física
     */
    protected function getPhysicalFilePath(Folder $file): string
    {
        return 'files/' . $file->hash . "." . $file->extension;
    }

    /**
     * Obtiene la ruta física específica para carpetas en la papelera
     */
    public function getPhysicalDirectoryTrashPath(Folder $folder): string
    {
        return 'trash/' . $folder->hash;
    }

    /**
     * Convierte un objeto Folder (archivo) en una ruta física en la papelera
     */
    protected function getPhysicalFileTrashPath(Folder $file): string
    {
        return 'trash/' . $file->hash . "." . $file->extension;
    }

    public function createDirectory(Folder $folder): bool
    {
        $path = $this->getPhysicalPath($folder);
        return $this->disk->makeDirectory($path);
    }

    public function deleteDirectory(Folder $folder, bool $recursive = true): bool
    {
        $path = $this->getPhysicalPath($folder);

        if ($recursive) {
            return $this->disk->deleteDirectory($path);
        } else {
            return $this->disk->delete($path);
        }
    }

    /**
     * El movimiento de directorios en una estructura plana con hash inmutable
     * no requiere mover físicamente los archivos, ya que la ubicación lógica
     * se gestiona a través de la base de datos.
     * 
     * Esto significa que al mover un directorio, simplemente actualizamos
     * la ruta lógica en la base de datos sin realizar ninguna operación física.
     * 
     * @param Folder $folder Carpeta a mover
     * @param string $oldPath Ruta antigua del directorio
     * @return bool Siempre retorna true, ya que no hay movimiento físico
     */
    public function moveDirectory(Folder $folder, string $oldPath): bool
    {
        Log::info("Movimiento de directorio - Solo cambio lógico", [
            'folder_id' => $folder->id,
            'old_path' => $oldPath,
            'new_path' => $folder->path,
            'hash' => $folder->hash,
            'physical_path' => $this->getPhysicalPath($folder),
            'action' => 'no_physical_movement_required'
        ]);

        return true;
    }

    public function directoryExists(Folder $folder): bool
    {
        $path = $this->getPhysicalPath($folder);
        return $this->disk->exists($path);
    }

    public function putFile(Folder $file, $content): bool
    {
        $path = $this->getPhysicalFilePath($file);
        return $this->disk->put($path, $content);
    }

    /**
     * Guarda un archivo en el sistema a partir de una ruta local
     * 
     * @param Folder $file Modelo del archivo
     * @param string $sourcePath Ruta al archivo fuente
     * @return bool Si la operación fue exitosa
     */
    public function putFileFromPath(Folder $file, string $sourcePath): bool
    {
        $destinationPath = $this->getPhysicalFilePath($file);

        try {
            // Validar aspectos físicos (responsabilidad del storage)
            if (!file_exists($sourcePath) || !is_readable($sourcePath)) {
                Log::error("El archivo fuente no existe o no es legible", [
                    'source_path' => $sourcePath
                ]);
                return false;
            }

            // Operación física de almacenamiento
            $success = $this->disk->putFileAs(
                dirname($destinationPath),            // directorio destino 
                new \Illuminate\Http\File($sourcePath), // archivo fuente como objeto File
                basename($destinationPath)            // nombre del archivo
            );

            return (bool)$success;
        } catch (\Exception $e) {
            Log::error("Error al guardar archivo desde ruta", [
                'source' => $sourcePath,
                'destination' => $destinationPath,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Obtiene la ruta de almacenamiento completa
     * 
     * @param Folder $folder Carpeta o archivo para el que obtener la ruta de almacenamiento
     * @return string Ruta completa en el sistema de archivos
     */
    public function getStoragePath(Folder $folder): string
    {
        return $this->disk->path($this->getPhysicalPath($folder));
    }

    /**
     * Obtiene el tamaño del archivo físico
     * 
     * @param Folder $folder Carpeta o archivo para el que obtener el tamaño
     * @return int|null Tamaño del archivo en bytes, null si no existe
     */
    public function getFileSize(Folder $folder): int|null
    {
        $path = $this->getPhysicalPath($folder);
        if (!$this->disk->exists($path)) {
            return null;
        }
        return $this->disk->size($path);
    }

    public function getFile(Folder $file)
    {
        $path = $this->getPhysicalFilePath($file);

        if (!$this->disk->exists($path)) {
            return false;
        }

        return $this->disk->get($path);
    }

    public function deleteFile(Folder $file): bool
    {
        $path = $this->getPhysicalFilePath($file);
        return $this->disk->delete($path);
    }

    /**
     * El movimiento de archivos en una estructura plana con hash inmutable
     * no requiere mover físicamente los archivos, ya que la ubicación lógica
     * se gestiona a través de la base de datos.
     * 
     * Esto significa que al mover un archivo, simplemente actualizamos
     * la ruta lógica en la base de datos sin realizar ninguna operación física.
     * 
     * @param Folder $file Archivo a mover
     * @param string $oldPath Ruta antigua del archivo
     * @return bool Siempre retorna true, ya que no hay movimiento físico
     */
    public function moveFile(Folder $file, string $oldPath): bool
    {
        Log::info("Movimiento de archivo - Solo cambio lógico", [
            'file_id' => $file->id,
            'old_path' => $oldPath,
            'new_path' => $file->path,
            'hash' => $file->hash,
            'physical_path' => $this->getPhysicalFilePath($file),
            'action' => 'no_physical_movement_required'
        ]);

        return true;
    }

    /**
     * Mueve un elemento a la papelera y guarda metadatos (SIN manejo de hijos)
     *
     * @param Folder $folder Elemento a mover a la papelera
     * @return bool Si la operación fue exitosa
     */
    public function moveToTrash(Folder $folder): bool
    {
        $sourcePath = $this->getPhysicalPath($folder);
        $trashPath = $this->getPhysicalTrashPath($folder);
        $metadataPath = 'trash/metadata/' . $folder->hash . '.json';

        // Verificar si el elemento existe físicamente
        if (!$this->disk->exists($sourcePath)) {
            Log::warning("Elemento no encontrado físicamente para mover a papelera", [
                'folder_id' => $folder->id,
                'path' => $folder->path,
                'physical_path' => $sourcePath
            ]);
            return false;
        }

        try {
            // Crear metadatos ANTES de mover
            $metadata = $this->createTrashMetadata($folder);

            // Asegurar que exista el directorio de metadatos
            $this->disk->makeDirectory('trash/metadata');

            // Guardar metadatos
            $metadataCreated = $this->disk->put($metadataPath, json_encode($metadata, JSON_PRETTY_PRINT));

            // Mover elemento individual a la papelera
            $moved = $this->disk->move($sourcePath, $trashPath);

            // Logging apropiado
            if (!$moved) {
                Log::info("Elemento movido a papelera exitosamente", [
                    'folder_id' => $folder->id,
                    'path' => $folder->path,
                    'source_path' => $sourcePath,
                    'trash_path' => $trashPath,
                    'metadata_created' => $metadataCreated,
                    'type' => $folder->esCarpeta() ? 'directory' : 'file'
                ]);
            } else {
                Log::error("Error al mover elemento a papelera", [
                    'folder_id' => $folder->id,
                    'path' => $folder->path,
                    'source_path' => $sourcePath,
                    'trash_path' => $trashPath
                ]);
            }

            // Advertir si metadatos fallaron pero el movimiento fue exitoso
            if ($moved && !$metadataCreated) {
                Log::warning("Elemento movido pero metadatos fallaron", [
                    'folder_id' => $folder->id,
                    'path' => $folder->path,
                    'metadata_path' => $metadataPath
                ]);
            }

            return $moved;
        } catch (\Exception $e) {
            Log::error("Excepción al mover elemento a papelera", [
                'folder_id' => $folder->id,
                'path' => $folder->path,
                'source_path' => $sourcePath,
                'trash_path' => $trashPath,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function restoreFromTrash(Folder $folder, ?string $customDestination = null): bool
    {
        // 1. Obtener la ruta en la papelera y verificar existencia
        $trashPath = 'trash/' . $folder->hash;
        $trashMetadataPath = 'trash/metadata/' . $folder->hash . '.json';

        if (!$this->disk->exists($trashPath)) {
            return false;
        }

        // 2. Determinar la ruta de destino
        $destinationPath = $customDestination;

        // Si hay metadatos, intentar recuperar la ruta original
        if ($this->disk->exists($trashMetadataPath)) {
            try {
                $metadata = json_decode($this->disk->get($trashMetadataPath), true);
                // Usar la ruta original de los metadatos si no se proporcionó un destino personalizado
                if (!$customDestination && isset($metadata['original_path'])) {
                    $destinationPath = $metadata['original_path'];
                }
            } catch (\Exception $e) {
                // Si hay error al leer metadatos, continuar con la ruta estándar
            }
        }

        // Si no tenemos ruta personalizada ni de metadatos, usar la ruta estándar
        $destinationPath = $destinationPath ?? $this->getPhysicalPath($folder);

        // 3. Verificar conflictos - si ya existe un elemento en la ruta de destino
        if ($this->disk->exists($destinationPath)) {
            return false; // No sobrescribir archivos existentes
        }

        // 4. Asegurar que el directorio padre exista usando ayudantes de Laravel
        $this->disk->makeDirectory(dirname($destinationPath), 0755, true, true);

        // 5. Realizar la restauración
        $success = $this->disk->move($trashPath, $destinationPath);

        // 6. Si la restauración fue exitosa, eliminar los metadatos
        if ($success && $this->disk->exists($trashMetadataPath)) {
            $this->disk->delete($trashMetadataPath);
        }

        return $success;
    }

    /**
     * Lista elementos en la papelera con sus metadatos
     *
     * @param int|null $limit Límite de elementos a retornar
     * @param int $offset Desde qué posición empezar
     * @return array Lista de elementos en la papelera con metadatos
     */
    public function listTrashItems(?int $limit = null, int $offset = 0): array
    {
        $items = collect([])
            ->merge($this->disk->files('trash'))
            ->merge($this->disk->directories('trash'))
            ->filter(function ($path) {
                return basename(dirname($path)) !== 'metadata';
            })
            ->values();

        // Ordenar por fecha de modificación
        $items = $items->sortByDesc(function ($path) {
            // Intentar obtener fecha de eliminación de los metadatos para ordenación más precisa
            $hash = basename($path);
            $metadataPath = 'trash/metadata/' . $hash . '.json';

            if ($this->disk->exists($metadataPath)) {
                try {
                    $metadata = json_decode($this->disk->get($metadataPath), true);
                    if (isset($metadata['deleted_at'])) {
                        return strtotime($metadata['deleted_at']);
                    }
                } catch (\Exception $e) {
                    // Fallback a lastModified si hay error
                }
            }

            return $this->disk->lastModified($path);
        });

        // Paginación
        $items = $items->values()->slice($offset, $limit);

        // Construir resultado
        return $items->map(function ($path) {
            $hash = basename($path);
            $metadataPath = 'trash/metadata/' . $hash . '.json';
            $metadata = [];

            // Cargar metadatos si existen
            if ($this->disk->exists($metadataPath)) {
                try {
                    $metadata = json_decode($this->disk->get($metadataPath), true) ?? [];
                } catch (\Exception $e) {
                    // Error al decodificar metadatos
                }
            }

            // Determinar si es un directorio usando las rutas
            $isDirectory = $this->isDirectory($path);

            // Información del elemento
            return [
                'hash' => $hash,
                'size' => $isDirectory ? null : $this->disk->size($path),
                'is_directory' => $isDirectory,
                'type' => $metadata['type'] ?? ($isDirectory ? 'directory' : 'file'),
                'original_path' => $metadata['folder_path'] ?? null,
                'deleted_at' => $metadata['deleted_at'] ?? null,
                'deleted_by' => $metadata['deleted_by'] ?? null,
                'days_in_trash' => isset($metadata['deleted_at'])
                    ? now()->diffInDays(\Carbon\Carbon::parse($metadata['deleted_at']))
                    : null,
                'can_restore' => !$this->disk->exists($metadata['original_path'] ?? ''),
                'metadata' => $metadata,
            ];
        })->all();
    }

    /**
     * Elimina permanentemente elementos antiguos de la papelera
     *
     * @param int $olderThanDays Eliminar elementos más antiguos que este número de días
     * @return int Número de elementos eliminados
     */
    public function emptyTrash(int $olderThanDays = 30): int
    {
        $deleted = 0;
        $cutoffTime = now()->subDays($olderThanDays)->timestamp;

        // Obtener archivos de metadatos
        $metadataFiles = $this->disk->files('trash/metadata');

        foreach ($metadataFiles as $metadataPath) {
            try {
                // Leer metadatos para verificar fecha
                $metadata = json_decode($this->disk->get($metadataPath), true) ?? [];
                $hash = basename($metadataPath, '.json');
                $trashPath = 'trash/' . $hash;

                $deletedAt = $metadata['deleted_at'] ?? null;
                $deletedTime = $deletedAt ? strtotime($deletedAt) : $this->disk->lastModified($metadataPath);

                // Si es más antiguo que el límite, eliminar
                if ($deletedTime < $cutoffTime && $this->disk->exists($trashPath)) {
                    if ($metadata['type'] === 'directory') {
                        $this->disk->deleteDirectory($trashPath);
                    } else {
                        $this->disk->delete($trashPath);
                    }

                    // Eliminar también los metadatos
                    $this->disk->delete($metadataPath);

                    $deleted++;
                }
            } catch (\Exception $e) {
                // Continuar con el siguiente archivo si hay error
            }
        }

        return $deleted;
    }

    /**
     * Crea los metadatos para un elemento que se mueve a la papelera
     *
     * @param Folder $folder Elemento a mover
     * @return array Metadatos del elemento
     */
    protected function createTrashMetadata(Folder $folder): array
    {
        $metadata = [
            'original_path' => $this->getPhysicalPath($folder),
            'deleted_at' => now()->toIso8601String(),
            'folder_id' => $folder->id,
            'folder_path' => $folder->path,
            'folder_name' => $folder->name,
            'type' => $folder->esCarpeta() ? 'directory' : 'file',
            'deleted_by' => Auth::id() ?? $this->getSuperAdmin()->id ?? 1,
            'parent_id' => $folder->parent_id,
            'size' => $folder->esCarpeta() ? null : $folder->size,
            'extension' => $folder->esCarpeta() ? null : $folder->extension,
        ];

        // Si es una carpeta, incluir información sobre hijos
        if ($folder->esCarpeta()) {
            $childrenCount = $folder->children()->count();
            $metadata['children_count'] = $childrenCount;

            if ($childrenCount > 0) {
                $metadata['has_children'] = true;
                $metadata['children_moved_to_trash'] = true;
            }
        }

        return $metadata;
    }

    /**
     * Verifica si una ruta corresponde a un directorio
     * 
     * @param string $path La ruta a verificar
     * @return bool True si es un directorio
     */
    protected function isDirectory(string $path): bool
    {
        // Verificar si está en la lista de directorios del padre
        return in_array($path, $this->disk->directories(dirname($path)));
    }

    /**
     * Obtiene el usuario Super Admin del sistema
     * Utiliza caché para evitar consultas repetidas a la base de datos
     *
     * @return \App\Models\User
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si no se encuentra un Super Admin
     */
    protected function getSuperAdmin(): \App\Models\User
    {
        return Cache::remember(
            key: 'super_admin_user',
            ttl: 60 * 60 * 24, // 24 horas
            callback: fn() => User::role('Super Admin')->firstOrFail()
        );
    }
}

<?php

namespace App\Services\Storage;

use App\Models\Folder;
use App\Models\User;
use App\Events\Storage\Directories\DirectoryCreated;
use App\Events\Storage\Directories\DirectoryMoved;
use App\Events\Storage\Directories\DirectoryDeleted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Servicio para gestión integral de directorios.
 * 
 * Combina operaciones lógicas (FolderService) con operaciones físicas (FileSystemService)
 * para proporcionar operaciones atómicas de gestión de directorios.
 * 
 * Este servicio actúa como orquestador de alto nivel que garantiza que tanto
 * la estructura lógica (base de datos) como la física (sistema de archivos)
 * se mantengan sincronizadas durante las operaciones de directorios.
 * 
 * @package App\Services\Storage
 * @author TeDeLimon
 */
class DirectoryManagementService
{
    protected FolderService $folderService;
    protected FileSystemService $fileSystemService;

    /**
     * Constructor del servicio.
     * 
     * @param FolderService $folderService Servicio para operaciones lógicas de carpetas
     * @param FileSystemService $fileSystemService Servicio para operaciones físicas
     */
    public function __construct(
        FolderService $folderService,
        FileSystemService $fileSystemService
    ) {
        $this->folderService = $folderService;
        $this->fileSystemService = $fileSystemService;
    }

    /**
     * Crea una estructura completa de directorios (lógica + física).
     * 
     * Este método garantiza que tanto la estructura lógica en la base de datos
     * como la estructura física en el sistema de archivos se creen de forma atómica.
     * 
     * @param string $path Ruta completa a crear (formato: "folder1/folder2/folder3")
     * @param array $attributes Atributos adicionales para aplicar a las carpetas
     * @param User|null $owner Propietario de las carpetas
     * @param User|null $creator Usuario que crea las carpetas
     * 
     * @return Folder La carpeta final creada
     * @throws \RuntimeException Si no se puede crear la estructura física
     * @throws \InvalidArgumentException Si la ruta es inválida
     */
    public function createDirectoryPath(
        string $path,
        array $attributes = [],
        ?User $owner = null,
        ?User $creator = null
    ): Folder {
        return DB::transaction(function () use ($path, $attributes, $owner, $creator) {
            // 1. Crear estructura lógica (usando método interno sin transacción)
            $folder = $this->folderService->createPath($path, $attributes, $owner, $creator);

            // 2. Crear estructura física
            $physicalCreated = $this->fileSystemService->ensureDirectoryExists($folder);

            if (!$physicalCreated) {
                throw new \RuntimeException("No se pudo crear la estructura física para: {$path}");
            }

            // 3. Disparar evento
            // event(new DirectoryCreated($folder, $creator ?? Auth::user()));

            Log::info("Directorio creado exitosamente", [
                'path' => $path,
                'folder_id' => $folder->id,
                'creator_id' => $creator?->id ?? Auth::id(),
                'owner_id' => $owner?->id ?? $creator?->id ?? Auth::id()
            ]);

            return $folder;
        });
    }

    /**
     * Crea un subdirectorio dentro de una carpeta padre.
     * 
     * @param Folder $parentFolder Carpeta padre donde crear el subdirectorio
     * @param string $subPath Ruta del subdirectorio (puede incluir múltiples niveles)
     * @param array $attributes Atributos adicionales para el subdirectorio
     * @param User|null $creator Usuario que crea el subdirectorio
     * 
     * @return Folder El subdirectorio creado
     * @throws \RuntimeException Si no se puede crear la estructura física
     * @throws \InvalidArgumentException Si la carpeta padre no es válida
     */
    public function createSubdirectory(
        Folder $parentFolder,
        string $subPath,
        array $attributes = [],
        ?User $creator = null
    ): Folder {
        if (!$parentFolder->esCarpeta()) {
            throw new \InvalidArgumentException('El elemento padre debe ser una carpeta');
        }

        return DB::transaction(function () use ($parentFolder, $subPath, $attributes, $creator) {
            // 1. Crear subdirectorio lógico
            $subfolder = $this->folderService->createSubfolder(
                $parentFolder,
                $subPath,
                $attributes,
                $creator
            );

            // 2. Crear estructura física
            $physicalCreated = $this->fileSystemService->ensureDirectoryExists($subfolder);

            if (!$physicalCreated) {
                throw new \RuntimeException("No se pudo crear la estructura física para el subdirectorio: {$subPath}");
            }

            // 3. Disparar evento
            event(new DirectoryCreated($subfolder, $creator ?? Auth::user()));

            Log::info("Subdirectorio creado exitosamente", [
                'parent_path' => $parentFolder->path,
                'sub_path' => $subPath,
                'full_path' => $subfolder->path,
                'folder_id' => $subfolder->id,
                'creator_id' => $creator?->id ?? Auth::id()
            ]);

            return $subfolder;
        });
    }

    /**
     * Mueve un directorio con toda su estructura a una nueva ubicación.
     * 
     * @param Folder $folder Directorio a mover
     * @param Folder $targetFolder Directorio destino
     * @param bool $overwrite Si sobrescribir en caso de conflicto
     * 
     * @return Folder El directorio movido
     * @throws \RuntimeException Si no se puede mover la estructura física
     * @throws \InvalidArgumentException Si los parámetros no son válidos
     */
    public function moveDirectory(
        Folder $folder,
        Folder $targetFolder,
        bool $overwrite = false
    ): Folder {
        if (!$folder->esCarpeta() || !$targetFolder->esCarpeta()) {
            throw new \InvalidArgumentException('Tanto origen como destino deben ser carpetas');
        }

        $oldPath = $folder->path;

        return DB::transaction(function () use ($folder, $targetFolder, $oldPath, $overwrite) {
            // 1. Mover estructura lógica
            $movedFolder = $this->folderService->moveFolder($folder, $targetFolder, $overwrite);

            // 2. Mover estructura física
            $physicalMoved = $this->fileSystemService->moveDirectory($movedFolder, $oldPath);

            if (!$physicalMoved) {
                throw new \RuntimeException("No se pudo mover la estructura física desde: {$oldPath}");
            }

            // 3. Disparar evento
            event(new DirectoryMoved($movedFolder, $oldPath, Auth::user()));

            Log::info("Directorio movido exitosamente", [
                'from_path' => $oldPath,
                'to_path' => $movedFolder->path,
                'folder_id' => $movedFolder->id,
                'target_folder_id' => $targetFolder->id,
                'overwrite' => $overwrite,
                'user_id' => Auth::id()
            ]);

            return $movedFolder;
        });
    }

    /**
     * Elimina un directorio.
     * 
     * @param Folder $folder Directorio a eliminar
     * @param bool $forceDelete Si hacer eliminación permanente (true) o soft delete (false)
     * 
     * @return bool Si la operación fue exitosa
     * @throws \RuntimeException Si no se puede eliminar la estructura
     * @throws \InvalidArgumentException Si el elemento no es una carpeta
     */
    public function deleteDirectory(
        Folder $folder,
        bool $forceDelete = false
    ): bool {
        if (!$folder->esCarpeta()) {
            throw new \InvalidArgumentException('El elemento debe ser una carpeta');
        }

        return DB::transaction(function () use ($folder, $forceDelete) {
            $folderPath = $folder->path;
            $folderId = $folder->id;

            // 1. Verificar si el directorio tiene subdirectorios o archivos a nivel lógico
            $descendants = $this->folderService->getDescendants($folder);

            // 2. Eliminar todos los descendientes a nivel físico dado que es una estructura plana
            if ($descendants->isNotEmpty()) {
                foreach ($descendants as $descendant) {
                    if ($descendant->esCarpeta()) {
                        $physicalDeleted = $this->fileSystemService->deleteDirectory($descendant, $forceDelete);
                    } else {
                        $physicalDeleted = $this->fileSystemService->deleteFile($descendant, $forceDelete);
                    }

                    if (!$physicalDeleted) {
                        throw new \RuntimeException("No se pudo eliminar la estructura física del descendiente: {$descendant->path}");
                    }
                }
            }

            // 3. Eliminar estructura física del directorio principal
            $physicalDeleted = $this->fileSystemService->deleteDirectory($folder, $forceDelete);

            if (!$physicalDeleted) {
                throw new \RuntimeException("No se pudo eliminar la estructura física: {$folderPath}");
            }

            // 4. Eliminar estructura lógica (usando método unificado sin transacción)
            $logicalDeleted = $this->folderService->deleteFolder($folder, $forceDelete);

            if (!$logicalDeleted) {
                throw new \RuntimeException("No se pudo eliminar la estructura lógica: {$folderPath}");
            }

            // 3. Disparar evento
            event(new DirectoryDeleted($folder, $forceDelete, Auth::user()));

            Log::info("Directorio eliminado exitosamente", [
                'path' => $folderPath,
                'folder_id' => $folderId,
                'descendants_count' => $descendants->count(),
                'force_delete' => $forceDelete,
                'user_id' => Auth::id()
            ]);

            return true;
        });
    }

    /**
     * Mueve un elemento (archivo o carpeta) a la papelera.
     * 
     * Este método es un alias para deleteElement() con forceDelete=false
     * para mayor claridad semántica en el código.
     * 
     * @param Folder $element Elemento a mover a la papelera
     * @return bool Si la operación fue exitosa
     */
    public function moveElementToTrash(Folder $element): bool
    {
        return $this->deleteElement($element, false);
    }

    /**
     * Elimina un elemento permanentemente (alias para deleteElement con forceDelete=true)
     * 
     * @param Folder $element Elemento a eliminar permanentemente
     * @return bool Si la operación fue exitosa
     */
    public function deleteElementPermanently(Folder $element): bool
    {
        return $this->deleteElement($element, true);
    }

    /**
     * Restaura un directorio desde la papelera.
     * 
     * @param Folder $folder Directorio a restaurar
     * @param string|null $customDestination Destino personalizado (opcional)
     * 
     * @return bool Si la operación fue exitosa
     * @throws \RuntimeException Si no se puede restaurar la estructura
     */
    public function restoreDirectory(
        Folder $folder,
        ?string $customDestination = null
    ): bool {
        return DB::transaction(function () use ($folder, $customDestination) {
            $folderPath = $folder->path;
            $folderId = $folder->id;

            // 1. Restaurar estructura física
            $physicalRestored = $this->fileSystemService->restoreFromTrash($folder, $customDestination);

            if (!$physicalRestored) {
                throw new \RuntimeException("No se pudo restaurar la estructura física: {$folderPath}");
            }

            // 2. Restaurar estructura lógica (restore en Eloquent)
            $folder->restore();

            Log::info("Directorio restaurado exitosamente", [
                'path' => $folderPath,
                'folder_id' => $folderId,
                'custom_destination' => $customDestination,
                'user_id' => Auth::id()
            ]);

            return true;
        });
    }

    /**
     * Sincroniza directorios lógicos con físicos.
     * 
     * @param Folder|null $rootFolder Directorio raíz desde donde sincronizar (null = todos)
     * @param bool $prioritizeRecent Si priorizar elementos más recientes
     * @param int|null $limit Límite de elementos a sincronizar
     * 
     * @return array Resultado de la sincronización
     * @throws \InvalidArgumentException Si el directorio raíz no es válido
     */
    public function syncDirectories(
        ?Folder $rootFolder = null,
        bool $prioritizeRecent = true,
        ?int $limit = null
    ): array {
        if ($rootFolder && !$rootFolder->esCarpeta()) {
            throw new \InvalidArgumentException('El directorio raíz debe ser una carpeta');
        }

        Log::info("Iniciando sincronización de directorios", [
            'root_folder_id' => $rootFolder?->id,
            'root_path' => $rootFolder?->path,
            'prioritize_recent' => $prioritizeRecent,
            'limit' => $limit,
            'user_id' => Auth::id()
        ]);

        // Delegar la sincronización al FileSystemService
        $result = $this->fileSystemService->syncAllDirectories($prioritizeRecent, $limit);

        Log::info("Sincronización completada", [
            'synchronized' => $result['synchronized'] ?? 0,
            'errors' => $result['errors'] ?? 0,
            'user_id' => Auth::id()
        ]);

        return $result;
    }

    /**
     * Obtiene información detallada de un directorio.
     * 
     * @param Folder $folder Directorio del que obtener información
     * @param array $options Opciones adicionales para el contenido
     * 
     * @return array Información completa del directorio
     * @throws \InvalidArgumentException Si el elemento no es una carpeta
     */
    public function getDirectoryInfo(Folder $folder, array $options = []): array
    {
        if (!$folder->esCarpeta()) {
            throw new \InvalidArgumentException('El elemento debe ser una carpeta');
        }

        // Obtener contenidos usando FolderService
        $contents = $this->folderService->getFolderContents($folder, $options);

        // Verificar existencia física
        $physicalExists = $this->fileSystemService->ensureDirectoryExists($folder);

        // Calcular estadísticas
        $totalFolders = is_countable($contents['folders']) ? count($contents['folders']) : 0;
        $totalFiles = is_countable($contents['files']) ? count($contents['files']) : 0;
        $totalSize = 0;

        if (is_iterable($contents['files'])) {
            foreach ($contents['files'] as $file) {
                $totalSize += $file->size ?? 0;
            }
        }

        return [
            'folder' => $folder,
            'contents' => $contents,
            'physical_exists' => $physicalExists,
            'stats' => [
                'total_folders' => $totalFolders,
                'total_files' => $totalFiles,
                'total_size' => $totalSize,
                'total_items' => $totalFolders + $totalFiles
            ],
            'meta' => [
                'checked_at' => now(),
                'user_id' => Auth::id()
            ]
        ];
    }

    /**
     * Crea múltiples directorios de forma eficiente.
     * 
     * @param array $paths Array de rutas a crear
     * @param array $commonAttributes Atributos comunes para todos los directorios
     * @param User|null $owner Propietario común
     * @param User|null $creator Creador común
     * 
     * @return array Array de directorios creados
     */
    public function createMultipleDirectories(
        array $paths,
        array $commonAttributes = [],
        ?User $owner = null,
        ?User $creator = null
    ): array {
        $createdFolders = [];
        $errors = [];

        foreach ($paths as $path) {
            try {
                $createdFolders[] = $this->createDirectoryPath(
                    $path,
                    $commonAttributes,
                    $owner,
                    $creator
                );
            } catch (\Exception $e) {
                $errors[$path] = $e->getMessage();
                Log::error("Error creando directorio múltiple", [
                    'path' => $path,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'created' => $createdFolders,
            'errors' => $errors,
            'success_count' => count($createdFolders),
            'error_count' => count($errors)
        ];
    }

    /**
     * Valida la consistencia entre estructura lógica y física.
     * 
     * @param Folder $folder Directorio a validar
     * @param bool $recursive Si validar recursivamente
     * 
     * @return array Resultado de la validación
     */
    public function validateDirectoryConsistency(Folder $folder, bool $recursive = false): array
    {
        if (!$folder->esCarpeta()) {
            throw new \InvalidArgumentException('El elemento debe ser una carpeta');
        }

        $issues = [];

        // Verificar existencia física
        $physicalExists = $this->fileSystemService->ensureDirectoryExists($folder);
        if (!$physicalExists) {
            $issues[] = "Directorio físico no existe: {$folder->path}";
        }

        if ($recursive) {
            $contents = $this->folderService->getFolderContents($folder);

            if (isset($contents['folders'])) {
                foreach ($contents['folders'] as $subfolder) {
                    $subIssues = $this->validateDirectoryConsistency($subfolder, true);
                    $issues = array_merge($issues, $subIssues['issues']);
                }
            }
        }

        return [
            'folder' => $folder,
            'is_consistent' => empty($issues),
            'issues' => $issues,
            'checked_at' => now()
        ];
    }

    /**
     * Elimina un elemento (archivo o carpeta) del sistema.
     * 
     * Este método unificado maneja tanto archivos como carpetas,
     * delegando a los servicios especializados correspondientes.
     * 
     * @param Folder $element Elemento a eliminar (archivo o carpeta)
     * @param bool $forceDelete Si hacer eliminación permanente (true) o soft delete (false)
     * 
     * @return bool Si la operación fue exitosa
     * @throws \RuntimeException Si no se puede eliminar el elemento
     * @throws \InvalidArgumentException Si el elemento no es válido
     */
    public function deleteElement(
        Folder $element,
        bool $forceDelete = false
    ): bool {
        $elementPath = $element->path;
        $elementId = $element->id;
        $isDirectory = $element->esCarpeta();

        try {
            if ($isDirectory) {
                // Delegar a deleteDirectory para carpetas
                return $this->deleteDirectory($element, $forceDelete);
            } else {
                // Delegar a deleteFile para archivos
                return $this->deleteFile($element, $forceDelete);
            }
        } catch (\Exception $e) {
            Log::error("Error eliminando elemento", [
                'element_id' => $elementId,
                'path' => $elementPath,
                'is_directory' => $isDirectory,
                'force_delete' => $forceDelete,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            throw $e;
        }
    }

    /**
     * Elimina un archivo usando los servicios especializados.
     * 
     * @param Folder $file Archivo a eliminar
     * @param bool $forceDelete Si hacer eliminación permanente
     * 
     * @return bool Si la operación fue exitosa
     * @throws \RuntimeException Si no se puede eliminar el archivo
     * @throws \InvalidArgumentException Si el elemento no es un archivo
     */
    protected function deleteFile(
        Folder $file,
        bool $forceDelete = false
    ): bool {
        if (!$file->esArchivo()) {
            throw new \InvalidArgumentException('El elemento debe ser un archivo');
        }

        return DB::transaction(function () use ($file, $forceDelete) {
            $filePath = $file->path;
            $fileId = $file->id;

            // 1. Eliminar estructura física primero
            $physicalDeleted = $this->fileSystemService->deleteFile($file, $forceDelete);

            if (!$physicalDeleted) {
                throw new \RuntimeException("No se pudo eliminar la estructura física del archivo: {$filePath}");
            }

            // 2. Eliminar estructura lógica (usando método unificado sin transacción)
            $logicalDeleted = $this->folderService->deleteFile($file, $forceDelete);

            if (!$logicalDeleted) {
                throw new \RuntimeException("No se pudo eliminar la estructura lógica del archivo: {$filePath}");
            }

            Log::info("Archivo eliminado exitosamente", [
                'path' => $filePath,
                'file_id' => $fileId,
                'force_delete' => $forceDelete,
                'user_id' => Auth::id()
            ]);

            return true;
        });
    }
}

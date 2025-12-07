<?php

namespace App\Interfaces;

use App\Models\Folder;
use Illuminate\Contracts\Filesystem\Filesystem;

interface FileStorageInterface
{
    /**
     * Crea un directorio físico para la carpeta especificada
     * 
     * @param Folder $folder Carpeta para la que crear el directorio físico
     * @return bool Si la operación fue exitosa
     */
    public function createDirectory(Folder $folder): bool;

    /**
     * Elimina un directorio físico para la carpeta especificada
     * 
     * @param Folder $folder Carpeta cuyo directorio físico se elimina
     * @param bool $recursive Si se deben eliminar los contenidos recursivamente
     * @return bool Si la operación fue exitosa
     */
    public function deleteDirectory(Folder $folder, bool $recursive = true): bool;

    /**
     * Mueve un directorio físico de una ubicación a otra
     * 
     * @param Folder $folder Carpeta a mover
     * @param string $oldPath Ruta antigua (antes del movimiento)
     * @return bool Si la operación fue exitosa
     */
    public function moveDirectory(Folder $folder, string $oldPath): bool;

    /**
     * Verifica si existe el directorio físico correspondiente al modelo Folder
     * 
     * @param Folder $folder Carpeta o archivo a verificar
     * @return bool Si el directorio físico existe
     */
    public function directoryExists(Folder $folder): bool;

    /**
     * Obtiene la ruta física del archivo o carpeta
     * 
     * @param Folder $folder Carpeta para la que obtener la ruta física
     * @return string Ruta física del directorio o archivo
     */
    public function getPhysicalPath(Folder $folder): string;

    /**
     * Guarda un archivo físico en el sistema de almacenamiento
     * 
     * @param Folder $file Entrada de archivo en la base de datos
     * @param mixed $content Contenido del archivo (stream, string, etc.)
     * @return bool Si la operación fue exitosa
     */
    public function putFile(Folder $file, $content): bool;

    /**
     * Guarda un archivo en el sistema a partir de una ruta local
     * 
     * @param Folder $file Entrada de archivo en la base de datos
     * @param string $sourcePath Ruta al archivo en el sistema local
     * @return bool Si la operación fue exitosa
     */
    public function putFileFromPath(Folder $file, string $sourcePath): bool;

    /**
     * Obtiene el contenido de un archivo físico si existe
     * 
     * @param Folder $file Entrada de archivo en la base de datos
     * @return mixed Contenido del archivo o FALSE si el archivo no existe
     */
    public function getFile(Folder $file);

    /**
     * Elimina un archivo físico
     * 
     * @param Folder $file Entrada de archivo en la base de datos
     * @return bool Si la operación fue exitosa
     */
    public function deleteFile(Folder $file): bool;

    /**
     * Mueve un archivo físico de una ubicación a otra
     * 
     * @param Folder $file Archivo a mover
     * @param string $oldPath Ruta antigua (antes del movimiento)
     * @return bool Si la operación fue exitosa
     */
    public function moveFile(Folder $file, string $oldPath): bool;

    /**
     * Mueve un elemento a la papelera para soft delete
     * 
     * @param Folder $folder Carpeta o archivo a mover a la papelera
     * @return bool Si la operación fue exitosa
     */
    public function moveToTrash(Folder $folder): bool;

    /**
     * Restaura un elemento desde la papelera
     * 
     * @param Folder $folder Carpeta o archivo a restaurar
     * @param string|null $customDestination Ruta personalizada donde restaurar (opcional)
     * @return bool Si la operación fue exitosa
     */
    public function restoreFromTrash(Folder $folder, ?string $customDestination = null): bool;

    /**
     * Lista elementos en la papelera
     */
    public function listTrashItems(?int $limit = null, int $offset = 0): array;

    /**
     * Elimina elementos antiguos de la papelera
     */
    public function emptyTrash(int $olderThanDays = 30): int;

    /**
     * Get the full path to the file that exists at the given relative path.
     */
    public function getStoragePath(Folder $folder): string;

    /**
     * Obtiene el tamaño del archivo físico
     */
    public function getFileSize(Folder $folder): ?int;
}

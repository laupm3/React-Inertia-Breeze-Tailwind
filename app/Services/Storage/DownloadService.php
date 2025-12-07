<?php

namespace App\Services\Storage;

use App\Models\Folder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
// ✅ IMPORTS CORRECTOS para ZipStream v3
use ZipStream\ZipStream;

/**
 * Servicio reutilizable para la descarga de archivos del sistema.
 * 
 * Este servicio proporciona diferentes métodos para descargar archivos:
 * - Descarga directa de un archivo
 * - Generación de URLs firmadas temporales
 * - Descarga con autenticación y permisos
 * - Descarga de múltiples archivos como ZIP
 * 
 * @package App\Services\File
 */
class DownloadService
{
    /**
     * Servicio para operaciones lógicas de carpetas y archivos.
     */
    protected FolderService $folderService;

    /**
     * Servicio para operaciones físicas de archivos o carpetas.
     */
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
     * Tiempo de expiración por defecto para URLs firmadas (en minutos)
     */
    const DEFAULT_EXPIRATION_MINUTES = 60;

    /**
     * Método genérico para descargar carpetas o archivos.
     * 
     * La peculiaridad es que si es una carpeta, se descarga como ZIP.
     * Si es un archivo, se descarga directamente.
     * 
     * @param Folder $folder El archivo o carpeta a descargar
     * @param bool $inline Si debe mostrarse inline o como descarga
     * @return StreamedResponse|BinaryFileResponse
     * 
     * @throws \InvalidArgumentException Si el objeto no es un archivo válido
     * @throws \RuntimeException Si el archivo no existe en el sistema de archivos
     * @throws \RuntimeException Si ocurre un error al crear el archivo ZIP
     * @throws \RuntimeException Si el archivo no existe en el sistema de archivos
     */
    public function download(Folder $folder, bool $inline = false): StreamedResponse|BinaryFileResponse
    {
        // Si es una carpeta, descargar como ZIP
        if ($folder->esCarpeta()) {
            return $this->downloadAsZip($folder);
        }

        // Si es un archivo, descargar directamente
        return $this->downloadFile($folder, $inline);
    }

    /**
     * Descarga directa de un archivo
     * 
     * @param Folder $folder El archivo a descargar
     * @param bool $inline Si debe mostrarse inline o como descarga
     * @return StreamedResponse|BinaryFileResponse
     * 
     * @throws \InvalidArgumentException Si el objeto no es un archivo válido
     * @throws \RuntimeException Si el archivo no existe en el sistema de archivos
     */
    public function downloadFile(Folder $folder, bool $inline = false): StreamedResponse|BinaryFileResponse
    {
        // Validar que sea un archivo
        if (!$folder->esArchivo()) {
            throw new \InvalidArgumentException('El objeto proporcionado no es un archivo válido.');
        }

        // Verificar que el archivo físico existe
        if (!$this->fileSystemService->directoryExists($folder)) {
            throw new \RuntimeException('El archivo no existe en el sistema de archivos.');
        }

        // Datos necesarios para la descarga
        $storagePath = $this->fileSystemService->getStoragePath($folder);

        $downloadName = $this->getDownloadFileName($folder);
        $headers = $this->getDownloadHeaders($folder);

        return response()->streamDownload(
            callback: function () use ($folder) {
                $content = $this->fileSystemService->getFile($folder);
                echo $content;
            },
            name: $downloadName,
            headers: $headers,
            disposition: $inline ? 'inline' : 'attachment'
        );
    }

    /**
     * Descarga una carpeta como un archivo ZIP.
     * 
     * @param array $files Carpeta a descargar
     * @param string $zipName Sino se especifica, se usará el nombre de la carpeta
     * @return StreamedResponse|null
     * 
     * @throws \InvalidArgumentException Si el elemento no es una carpeta
     * @throws \RuntimeException Si ocurre un error al crear el archivo ZIP
     */
    public function downloadAsZip(Folder $folder, string $zipName = ''): ?StreamedResponse
    {
        // Validar que sea una carpeta
        if (!$folder->esCarpeta()) {
            throw new \InvalidArgumentException('El elemento debe ser una carpeta');
        }

        // Obtener todos los descendientes de la carpeta (archivos y subcarpetas)
        $folders = $this->folderService->getDescendants($folder);

        if ($folders->isEmpty()) {
            Log::info('Carpeta vacía para descarga ZIP', [
                'folder_id' => $folder->id,
                'folder_name' => $folder->name
            ]);
            return null; // No hay archivos para descargar
        }

        // ✅ MEJORAR: Generar nombre del ZIP correctamente
        $zipName = $this->generateZipName($folder, $zipName);

        return $this->createStreamedZipResponse($folders, $zipName, $folder);
    }

    /**
     * Crea una respuesta ZIP streamed optimizada
     * 
     * Este método crea un archivo ZIP temporal y lo envía como respuesta.
     * 
     * @param \Illuminate\Support\Collection<Folder> $folders Carpeta o archivos a incluir en el ZIP
     * @param string $zipName Nombre del archivo ZIP a descargar
     * @param Folder|null $baseFolder Carpeta base para la estructura del ZIP
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     * 
     * @throws \RuntimeException Si no se puede crear el archivo ZIP temporal
     */
    protected function createStreamedZipResponse(Collection $folders, string $zipName, ?Folder $baseFolder = null): StreamedResponse
    {
        return response()->streamDownload(
            callback: function () use ($folders, $baseFolder, $zipName) {

                $zip = new ZipStream(
                    outputName: $zipName,
                    sendHttpHeaders: false,
                    comment: 'Generado por ' . config('app.name')
                );

                try {
                    $this->addItemsToZipStream($zip, $folders, $baseFolder);
                } catch (\Exception $e) {
                    Log::error('Error creando ZIP stream', [
                        'error' => $e->getMessage(),
                        'base_folder' => $baseFolder?->id
                    ]);
                    throw $e;
                } finally {
                    $zip->finish();
                }
            },
            name: $zipName,
            headers: $this->getZipHeaders()
        );
    }

    /**
     * Añade elementos al ZipStream manteniendo estructura
     * 
     * Este método organiza los elementos por tipo (carpetas y archivos)
     * y los añade al ZipStream. Las carpetas se crean como directorios vacíos
     * y los archivos se añaden desde su ruta física.
     * 
     * @param ZipStream $zip El objeto ZipStream donde añadir los elementos
     * @param Collection<Folder> $folders Colección de carpetas y archivos a añadir
     * @param Folder|null $baseFolder Carpeta base para la estructura del ZIP
     */
    protected function addItemsToZipStream(ZipStream $zip, Collection $folders, ?Folder $baseFolder): void
    {
        // Organizar por tipo
        $directories = $folders->filter(fn($item) => $item->esCarpeta())->sortBy('path');
        $files = $folders->filter(fn($item) => $item->esArchivo())->sortBy('path');

        // 1. Crear estructura de directorios
        foreach ($directories as $directory) {
            // Obtener la ruta relativa desde la carpeta base, añade / dado que ZipStream requiere que los directorios terminen en /
            $zipPath = $this->folderService->getRelativePathFromBase($directory, $baseFolder) . '/';
            $zip->addFile($zipPath, '');

            Log::debug('Directorio añadido al ZIP', [
                'directory' => $directory->name,
                'zip_path' => $zipPath
            ]);
        }

        // 2. Añadir archivos
        foreach ($files as $file) {
            if (!$this->fileSystemService->directoryExists($file)) {
                Log::warning('Archivo no encontrado', ['file_id' => $file->id]);
                continue;
            }

            $physicalPath = $this->fileSystemService->getStoragePath($file);
            $zipPath = $this->folderService->getRelativePathFromBase($file, $baseFolder);

            // Stream directo desde archivo físico
            $zip->addFileFromPath($zipPath, $physicalPath);
        }
    }

    /**
     * Genera una URL firmada temporal para descarga
     * 
     * @param Folder $folder El archivo o carpeta para el cual se generará la URL
     * @param int|null $expirationMinutes Minutos hasta expiración (null = default)
     * @param array $additionalParams Parámetros adicionales para la URL
     * @return string URL firmada temporal
     */
    public function generateSignedDownloadUrl(
        Folder $folder,
        ?int $expirationMinutes = null,
        array $additionalParams = []
    ): string {
        $expiration = now()->addMinutes($expirationMinutes ?? self::DEFAULT_EXPIRATION_MINUTES);

        $params = [
            'folder' => $folder->hash,
            ...$additionalParams
        ];

        return URL::temporarySignedRoute(
            'api.v1.files.download.signed',
            $expiration,
            $params
        );
    }

    /**
     * Obtiene el nombre de descarga para el archivo
     * 
     * @param Folder $file
     * @return string
     */
    protected function getDownloadFileName(Folder $file): string
    {
        // Si el archivo tiene nombre, usarlo; si no, usar el nombre del path
        $baseName = $file->name ?? basename($file->path);

        // Asegurar que tenga extensión
        if (!pathinfo($baseName, PATHINFO_EXTENSION) && $file->extension) {
            $baseName .= '.' . $file->extension;
        }

        return $baseName;
    }

    /**
     * Obtiene headers apropiados para la descarga
     * 
     * @param Folder $file
     * @return array
     */
    protected function getDownloadHeaders(Folder $file): array
    {
        $headers = [];

        if ($file->extension) {
            $headers['Content-Type'] = $file->getMimeType();
        }

        // Obtener tamaño si está disponible
        if ($fileSize = $this->fileSystemService->getFileSize($file)) {
            $headers['Content-Length'] = $fileSize;
        }

        return $headers;
    }

    /**
     * Obtiene los headers para la descarga de un ZIP
     * 
     * @return array
     */
    protected function getZipHeaders(): array
    {
        return [
            'Content-Type' => 'application/zip',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ];
    }

    /**
     * ✅ NUEVO: Genera nombre de ZIP correctamente
     * 
     * Genera un nombre de archivo ZIP basado en la carpeta o un nombre personalizado.
     * Si no se proporciona un nombre, usa el nombre de la carpeta.
     * Si el nombre no termina en .zip, lo añade automáticamente.   
     * 
     * @param Folder $folder Carpeta de la que generar el ZIP
     * @param string $zipName Nombre personalizado para el ZIP (opcional)
     * @return string Nombre del archivo ZIP generado
     */
    protected function generateZipName(Folder $folder, string $zipName = ''): string
    {
        if (empty($zipName)) {
            return $this->sanitizeFileName($folder->name) . '.zip';
        }

        // Si no termina en .zip, añadirlo
        if (!str_ends_with(strtolower($zipName), '.zip')) {
            $zipName .= '.zip';
        }

        return $this->sanitizeFileName($zipName);
    }

    /**
     * ✅ NUEVO: Sanitiza nombres de archivo
     * 
     * Elimina caracteres problemáticos de un nombre de archivo.
     * Reemplaza espacios por guiones bajos y elimina caracteres no alfanuméricos
     * excepto guiones, puntos y guiones bajos.
     * 
     * @param string $fileName Nombre del archivo a sanitizar
     * @return string Nombre sanitizado 
     */
    protected function sanitizeFileName(string $fileName): string
    {
        // Remover caracteres problemáticos
        $fileName = preg_replace('/[^\w\s\-\.]/', '', $fileName);
        $fileName = preg_replace('/\s+/', '_', $fileName);

        return trim($fileName, '._-');
    }
}

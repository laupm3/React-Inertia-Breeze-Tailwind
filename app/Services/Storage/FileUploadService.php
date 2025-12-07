<?php

namespace App\Services\Storage;

use App\Models\User;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Storage\FolderService;
use App\Events\Storage\Files\FileUploaded;
use App\Services\Storage\FileSystemService;
use App\Exceptions\Storage\FileProcessingException;
use App\Exceptions\Storage\NoFilesProvidedException;

/**
 * Servicio para manejar la carga de archivos y su integración con el sistema de archivos.
 * 
 * Este servicio actúa como orquestador entre FolderService (para la estructura lógica) 
 * y FileSystemService (para el almacenamiento físico), y maneja la lógica específica
 * de procesamiento de requests de archivos.
 */
class FileUploadService
{
    protected FileSystemService $fileSystemService;
    protected FolderService $folderService;

    /**
     * Constructor del servicio.
     */
    public function __construct(
        FileSystemService $fileSystemService,
        FolderService $folderService
    ) {
        $this->fileSystemService = $fileSystemService;
        $this->folderService = $folderService;
    }

    /**
     * Procesa un archivo desde un UploadedFile de HTTP y lo almacena en el sistema.
     * 
     * @param Folder $destinationFolder Carpeta destino
     * @param UploadedFile $uploadedFile Archivo subido desde HTTP
     * @param array $attributes Atributos adicionales para el archivo
     * @param User|int|null $creator Usuario creador (instancia, ID o null)
     * @param bool $overwrite Sobrescribir si existe
     * 
     * @return Folder|false El modelo de archivo creado o falso si falló
     */
    public function processUploadedFile(
        Folder $destinationFolder,
        UploadedFile $uploadedFile,
        array $attributes = [],
        User|int|null $creator = null,
        bool $overwrite = false
    ): Folder {
        // Extraer información del archivo
        $fileName = $uploadedFile->getClientOriginalName();
        $extension = $uploadedFile->getClientOriginalExtension();
        $size = $uploadedFile->getSize();

        // Ejecutar la transacción
        return DB::transaction(function () use (
            $destinationFolder,
            $uploadedFile,
            $fileName,
            $extension,
            $size,
            $attributes,
            $creator,
            $overwrite
        ) {
            // Preparar atributos del archivo
            $fileAttributes = [
                'size' => $size,
                'extension' => strtolower($extension),
                ...$attributes
            ];

            // Crear registro lógico
            $fileModel = $this->folderService->createFile(
                $destinationFolder,
                $fileName,
                $fileAttributes,
                $creator,
                $overwrite
            );

            // Almacenar físicamente
            $stored = $this->fileSystemService->putFileFromPath($fileModel, $uploadedFile->getRealPath());

            if (!$stored) {
                // Forzar rollback con una excepción
                throw new \RuntimeException("No se pudo almacenar físicamente el archivo");
            }

            // Disparar evento
            $creatorId = $fileModel->created_by;

            // 3. Notificar que se completó la operación esencial (opcional)
            // event(new FileUploaded($fileModel, $creatorId, $destinationFolder));

            // 4. Encolar el procesamiento pesado para que ocurra de forma asíncrona
            // ProcessUploadedFileJob::dispatch($fileModel);

            return $fileModel;
        });
    }

    /**
     * Procesa un archivo desde una ubicación física del sistema
     * 
     * @param Folder $destinationFolder Carpeta destino
     * @param string $filePath Ruta al archivo en el sistema
     * @param array $attributes Atributos adicionales
     * @param User|int|null $creator Usuario creador
     * @param bool $overwrite Sobrescribir si existe
     * 
     * @return Folder El modelo de archivo creado
     * @throws \RuntimeException Si no se puede procesar el archivo
     */
    public function processLocalFile(
        Folder $destinationFolder,
        string $filePath,
        array $attributes = [],
        $creator = null,
        bool $overwrite = false
    ): Folder {

        // Extraer información del archivo fuera de la transacción
        $fileName = basename($filePath);
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);

        // Para estas operaciones el archivo debe existir, pero las validaciones
        // detalladas las hará LocalFileStorage en putFileFromPath
        $size = @filesize($filePath) ?: 0;

        // Ejecutar la transacción
        return DB::transaction(function () use (
            $destinationFolder,
            $filePath,
            $fileName,
            $size,
            $extension,
            $attributes,
            $creator,
            $overwrite
        ) {
            // Preparar atributos del archivo
            $fileAttributes = array_merge([
                'size' => $size,
                'extension' => strtolower($extension),
            ], $attributes);

            // Crear registro lógico
            $fileModel = $this->folderService->createFile(
                $destinationFolder,
                $fileName,
                $fileAttributes,
                $creator,
                $overwrite
            );

            // Almacenar archivo físicamente - aquí se realizarán las validaciones físicas
            $stored = $this->fileSystemService->putFileFromPath($fileModel, $filePath);

            if (!$stored) {
                throw new \RuntimeException(
                    "No se pudo almacenar físicamente el archivo: {$fileName}. " .
                        "Verifique que el archivo exista y sea accesible."
                );
            }

            // Disparar evento
            $creatorId = $fileModel->created_by;
            // Notificar que se completó la operación esencial
            // event(new FileUploaded($fileModel, $creatorId, $destinationFolder));

            return $fileModel;
        });
    }

    /**
     * Procesa todos los archivos subidos en un request HTTP
     * 
     * Este método orquesta el procesamiento completo de archivos enviados mediante un
     * formulario HTTP, gestionando tanto la validación como el almacenamiento y manejando
     * errores de forma apropiada para múltiples archivos.
     *
     * @param Request $request Request HTTP con archivos
     * @param Folder $destinationFolder Carpeta destino
     * @param string $filesField Nombre del campo que contiene los archivos
     * @param User|int|null $creator Usuario creador
     * @param array $attributes Atributos adicionales
     * @param bool $overwrite Sobrescribir si existe
     *
     * @return \Illuminate\Support\Collection<Folder> Colección de archivos creados exitosamente
     * @throws NoFilesProvidedException Si no hay archivos para procesar
     * @throws FileProcessingException Si fallan algunos/todos los archivos
     */
    public function handleUploadRequest(
        Request $request,
        Folder $destinationFolder,
        string $filesField = 'files',
        $creator = null,
        array $attributes = [],
        bool $overwrite = false
    ): \Illuminate\Support\Collection {
        // 1. Validar que existan archivos para procesar
        if (!$request->hasFile($filesField)) {
            throw new NoFilesProvidedException(
                "No se encontraron archivos en el campo '{$filesField}' del request"
            );
        }

        // 2. Normalizar la entrada a un array de archivos
        $uploadedFiles = $request->file($filesField);

        if (!$uploadedFiles) {
            throw new NoFilesProvidedException(
                "El campo '{$filesField}' del request está vacío"
            );
        }

        $uploadedFiles = (!is_array($uploadedFiles)) ? collect([$uploadedFiles]) : collect($uploadedFiles);

        // 3. Inicializar colecciones para resultados y errores
        $processedFiles = collect();
        $errors = collect();

        // 4. Iniciar registro para diagnóstico
        $startTime = microtime(true);
        $logContext = [
            'destination_folder' => $destinationFolder->path,
            'destination_folder_id' => $destinationFolder->id,
            'total_files' => $uploadedFiles->count(),
            'creator_id' => $creator instanceof \App\Models\User ? $creator->id : $creator
        ];
        Log::info("Iniciando procesamiento de {$uploadedFiles->count()} archivos", $logContext);

        // 5. Procesar cada archivo individualmente
        $uploadedFiles->each(function ($uploadedFile, $index) use ($destinationFolder, $attributes, $creator, $overwrite, $processedFiles, $errors) {
            $fileName = $uploadedFile->getClientOriginalName();
            $fileSize = $uploadedFile->getSize();
            $fileContext = ['file_name' => $fileName, 'file_size' => $fileSize, 'index' => $index];

            try {
                // Intentar procesar el archivo actual
                $fileModel = $this->processUploadedFile(
                    $destinationFolder,
                    $uploadedFile,
                    $attributes,
                    $creator,
                    $overwrite
                );

                $processedFiles->push($fileModel);
                
                Log::debug("Archivo procesado exitosamente", $fileContext);
                
            } catch (\Exception $e) {
                $errorInfo = [
                    'file' => $fileName,
                    'error' => $e->getMessage(),
                    'index' => $index,
                    'size' => $fileSize
                ];
                
                $errors->push($errorInfo);
                
                Log::error("Error al procesar archivo: {$e->getMessage()}", [
                    ...$fileContext,
                    'exception' => get_class($e),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        });

        // 6. Registrar resultado final
        $processingTime = round(microtime(true) - $startTime, 2);
        Log::info("Procesamiento completado en {$processingTime}s: {$processedFiles->count()} exitosos, {$errors->count()} fallidos", [
            'destination_folder' => $destinationFolder->path,
            'processing_time' => $processingTime,
            'successful_count' => $processedFiles->count(),
            'failed_count' => $errors->count()
        ]);

        // 7. Manejar errores según la política decidida
        if ($errors->isNotEmpty()) {
            throw new FileProcessingException(
                "Falló el procesamiento de {$errors->count()} archivo(s) de {$uploadedFiles->count()}",
                $errors->toArray(),
                $processedFiles
            );
        }

        return $processedFiles;
    }
}

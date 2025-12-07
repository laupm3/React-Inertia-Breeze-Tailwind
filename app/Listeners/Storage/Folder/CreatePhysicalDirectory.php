<?php

namespace App\Listeners\Storage\Folder;

use App\Events\Storage\Folder\FolderCreated;
use App\Services\Storage\FileSystemService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class CreatePhysicalDirectory
{
    use InteractsWithQueue;

    /**
     * El número de veces que se intentará ejecutar el trabajo.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * El número de segundos a esperar antes de reintentar.
     *
     * @var array
     */
    public $backoff = [1, 5, 10];

    protected $fileSystemService;

    /**
     * Create the event listener.
     */
    public function __construct(FileSystemService $fileSystemService)
    {
        $this->fileSystemService = $fileSystemService;
    }

    /**
     * Handle the event.
     */
    public function handle(FolderCreated $event): void
    {
        // FileSystemService ya maneja las excepciones internamente
        $success = $this->fileSystemService->ensureDirectoryExists($event->folder);

        if (!$success) {
            Log::warning('No se pudo crear el directorio físico', [
                'folder_id' => $event->folder->id,
                'path' => $event->folder->path
            ]);

            $this->release(10); // Reintentar en 10 segundos
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(FolderCreated $event, \Throwable $exception): void
    {
        Log::critical('Falló definitivamente la creación del directorio físico', [
            'folder_id' => $event->folder->id,
            'path' => $event->folder->path,
            'error' => $exception->getMessage()
        ]);

        // Aquí podrías notificar a un administrador sobre el problema
    }
}

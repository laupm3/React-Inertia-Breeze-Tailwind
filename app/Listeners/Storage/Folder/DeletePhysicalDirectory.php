<?php

namespace App\Listeners\Storage\Folder;

use App\Events\Storage\Folder\FolderDeleted;
use App\Services\Storage\FileSystemService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class DeletePhysicalDirectory
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
    public function handle(FolderDeleted $event): void
    {
        // Llamar al método del servicio que borra directorios
        // El segundo parámetro indica si es borrado permanente o soft delete (moveToTrash)
        $success = $this->fileSystemService->deleteDirectory($event->folder, $event->permanent);

        if (!$success) {
            Log::warning('No se pudo eliminar/mover a papelera el directorio físico', [
                'folder_id' => $event->folder->id,
                'path' => $event->folder->path,
                'permanent' => $event->permanent ? 'permanente' : 'papelera'
            ]);

            $this->release(10);
        }
    }

    public function failed(FolderDeleted $event, \Throwable $exception): void
    {
        Log::critical('Falló definitivamente la eliminación del directorio físico', [
            'folder_id' => $event->folder->id,
            'path' => $event->folder->path,
            'permanent' => $event->permanent ? 'permanente' : 'papelera',
            'error' => $exception->getMessage()
        ]);
    }
}

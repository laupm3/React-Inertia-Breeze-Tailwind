<?php

namespace App\Listeners\Storage\Folder;

use App\Events\Storage\Folder\FolderRestored;
use App\Services\Storage\FileSystemService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class RestorePhysicalDirectory
{
    use InteractsWithQueue;

    public $tries = 3;
    public $backoff = [1, 5, 10];

    protected $fileSystemService;

    public function __construct(FileSystemService $fileSystemService)
    {
        $this->fileSystemService = $fileSystemService;
    }

    public function handle(FolderRestored $event): void
    {
        // Usar el método restoreFromTrash de FileSystemService
        $success = $this->fileSystemService->restoreFromTrash(
            $event->folder,
            $event->customDestination ?? null
        );

        if (!$success) {
            Log::warning('No se pudo restaurar el directorio físico', [
                'folder_id' => $event->folder->id,
                'path' => $event->folder->path,
                'custom_destination' => $event->customDestination ?? 'ninguno'
            ]);

            $this->release(10);
        }
    }

    public function failed(FolderRestored $event, \Throwable $exception): void
    {
        Log::critical('Falló definitivamente la restauración del directorio físico', [
            'folder_id' => $event->folder->id,
            'path' => $event->folder->path,
            'error' => $exception->getMessage()
        ]);
    }
}

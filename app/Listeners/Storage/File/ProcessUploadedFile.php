<?php

namespace App\Listeners\Storage\File;

use App\Events\Storage\Files\FileUploaded;
use App\Services\Storage\FileUploadService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessUploadedFile implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * El número de veces que se intentará ejecutar el trabajo.
     */
    public $tries = 3;
    /**
     * El número de segundos a esperar antes de reintentar.
     */
    public $timeout = 120;

    /**
     * The service to handle the file.
     *
     * @var FileUploadService
     */
    protected $fileUploadService;

    /**
     * Create the event listener.
     */
    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Handle the event.
     * 
     * @param \App\Events\Storage\Files\FileUploaded $event
     * @return void
     */
    public function handle(FileUploaded $event): void
    {
        //
    }
}

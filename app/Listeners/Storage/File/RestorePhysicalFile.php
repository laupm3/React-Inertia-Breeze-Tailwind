<?php

namespace App\Listeners\Storage\File;

use App\Events\Storage\Files\FileRestored;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RestorePhysicalFile
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(FileRestored $event): void
    {
        //
    }
}

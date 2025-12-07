<?php

namespace App\Listeners\Storage\File;

use App\Events\Storage\Files\FileUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdatePhysicalFile
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
    public function handle(FileUpdated $event): void
    {
        //
    }
}

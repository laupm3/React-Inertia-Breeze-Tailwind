<?php

namespace App\Listeners\Storage\File;

use App\Events\Storage\Files\FileDeleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class DeletePhysicalFile
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
    public function handle(FileDeleted $event): void
    {
        //
    }
}

<?php

namespace App\Listeners\Storage\File;

use App\Events\Storage\Files\FileMoved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class MovePhysicalFile
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
    public function handle(FileMoved $event): void
    {
        //
    }
}

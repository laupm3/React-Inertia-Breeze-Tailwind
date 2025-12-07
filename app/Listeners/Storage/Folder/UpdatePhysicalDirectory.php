<?php

namespace App\Listeners\Storage\Folder;

use App\Events\Storage\Folder\FolderUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdatePhysicalDirectory
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
    public function handle(FolderUpdated $event): void
    {
        //
    }
}

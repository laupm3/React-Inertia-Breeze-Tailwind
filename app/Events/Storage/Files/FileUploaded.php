<?php

namespace App\Events\Storage\Files;

use App\Models\Folder;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FileUploaded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El archivo que se ha subido.
     *
     * @var \App\Models\Folder
     */
    public Folder $file;

    /**
     * El ID del usuario que subió el archivo.
     *
     * @var int
     */
    public int $userId;

    /**
     * La carpeta donde se subió el archivo.
     *
     * @var \App\Models\Folder|null
     */
    public ?Folder $parentFolder;

    /**
     * Create a new event instance.
     */
    public function __construct(Folder $file, int $userId, ?Folder $parentFolder = null)
    {
        $this->file = $file;
        $this->userId = $userId;
        $this->parentFolder = $parentFolder;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}

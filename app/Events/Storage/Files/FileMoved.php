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

class FileMoved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El archivo que se ha movido.
     *
     * @var \App\Models\Folder
     */
    public Folder $file;

    /**
     * La ruta anterior del archivo.
     *
     * @var string
     */
    public string $oldPath;

    /**
     * El ID de la carpeta padre anterior.
     *
     * @var int|null
     */
    public ?int $oldParentId;

    /**
     * El ID del usuario que movió el archivo.
     *
     * @var int
     */
    public int $userId;

    /**
     * Create a new event instance.
     */
    public function __construct(Folder $file, string $oldPath, ?int $oldParentId, int $userId)
    {
        $this->file = $file;
        $this->oldPath = $oldPath;
        $this->oldParentId = $oldParentId;
        $this->userId = $userId;
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

<?php

namespace App\Events\Storage\Folder;

use App\Models\Folder;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FolderMoved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * La carpeta que se ha movido.
     *
     * @var \App\Models\Folder
     */
    public Folder $folder;

    /**
     * La ruta anterior de la carpeta.
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
     * El ID del usuario que movió la carpeta.
     *
     * @var int
     */
    public int $userId;

    /**
     * Create a new event instance.
     */
    public function __construct(Folder $folder, string $oldPath, ?int $oldParentId, int $userId)
    {
        $this->folder = $folder;
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

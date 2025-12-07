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

class FileRestored
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El archivo que se ha restaurado.
     *
     * @var \App\Models\Folder
     */
    public Folder $file;

    /**
     * El ID del usuario que restauró el archivo.
     *
     * @var int
     */
    public int $userId;

    /**
     * Create a new event instance.
     */
    public function __construct(Folder $file, int $userId)
    {
        $this->file = $file;
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

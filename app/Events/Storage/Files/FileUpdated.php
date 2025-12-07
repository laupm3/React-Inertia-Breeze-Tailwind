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

class FileUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El archivo que se ha actualizado.
     *
     * @var \App\Models\Folder
     */
    public Folder $file;

    /**
     * El ID del usuario que actualizó el archivo.
     *
     * @var int
     */
    public int $userId;

    /**
     * Los atributos que fueron modificados.
     *
     * @var array
     */
    public array $changedAttributes;

    /**
     * Create a new event instance.
     */
    public function __construct(Folder $file, int $userId, array $changedAttributes)
    {
        $this->file = $file;
        $this->userId = $userId;
        $this->changedAttributes = $changedAttributes;
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

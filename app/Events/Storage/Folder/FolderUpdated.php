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

class FolderUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * La carpeta que se ha actualizado.
     *
     * @var \App\Models\Folder
     */
    public Folder $folder;

    /**
     * El ID del usuario que actualizó la carpeta.
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
    public function __construct(Folder $folder, int $userId, array $changedAttributes)
    {
        $this->folder = $folder;
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

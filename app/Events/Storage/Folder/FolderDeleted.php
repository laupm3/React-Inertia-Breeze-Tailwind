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

class FolderDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * La carpeta que se ha eliminado.
     *
     * @var \App\Models\Folder
     */
    public Folder $folder;

    /**
     * El ID del usuario que eliminó la carpeta.
     *
     * @var int
     */
    public int $userId;

    /**
     * Indica si la carpeta se eliminó permanentemente o se movió a la papelera.
     *
     * @var bool
     */
    public bool $permanent;

    /**
     * Create a new event instance.
     */
    public function __construct(Folder $folder, int $userId, bool $permanent = false)
    {
        $this->folder = $folder;
        $this->userId = $userId;
        $this->permanent = $permanent;
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

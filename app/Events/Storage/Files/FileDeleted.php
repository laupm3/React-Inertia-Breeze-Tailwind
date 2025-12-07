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

class FileDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El archivo que se ha eliminado.
     *
     * @var \App\Models\Folder
     */
    public Folder $file;

    /**
     * El ID del usuario que eliminó el archivo.
     *
     * @var int
     */
    public int $userId;

    /**
     * Indica si el archivo se eliminó permanentemente o se movió a la papelera.
     *
     * @var bool
     */
    public bool $permanent;

    /**
     * Create a new event instance.
     */
    public function __construct(Folder $file, int $userId, bool $permanent = false)
    {
        $this->file = $file;
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

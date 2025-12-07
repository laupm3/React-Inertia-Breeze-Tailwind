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
use Illuminate\Support\Facades\Request;

class FilesUploadRequested implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El request que contiene los archivos subidos.
     */
    public Request $request;

    /**
     * La carpeta destino para los archivos.
     */
    public Folder $destinationFolder;

    /**
     * El ID del usuario que realiza la subida.
     */
    public int $userId;

    /**
     * Nombre del campo en el request que contiene los archivos.
     */
    public string $filesField;

    /**
     * Create a new event instance.
     */
    public function __construct(
        Request $request,
        Folder $destinationFolder,
        int $userId,
        string $filesField = 'files'
    ) {
        $this->request = $request;
        $this->destinationFolder = $destinationFolder;
        $this->userId = $userId;
        $this->filesField = $filesField;
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

<?php

namespace App\Events\Storage\Files\Nominas;

use App\Models\File;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NominaFileCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El archivo de nómina que se ha creado.
     *
     * @var \App\Models\File
     */
    public $file;

    /**
     * Create a new event instance.
     */
    public function __construct(File $file)
    {
        $this->file = $file;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('files.nominas'),
        ];
    }
}

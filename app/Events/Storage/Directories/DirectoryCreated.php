<?php

namespace App\Events\Storage\Directories;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento disparado cuando se crea un directorio.
 * 
 * Este evento se dispara después de que tanto la estructura lógica
 * como la física del directorio han sido creadas exitosamente.
 */
class DirectoryCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El directorio que fue creado.
     *
     * @var Folder
     */
    public Folder $directory;

    /**
     * El usuario que creó el directorio.
     *
     * @var User|null
     */
    public ?User $creator;

    /**
     * Marca de tiempo de cuando se creó el directorio.
     *
     * @var \Carbon\Carbon
     */
    public $createdAt;

    /**
     * Create a new event instance.
     *
     * @param Folder $directory El directorio creado
     * @param User|null $creator El usuario que creó el directorio
     */
    public function __construct(Folder $directory, ?User $creator = null)
    {
        $this->directory = $directory;
        $this->creator = $creator;
        $this->createdAt = now();
    }

    /**
     * Obtiene información del evento para logging.
     *
     * @return array
     */
    public function getEventData(): array
    {
        return [
            'event' => 'directory_created',
            'directory_id' => $this->directory->id,
            'directory_path' => $this->directory->path,
            'directory_name' => $this->directory->name,
            'creator_id' => $this->creator?->id,
            'creator_name' => $this->creator?->name,
            'created_at' => $this->createdAt->toISOString(),
        ];
    }
}

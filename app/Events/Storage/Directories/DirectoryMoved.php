<?php

namespace App\Events\Storage\Directories;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento disparado cuando se mueve un directorio.
 * 
 * Este evento se dispara después de que tanto la estructura lógica
 * como la física del directorio han sido movidas exitosamente.
 */
class DirectoryMoved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El directorio que fue movido.
     *
     * @var Folder
     */
    public Folder $directory;

    /**
     * La ruta anterior del directorio.
     *
     * @var string
     */
    public string $oldPath;

    /**
     * El usuario que movió el directorio.
     *
     * @var User|null
     */
    public ?User $user;

    /**
     * Marca de tiempo de cuando se movió el directorio.
     *
     * @var \Carbon\Carbon
     */
    public $movedAt;

    /**
     * Create a new event instance.
     *
     * @param Folder $directory El directorio movido
     * @param string $oldPath La ruta anterior del directorio
     * @param User|null $user El usuario que movió el directorio
     */
    public function __construct(Folder $directory, string $oldPath, ?User $user = null)
    {
        $this->directory = $directory;
        $this->oldPath = $oldPath;
        $this->user = $user;
        $this->movedAt = now();
    }

    /**
     * Obtiene información del evento para logging.
     *
     * @return array
     */
    public function getEventData(): array
    {
        return [
            'event' => 'directory_moved',
            'directory_id' => $this->directory->id,
            'directory_name' => $this->directory->name,
            'old_path' => $this->oldPath,
            'new_path' => $this->directory->path,
            'user_id' => $this->user?->id,
            'user_name' => $this->user?->name,
            'moved_at' => $this->movedAt->toISOString(),
        ];
    }
}

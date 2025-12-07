<?php

namespace App\Events\Storage\Directories;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento disparado cuando se elimina un directorio.
 * 
 * Este evento se dispara después de que tanto la estructura lógica
 * como la física del directorio han sido eliminadas exitosamente.
 */
class DirectoryDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El directorio que fue eliminado.
     *
     * @var Folder
     */
    public Folder $directory;

    /**
     * Si fue una eliminación forzada (permanente).
     *
     * @var bool
     */
    public bool $forceDelete;

    /**
     * El usuario que eliminó el directorio.
     *
     * @var User|null
     */
    public ?User $user;

    /**
     * Marca de tiempo de cuando se eliminó el directorio.
     *
     * @var \Carbon\Carbon
     */
    public $deletedAt;

    /**
     * Create a new event instance.
     *
     * @param Folder $directory El directorio eliminado
     * @param bool $forceDelete Si fue eliminación forzada
     * @param User|null $user El usuario que eliminó el directorio
     */
    public function __construct(Folder $directory, bool $forceDelete = false, ?User $user = null)
    {
        $this->directory = $directory;
        $this->forceDelete = $forceDelete;
        $this->user = $user;
        $this->deletedAt = now();
    }

    /**
     * Obtiene información del evento para logging.
     *
     * @return array
     */
    public function getEventData(): array
    {
        return [
            'event' => 'directory_deleted',
            'directory_id' => $this->directory->id,
            'directory_path' => $this->directory->path,
            'directory_name' => $this->directory->name,
            'force_delete' => $this->forceDelete,
            'user_id' => $this->user?->id,
            'user_name' => $this->user?->name,
            'deleted_at' => $this->deletedAt->toISOString(),
        ];
    }

    /**
     * Determina si la eliminación fue permanente.
     *
     * @return bool
     */
    public function isPermanentDelete(): bool
    {
        return $this->forceDelete;
    }

    /**
     * Determina si la eliminación fue soft delete.
     *
     * @return bool
     */
    public function isSoftDelete(): bool
    {
        return !$this->forceDelete;
    }
}

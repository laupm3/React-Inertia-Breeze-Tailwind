<?php

namespace App\Events\Logs;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Database\Eloquent\Model;

/**
 * Evento para registrar cambios en los modelos
 */
class ModelChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $eventType;
    public $model;
    public $modelData;
    public $changes;
    public $original;
    public $userId;
    public $ipAddress;
    public $userAgent;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $eventType,
        Model $model,
        ?array $modelData = null,
        ?array $changes = null,
        ?array $original = null,
        ?string $userId = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ) {
        $this->eventType = $eventType;
        $this->model = $model;
        $this->modelData = $modelData;
        $this->changes = $changes;
        $this->original = $original;
        $this->userId = $userId;
        $this->ipAddress = $ipAddress;
        $this->userAgent = $userAgent;
    }
} 
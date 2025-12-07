<?php

namespace App\Config;

use Carbon\Carbon;

class NotificationConfig
{
    /**
     * Crea una nueva configuración de notificación
     */
    public function __construct(
        public string $model,
        public string $action,
        public array $recipients,
        public array $channels = ['broadcast', 'database'],
        public ?Carbon $scheduledAt = null,
        public array $extraData = [],
        public ?string $customTitle = null,
        public ?string $customContent = null,
        public array $databaseConfig = []
    ) {}

    /**
     * Verifica si la notificación está programada
     */
    public function isScheduled(): bool
    {
        return $this->scheduledAt !== null && $this->scheduledAt->isFuture();
    }

    /**
     * Verifica si debe guardarse inmediatamente en la base de datos
     */
    public function shouldSaveImmediately(): bool
    {
        return $this->databaseConfig['save_immediately'] ?? true;
    }

    /**
     * Obtiene los canales excluyendo database (para manejo especial)
     */
    public function getChannelsExcludingDatabase(): array
    {
        return array_filter($this->channels, function($channel) {
            return $channel !== 'database';
        });
    }

    /**
     * Verifica si incluye el canal database
     */
    public function includesDatabaseChannel(): bool
    {
        return in_array('database', $this->channels);
    }

    /**
     * Obtiene campos personalizados para la base de datos
     */
    public function getCustomFields(): array
    {
        return $this->databaseConfig['custom_fields'] ?? [];
    }
} 
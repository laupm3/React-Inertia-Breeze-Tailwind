<?php

namespace App\Notifications;

use App\Channels\BrevoChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SystemNotification extends Notification implements ShouldQueue 
{
    use Queueable;

    /**
     * Crea una nueva instancia de notificación.
     *
     * @param string $type Tipo de notificación (ej: 'system.empresa.updated')
     * @param string $title Título de la notificación
     * @param string|array $sender Remitente de la notificación (nombre o array con datos)
     * @param string $message Mensaje principal
     * @param array $data Datos adicionales específicos
     * @param array $channels Canales de envío (por defecto solo broadcast)
     */
    public function __construct(
        public string $type,
        public string $title,
        public $sender,
        public string $message,
        public array $data = [],
        public array $channels = ['broadcast']
    ) {}

    /**
     * Determina por qué canales se enviará la notificación
     */
    public function via($notifiable): array
    {
        $via = [];

        if (in_array('broadcast', $this->channels)) {
            $via[] = 'broadcast';
        }

        if (in_array('mail', $this->channels)) {
            $via[] = BrevoChannel::class;
        }

        if (in_array('database', $this->channels)) {
            $via[] = 'database';
        }

        return $via;
    }

    /**
     * Obtener la representación de la notificación para broadcast.
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        Log::info('Entre a toBroadcast');
        return new BroadcastMessage([
            'id' => $this->data['notification_id'] ?? null,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'sender' => $this->sender
        ]);
    }

    /**
     * Datos para la plantilla de Brevo
     */
    public function toBrevo($notifiable): array
    {
        $brevoParams = $this->data['brevo_params'] ?? [];
        
        Log::info('Preparando datos para Brevo', [
            'brevo_params' => $brevoParams,
            'all_data' => $this->data
        ]);
        
        // Datos base
        $baseParams = [
            'title' => $this->title,
            'message' => nl2br($this->message),
            'date' => now()->format('d/m/Y H:i'),
        ];
        
        // Datos de la plantilla específica
        $templateData = $brevoParams['template_data'] ?? [];
        
        // Template ID
        $templateId = $brevoParams['template_id'] ?? 46;
        
        // Combinar todos los parámetros
        $allParams = array_merge($baseParams, $templateData, [
            'template_id' => $templateId,
            'subject' => $brevoParams['subject'] ?? $this->title,
        ]);
        
        Log::info('Datos finales para Brevo', [
            'template_id' => $templateId,
            'params_count' => count($allParams),
            'params_keys' => array_keys($allParams)
        ]);
        
        return [
            'params' => $allParams
        ];
    }

    public function toDatabase($notifiable): array
    {
        Log::info('Guardando notificación en la base de datos', [
            'type' => $this->type,
            'recipient' => $notifiable->id,
            'title' => $this->title
        ]);

        return [
            'id' => $this->data['notification_id'] ?? null,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'sender' => $this->sender,
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }
}

<?php

namespace App\Listeners\User;

use App\Events\User\UserCreated;
use App\Traits\GenericNotificationTrait;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendWelcomeNotification implements ShouldQueue
{
    use GenericNotificationTrait;

    public function handle(UserCreated $event): void
    {
        Log::info('🎯 SendWelcomeNotification.handle() ejecutándose', [
            'user_id' => $event->user->id,
            'user_email' => $event->user->email,
            'listener_class' => get_class($this)
        ]);

        Log::info('🎉 Enviando notificación de bienvenida', [
            'user_id' => $event->user->id,
            'user_email' => $event->user->email,
            'user_name' => $event->user->name,
            'has_temporary_password' => !empty($event->temporaryPassword),
            'actor_id' => $event->actor?->id ?? 'Sistema'
        ]);

        // Preparamos datos extra para la notificación
        $notificationData = [
            'nombre' => $event->user->name,
            'apellidos' => $event->user->last_name ?? '',
            'username' => $event->user->email,
            'password' => $event->temporaryPassword ?? 'password',
            'welcome_date' => now()->format('d/m/Y H:i'),
        ];

        Log::info('📋 Datos de notificación preparados', [
            'notification_data' => $notificationData,
            'action' => 'bienvenido'
        ]);

        // Dispara la notificación usando el sistema centralizado con la acción 'bienvenido'
        $this->sendNotification($event->user, 'bienvenido', $notificationData);
        
        Log::info('✅ Notificación de bienvenida enviada correctamente', [
            'user_id' => $event->user->id
        ]);
    }
}

<?php

namespace App\Traits;

use App\Models\Notification;
use App\Models\User;
use App\Notifications\SystemNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

trait NotificacionesTrait
{
    /**
     * Notifica a un usuario específico
     */
    protected function notifyUser(
        User $user,
        $model,
        string $action,
        bool $isEmployee = false,
        array $channels = ['broadcast', 'mail'],
        ?Carbon $delay = null
    ): void {
        $title = $this->getTitle($model, $action, $isEmployee);
        $content = $this->createContent($model, $action, $isEmployee);
        $data = $this->prepareData($model, $action);

        // Obtener información del remitente
        $authUser = auth()->user();
        $senderInfo = null;

        if ($authUser) {
            $senderInfo = [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'email' => $authUser->email,
                'avatar' => $authUser->profile_photo_url ?? null
            ];
        } else {
            $senderInfo = 'Sistema';
        }

        // 1. Crear notificación en base de datos (solo para notificaciones inmediatas)
        $notificationId = null;
        if (!$delay) {
            $dbNotification = Notification::create([
                'sender_id' => $authUser ? $authUser->id : 1,
                'receiver_id' => $user->id,
                'notifiable_model' => get_class($model),
                'model_id' => $model->id,
                'action_model' => $action,
                'title' => $title,
                'content' => $content,
                'data' => $data,
                'sent_at' => now(),
            ]);

            $notificationId = $dbNotification->id;
            $data['notification_id'] = $notificationId;
        }

        // 2. Enviar notificación (inmediata o programada)
        $notification = new SystemNotification(
            type: $this->getNotificationType($model) . '.' . $action,
            title: $title,
            sender: $senderInfo,
            message: $content,
            data: array_merge(['action' => $action], $data),
            channels: $channels
        );

        if ($delay) {
            $user->notify($notification->delay($delay));

            // Programar la creación de la notificación en la base de datos
            $this->scheduleNotificationRecord($user, $model, $action, $delay, $isEmployee, $senderInfo);
        } else {
            $user->notify($notification);
        }
    }

    /**
     * Programa la creación de un registro de notificación en la base de datos
     */
    protected function scheduleNotificationRecord(
        User $user,
        $model,
        string $action,
        Carbon $scheduledDate,
        bool $isEmployee = false,
        $senderInfo = null
    ): void {
        // Obtener el ID del remitente
        $senderId = auth()->id() ?? 1;
        if (is_array($senderInfo) && isset($senderInfo['id'])) {
            $senderId = $senderInfo['id'];
        }

        // Programar un job para crear el registro en la base de datos cuando se envíe la notificación
        \Illuminate\Support\Facades\Queue::later(
            $scheduledDate,
            new \App\Jobs\CreateNotificationRecord(
                $senderId,
                $user->id,
                get_class($model),
                $model->id,
                $action,
                $this->getTitle($model, $action, $isEmployee),
                $this->createContent($model, $action, $isEmployee),
                array_merge(
                    $this->prepareData($model, $action),
                    ['sender' => $senderInfo]
                ),
                ['broadcast', 'mail']  // Canales por defecto
            ),
            'notifications'  // Especificar la cola 'notifications'
        );

        Log::info("Registro de notificación programado para {$scheduledDate->format('Y-m-d H:i:s')}", [
            'user_id' => $user->id,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'action' => $action
        ]);
    }

    /**
     * Notifica a múltiples usuarios con el mismo rol
     */
    protected function notifyUsersByRole(
        array $roleNames,
        $model,
        string $action,
        bool $isEmployee = false,
        array $channels = ['broadcast']
    ): void {
        $users = $this->getUsersByRole($roleNames);

        foreach ($users as $user) {
            $this->notifyUser($user, $model, $action, $isEmployee, $channels);
        }
    }

    /**
     * Programa notificaciones para fechas futuras
     */
    protected function scheduleNotification(
        User $user,
        $model,
        string $action,
        Carbon $scheduledDate,
        bool $isEmployee = false,
        array $channels = ['broadcast', 'mail'],
        array $extraData = []
    ): void {
        if ($scheduledDate->isPast()) {
            return;
        }

        // Asegurarse de que days_remaining sea un entero si existe
        if (isset($extraData['days_remaining'])) {
            $extraData['days_remaining'] = (int)$extraData['days_remaining'];
        }

        // Obtener información del remitente
        $authUser = auth()->user();
        $senderInfo = null;

        if ($authUser) {
            $senderInfo = [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'email' => $authUser->email,
                'avatar' => $authUser->profile_photo_url ?? null
            ];
        } else {
            $senderInfo = 'Sistema';
        }

        $title = $this->getTitle($model, $action, $isEmployee);
        $content = $this->createContent($model, $action, $isEmployee);
        $data = array_merge($this->prepareData($model, $action), $extraData);

        // Programar la notificación
        $user->notify(
            (new SystemNotification(
                type: $this->getNotificationType($model) . '.' . $action,
                title: $title,
                sender: $senderInfo,
                message: $content,
                data: array_merge(['action' => $action], $data),
                channels: $channels
            ))->delay($scheduledDate)/* ->onQueue('notifications') */ // Es para que se ejecute en la cola 'notifications' pero lo dejo para despues
        );

        // Programar la creación del registro en la base de datos
        $this->scheduleNotificationRecord($user, $model, $action, $scheduledDate, $isEmployee, $senderInfo);
    }

    /**
     * Obtiene usuarios con roles específicos
     */
    protected function getUsersByRole(array $roleNames): \Illuminate\Database\Eloquent\Collection
    {
        $roleIds = Role::whereIn('name', $roleNames)
            ->where('guard_name', 'web')
            ->pluck('id');

        return User::whereHas('roles', function ($q) use ($roleIds) {
            $q->whereIn('role_id', $roleIds);
        })
            ->get();
    }

    /**
     * Determina el tipo de notificación basado en el modelo
     */
    protected function getNotificationType($model): string
    {
        $className = class_basename($model);
        return strtolower($className);
    }

    /**
     * Cancela notificaciones programadas
     */
    protected function cancelScheduledNotifications($model, string $type): int
    {
        return \DB::table('jobs')
            ->where('payload', 'like', '%' . $type . '%')
            ->where('payload', 'like', '%' . $model->id . '%')
            ->delete();
    }

    /**
     * Obtiene el título para la notificación
     * Este método debe ser implementado por las clases que usen este trait
     */
    abstract protected function getTitle($model, string $action, bool $isEmployee = false): string;

    /**
     * Crea el contenido para la notificación
     * Este método debe ser implementado por las clases que usen este trait
     */
    abstract protected function createContent($model, string $action, bool $isEmployee = false): string;

    /**
     * Prepara los datos para la notificación
     * Este método debe ser implementado por las clases que usen este trait
     */
    abstract protected function prepareData($model, string $action): array;
}

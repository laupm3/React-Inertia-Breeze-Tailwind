<?php

namespace App\Traits;

use App\Config\NotificationConfig;
use App\Services\GenericNotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

trait GenericNotificationTrait
{
    /**
     * Envía notificación usando configuración automática
     */
    protected function sendNotification($model, string $action, array $config = []): void
    {
        try {
            app(GenericNotificationService::class)->send($model, $action, $config);
            
            Log::info("✅ Notificación enviada correctamente", [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificación", [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Programa notificación usando configuración automática
     */
    protected function scheduleNotification($model, string $action, Carbon $date, array $config = []): void
    {
        try {
            app(GenericNotificationService::class)->schedule($model, $action, $date, $config);
            
            Log::info("✅ Notificación programada correctamente", [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action,
                'scheduled_date' => $date->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error al programar notificación", [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Cancela notificaciones programadas
     */
    protected function cancelNotifications($model, string $type): int
    {
        try {
            $deletedCount = app(GenericNotificationService::class)->cancel($model, $type);
            
            Log::info("✅ Notificaciones canceladas", [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'type' => $type,
                'deleted_count' => $deletedCount
            ]);
            
            return $deletedCount;
        } catch (\Exception $e) {
            Log::error("❌ Error al cancelar notificaciones", [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'type' => $type,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
} 
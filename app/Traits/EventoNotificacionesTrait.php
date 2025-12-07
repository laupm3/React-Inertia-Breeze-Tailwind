<?php

namespace App\Traits;

use App\Models\Evento;
use Illuminate\Support\Facades\Log;

trait EventoNotificacionesTrait
{
    use NotificacionesTrait;
    
    /**
     * Notifica a todos los participantes sobre un cambio en un evento
     */
    protected function notifyAdminsAboutEvento(Evento $evento, string $action): void
    {
        try {
            // Asegurarnos de que los usuarios estén cargados
            if (!$evento->relationLoaded('users')) {
                $evento->load('users');
            }
            
            // Obtener todos los participantes del evento
            $participantes = $evento->users;
            
            foreach ($participantes as $participante) {
                $this->notifyUser(
                    $participante,
                    $evento,
                    $action,
                    false,
                    ['broadcast', 'database']
                );
            }
            
            Log::info("✅ Notificaciones de evento ({$action}) enviadas correctamente a " . $participantes->count() . " participantes");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de evento ({$action}):", [
                'error' => $e->getMessage(),
                'evento_id' => $evento->id
            ]);
            throw $e;
        }
    }
    
    /**
     * Obtiene el título para la notificación de evento
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Evento)) {
            return "Notificación del Sistema";
        }
        
        return match($action) {
            'created' => "Nuevo Evento: {$model->nombre}",
            'updated' => "Evento Actualizado: {$model->nombre}",
            'deleted' => "Evento Eliminado: {$model->nombre}",
            default => "Evento: {$model->nombre}"
        };
    }
    
    /**
     * Crea el contenido para la notificación de evento
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Evento)) {
            return "Notificación del sistema";
        }
        
        $prefix = match($action) {
            'created' => "Se ha creado un nuevo evento en el sistema",
            'updated' => "Se ha actualizado un evento en el sistema",
            'deleted' => "Se ha eliminado un evento del sistema",
            default => "Información de evento"
        };
        
        // Asegurarnos de que tipo_evento esté cargado
        if (!$model->relationLoaded('tipoEvento')) {
            $model->load('tipoEvento');
        }
        
        return $prefix . ".\n\n" .
            "Detalles del evento:\n" .
            "• Título: {$model->nombre}\n" .
            "• Tipo: " . ($model->tipoEvento ? $model->tipoEvento->nombre : 'No especificado') . "\n" .
            "• Fecha inicio: " . $model->fecha_inicio->format('d/m/Y H:i') . "\n" .
            "• Fecha fin: " . ($model->fecha_fin ? $model->fecha_fin->format('d/m/Y H:i') : 'No especificada');
    }
    
    /**
     * Prepara los datos para la notificación de evento
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Evento)) {
            return [];
        }
        
        // Asegurarnos de que tipo_evento esté cargado
        if (!$model->relationLoaded('tipoEvento')) {
            $model->load('tipoEvento');
        }
        
        return [
            'evento_id' => $model->id,
            //'action_url' => route('eventos.show', $model->id),
            'action_text' => 'Ver Evento',
            'evento' => [
                'nombre' => $model->nombre,
                'tipo' => $model->tipoEvento ? $model->tipoEvento->nombre : 'No especificado',
                'fecha_inicio' => $model->fecha_inicio->format('Y-m-d H:i:s'),
                'fecha_fin' => $model->fecha_fin ? $model->fecha_fin->format('Y-m-d H:i:s') : null,
            ]
        ];
    }
} 
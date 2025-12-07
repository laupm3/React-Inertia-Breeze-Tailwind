<?php

namespace App\Listeners;

use App\Models\SystemEvent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class LogEventToDatabase
{
    /**
     * Handle the event.
     */
    public function handle($event): void
    {
        $eventClass = get_class($event);
        $eventName = class_basename($eventClass);
        
        try {
            // Determinar el tipo de entidad y sus datos
            $entityType = null;
            $entityId = null;
            $entityName = null;
            $eventData = [];
            
            // Eventos de asignación
            if (str_contains($eventClass, 'Asignacion')) {
                $entityType = 'Asignacion';
                
                if (property_exists($event, 'asignacion')) {
                    // Eventos de creación y actualización
                    $entityId = $event->asignacion->id;
                    $entityName = $event->asignacion->nombre;
                    $eventData['asignacion'] = $event->asignacion->toArray();
                    
                    // Datos específicos para actualizaciones
                    if (method_exists($event, 'getOriginal') && $event->getOriginal()) {
                        $changes = [];
                        foreach ($event->getOriginal() as $key => $value) {
                            if ($event->asignacion->$key !== $value) {
                                $changes[$key] = [
                                    'old' => $value,
                                    'new' => $event->asignacion->$key
                                ];
                            }
                        }
                        if (!empty($changes)) {
                            $eventData['changes'] = $changes;
                        }
                    }
                } elseif (property_exists($event, 'asignacionId')) {
                    // Evento de eliminación
                    $entityId = $event->asignacionId;
                    $entityName = $event->nombre;
                    $eventData['deleted'] = true;
                }
            }
            
            // Registrar evento en la base de datos
            $record = SystemEvent::record(
                $eventName,
                $entityType,
                $entityId,
                $entityName,
                $eventData
            );
            
            Log::info("Evento {$eventName} registrado con ID: {$record->id}", [
                'event_id' => $record->id,
                'entity_name' => $entityName,
                'user_id' => Auth::id()
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error registrando evento {$eventName}: {$e->getMessage()}", [
                'exception' => $e
            ]);
        }
    }
}
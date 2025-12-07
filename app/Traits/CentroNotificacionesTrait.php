<?php

namespace App\Traits;

use App\Events\Centro\CentroActualizado;
use App\Models\Centro;
use App\Events\CentroUpdated;
use Illuminate\Support\Facades\Log;

trait CentroNotificacionesTrait
{
    use NotificacionesTrait;
    
    /**
     * Notifica a todos los administradores sobre un cambio en un centro
     */
    protected function notifyAdminsAboutCentro(Centro $centro, string $action): void
    {
        try {
            // Notificar a administradores
            $this->notifyUsersByRole(['Administrator', 'Super Admin'], $centro, $action);
            
            Log::info("✅ Notificaciones de centro ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de centro ({$action}):", [
                'error' => $e->getMessage(),
                'centro_id' => $centro->id
            ]);
            throw $e;
        }
    }
    /**
     * Notifica a todos los empleados sobre un cambio en un centro
     */
    protected function notifyUsersAboutCentro(Centro $centro, string $action): void
    {
        try {
            // Notificar a empleados
            $this->notifyUsersByRole(['Employee'], $centro, $action, true);
            
            Log::info("✅ Notificaciones de centro ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de centro ({$action}):", [
                'error' => $e->getMessage(),
                'centro_id' => $centro->id
            ]);
            throw $e;
        }
    }
    
    /**
     * Obtiene el título para la notificación de centro
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Centro)) {
            return "Notificación del Sistema";
        }
        
        return match($action) {
            'created' => "Nuevo Centro: {$model->nombre}",
            'updated' => "Centro Actualizado: {$model->nombre}",
            'deleted' => "Centro Eliminado: {$model->nombre}",
            default => "Centro: {$model->nombre}"
        };
    }
    
    /**
     * Crea el contenido para la notificación de centro
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Centro)) {
            return "Notificación del sistema";
        }
        
        $prefix = match($action) {
            'created' => "Se ha creado un nuevo Centro en el sistema",
            'updated' => "Se ha actualizado un Centro en el sistema",
            'deleted' => "Se ha eliminado un Centro del sistema",
            default => "Información de Centro"
        };
        
        $content = $prefix . ".\n\n" .
            "Detalles del Centro:\n" .
            "• Nombre: {$model->nombre}\n" .
            "• Administrador del Centro: {$model->responsable_id}\n" .
            "• Coordinador: {$model->coordinador_id}\n" .
            "• Dirección: {$model->direccion_id}\n" .
            "• Email: {$model->email}\n" .
            "• Teléfono: {$model->telefono}\n" .
            "• Empresa: {$model->empresa_id}";
            
        // Añadir estado solo si no es una eliminación
        if ($action !== 'deleted') {
            $content .= "\n• Estado: {$model->estado_id}";
        }
        
        return $content;
    }
    
    /**
     * Prepara los datos para la notificación de centro
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Centro)) {
            return [];
        }
        
        $data = [
            'centro_id' => $model->id,
            'action_url' => route('admin.centros.index'),
            'action_text' => 'Ver centros',
            'centro' => [
                'nombre' => $model->nombre,
                'responsable_id' => $model->responsable_id,
                'coordinador_id' => $model->coordinador_id,
                'direccion_id' => $model->direccion_id,
                'email' => $model->email,
                'telefono' => $model->telefono,
                'empresa_id' => $model->empresa_id,
            ]
        ];
        
        // Añadir estado solo si no es una eliminación
        if ($action !== 'deleted') {
            $data['centro']['estado_id'] = $model->estado_id;
        }
        
        return $data;
    }

    /**
     * Notifica en tiempo real a los usuarios asignados a un centro
     */
    protected function broadcastCentroUpdate(Centro $centro, string $action): void
    {
        try {
            // Obtener todos los usuarios asignados al centro
            $usuarios = $centro->usuarios()->get();
            
            if ($usuarios->isEmpty()) {
                Log::info("No hay usuarios asignados para notificación en tiempo real", [
                    'centro_id' => $centro->id
                ]);
                return;
            }
            
            $titulo = $this->getTitle($centro, $action, true);
            $contenido = $this->createContent($centro, $action, true);
            $datos = $this->prepareData($centro, $action);
            
            // Broadcast a cada usuario en su canal privado
            foreach ($usuarios as $usuario) {
                // Broadcast al canal del usuario
                broadcast(new CentroActualizado(
                    $usuario,
                    $centro,
                    $action,
                    $titulo,
                    $contenido,
                    $datos
                ))->toOthers();
                
                Log::info("Notificación en tiempo real enviada al usuario", [
                    'user_id' => $usuario->id,
                    'centro_id' => $centro->id,
                    'action' => $action
                ]);
            }
            
            // También hacer broadcast al canal específico del centro
            broadcast(new CentroActualizado(
                null,
                $centro,
                $action,
                $titulo,
                $contenido,
                $datos
            ))->toOthers()->onChannel('centro.' . $centro->id);
            
            Log::info("✅ Broadcast de centro ({$action}) enviado correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar broadcast de centro ({$action}):", [
                'error' => $e->getMessage(),
                'centro_id' => $centro->id
            ]);
        }
    }
}
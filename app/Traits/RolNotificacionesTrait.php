<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

trait RolNotificacionesTrait
{
    use NotificacionesTrait;
    
    /**
     * Notifica a todos los administradores sobre un cambio en un rol
     */
    protected function notifyAdminsAboutRol(Role $role, string $action): void
    {
        try {
            // Notificar a administradores
            $this->notifyUsersByRole(['Administrator', 'Super Admin'], $role, $action);
            
            Log::info("✅ Notificaciones de rol ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de rol ({$action}):", [
                'error' => $e->getMessage(),
                'role_id' => $role->id
            ]);
            throw $e;
        }
    }
    
    /**
     * Obtiene el título para la notificación de rol
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Role)) {
            return "Notificación del Sistema";
        }
        
        return match($action) {
            'created' => "Nuevo Rol: {$model->name}",
            'updated' => "Rol Actualizado: {$model->name}",
            'deleted' => "Rol Eliminado: {$model->name}",
            default => "Rol: {$model->name}"
        };
    }
    
    /**
     * Crea el contenido para la notificación de rol
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Role)) {
            return "Notificación del sistema";
        }
        
        $prefix = match($action) {
            'created' => "Se ha creado un nuevo rol en el sistema",
            'updated' => "Se ha actualizado un rol en el sistema",
            'deleted' => "Se ha eliminado un rol del sistema",
            default => "Información de rol"
        };
        
        return $prefix . ".\n\n" .
            "Detalles del rol:\n" .
            "• Nombre: {$model->name}\n" .
            "• Guard: {$model->guard_name}";
    }
    
    /**
     * Prepara los datos para la notificación de rol
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Role)) {
            return [];
        }
        
        return [
            'role_id' => $model->id,
            'action_url' => route('admin.roles.index'),
            'action_text' => 'Ver Roles',
            'role' => [
                'name' => $model->name,
                'guard_name' => $model->guard_name,
            ]
        ];
    }
} 
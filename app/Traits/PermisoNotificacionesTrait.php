<?php

namespace App\Traits;

use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;

trait PermisoNotificacionesTrait
{
    /**
     * Notifica a todos los usuarios relevantes sobre un cambio en un permiso
     */
    protected function notifyUsersAboutPermiso(Permission $permission, string $action): void
    {
        try {
            // 1. Notificar a administradores
            $this->notifyUsersByRole(['Administrator', 'Super Admin'], $permission, $action);
            
            // 2. Notificar a recursos humanos
            $this->notifyUsersByRole(['RRHH', 'Human Resources'], $permission, $action);
            
            // 3. Notificar a managers
            $this->notifyUsersByRole(['Manager', 'Team Lead'], $permission, $action);
            
            Log::info("✅ Notificaciones de permiso ({$action}) enviadas correctamente a todos los usuarios");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de permiso ({$action}):", [
                'error' => $e->getMessage(),
                'permission_id' => $permission->id
            ]);
            throw $e;
        }
    }
    
    /**
     * Notifica a usuarios según rol
     */
    protected function notifyUsersByRole(array $roles, Permission $permission, string $action): void
    {
        $users = User::role($roles)->get();
        
        Log::info('👥 Notificando a usuarios con roles: ' . implode(', ', $roles), [
            'total_users' => $users->count(),
            'user_ids' => $users->pluck('id')->toArray()
        ]);
        
        if ($users->isEmpty()) {
            Log::warning('⚠️ No se encontraron usuarios con los roles especificados', [
                'roles' => $roles
            ]);
        }
        
        foreach ($users as $user) {
            $title = $this->getPermissionTitle($permission, $action);
            $message = $this->createPermissionMessage($permission, $action);
            $data = $this->preparePermissionData($permission, $action);
            
            // Añadir identificador único para la notificación
            $data['notification_id'] = (string) \Illuminate\Support\Str::uuid();
            
            // Usar SystemNotification en lugar de PermisoNotification
            try {
                $user->notify(new SystemNotification(
                    type: "permission.{$action}",
                    title: $title,
                    sender: 'Sistema de Permisos',
                    message: $message,
                    data: $data,
                    channels: ['broadcast', 'mail', 'database']
                ));
                
                Log::info("✅ Notificación enviada a usuario {$user->name} (ID: {$user->id}) - Rol: " . implode(', ', $user->getRoleNames()->toArray()));
            } catch (\Exception $e) {
                Log::error("❌ Error al notificar al usuario {$user->id}:", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }
    }
    
    /**
     * Obtiene el título para la notificación de permiso
     */
    protected function getPermissionTitle(Permission $permission, string $action): string
    {
        return match($action) {
            'created' => "Nuevo Permiso: {$permission->name}",
            'updated' => "Permiso Actualizado: {$permission->name}",
            'deleted' => "Permiso Eliminado: {$permission->name}",
            default => "Permiso: {$permission->name}"
        };
    }
    
    /**
     * Crea el mensaje para la notificación de permiso
     */
    protected function createPermissionMessage(Permission $permission, string $action): string
    {
        $prefix = match($action) {
            'created' => "Se ha creado un nuevo permiso en el sistema",
            'updated' => "Se ha actualizado un permiso en el sistema",
            'deleted' => "Se ha eliminado un permiso del sistema",
            default => "Información de permiso"
        };
        
        return $prefix . ".\n\n" .
            "Detalles del permiso:\n" .
            "• Nombre: {$permission->name}\n" .
            "• Guard: {$permission->guard_name}";
    }
    
    /**
     * Prepara los datos para la notificación de permiso
     */
    protected function preparePermissionData(Permission $permission, string $action): array
{
    // Usa try-catch para manejar error de rutas inexistentes
    try {
        $actionUrl = route('admin.permisos.index');
    } catch (\Exception $e) {
        // Si falla, usa una URL absoluta como respaldo
        $actionUrl = url('/admin/permissions');
        Log::warning('⚠️ Ruta admin.permisos.index no encontrada, usando URL absoluta', [
            'fallback_url' => $actionUrl,
            'error' => $e->getMessage()
        ]);
    }

    return [
        'permission_id' => $permission->id,
        'action_url' => $actionUrl,
        'action_text' => 'Ver Permisos',
        'permission' => [
            'name' => $permission->name,
            'guard_name' => $permission->guard_name,
        ],
        'brevo_params' => [
            'permission_name' => $permission->name,
            'action' => $action,
            'action_url' => $actionUrl,
            'action_text' => 'Ver Permisos',
        ],
        'timestamp' => now()->toIso8601String(),
    ];
}
}
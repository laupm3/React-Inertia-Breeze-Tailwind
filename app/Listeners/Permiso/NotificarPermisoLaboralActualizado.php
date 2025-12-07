<?php

namespace App\Listeners\Permiso;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Notifications\SystemNotification;
use App\Events\Permiso\PermisosLaborales\PermisoLaboralActualizado;

class NotificarPermisoLaboralActualizado
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(PermisoLaboralActualizado $event): void
    {
        Log::info('🔄 Iniciando notificación de permiso laboral actualizado', [
            'permiso_id' => $event->permiso->id,
            'permiso_nombre' => $event->permiso->nombre,
            'cambios' => $event->cambios
        ]);

        $this->notificarUsuarios($event->permiso, $event->cambios);
    }

    /**
     * Notificar a los usuarios relevantes
     */
    protected function notificarUsuarios($permiso, $cambios): void
    {
        try {
            // Notificar a administradores, RRHH y managers
            $usuarios = User::role([
                'Administrator', 
                'Super Admin', 
                'RRHH', 
                'Human Resources', 
                'Manager', 
                'Team Lead'
            ])->get();
            
            Log::info('👥 Notificando a usuarios sobre permiso laboral actualizado', [
                'total_usuarios' => $usuarios->count(),
                'ids_usuarios' => $usuarios->pluck('id')->toArray()
            ]);
            
            if ($usuarios->isEmpty()) {
                Log::warning('⚠️ No se encontraron usuarios con los roles especificados');
                return;
            }
            
            foreach ($usuarios as $usuario) {
                $this->enviarNotificacion($usuario, $permiso, $cambios);
            }
            
            Log::info("✅ Notificaciones de permiso laboral actualizado enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de permiso laboral actualizado:", [
                'error' => $e->getMessage(),
                'permiso_id' => $permiso->id
            ]);
        }
    }
    
    /**
     * Enviar notificación a un usuario específico
     */
    protected function enviarNotificacion(User $usuario, $permiso, $cambios): void
    {
        try {
            $tipo = $permiso->retribuido ? 'retribuido' : 'no retribuido';
            
            $titulo = "Permiso Laboral Actualizado: {$permiso->nombre}";
            $mensaje = "Se ha actualizado un tipo de permiso laboral en el sistema.\n\n" .
                      "• Nombre: {$permiso->nombre}\n" .
                      "• Descripción: {$permiso->descripcion}\n" .
                      "• Tipo: {$tipo}";
                      
            if (!empty($cambios)) {
                $mensaje .= "\n\nCambios realizados:";
                foreach ($cambios as $campo => $valores) {
                    $mensaje .= "\n• {$campo}: {$valores['anterior']} → {$valores['nuevo']}";
                }
            }
            
            // Intentar usar la ruta correcta, con fallback
            try {
                $urlAccion = route('permisos.index');
            } catch (\Exception $e) {
                $urlAccion = url('/permisos');
                Log::warning('Usando URL absoluta para permisos laborales', ['error' => $e->getMessage()]);
            }
            
            $datos = [
                'permiso_id' => $permiso->id,
                'action_url' => $urlAccion,
                'action_text' => 'Ver Permisos Laborales',
                'cambios' => $cambios,
                'permiso' => [
                    'nombre' => $permiso->nombre,
                    'descripcion' => $permiso->descripcion,
                    'retribuido' => $permiso->retribuido,
                ],
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];
            
            $usuario->notify(new SystemNotification(
                type: "permiso_laboral.actualizado",
                title: $titulo,
                sender: 'Sistema de Permisos Laborales',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database']
            ));
            
            Log::info("✅ Notificación de actualización enviada a usuario {$usuario->name} (ID: {$usuario->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar actualización al usuario {$usuario->id}:", [
                'error' => $e->getMessage()
            ]);
        }
    }
}
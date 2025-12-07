<?php

namespace App\Listeners\Permiso;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Notifications\SystemNotification;
use App\Events\Permiso\PermisosLaborales\PermisoLaboralEliminado;

class NotificarPermisoLaboralEliminado
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
    public function handle(PermisoLaboralEliminado $event): void
    {
        Log::info('🗑️ Iniciando notificación de permiso laboral eliminado', [
            'permiso_id' => $event->permisoId,
            'permiso_nombre' => $event->permisoNombre
        ]);

        $this->notificarUsuarios(
            $event->permisoId,
            $event->permisoNombre,
            $event->permisoDescripcion,
            $event->permisoRetribuido
        );
    }

    /**
     * Notificar a los usuarios relevantes
     */
    protected function notificarUsuarios($permisoId, $nombre, $descripcion, $retribuido): void
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
            
            Log::info('👥 Notificando a usuarios sobre permiso laboral eliminado', [
                'total_usuarios' => $usuarios->count(),
                'ids_usuarios' => $usuarios->pluck('id')->toArray()
            ]);
            
            if ($usuarios->isEmpty()) {
                Log::warning('⚠️ No se encontraron usuarios con los roles especificados');
                return;
            }
            
            foreach ($usuarios as $usuario) {
                $this->enviarNotificacion($usuario, $permisoId, $nombre, $descripcion, $retribuido);
            }
            
            Log::info("✅ Notificaciones de permiso laboral eliminado enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de permiso laboral eliminado:", [
                'error' => $e->getMessage(),
                'permiso_id' => $permisoId
            ]);
        }
    }
    
    /**
     * Enviar notificación a un usuario específico
     */
    protected function enviarNotificacion(User $usuario, $permisoId, $nombre, $descripcion, $retribuido): void
    {
        try {
            $tipo = $retribuido ? 'retribuido' : 'no retribuido';
            
            $titulo = "Permiso Laboral Eliminado: {$nombre}";
            $mensaje = "Se ha eliminado un tipo de permiso laboral del sistema.\n\n" .
                      "• Nombre: {$nombre}\n" .
                      "• Descripción: {$descripcion}\n" .
                      "• Tipo: {$tipo}";
            
            // Intentar usar la ruta correcta, con fallback
            try {
                $urlAccion = route('permisos.index');
            } catch (\Exception $e) {
                $urlAccion = url('/permisos');
                Log::warning('Usando URL absoluta para permisos laborales', ['error' => $e->getMessage()]);
            }
            
            $datos = [
                'permiso_id' => $permisoId,
                'action_url' => $urlAccion,
                'action_text' => 'Ver Permisos Laborales',
                'permiso' => [
                    'nombre' => $nombre,
                    'descripcion' => $descripcion,
                    'retribuido' => $retribuido,
                ],
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];
            
            $usuario->notify(new SystemNotification(
                type: "permiso_laboral.eliminado",
                title: $titulo,
                sender: 'Sistema de Permisos Laborales',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database']
            ));
            
            Log::info("✅ Notificación de eliminación enviada a usuario {$usuario->name} (ID: {$usuario->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar eliminación al usuario {$usuario->id}:", [
                'error' => $e->getMessage()
            ]);
        }
    }
}
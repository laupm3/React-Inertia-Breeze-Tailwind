<?php

namespace App\Listeners\Permiso;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Notifications\SystemNotification;
use App\Events\Permiso\PermisosLaborales\PermisoLaboralCreado;

class NotificarPermisoLaboralCreado
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
    public function handle(PermisoLaboralCreado $event): void
    {
        Log::info('🎯 Iniciando notificación de permiso laboral creado', [
            'permiso_id' => $event->permiso->id,
            'permiso_nombre' => $event->permiso->nombre
        ]);

        $this->notificarUsuarios($event->permiso);
    }

    /**
     * Notificar a los usuarios relevantes
     */
    protected function notificarUsuarios($permiso): void
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
            
            Log::info('👥 Notificando a usuarios sobre nuevo permiso laboral', [
                'total_usuarios' => $usuarios->count(),
                'ids_usuarios' => $usuarios->pluck('id')->toArray()
            ]);
            
            if ($usuarios->isEmpty()) {
                Log::warning('⚠️ No se encontraron usuarios con los roles especificados');
                return;
            }
            
            foreach ($usuarios as $usuario) {
                $this->enviarNotificacion($usuario, $permiso);
            }
            
            Log::info("✅ Notificaciones de permiso laboral enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de permiso laboral:", [
                'error' => $e->getMessage(),
                'permiso_id' => $permiso->id
            ]);
        }
    }
    
    /**
     * Enviar notificación a un usuario específico
     */
    protected function enviarNotificacion(User $usuario, $permiso): void
    {
        try {
            $tipo = $permiso->retribuido ? 'retribuido' : 'no retribuido';
            
            $titulo = "Nuevo Permiso Laboral: {$permiso->nombre}";
            $mensaje = "Se ha registrado un nuevo tipo de permiso laboral en el sistema.\n\n" .
                      "• Nombre: {$permiso->nombre}\n" .
                      "• Descripción: {$permiso->descripcion}\n" .
                      "• Tipo: {$tipo}";
            
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
                'permiso' => [
                    'nombre' => $permiso->nombre,
                    'descripcion' => $permiso->descripcion,
                    'retribuido' => $permiso->retribuido,
                ],
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];
            
            $usuario->notify(new SystemNotification(
                type: "permiso_laboral.creado",
                title: $titulo,
                sender: 'Sistema de Permisos Laborales',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database'] // Omitimos 'mail' para no enviar demasiados emails
            ));
            
            Log::info("✅ Notificación enviada a usuario {$usuario->name} (ID: {$usuario->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar al usuario {$usuario->id}:", [
                'error' => $e->getMessage()
            ]);
        }
    }
}
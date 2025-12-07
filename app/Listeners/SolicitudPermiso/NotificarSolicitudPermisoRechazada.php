<?php

namespace App\Listeners\SolicitudPermiso;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Traits\GenericNotificationTrait;
use App\Events\SolicitudPermiso\SolicitudPermisoRechazada;

class NotificarSolicitudPermisoRechazada
{
    use GenericNotificationTrait;

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
    public function handle(SolicitudPermisoRechazada $event): void
    {
        Log::info('🔴 Iniciando notificación de solicitud de permiso rechazada', [
            'solicitud_id' => $event->solicitudPermiso->id,
            'tipo_aprobacion' => $event->tipoAprobacion
        ]);

        // Usar el nuevo sistema genérico
        $this->sendNotification($event->solicitudPermiso, 'denied', [
            'denied_by' => auth()->user()->name ?? 'Sistema',
            'denied_at' => now()->format('Y-m-d H:i:s')
        ]);

        /* // Notificar al empleado que creó la solicitud
        $this->notificarEmpleado($event->solicitudPermiso, $event->tipoAprobacion, $event->observacion);

        // Notificar a los managers
        $this->notificarManagers($event->solicitudPermiso, $event->tipoAprobacion, $event->observacion);

        // Notificar a usuarios con permiso de ver solicitudes
        $this->notificarUsuariosConPermiso($event->solicitudPermiso, $event->tipoAprobacion, $event->observacion); */
    }

    /**
     * Notificar al empleado que creó la solicitud
     */
    /* protected function notificarEmpleado($solicitudPermiso, $tipoAprobacion, $observacion): void
    {
        try {
            $empleado = $solicitudPermiso->empleado;
            $usuario = $empleado->user;

            if (!$usuario) {
                Log::warning('⚠️ Empleado no tiene usuario asociado', [
                    'empleado_id' => $empleado->id
                ]);
                return;
            }

            $tipoAprobacionText = match($tipoAprobacion) {
                'manager' => 'Manager',
                'hr' => 'Recursos Humanos',
                'direction' => 'Dirección',
                default => $tipoAprobacion
            };

            $titulo = "Solicitud de Permiso Rechazada";
            $mensaje = "Tu solicitud para '{$solicitudPermiso->permiso->nombre}' ha sido rechazada por {$tipoAprobacionText}.\n\n" .
                      "• Fecha de inicio: {$solicitudPermiso->fecha_inicio->format('d/m/Y H:i')}\n" .
                      "• Fecha de fin: {$solicitudPermiso->fecha_fin->format('d/m/Y H:i')}\n" .
                      "• Motivo: {$solicitudPermiso->motivo}";

            if ($observacion) {
                $mensaje .= "\n\nComentario: {$observacion}";
            }

            // Intentar usar la ruta correcta, con fallback
            try {
                $urlAccion = route('user.permisos.show', $solicitudPermiso->id);
            } catch (\Exception $e) {
                $urlAccion = url('/user/permisos/' . $solicitudPermiso->id);
                Log::warning('Usando URL absoluta para solicitud', ['error' => $e->getMessage()]);
            }

            $datos = [
                'solicitud_id' => $solicitudPermiso->id,
                'action_url' => $urlAccion,
                'action_text' => 'Ver Solicitud',
                'solicitud' => [
                    'id' => $solicitudPermiso->id,
                    'fecha_inicio' => $solicitudPermiso->fecha_inicio->toIso8601String(),
                    'fecha_fin' => $solicitudPermiso->fecha_fin->toIso8601String(),
                    'motivo' => $solicitudPermiso->motivo,
                    'permiso' => [
                        'id' => $solicitudPermiso->permiso->id,
                        'nombre' => $solicitudPermiso->permiso->nombre,
                    ],
                ],
                'rechazo' => [
                    'tipo_aprobacion' => $tipoAprobacion,
                    'observacion' => $observacion
                ],
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];

            $usuario->notify(new SystemNotification(
                type: "solicitud_permiso.rechazada",
                title: $titulo,
                sender: 'Sistema de Permisos',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database', 'mail'] // Incluimos mail por ser rechazo
            ));

            Log::info("✅ Notificación de rechazo enviada al empleado {$usuario->name} (ID: {$usuario->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar rechazo al empleado:", [
                'error' => $e->getMessage(),
                'empleado_id' => $solicitudPermiso->empleado_id
            ]);
        }
    } */

    /**
     * Notificar a los managers
     */
    /* protected function notificarManagers($solicitudPermiso, $tipoAprobacion, $observacion): void
    {
        try {
            // Notificar a los managers
            $managers = User::role(['Manager', 'Team Lead'])
                ->where('id', '!=', $solicitudPermiso->empleado->user_id) // Excluir al solicitante si es manager
                ->get();

            Log::info('👥 Notificando a managers sobre solicitud rechazada', [
                'total_managers' => $managers->count(),
                'ids_managers' => $managers->pluck('id')->toArray()
            ]);

            if ($managers->isEmpty()) {
                Log::warning('⚠️ No se encontraron managers para notificar');
                return;
            }

            foreach ($managers as $manager) {
                $this->enviarNotificacionManager($manager, $solicitudPermiso, $tipoAprobacion, $observacion);
            }

            Log::info("✅ Notificaciones de rechazo a managers enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar rechazo a managers:", [
                'error' => $e->getMessage(),
                'solicitud_id' => $solicitudPermiso->id
            ]);
        }
    } */

    /**
     * Enviar notificación a un manager específico
     */
   /*  protected function enviarNotificacionManager(User $manager, $solicitudPermiso, $tipoAprobacion, $observacion): void
    {
        try {
            $empleado = $solicitudPermiso->empleado;

            $tipoAprobacionText = match($tipoAprobacion) {
                'manager' => 'Manager',
                'hr' => 'Recursos Humanos',
                'direction' => 'Dirección',
                default => $tipoAprobacion
            };

            $titulo = "Solicitud de Permiso Rechazada: {$empleado->nombre_completo}";
            $mensaje = "La solicitud de permiso de {$empleado->nombre_completo} ha sido rechazada por {$tipoAprobacionText}.\n\n" .
                      "• Permiso: {$solicitudPermiso->permiso->nombre}\n" .
                      "• Fecha de inicio: {$solicitudPermiso->fecha_inicio->format('d/m/Y H:i')}\n" .
                      "• Fecha de fin: {$solicitudPermiso->fecha_fin->format('d/m/Y H:i')}\n" .
                      "• Motivo: {$solicitudPermiso->motivo}";

            if ($observacion) {
                $mensaje .= "\n\nComentario del rechazo: {$observacion}";
            }

            // Intentar usar la ruta correcta, con fallback
            try {
                $urlAccion = route('admin.permisos.show', $solicitudPermiso->id);
            } catch (\Exception $e) {
                $urlAccion = url('/admin/permisos/' . $solicitudPermiso->id);
                Log::warning('Usando URL absoluta para solicitud', ['error' => $e->getMessage()]);
            }

            $datos = [
                'solicitud_id' => $solicitudPermiso->id,
                'action_url' => $urlAccion,
                'action_text' => 'Ver Solicitud',
                'solicitud' => [
                    'id' => $solicitudPermiso->id,
                    'fecha_inicio' => $solicitudPermiso->fecha_inicio->toIso8601String(),
                    'fecha_fin' => $solicitudPermiso->fecha_fin->toIso8601String(),
                    'motivo' => $solicitudPermiso->motivo,
                    'empleado' => [
                        'id' => $empleado->id,
                        'nombre' => $empleado->nombre_completo,
                    ],
                    'permiso' => [
                        'id' => $solicitudPermiso->permiso->id,
                        'nombre' => $solicitudPermiso->permiso->nombre,
                    ],
                ],
                'rechazo' => [
                    'tipo_aprobacion' => $tipoAprobacion,
                    'observacion' => $observacion
                ],
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];

            $manager->notify(new SystemNotification(
                type: "solicitud_permiso.rechazada.manager",
                title: $titulo,
                sender: 'Sistema de Permisos',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database']
            ));

            Log::info("✅ Notificación de rechazo enviada a manager {$manager->name} (ID: {$manager->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar rechazo al manager {$manager->id}:", [
                'error' => $e->getMessage()
            ]);
        }
    } */

    /**
     * Notificar a usuarios con permiso de ver solicitudes
     */
    /* protected function notificarUsuariosConPermiso($solicitudPermiso, $tipoAprobacion, $observacion): void
    {
        try {
            // Notificar a usuarios con permiso de ver solicitudes (excepto managers que ya fueron notificados)
            $usuarios = User::permission('viewWorkPermitRequests')
                ->whereNotIn('id', [
                    $solicitudPermiso->empleado->user_id, // Excluir al solicitante
                    ...User::role(['Manager', 'Team Lead'])->pluck('id') // Excluir managers ya notificados
                ])
                ->get();

            Log::info('👥 Notificando a usuarios con permiso sobre solicitud rechazada', [
                'total_usuarios' => $usuarios->count(),
                'ids_usuarios' => $usuarios->pluck('id')->toArray()
            ]);

            if ($usuarios->isEmpty()) {
                Log::info('ℹ️ No hay usuarios adicionales con permiso para notificar');
                return;
            }

            foreach ($usuarios as $usuario) {
                $this->enviarNotificacionUsuarioConPermiso($usuario, $solicitudPermiso, $tipoAprobacion, $observacion);
            }

            Log::info("✅ Notificaciones de rechazo a usuarios con permiso enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar rechazo a usuarios con permiso:", [
                'error' => $e->getMessage(),
                'solicitud_id' => $solicitudPermiso->id
            ]);
        }
    } */

    /**
     * Enviar notificación a usuario con permiso específico
     */
    /* protected function enviarNotificacionUsuarioConPermiso(User $usuario, $solicitudPermiso, $tipoAprobacion, $observacion): void
    {
        try {
            $empleado = $solicitudPermiso->empleado;

            $tipoAprobacionText = match($tipoAprobacion) {
                'manager' => 'Manager',
                'hr' => 'Recursos Humanos',
                'direction' => 'Dirección',
                default => $tipoAprobacion
            };

            $titulo = "Solicitud de Permiso Rechazada";
            $mensaje = "La solicitud de {$empleado->nombre_completo} ha sido rechazada por {$tipoAprobacionText}.\n\n" .
                      "• Permiso: {$solicitudPermiso->permiso->nombre}\n" .
                      "• Fecha de inicio: {$solicitudPermiso->fecha_inicio->format('d/m/Y H:i')}\n" .
                      "• Fecha de fin: {$solicitudPermiso->fecha_fin->format('d/m/Y H:i')}";

            if ($observacion) {
                $mensaje .= "\n\nComentario del rechazo: {$observacion}";
            }

            // Intentar usar la ruta correcta, con fallback
            try {
                $urlAccion = route('admin.permisos.show', $solicitudPermiso->id);
            } catch (\Exception $e) {
                $urlAccion = url('/admin/permisos/' . $solicitudPermiso->id);
                Log::warning('Usando URL absoluta para solicitud', ['error' => $e->getMessage()]);
            }

            $datos = [
                'solicitud_id' => $solicitudPermiso->id,
                'action_url' => $urlAccion,
                'action_text' => 'Ver Detalles',
                'solicitud' => [
                    'id' => $solicitudPermiso->id,
                    'fecha_inicio' => $solicitudPermiso->fecha_inicio->toIso8601String(),
                    'fecha_fin' => $solicitudPermiso->fecha_fin->toIso8601String(),
                    'motivo' => $solicitudPermiso->motivo,
                    'empleado' => [
                        'id' => $empleado->id,
                        'nombre' => $empleado->nombre_completo,
                    ],
                    'permiso' => [
                        'id' => $solicitudPermiso->permiso->id,
                        'nombre' => $solicitudPermiso->permiso->nombre,
                    ],
                ],
                'rechazo' => [
                    'tipo_aprobacion' => $tipoAprobacion,
                    'observacion' => $observacion
                ],
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];

            $usuario->notify(new SystemNotification(
                type: "solicitud_permiso.rechazada.admin",
                title: $titulo,
                sender: 'Sistema de Permisos',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database']
            ));

            Log::info("✅ Notificación de rechazo enviada a usuario {$usuario->name} (ID: {$usuario->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar rechazo al usuario {$usuario->id}:", [
                'error' => $e->getMessage()
            ]);
        }
    } */
}

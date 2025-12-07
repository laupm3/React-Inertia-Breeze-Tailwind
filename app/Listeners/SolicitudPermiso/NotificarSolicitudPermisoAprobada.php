<?php

namespace App\Listeners\SolicitudPermiso;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Traits\GenericNotificationTrait;
use App\Events\SolicitudPermiso\SolicitudPermisoAprobada;
use App\Jobs\ModificarHorariosJob;

class NotificarSolicitudPermisoAprobada
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
    public function handle(SolicitudPermisoAprobada $event): void
    {
        Log::info('✅ Iniciando notificación de solicitud de permiso aprobada', [
            'solicitud_id' => $event->solicitudPermiso->id
        ]);


        //Usar el nuevo sistema genérico
        $this->sendNotification($event->solicitudPermiso, 'aproved', [
            'aproved_by' => auth()->user()->name ?? 'Sistema',
            'aproved_at' => now()->format('Y-m-d H:i:s')
        ]);

        /* // Notificar al empleado que creó la solicitud
        $this->notificarEmpleado($event->solicitudPermiso);

        // Notificar a los managers
        $this->notificarManagers($event->solicitudPermiso);

        // Notificar a usuarios con permiso de ver solicitudes
        $this->notificarUsuariosConPermiso($event->solicitudPermiso); */
    }

    /**
     * Notificar al empleado que creó la solicitud
     */
   /*  protected function notificarEmpleado($solicitudPermiso): void
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

            $titulo = "Solicitud de Permiso Aprobada";
            $mensaje = "Tu solicitud para '{$solicitudPermiso->permiso->nombre}' ha sido aprobada.\n\n" .
                      "• Fecha de inicio: {$solicitudPermiso->fecha_inicio->format('d/m/Y H:i')}\n" .
                      "• Fecha de fin: {$solicitudPermiso->fecha_fin->format('d/m/Y H:i')}\n" .
                      "• Motivo: {$solicitudPermiso->motivo}";

            // Intentar usar la ruta correcta, con fallback
            try {
                $urlAccion = route('user.permisos.show', $solicitudPermiso->id);
            } catch (\Exception $e) {
                $urlAccion = url('/user/permisos/' . $solicitudPermiso->id);
                Log::warning('Usando URL absoluta para solicitud', ['error' => $e->getMessage()]);
            }

            // Obtener detalles de las aprobaciones
            $aprobacionesData = $solicitudPermiso->aprobaciones()
                ->with('approvedBy:id,name')
                ->get()
                ->map(function($aprobacion) {
                    return [
                        'tipo' => $aprobacion->tipo_aprobacion,
                        'aprobado_por' => $aprobacion->approvedBy->name,
                        'fecha' => $aprobacion->updated_at->toIso8601String(),
                        'observacion' => $aprobacion->observacion
                    ];
                });

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
                'aprobaciones' => $aprobacionesData,
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];

            $usuario->notify(new SystemNotification(
                type: "solicitud_permiso.aprobada",
                title: $titulo,
                sender: 'Sistema de Permisos',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database', 'mail'] // Incluir mail para aprobaciones
            ));

            Log::info("✅ Notificación de aprobación enviada al empleado {$usuario->name} (ID: {$usuario->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar aprobación al empleado:", [
                'error' => $e->getMessage(),
                'empleado_id' => $solicitudPermiso->empleado_id
            ]);
        }
    } */

    /**
     * Notificar a los managers
     */
    /* protected function notificarManagers($solicitudPermiso): void
    {
        try {
            // Notificar a los managers
            $managers = User::role(['Manager', 'Team Lead'])
                ->where('id', '!=', $solicitudPermiso->empleado->user_id) // Excluir al solicitante si es manager
                ->get();

            Log::info('👥 Notificando a managers sobre solicitud aprobada', [
                'total_managers' => $managers->count(),
                'ids_managers' => $managers->pluck('id')->toArray()
            ]);

            if ($managers->isEmpty()) {
                Log::warning('⚠️ No se encontraron managers para notificar');
                return;
            }

            foreach ($managers as $manager) {
                $this->enviarNotificacionManager($manager, $solicitudPermiso);
            }

            Log::info("✅ Notificaciones de aprobación a managers enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar aprobación a managers:", [
                'error' => $e->getMessage(),
                'solicitud_id' => $solicitudPermiso->id
            ]);
        }
    } */

    /**
     * Enviar notificación a un manager específico
     */
    /* protected function enviarNotificacionManager(User $manager, $solicitudPermiso): void
    {
        try {
            $empleado = $solicitudPermiso->empleado;

            $titulo = "Solicitud de Permiso Aprobada: {$empleado->nombre_completo}";
            $mensaje = "La solicitud de permiso de {$empleado->nombre_completo} ha sido aprobada completamente.\n\n" .
                      "• Permiso: {$solicitudPermiso->permiso->nombre}\n" .
                      "• Fecha de inicio: {$solicitudPermiso->fecha_inicio->format('d/m/Y H:i')}\n" .
                      "• Fecha de fin: {$solicitudPermiso->fecha_fin->format('d/m/Y H:i')}\n" .
                      "• Motivo: {$solicitudPermiso->motivo}";

            // Intentar usar la ruta correcta, con fallback
            try {
                $urlAccion = route('admin.permisos.show', $solicitudPermiso->id);
            } catch (\Exception $e) {
                $urlAccion = url('/admin/permisos/' . $solicitudPermiso->id);
                Log::warning('Usando URL absoluta para solicitud', ['error' => $e->getMessage()]);
            }

            // Obtener detalles de las aprobaciones
            $aprobacionesData = $solicitudPermiso->aprobaciones()
                ->with('approvedBy:id,name')
                ->get()
                ->map(function($aprobacion) {
                    return [
                        'tipo' => $aprobacion->tipo_aprobacion,
                        'aprobado_por' => $aprobacion->approvedBy->name,
                        'fecha' => $aprobacion->updated_at->toIso8601String(),
                        'observacion' => $aprobacion->observacion
                    ];
                });

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
                'aprobaciones' => $aprobacionesData,
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];

            $manager->notify(new SystemNotification(
                type: "solicitud_permiso.aprobada.manager",
                title: $titulo,
                sender: 'Sistema de Permisos',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database']
            ));

            Log::info("✅ Notificación de aprobación enviada a manager {$manager->name} (ID: {$manager->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar aprobación al manager {$manager->id}:", [
                'error' => $e->getMessage()
            ]);
        }
    } */

    /**
     * Notificar a usuarios con permiso de ver solicitudes
     */
    /* protected function notificarUsuariosConPermiso($solicitudPermiso): void
    {
        try {
            // Notificar a usuarios con permiso de ver solicitudes (excepto managers que ya fueron notificados)
            $usuarios = User::permission('viewWorkPermitRequests')
                ->whereNotIn('id', [
                    $solicitudPermiso->empleado->user_id, // Excluir al solicitante
                    ...User::role(['Manager', 'Team Lead'])->pluck('id') // Excluir managers ya notificados
                ])
                ->get();

            Log::info('👥 Notificando a usuarios con permiso sobre solicitud aprobada', [
                'total_usuarios' => $usuarios->count(),
                'ids_usuarios' => $usuarios->pluck('id')->toArray()
            ]);

            if ($usuarios->isEmpty()) {
                Log::info('ℹ️ No hay usuarios adicionales con permiso para notificar');
                return;
            }

            foreach ($usuarios as $usuario) {
                $this->enviarNotificacionUsuarioConPermiso($usuario, $solicitudPermiso);
            }

            Log::info("✅ Notificaciones de aprobación a usuarios con permiso enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar aprobación a usuarios con permiso:", [
                'error' => $e->getMessage(),
                'solicitud_id' => $solicitudPermiso->id
            ]);
        }
    } */

    /**
     * Enviar notificación a usuario con permiso específico
     */
    /* protected function enviarNotificacionUsuarioConPermiso(User $usuario, $solicitudPermiso): void
    {
        try {
            $empleado = $solicitudPermiso->empleado;

            $titulo = "Solicitud de Permiso Aprobada";
            $mensaje = "La solicitud de {$empleado->nombre_completo} ha sido aprobada completamente.\n\n" .
                      "• Permiso: {$solicitudPermiso->permiso->nombre}\n" .
                      "• Fecha de inicio: {$solicitudPermiso->fecha_inicio->format('d/m/Y H:i')}\n" .
                      "• Fecha de fin: {$solicitudPermiso->fecha_fin->format('d/m/Y H:i')}";

            // Intentar usar la ruta correcta, con fallback
            try {
                $urlAccion = route('admin.permisos.show', $solicitudPermiso->id);
            } catch (\Exception $e) {
                $urlAccion = url('/admin/permisos/' . $solicitudPermiso->id);
                Log::warning('Usando URL absoluta para solicitud', ['error' => $e->getMessage()]);
            }

            // Obtener detalles de las aprobaciones
            $aprobacionesData = $solicitudPermiso->aprobaciones()
                ->with('approvedBy:id,name')
                ->get()
                ->map(function($aprobacion) {
                    return [
                        'tipo' => $aprobacion->tipo_aprobacion,
                        'aprobado_por' => $aprobacion->approvedBy->name,
                        'fecha' => $aprobacion->updated_at->toIso8601String(),
                        'observacion' => $aprobacion->observacion
                    ];
                });

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
                'aprobaciones' => $aprobacionesData,
                'notification_id' => (string) \Illuminate\Support\Str::uuid(),
                'timestamp' => now()->toIso8601String(),
            ];

            $usuario->notify(new SystemNotification(
                type: "solicitud_permiso.aprobada.admin",
                title: $titulo,
                sender: 'Sistema de Permisos',
                message: $mensaje,
                data: $datos,
                channels: ['broadcast', 'database']
            ));

            Log::info("✅ Notificación de aprobación enviada a usuario {$usuario->name} (ID: {$usuario->id})");
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar aprobación al usuario {$usuario->id}:", [
                'error' => $e->getMessage()
            ]);
        }
    } */
}

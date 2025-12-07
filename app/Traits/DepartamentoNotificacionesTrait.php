<?php

namespace App\Traits;

use App\Models\Departamento;
use Illuminate\Support\Facades\Log;

trait  DepartamentoNotificacionesTrait
{
    use NotificacionesTrait;

    /**
     * Notifica a todos los administradores sobre un cambio en un departamento
     */
    protected function notifyAdminsAboutDepartamento(Departamento $departamento, string $action): void
    {
        try {
            // Notificar a administradores con broadcast y mail
            $this->notifyUsersByRole(
                ['Administrator', 'Super Admin'],
                $departamento,
                $action,
                false,
                ['broadcast', 'mail']  // Se envía a los administradores con broadcast y mail
            );

            Log::info("✅ Notificaciones de departamento ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de departamento ({$action}):", [
                'error' => $e->getMessage(),
                'departamento_id' => $departamento->id
            ]);
            throw $e;
        }
    }

    /**
     * Notifica a todos los usuarios relacionados con un departamento:
     * - Manager y adjunto
     * - Todos los empleados con contratos (vigentes o no)
     */
    protected function notifyUsersAboutDepartamento(Departamento $departamento, string $action): void
    {
        try {
            // Colección para almacenar todos los usuarios a notificar
            $usuarios = collect();

            // 1. Obtener TODOS los contratos del departamento (no solo vigentes)
            $contratos = $departamento->contratos()  // Usa contratos() en lugar de contratosVigentes()
                ->with('empleado.user')
                ->get();

            Log::info("Buscando usuarios para notificar sobre departamento", [
                'departamento_id' => $departamento->id,
                'total_contratos' => $contratos->count()
            ]);

            // Extraer usuarios de los contrato
            foreach ($contratos as $contrato) {
                Log::debug("Analizando contrato para notificación", [
                    'contrato_id' => $contrato->id,
                    'tiene_empleado' => $contrato->empleado ? 'sí' : 'no',
                    'empleado_id' => $contrato->empleado_id ?? 'no asignado',
                    'empleado_tiene_usuario' => ($contrato->empleado && $contrato->empleado->user) ? 'sí' : 'no',
                    'usuario_id' => ($contrato->empleado && $contrato->empleado->user) ? $contrato->empleado->user->id : 'sin usuario'
                ]);
                
                // IMPORTANTE: Colocar este código DENTRO del bucle
                if ($contrato->empleado && $contrato->empleado->user) {
                    $usuarios->push($contrato->empleado->user);
                    Log::debug("Usuario de contrato añadido a notificaciones", [
                        'contrato_id' => $contrato->id,
                        'empleado_id' => $contrato->empleado_id,
                        'user_id' => $contrato->empleado->user->id
                    ]);
                }
            }

            // 2. Añadir el manager del departamento si existe
            if ($departamento->relationLoaded('manager') ? $departamento->manager : $departamento->manager()->first()) {
                $manager = $departamento->manager;

                // Cargar la relación user si no está cargada
                if (!$manager->relationLoaded('user')) {
                    $manager->load('user');
                }

                if ($manager->user) {
                    $usuarios->push($manager->user);
                    Log::info("Manager añadido a las notificaciones", [
                        'manager_id' => $departamento->manager_id,
                        'user_id' => $manager->user->id
                    ]);
                }
            }

            // 3. Añadir el adjunto del departamento si existe
            if ($departamento->relationLoaded('adjunto') ? $departamento->adjunto : $departamento->adjunto()->first()) {
                $adjunto = $departamento->adjunto;

                // Cargar la relación user si no está cargada
                if (!$adjunto->relationLoaded('user')) {
                    $adjunto->load('user');
                }

                if ($adjunto->user) {
                    $usuarios->push($adjunto->user);
                    Log::info("Adjunto añadido a las notificaciones", [
                        'adjunto_id' => $departamento->adjunto_id,
                        'user_id' => $adjunto->user->id
                    ]);
                }
            }

            // Eliminar duplicados por ID de usuario
            $usuarios = $usuarios->unique('id');

            if ($usuarios->isEmpty()) {
                Log::info("No hay usuarios para notificar sobre este departamento");
                return;
            }

            Log::info("Enviando notificaciones a usuarios del departamento", [
                'departamento_id' => $departamento->id,
                'total_usuarios' => $usuarios->count()
            ]);

            // Notificar a cada usuario
            foreach ($usuarios as $usuario) {
                // Determinar el rol del usuario en el departamento
                $rol = $this->determinarRolUsuario($departamento, $usuario);

                // Determinar los canales según el rol y tipo de acción
                $canales = $this->determinarCanalesNotificacion($rol, $action);

                // Notificar al usuario - IMPORTANTE: No pasar additionalData
                try {
                    // Usar directamente SystemNotification en lugar de notifyUser
                    // para evitar problemas de compatibilidad de métodos
                    $title = $this->getTitleWithRole($departamento, $action, true, $rol);
                    $content = $this->getContentWithRole($departamento, $action, true, $rol);
                    $data = $this->prepareData($departamento, $action);

                    // Agregar información de rol a los datos
                    $data['rol'] = $rol;
                    $data['departamento_id'] = $departamento->id;
                    $data['departamento_nombre'] = $departamento->nombre;
                    $data['action'] = $action;

                    // Crear notificación directamente
                    $notification = new \App\Notifications\SystemNotification(
                        'departamento.' . $action,
                        $title,
                        auth()->user() ? auth()->user()->name : 'Sistema',
                        $content,
                        $data,
                        $canales
                    );

                    $usuario->notify($notification);

                    Log::debug("Notificación enviada correctamente", [
                        'user_id' => $usuario->id,
                        'user_email' => $usuario->email,
                        'rol' => $rol,
                        'canales' => $canales
                    ]);
                } catch (\Exception $e) {
                    Log::warning("Error al notificar a usuario individual", [
                        'user_id' => $usuario->id,
                        'error' => $e->getMessage()
                    ]);
                    // Continuar con el siguiente usuario
                }
            }

            Log::info("✅ Notificaciones enviadas a {$usuarios->count()} usuarios relacionados con el departamento");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones a usuarios del departamento:", [
                'error' => $e->getMessage(),
                'departamento_id' => $departamento->id,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
    /**
     * Notifica a usuarios de Recursos Humanos sobre cambios en departamentos
     */
    protected function notifyHRAboutDepartamento(Departamento $departamento, string $action): void
    {
        try {
            // Notificar a usuarios con rol Human Resources
            $this->notifyUsersByRole(
                ['Human Resources'],
                $departamento,
                $action,
                false,
                ['broadcast', 'mail', 'database']
            );

            Log::info("✅ Notificaciones de departamento ({$action}) enviadas a RRHH");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de departamento a RRHH:", [
                'error' => $e->getMessage(),
                'departamento_id' => $departamento->id
            ]);
            throw $e;
        }
    }
    /**
     * Notifica específicamente al manager y adjunto del departamento
     */
    protected function notifyManagerAndAdjunto(Departamento $departamento, string $action): void
    {
        try {
            $usuarios = collect();

            // Verificación segura para manager
            if ($departamento->manager && $departamento->manager->user) {
                $usuarios->push($departamento->manager->user);
                Log::info("Manager añadido a notificaciones", [
                    'manager_id' => $departamento->manager_id,
                    'user_id' => $departamento->manager->user->id
                ]);
            }

            // Verificación segura para adjunto
            if ($departamento->adjunto && $departamento->adjunto->user) {
                $usuarios->push($departamento->adjunto->user);
                Log::info("Adjunto añadido a notificaciones", [
                    'adjunto_id' => $departamento->adjunto_id,
                    'user_id' => $departamento->adjunto->user->id
                ]);
            }

            if ($usuarios->isEmpty()) {
                Log::info("No hay manager ni adjunto para notificar");
                return;
            }

            // Notificar a cada usuario
            foreach ($usuarios as $usuario) {
                // Determinar el rol (de forma segura)
                $rol = 'empleado'; // valor predeterminado

                if (
                    $departamento->manager && $departamento->manager->user &&
                    $usuario->id == $departamento->manager->user->id
                ) {
                    $rol = 'manager';
                } else if (
                    $departamento->adjunto && $departamento->adjunto->user &&
                    $usuario->id == $departamento->adjunto->user->id
                ) {
                    $rol = 'adjunto';
                }
                // Crear mensaje personalizado según el rol
                $title = $this->getTitleWithRole($departamento, $action, true, $rol);
                $content = $this->getContentWithRole($departamento, $action, true, $rol);
                $data = $this->prepareData($departamento, $action);

                // Agregar información de rol a los datos
                $data['rol'] = $rol;
                $data['action'] = $action;

                // Crear y enviar la notificación
                $notification = new \App\Notifications\SystemNotification(
                    'departamento.' . $action,
                    $title,
                    auth()->user() ? auth()->user()->name : 'Sistema',
                    $content,
                    $data,
                    $canales
                );

                // En el método notifyManagerAndAdjunto, para los casos de eliminación
                if ($action === 'deleted') {
                    // Usar notifyNow para asegurar entrega inmediata sin cola
                    $usuario->notifyNow($notification);
                } else {
                    // Usar notify normal para el resto de casos (usa cola)
                    $usuario->notify($notification);
                }

                Log::info("✅ Notificación enviada a {$rol}", [
                    'user_id' => $usuario->id,
                    'email' => $usuario->email,
                    'channels' => $canales
                ]);
            }
        } catch (\Exception $e) {
            Log::error("❌ Error al notificar al manager y adjunto:", [
                'error' => $e->getMessage(),
                'departamento_id' => $departamento->id,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Determina el rol de un usuario en relación al departamento
     *
     * @param Departamento $departamento
     * @param \App\Models\User $usuario
     * @return string El rol del usuario (manager, adjunto o empleado)
     */
    private function determinarRolUsuario(Departamento $departamento, $usuario): string
    {
        // Verificar si es el manager
        $manager = $departamento->relationLoaded('manager') ?
            $departamento->manager :
            $departamento->manager()->with('user')->first();

        if ($manager && $manager->user && $manager->user->id === $usuario->id) {
            return 'manager';
        }

        // Verificar si es el adjunto
        $adjunto = $departamento->relationLoaded('adjunto') ?
            $departamento->adjunto :
            $departamento->adjunto()->with('user')->first();

        if ($adjunto && $adjunto->user && $adjunto->user->id === $usuario->id) {
            return 'adjunto';
        }

        // Por defecto es un empleado regular
        return 'empleado';
    }

    /**
     * Determina los canales de notificación según el rol y la acción
     *
     * @param string $rol El rol del usuario (manager, adjunto, empleado)
     * @param string $action La acción realizada (created, updated, deleted)
     * @return array Canales de notificación
     */
    private function determinarCanalesNotificacion(string $rol, string $action): array
    {
        // Por defecto, todos reciben notificaciones en la aplicación
        $canales = ['database', 'broadcast', 'mail'];

        // Manager y Adjunto siempre reciben mail y broadcast para toda acción
        if (in_array($rol, ['manager', 'adjunto'])) {
            return ['database', 'broadcast', 'mail'];
        }
        // Los empleados reciben email solo en acciones importantes
        else if ($rol === 'empleado' && in_array($action, ['created', 'deleted'])) {
            $canales[] = 'mail';
        }

        return array_unique($canales);
    }
    // Extraer usuarios de los contratos


    /**
     * Obtiene el título para la notificación de departamento incluyendo el rol
     */
    protected function getTitleWithRole($model, string $action, bool $isEmployee = false, string $rol = null): string
    {
        if (!($model instanceof Departamento)) {
            return "Notificación del Sistema";
        }

        if ($isEmployee) {
            // Personalizar según el rol si está disponible
            if ($rol === 'manager') {
                return match ($action) {
                    'created' => "Departamento creado bajo tu gestión: {$model->nombre}",
                    'updated' => "Tu departamento ha sido actualizado: {$model->nombre}",
                    'deleted' => "El departamento que gestionas ha sido eliminado: {$model->nombre}",
                    default => "Información sobre el departamento que gestionas: {$model->nombre}"
                };
            } elseif ($rol === 'adjunto') {
                return match ($action) {
                    'created' => "Nuevo departamento asignado como adjunto: {$model->nombre}",
                    'updated' => "Actualización en el departamento donde eres adjunto: {$model->nombre}",
                    'deleted' => "El departamento donde eras adjunto ha sido eliminado: {$model->nombre}",
                    default => "Información sobre el departamento donde eres adjunto: {$model->nombre}"
                };
            } else {
                // Títulos para empleados normales
                return match ($action) {
                    'created' => "Has sido asignado al departamento: {$model->nombre}",
                    'updated' => "Tu departamento ha sido actualizado: {$model->nombre}",
                    'deleted' => "Tu departamento ha sido eliminado: {$model->nombre}",
                    default => "Información sobre tu departamento: {$model->nombre}"
                };
            }
        } else {
            // Títulos para administradores
            return match ($action) {
                'created' => "Nuevo Departamento: {$model->nombre}",
                'updated' => "Departamento Actualizado: {$model->nombre}",
                'deleted' => "Departamento Eliminado: {$model->nombre}",
                default => "Departamento: {$model->nombre}"
            };
        }
    }

    /**
     * Crea el contenido para la notificación de departamento incluyendo el rol
     */
    protected function getContentWithRole($model, string $action, bool $isEmployee = false, string $rol = null): string
    {
        if (!($model instanceof Departamento)) {
            return "Notificación del sistema";
        }

        if ($isEmployee) {
            // Contenido personalizado según el rol
            if ($rol === 'manager') {
                $prefix = match ($action) {
                    'created' => "Se ha creado un departamento bajo tu gestión",
                    'updated' => "Se ha actualizado el departamento que gestionas",
                    'deleted' => "El departamento que gestionabas ha sido eliminado",
                    default => "Información sobre el departamento que gestionas"
                };
            } elseif ($rol === 'adjunto') {
                $prefix = match ($action) {
                    'created' => "Has sido asignado como adjunto a un nuevo departamento",
                    'updated' => "Se ha actualizado el departamento donde eres adjunto",
                    'deleted' => "El departamento donde eras adjunto ha sido eliminado",
                    default => "Información sobre el departamento donde eres adjunto"
                };
            } else {
                // Empleado regular
                $prefix = match ($action) {
                    'created' => "Has sido asignado a un departamento",
                    'updated' => "Se ha actualizado la información del departamento al que perteneces",
                    'deleted' => "El departamento al que pertenecías ha sido eliminado",
                    default => "Información sobre tu departamento"
                };
            }

            return $prefix . ".\n\n" .
                "Detalles del departamento:\n" .
                "• Nombre: {$model->nombre}\n" .
                ($model->descripcion ? "• Descripción: {$model->descripcion}\n" : "") .
                ($model->manager ? "• Responsable: " . ($model->manager->nombre_completo ?? 'No asignado') . "\n" : "") .
                "\nSi tienes alguna pregunta, contacta con tu supervisor.";
        } else {
            // Contenido para administradores
            $prefix = match ($action) {
                'created' => "Se ha creado un nuevo departamento en el sistema",
                'updated' => "Se ha actualizado un departamento en el sistema",
                'deleted' => "Se ha eliminado un departamento del sistema",
                'default' => "Información de departamento"
            };

            return $prefix . ".\n\n" .
                "Detalles del departamento:\n" .
                "• Nombre: {$model->nombre}\n" .
                "• Código: {$model->codigo}\n" .
                "• Responsable: {$model->responsable}\n" .
                "• Descripción: " . ($model->descripcion ?? "No disponible");
        }
    }

    /**
     * Prepara los datos para la notificación de departamento
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Departamento)) {
            return [];
        }

        // Preparar parámetros específicos para Brevo
        $brevoParams = [
            'departamento_nombre' => $model->nombre,
            'departamento_codigo' => $model->codigo,
            'departamento_responsable' => $model->responsable,
            'departamento_descripcion' => $model->descripcion,
        ];

        return [
            'departamento_id' => $model->id,
            'action_url' => route('admin.departamentos.index'),
            'action_text' => 'Ver Departamentos',
            'departamento' => [
                'nombre' => $model->nombre,
                'codigo' => $model->codigo,
                'responsable' => $model->responsable,
                'descripcion' => $model->descripcion,
            ],
            // Añadir parámetros específicos para Brevo
            'brevo_params' => $brevoParams
        ];
    }
    /**
     * Obtiene el título para la notificación de departamento
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Departamento)) {
            return "Notificación del Sistema";
        }

        if ($isEmployee) {
            // Títulos para empleados
            return match ($action) {
                'created' => "Has sido asignado al departamento: {$model->nombre}",
                'updated' => "Tu departamento ha sido actualizado: {$model->nombre}",
                'deleted' => "Tu departamento ha sido eliminado: {$model->nombre}",
                default => "Información sobre tu departamento: {$model->nombre}"
            };
        } else {
            // Títulos para administradores (mantener lo que ya tienes)
            return match ($action) {
                'created' => "Nuevo Departamento: {$model->nombre}",
                'updated' => "Departamento Actualizado: {$model->nombre}",
                'deleted' => "Departamento Eliminado: {$model->nombre}",
                default => "Departamento: {$model->nombre}"
            };
        }
    }

    /**
     * Crea el contenido para la notificación de departamento
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Departamento)) {
            return "Notificación del sistema";
        }

        if ($isEmployee) {
            // Contenido para empleados
            $prefix = match ($action) {
                'created' => "Has sido asignado a un departamento",
                'updated' => "Se ha actualizado la información del departamento al que perteneces",
                'deleted' => "El departamento al que pertenecías ha sido eliminado",
                default => "Información sobre tu departamento"
            };

            return $prefix . ".\n\n" .
                "Detalles del departamento:\n" .
                "• Nombre: {$model->nombre}\n" .
                ($model->descripcion ? "• Descripción: {$model->descripcion}\n" : "") .
                ($model->manager ? "• Responsable: " . ($model->manager->nombre_completo ?? 'No asignado') . "\n" : "") .
                "\nSi tienes alguna pregunta, contacta con tu supervisor.";
        } else {
            // Contenido para administradores (mantener lo que ya tienes)
            $prefix = match ($action) {
                'created' => "Se ha creado un nuevo departamento en el sistema",
                'updated' => "Se ha actualizado un departamento en el sistema",
                'deleted' => "Se ha eliminado un departamento del sistema",
                'default' => "Información de departamento"
            };

            return $prefix . ".\n\n" .
                "Detalles del departamento:\n" .
                "• Nombre: {$model->nombre}\n" .
                "• Código: {$model->codigo}\n" .
                "• Responsable: {$model->responsable}\n" .
                "• Descripción: " . ($model->descripcion ?? "No disponible");
        }
    }
}

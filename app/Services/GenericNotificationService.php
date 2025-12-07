<?php

namespace App\Services;

use App\Config\NotificationRules;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\SystemNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class GenericNotificationService
{
    /**
     * Envía una notificación inmediata
     */
    public function send($model, string $action, array $config = []): void
    {
        $rules = NotificationRules::getRules();
        $modelType = strtolower(class_basename($model));

        Log::info("Buscando regla para {$modelType}.{$action}", [
            'available_rules' => array_keys($rules),
            'available_actions' => isset($rules[$modelType]) ? array_keys($rules[$modelType]) : []
        ]);

        if (!isset($rules[$modelType][$action])) {
            Log::warning("No se encontró regla de notificación para {$modelType}.{$action}");
            return;
        }

        $rule = $rules[$modelType][$action];

        Log::info("Regla encontrada", [
            'rule' => $rule,
            'templates' => $rule['templates'] ?? 'no templates'
        ]);

        $recipients = $this->resolveRecipients($model, $rule['recipients']);

        Log::info("Enviando notificación {$modelType}.{$action} a " . $recipients->count() . " destinatarios");

        foreach ($recipients as $recipient) {
            $this->sendToUser($recipient, $model, $action, $rule, $config);
        }
    }

    /**
     * Programa una notificación para una fecha futura
     */
    public function schedule($model, string $action, Carbon $date, array $config = []): void
    {
        $rules = NotificationRules::getRules();
        $modelType = strtolower(class_basename($model));

        if (!isset($rules[$modelType][$action])) {
            Log::warning("No se encontró regla de notificación para {$modelType}.{$action}");
            return;
        }

        $rule = $rules[$modelType][$action];

        if (!($rule['scheduled'] ?? false)) {
            Log::warning("La acción {$modelType}.{$action} no admite programación");
            return;
        }

        if ($date->isPast()) {
            Log::warning("No se puede programar notificación en el pasado: {$date}");
            return;
        }

        $recipients = $this->resolveRecipients($model, $rule['recipients']);

        Log::info("Programando notificación {$modelType}.{$action} para {$date} a " . $recipients->count() . " destinatarios");

        foreach ($recipients as $recipient) {
            $this->scheduleForUser($recipient, $model, $action, $date, $rule, $config);
        }
    }

    /**
     * Cancela notificaciones programadas
     */
    public function cancel($model, string $type): int
    {
        return DB::table('jobs')
            ->where('payload', 'like', '%' . $type . '%')
            ->where('payload', 'like', '%' . $model->id . '%')
            ->delete();
    }

    /**
     * Resuelve los destinatarios basado en la configuración
     */
    private function resolveRecipients($model, array $recipientConfig): \Illuminate\Support\Collection
    {
        $recipients = collect();

        Log::info('🔍 Resolviendo destinatarios', [
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'recipient_config' => $recipientConfig
        ]);

        // Por roles
        if (isset($recipientConfig['roles'])) {
            $recipients = $recipients->merge($this->getUsersByRole($recipientConfig['roles']));
        }

        // Por permisos específicos
        if (isset($recipientConfig['permissions'])) {
            $recipients = $recipients->merge($this->getUsersByPermissions($recipientConfig['permissions']));
        }

        // Por relaciones complejas
        if (isset($recipientConfig['relationships'])) {
            $recipients = $recipients->merge($this->getUsersByRelationships($model, $recipientConfig['relationships']));
        }

        // Usuarios específicos por ID
        if (isset($recipientConfig['user_ids'])) {
            $specificUsers = User::whereIn('id', $recipientConfig['user_ids'])->get();
            $recipients = $recipients->merge($specificUsers);
        }

        // Usuarios específicos por email
        if (isset($recipientConfig['user_emails'])) {
            $emailUsers = User::whereIn('email', $recipientConfig['user_emails'])->get();
            $recipients = $recipients->merge($emailUsers);
        }

        // El propio empleado
        if (isset($recipientConfig['employee']) && $recipientConfig['employee']) {
            if ($model->user) {
                $recipients->push($model->user);
            }
        }

        // El propio usuario (cuando el modelo es User)
        if (isset($recipientConfig['user']) && $recipientConfig['user']) {
            if ($model instanceof User) {
                Log::info('👤 Agregando propio usuario como destinatario', [
                    'user_id' => $model->id,
                    'user_email' => $model->email,
                    'user_name' => $model->name
                ]);
                $recipients->push($model);
            }
        }

        Log::info('📧 Destinatarios finales', [
            'total_recipients' => $recipients->count(),
            'recipients' => $recipients->map(fn($r) => [
                'id' => $r->id,
                'email' => $r->email,
                'name' => $r->name
            ])->toArray()
        ]);

        return $recipients->unique('id');
    }

    /**
     * Obtiene usuarios por roles
     */
    private function getUsersByRole(array $roleNames): \Illuminate\Database\Eloquent\Collection
    {
        $roleIds = Role::whereIn('name', $roleNames)
            ->where('guard_name', 'web')
            ->pluck('id');

        return User::whereHas('roles', function ($q) use ($roleIds) {
            $q->whereIn('role_id', $roleIds);
        })->get();
    }

    /**
     * Obtiene usuarios por permisos específicos
     */
    private function getUsersByPermissions(array $permissions): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereHas('permissions', function ($q) use ($permissions) {
            $q->whereIn('name', $permissions);
        })->get();
    }

    /**
     * Obtiene usuarios por relaciones complejas
     */
    private function getUsersByRelationships($model, array $relationships): \Illuminate\Support\Collection
    {
        $recipients = collect();
        $modelType = strtolower(class_basename($model));

        foreach ($relationships as $relationship => $enabled) {
            if (!$enabled) continue;

            switch ($relationship) {
                case 'department_employees':
                    if ($modelType === 'departamento') {
                        $recipients = $recipients->merge($this->getDepartmentEmployees($model));
                    }
                    break;

                case 'department_manager':
                    if ($modelType === 'departamento') {
                        $recipients = $recipients->merge($this->getDepartmentManager($model));
                    }
                    break;

                case 'department_adjunto':
                    if ($modelType === 'departamento') {
                        $recipients = $recipients->merge($this->getDepartmentAdjunto($model));
                    }
                    break;

                case 'employee_manager':
                    if ($modelType === 'empleado') {
                        $recipients = $recipients->merge($this->getEmployeeManager($model));
                    }
                    break;

                case 'center_managers':
                    if ($modelType === 'centro') {
                        $recipients = $recipients->merge($this->getCenterManagers($model));
                    }
                    break;
            }
        }

        return $recipients;
    }

    /**
     * Obtiene empleados de un departamento
     */
    private function getDepartmentEmployees($departamento): \Illuminate\Support\Collection
    {
        $usuarios = collect();

        $contratos = $departamento->contratos()
            ->with('empleado.user')
            ->get();

        foreach ($contratos as $contrato) {
            if ($contrato->empleado && $contrato->empleado->user) {
                $usuarios->push($contrato->empleado->user);
            }
        }

        return $usuarios;
    }

    /**
     * Obtiene el manager de un departamento
     */
    private function getDepartmentManager($departamento): \Illuminate\Support\Collection
    {
        $usuarios = collect();

        if ($departamento->manager && $departamento->manager->user) {
            $usuarios->push($departamento->manager->user);
        }

        return $usuarios;
    }

    /**
     * Obtiene el adjunto de un departamento
     */
    private function getDepartmentAdjunto($departamento): \Illuminate\Support\Collection
    {
        $usuarios = collect();

        if ($departamento->adjunto && $departamento->adjunto->user) {
            $usuarios->push($departamento->adjunto->user);
        }

        return $usuarios;
    }

    /**
     * Obtiene el manager de un empleado
     */
    private function getEmployeeManager($empleado): \Illuminate\Support\Collection
    {
        $usuarios = collect();

        if ($empleado->manager_id) {
            $manager = User::find($empleado->manager_id);
            if ($manager) {
                $usuarios->push($manager);
            }
        }

        return $usuarios;
    }

    /**
     * Obtiene managers de un centro
     */
    private function getCenterManagers($centro): \Illuminate\Support\Collection
    {
        return User::whereHas('roles', function ($q) {
            $q->where('name', 'Manager');
        })->whereHas('centros_gestionados', function ($q) use ($centro) {
            $q->where('centro_id', $centro->id);
        })->get();
    }

    /**
     * Envía notificación a un usuario específico
     */
    private function sendToUser($user, $model, string $action, array $rule, array $config): void
    {
        try {
            $userRole = $this->determineUserRole($model, $user);
            $title = $this->resolveRoleBasedTemplate('title', $model, $config, $userRole, $rule);
            $content = $this->resolveRoleBasedTemplate('content', $model, $config, $userRole, $rule);
            $data = $this->prepareData($model, $action, $config);

            // Filtrar canales habilitados
            $enabledChannels = array_filter($rule['channels'], function ($channel) {
                return NotificationRules::isChannelEnabled($channel);
            });

            // Manejar canal database por separado
            $channels = array_filter($enabledChannels, function ($channel) {
                return $channel !== 'database';
            });

            // 1. Enviar notificaciones por otros canales
            if (!empty($channels)) {
                $notification = new SystemNotification(
                    type: strtolower(class_basename($model)) . '.' . $action,
                    title: $title,
                    sender: Auth::user() ? Auth::user() : 'Sistema',
                    message: $content,
                    data: $this->prepareNotificationData($model, $action, $data, $rule),
                    channels: $channels
                );

                $user->notify($notification);
            }

            // 2. Manejar canal database por separado
            if (in_array('database', $enabledChannels)) {
                $this->handleDatabaseNotification($user, $model, $action, $title, $content, $data, $rule);
            }

            Log::info("Notificación enviada correctamente", [
                'user_id' => $user->id,
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action,
                'user_role' => $userRole,
                'channels' => $enabledChannels,
                'title' => $title,
                'content' => $content
            ]);
        } catch (\Exception $e) {
            Log::error("Error al enviar notificación", [
                'user_id' => $user->id,
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Prepara datos específicos para cada canal
     */
    private function prepareNotificationData($model, string $action, array $data, array $rule): array
    {
        $modelType = strtolower(class_basename($model));

        // Datos específicos para Brevo
        $brevoData = [];
        if (isset($rule['templates']['mail'])) {
            $templateKey = "{$modelType}.{$action}";
            $templateId = NotificationRules::getMailTemplateConfig($templateKey);

            // DEBUG: Log temporal para verificar la configuración
            Log::info("🔍 DEBUG: Resolviendo template para empresa", [
                'model_type' => $modelType,
                'action' => $action,
                'template_key' => $templateKey,
                'template_id_resolved' => $templateId,
                'config_check' => config("notifications.mail_templates.brevo.templates.{$templateKey}"),
                'all_templates' => config('notifications.mail_templates.brevo.templates')
            ]);

            $brevoData = [
                'brevo_params' => [
                    'subject' => $rule['templates']['mail']['subject'] ?? 'Notificación del Sistema',
                    'template_id' => $templateId,
                    'template_data' => $this->prepareBrevoTemplateData($model, $action, $data, $templateId),
                ]
            ];
        }

        return array_merge($data, $brevoData);
    }

    /**
     * Prepara datos para plantillas de Brevo según el template_id
     */
    private function prepareBrevoTemplateData($model, string $action, array $data, int $templateId): array
    {
        $modelType = strtolower(class_basename($model));
        $templateVars = config("notifications.mail_templates.brevo.template_variables.{$templateId}", []);

        // Datos base para todas las plantillas
        $baseData = [
            'NOMBRE' => $data['nombre'] ?? $data['name'] ?? '',
            'APELLIDOS' => $data['apellidos'] ?? $data['last_name'] ?? '',
        ];

        // Casos específicos para templates especiales
        switch ($templateId) {
            case 53: // empresa.created
                return [
                    'COMPANY_NAME' => $model->nombre ?? 'N/A',
                    'COMPANY_ID' => $model->id ?? 'N/A',
                    'COMPANY_CREATION_DAY' => now()->format('d/m/Y'),
                ];

            case 54: // empresa.updated - VARIABLES CORRECTAS PARA BREVO
                return [
                    'COMPANY_NAME' => $model->nombre ?? 'N/A',
                    'COMPANY_ID' => $model->id ?? 'N/A',
                    'COMPANY_UPDATE_DAY' => now()->format('d/m/Y'),
                ];

            case 55: // empresa.deleted
                return [
                    'COMPANY_NAME' => $model->nombre ?? 'N/A',
                    'COMPANY_ID' => $model->id ?? 'N/A',
                    'COMPANY_CREATION_DAY' => now()->format('d/m/Y'),
                ];

            case 46: // Email básico
                return array_merge($baseData, [
                    'SUBJECT' => $data['title'] ?? 'Notificación del Sistema',
                    'TITLE' => $data['title'] ?? 'Notificación',
                    'MESSAGE' => $data['content'] ?? $data['message'] ?? '',
                ]);

            case 28: // Usuario nuevo
            case 31: // Usuario actualizado
                return array_merge($baseData, [
                    'USERNAME' => $data['username'] ?? $data['email'] ?? '',
                    'PASSWORD' => $data['password'] ?? '***********',
                ]);

            case 30: // Notificación de Evento
                return array_merge($baseData, [
                    'EVENT_TYPE' => $data['event_type'] ?? 'Reunión',
                    'EVENT_CREATOR_AVATAR' => $data['event_creator_avatar'] ?? '',
                    'EVENT_CREATOR_FULLNAME' => $data['event_creator_fullname'] ?? '',
                    'EVENT_CREATOR_DEPARTMENT' => $data['event_creator_department'] ?? '',
                    'EVENT_DATE' => $data['event_date'] ?? now()->format('d/m/Y'),
                    'EVENT_HOUR' => $data['event_hour'] ?? now()->format('H:i'),
                    'EVENT_MESSAGE' => $data['event_message'] ?? '',
                ]);

            case 36: // Solicitud enviada (permisos)
            case 37: // Pendiente de revisión
            case 38: // En proceso
            case 39: // Solicitud aprobada
            case 47: // Solicitud denegada
                return array_merge($baseData, [
                    'PERMISOS_TYPE' => $data['permisos_type'] ?? 'Permiso',
                    'PERMISOS_DATE_START' => $data['permisos_date_start'] ?? '',
                    'PERMISOS_DATE_END' => $data['permisos_date_end'] ?? '',
                ]);

            case 32: // Modificación de información
                return array_merge($baseData, [
                    'MESSAGE' => $data['message'] ?? 'Por favor actualiza tu información de contacto.',
                ]);

            case 33: // Usuario dado de baja
            case 34: // Usuario baneado
            case 35: // Usuario reactivado
                return $baseData;

            case 41: // Felicitación cumpleaños
                return array_merge($baseData, [
                    'USER_AVATAR' => $data['user_avatar'] ?? '',
                ]);

            case 48: // Exportación completada
                return array_merge($baseData, [
                    'TABLE_NAME' => $data['table_name'] ?? 'Datos',
                ]);

            default:
                // Para plantillas no configuradas, usar email básico
                return array_merge($baseData, [
                    'SUBJECT' => $data['title'] ?? 'Notificación del Sistema',
                    'TITLE' => $data['title'] ?? 'Notificación',
                    'MESSAGE' => $data['content'] ?? $data['message'] ?? '',
                ]);
        }
    }

    /**
     * Programa notificación para un usuario específico
     */
    private function scheduleForUser($user, $model, string $action, Carbon $date, array $rule, array $config): void
    {
        try {
            $userRole = $this->determineUserRole($model, $user);
            $title = $this->resolveRoleBasedTemplate('title_template', $model, $config, $userRole, $rule);
            $content = $this->resolveRoleBasedTemplate('content_template', $model, $config, $userRole, $rule);
            $data = $this->prepareData($model, $action, $config);

            // Programar notificación por canales (excepto database)
            $channels = array_filter($rule['channels'], function ($channel) {
                return $channel !== 'database';
            });

            if (!empty($channels)) {
                $notification = new SystemNotification(
                    type: strtolower(class_basename($model)) . '.' . $action,
                    title: $title,
                    sender: Auth::id() ? Auth::user()->name : 'Sistema', // Todo: Crear usuario Sistema
                    message: $content,
                    data: $data,
                    channels: $channels
                );

                $user->notify($notification->delay($date));
            }

            // Programar registro en database
            if (in_array('database', $rule['channels'])) {
                \Illuminate\Support\Facades\Queue::later(
                    $date,
                    new \App\Jobs\CreateNotificationRecord(
                        Auth::id() ?? 1,
                        $user->id,
                        get_class($model),
                        $model->id,
                        $action,
                        $title,
                        $content,
                        $data
                    ),
                    'notifications'
                );
            }

            Log::info("Notificación programada correctamente", [
                'user_id' => $user->id,
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action,
                'user_role' => $userRole,
                'scheduled_date' => $date->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            Log::error("Error al programar notificación", [
                'user_id' => $user->id,
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Maneja la notificación en la base de datos personalizada
     */
    private function handleDatabaseNotification($user, $model, string $action, string $title, string $content, array $data, array $rule): void
    {
        $databaseConfig = $rule['database'] ?? [];
        $saveImmediately = $databaseConfig['save_immediately'] ?? true;

        if ($saveImmediately) {
            Log::info("Guardando inmediatamente en la base de datos personalizada");
            // Guardar inmediatamente en la base de datos personalizada
            $this->createNotificationRecord($user, $model, $action, $title, $content, $data);
        } else {
            Log::info("Programando job CreateNotificationRecord para guardar en job_logs");
            // Programar para guardar cuando se envíe la notificación
            $this->scheduleNotificationRecord($user, $model, $action, $title, $content, $data);
        }

        //$this->scheduleNotificationRecord($user, $model, $action, $title, $content, $data);
    }

    /**
     * Crea un registro de notificación en la base de datos personalizada
     */
    private function createNotificationRecord($user, $model, string $action, string $title, string $content, array $data): void
    {
        Notification::create([
            'sender_id' => Auth::id() ?? 1,
            'receiver_id' => $user->id,
            'notifiable_model' => get_class($model),
            'model_id' => $model->id,
            'action_model' => $action,
            'title' => $title,
            'content' => $content,
            'data' => $data,
            'sent_at' => now(),
        ]);
    }

    /**
     * Programa la creación de un registro de notificación
     */
    private function scheduleNotificationRecord($user, $model, string $action, string $title, string $content, array $data): void
    {
        \Illuminate\Support\Facades\Queue::later(
            now()->addMinutes(1), // O cuando se programe la notificación
            new \App\Jobs\CreateNotificationRecord(
                Auth::id() ?? 1, // Todo: Modificar el valor 1 por usuario por defecto, Super Admin
                $user->id,
                get_class($model),
                $model->id,
                $action,
                $title,
                $content,
                $data
            ),
            'notifications'
        );
    }

    /**
     * Determina el rol del usuario en el contexto del modelo
     */
    private function determineUserRole($model, $user): string
    {
        $modelType = strtolower(class_basename($model));

        switch ($modelType) {
            case 'departamento':
                return $this->determineDepartmentRole($model, $user);
            case 'empleado':
                return $this->determineEmployeeRole($model, $user);
            default:
                return 'user';
        }
    }

    /**
     * Determina el rol del usuario en un departamento
     */
    private function determineDepartmentRole($departamento, $user): string
    {
        // Verificar si es el manager
        if (
            $departamento->manager && $departamento->manager->user &&
            $departamento->manager->user->id === $user->id
        ) {
            return 'manager';
        }

        // Verificar si es el adjunto
        if (
            $departamento->adjunto && $departamento->adjunto->user &&
            $departamento->adjunto->user->id === $user->id
        ) {
            return 'adjunto';
        }

        // Verificar si es empleado del departamento
        $contrato = $departamento->contratos()
            ->whereHas('empleado', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->first();

        if ($contrato) {
            return 'empleado';
        }

        return 'user';
    }

    /**
     * Determina el rol del usuario en relación a un empleado
     */
    private function determineEmployeeRole($empleado, $user): string
    {
        // Si es el propio empleado
        if ($empleado->user && $empleado->user->id === $user->id) {
            return 'employee';
        }

        // Si es el manager del empleado
        if ($empleado->manager_id && $empleado->manager_id === $user->id) {
            return 'manager';
        }

        return 'user';
    }

    /**
     * Resuelve plantillas basadas en rol
     */
    private function resolveRoleBasedTemplate(string $templateType, $model, array $config, string $userRole, array $rule): string
    {
        // Primero buscar en role_based_content si existe
        $roleBasedContent = $rule['templates']['role_based'] ?? [];

        if (isset($roleBasedContent[$userRole][$templateType])) {
            $template = $roleBasedContent[$userRole][$templateType];
        } else {
            // Si no hay role_based, usar las plantillas normales
            $template = $rule['templates'][$templateType] ?? '';
        }

        if (empty($template)) {
            Log::warning("No se encontró plantilla para {$templateType}", [
                'model_type' => get_class($model),
                'user_role' => $userRole,
                'rule' => $rule
            ]);
            return "Notificación del sistema";
        }

        return $this->resolveTemplate($template, $model, $config);
    }

    /**
     * Resuelve una plantilla con datos del modelo y configuración
     */
    private function resolveTemplate(string $template, $model, array $config): string
    {
        $data = array_merge($model->toArray(), $config);

        return preg_replace_callback('/\{(\w+)\}/', function ($matches) use ($data) {
            return $data[$matches[1]] ?? $matches[0];
        }, $template);
    }

    /**
     * Prepara los datos para la notificación
     */
    private function prepareData($model, string $action, array $config): array
    {
        $modelType = strtolower(class_basename($model));

        $baseData = [
            'model_type' => $modelType,
            'model_id' => $model->id,
            'action' => $action,
            'action_url' => $this->getActionUrl($model, $action),
            'action_text' => $this->getActionText($action),
        ];

        // Agregar datos específicos del modelo
        $modelData = $this->getModelSpecificData($model, $modelType);

        return array_merge($baseData, $modelData, $config);
    }

    /**
     * Obtiene la URL de acción para la notificación
     */
    private function getActionUrl($model, string $action): string
    {
        if ($action === 'deleted') {
            return route("admin.{$this->getModelRouteName($model)}.index");
        }

        return route("admin.{$this->getModelRouteName($model)}.show", $model->id);
    }

    /**
     * Obtiene el texto de acción para la notificación
     */
    private function getActionText(string $action): string
    {
        return match ($action) {
            'deleted' => 'Ver Lista',
            default => 'Ver Detalles'
        };
    }

    /**
     * Obtiene el nombre de la ruta para el modelo
     */
    private function getModelRouteName($model): string
    {
        $modelType = strtolower(class_basename($model));
        return Str::plural($modelType);
    }

    /**
     * Obtiene datos específicos del modelo para la notificación
     */
    private function getModelSpecificData($model, string $modelType): array
    {
        return match ($modelType) {
            'empresa' => [
                'empresa' => [
                    'nombre' => $model->nombre,
                    'cif' => $model->cif,
                    'email' => $model->email,
                    'telefono' => $model->telefono,
                ]
            ],
            'empleado' => [
                'empleado' => [
                    'nombre' => $model->nombre . ' ' . $model->primer_apellido . ' ' . $model->segundo_apellido,
                    'nif' => $model->nif,
                    'email' => $model->email,
                    'telefono' => $model->telefono,
                ]
            ],
            'departamento' => [
                'departamento' => [
                    'nombre' => $model->nombre,
                    'descripcion' => $model->descripcion ?? '',
                ]
            ],
            default => []
        };
    }
}

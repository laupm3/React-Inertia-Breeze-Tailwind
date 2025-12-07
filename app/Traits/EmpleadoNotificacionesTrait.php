<?php

namespace App\Traits;

use App\Models\Empleado;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

trait EmpleadoNotificacionesTrait
{
    use NotificacionesTrait;

    /**
     * Notifica a todos los usuarios relevantes sobre un cambio en un empleado
     *
     * TODO: Usuarios adicionales que deberían ser notificados: debe recibir un array de ids o un array de objetos User
     */
    protected function notifyAllRelevantUsersAboutEmpleado(Empleado $empleado, string $action, bool $notifyAdmins = true): void
    {
        try {
            // 1. Notificar al empleado
            if ($empleado->user) {
                $this->notifyUser(
                    $empleado->user,
                    $empleado,
                    $action,
                    true
                );
            }

            // 2. Notificar a RRHH (solo si está activado)
            if ($notifyAdmins) {
                $this->notifyUsersByRole(['Human Resources'], $empleado, $action);
            }

            Log::info("✅ Notificaciones de empleado ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de empleado ({$action}):", [
                'error' => $e->getMessage(),
                'empleado_id' => $empleado->id
            ]);
            throw $e;
        }
    }

    /**
     * Programa notificaciones para el vencimiento del NIF de un empleado
     */
    protected function programarNotificacionesVencimientoNIF(Empleado $empleado): void
    {
        // Verificar que el empleado tenga fecha de caducidad del NIF
        if (!$empleado->caducidad_nif) {
            Log::info("Empleado sin fecha de caducidad NIF, no se programan notificaciones", [
                'empleado_id' => $empleado->id
            ]);
            return;
        }

        // Días de anticipación para notificar
        $diasAnticipacion = [10];

        // Obtener usuarios a notificar
        $usuarios = [];

        // 1. El empleado (si tiene usuario)
        if ($empleado->user) {
            $usuarios[] = [
                'user' => $empleado->user,
                'isEmployee' => true
            ];
        }

        // 2. Usuarios de RRHH
        $hrUsers = $this->getUsersByRole(['Human Resources']);

        foreach ($hrUsers as $hrUser) {
            $usuarios[] = [
                'user' => $hrUser,
                'isEmployee' => false
            ];
        }

        // Programar notificaciones para cada día de anticipación
        foreach ($diasAnticipacion as $dias) {
            // Calcular fecha de notificación
            $fechaNotificacion = Carbon::parse($empleado->caducidad_nif)->subDays($dias);

            // Si la fecha ya pasó, no programar
            if ($fechaNotificacion->isPast()) {
                continue;
            }

            // Programar notificación para cada usuario
            foreach ($usuarios as $usuario) {
                $this->scheduleNotification(
                    $usuario['user'],
                    $empleado,
                    'nif_expiring',
                    $fechaNotificacion,
                    $usuario['isEmployee'],
                    ['broadcast', 'mail'],
                    ['days_remaining' => $dias]
                );
            }

            Log::info("Notificación NIF programada para {$dias} días antes del vencimiento", [
                'empleado_id' => $empleado->id,
                'fecha_notificacion' => $fechaNotificacion->format('Y-m-d'),
                'fecha_caducidad_nif' => $empleado->caducidad_nif->format('Y-m-d')
            ]);
        }
    }

    /**
     * Cancela notificaciones programadas para el vencimiento del NIF de un empleado
     */
    protected function cancelarNotificacionesVencimientoNIF(Empleado $empleado): void
    {
        $deletedJobs = $this->cancelScheduledNotifications($empleado, 'nif_expiring');

        Log::info('Notificaciones NIF programadas anteriores canceladas', [
            'empleado_id' => $empleado->id,
            'jobs_cancelados' => $deletedJobs
        ]);
    }

    /**
     * Obtiene el título para la notificación de empleado
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Empleado)) {
            return "Notificación del Sistema";
        }

        if ($action === 'nif_expiring') {
            $daysRemaining = $model->data['days_remaining'] ?? '?';
            return $isEmployee
                ? "Tu NIF vence en {$daysRemaining} días"
                : "NIF próximo a vencer: {$model->nombre}";
        }

        if ($isEmployee) {
            return match ($action) {
                'created' => "Tu Perfil ha sido Creado",
                'updated' => "Tu Perfil ha sido Actualizado",
                'deleted' => "Tu Perfil ha sido Eliminado",
                default => "Información de tu Perfil"
            };
        }

        return match ($action) {
            'created' => "Nuevo Empleado: {$model->nombre}",
            'updated' => "Empleado Actualizado: {$model->nombre}",
            'deleted' => "Empleado Eliminado: {$model->nombre}",
            default => "Empleado: {$model->nombre}"
        };
    }

    /**
     * Crea el contenido para la notificación de empleado
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Empleado)) {
            return "Notificación del sistema";
        }

        // Contenido específico para vencimiento de NIF
        if ($action === 'nif_expiring') {
            $daysRemaining = $model->data['days_remaining'] ?? '?';
            return $this->createContentVencimientoNIF($model, $isEmployee, $daysRemaining);
        }

        $prefix = match ($action) {
            'created' => $isEmployee ? "Se ha creado tu perfil de empleado" : "Se ha creado un nuevo perfil para {$model->nombre}",
            'updated' => $isEmployee ? "Se ha actualizado tu perfil de empleado" : "Se ha actualizado el perfil de {$model->nombre}",
            'deleted' => $isEmployee ? "Se ha eliminado tu perfil de empleado" : "Se ha eliminado el perfil de {$model->nombre}",
            default => $isEmployee ? "Información de tu perfil de empleado" : "Información del perfil de {$model->nombre}"
        };

        return $prefix . ".\n\n" .
            "Detalles del Empleado:\n" .
            "• Nombre: {$model->nombre} {$model->primer_apellido} {$model->segundo_apellido}\n" .
            "• NIF: {$model->nif}\n" .
            "• Email: {$model->email}\n" .
            "• Teléfono: {$model->telefono}\n" .
            "• Tipo de Empleado: {$model->tipoEmpleado->nombre}\n" .
            "• Estado: {$model->estadoEmpleado->nombre}\n" .
            "• Tipo de Documento: {$model->tipoDocumento->nombre}\n" .
            "• Fecha de Nacimiento: {$model->fecha_nacimiento->format('d/m/Y')}\n" .
            "• NISS: {$model->niss}";
    }

    /**
     * Crea el contenido para la notificación de vencimiento del NIF
     */
    private function createContentVencimientoNIF($empleado, bool $isEmployee, $daysRemaining): string
    {
        // Asegurarnos que $daysRemaining sea un entero
        $daysRemaining = (int) $daysRemaining;

        if ($isEmployee) {
            return "Tu documento de identidad (NIF) vencerá en {$daysRemaining} días.\n\n" .
                "Detalles del Documento:\n" .
                "• Tipo: {$empleado->tipoDocumento->nombre}\n" .
                "• Número: {$empleado->nif}\n" .
                "• Fecha de Caducidad: {$empleado->caducidad_nif->format('d/m/Y')}\n\n" .
                "Por favor, renueva tu documento antes de la fecha de vencimiento para evitar problemas.";
        }

        return "El documento de identidad (NIF) de {$empleado->nombre} vencerá en {$daysRemaining} días.\n\n" .
            "Detalles del Documento:\n" .
            "• Empleado: {$empleado->nombre} {$empleado->primer_apellido} {$empleado->segundo_apellido}\n" .
            "• Tipo: {$empleado->tipoDocumento->nombre}\n" .
            "• Número: {$empleado->nif}\n" .
            "• Fecha de Caducidad: {$empleado->caducidad_nif->format('d/m/Y')}\n" .
            "• Email: {$empleado->email}\n" .
            "• Teléfono: {$empleado->telefono}";
    }

    /**
     * Prepara los datos para la notificación de empleado
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Empleado)) {
            return [];
        }

        $route = $action === 'deleted' ? 'admin.empleados.index' : 'admin.empleados.show';
        $routeParams = $action === 'deleted' ? [] : ['empleado' => $model->id];

        // Preparar parámetros específicos para Brevo.
        $brevoParams = [
            'employee_name' => $model->fullName,
            'document_type' => $model->tipoDocumento->nombre,
            'document_number' => $model->nif,
            'end_date' => $model->caducidad_nif ? $model->caducidad_nif->format('d/m/Y') : 'N/A',
            'days_remaining' => $model->data['days_remaining'] ?? '?',
            'action_url' => route($route, $routeParams),
            'action_text' => $action === 'deleted' ? 'Ver Empleados' : 'Ver Empleado',
        ];

        return [
            'empleado_id' => $model->id,
            'action_url' => route($route, $routeParams),
            'action_text' => $action === 'deleted' ? 'Ver Empleados' : 'Ver Empleado',
            'days_remaining' => $model->data['days_remaining'] ?? null,
            'empleado' => [
                'nombre' => $model->nombre . ' ' . $model->primer_apellido . ' ' . $model->segundo_apellido,
                'nif' => $model->nif,
                'tipo_documento' => $model->tipoDocumento->nombre,
                'caducidad_nif' => $model->caducidad_nif,
                'email' => $model->email,
                'telefono' => $model->telefono,
            ],
            // Añadir la clave esencial para Brevo.
            'brevo_params' => $brevoParams
        ];
    }
}

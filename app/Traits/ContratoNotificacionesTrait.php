<?php

namespace App\Traits;

use App\Models\Contrato;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

trait ContratoNotificacionesTrait
{
    use NotificacionesTrait;

    /**
     * Notifica a todos los usuarios relevantes sobre un cambio en un contrato
     */
    protected function notifyAllRelevantUsersAboutContrato(Contrato $contrato, string $action, bool $notifyAdmins = true): void
    {
        try {
            // 1. Notificar al empleado
            if ($contrato->empleado->user) {
                $this->notifyUser(
                    $contrato->empleado->user,
                    $contrato,
                    $action,
                    true
                );
            }

            // 2. Notificar a RRHH (solo si está activado)
            if ($notifyAdmins) {
                $this->notifyUsersByRole(['Human Resources'], $contrato, $action);
            }

            Log::info("✅ Notificaciones de contrato ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de contrato ({$action}):", [
                'error' => $e->getMessage(),
                'contrato_id' => $contrato->id
            ]);
            throw $e;
        }
    }

    /**
     * Programa notificaciones para el vencimiento de un contrato
     */
    protected function programarNotificacionesVencimiento(Contrato $contrato): void
    {
        // Días de anticipación para notificar
        $diasAnticipacion = [15, 5];

        // Obtener usuarios a notificar
        $usuarios = [];

        // 1. El empleado (si tiene usuario)
        if ($contrato->empleado->user) {
            $usuarios[] = [
                'user' => $contrato->empleado->user,
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
            $fechaNotificacion = Carbon::parse($contrato->fecha_fin)->subDays($dias);

            // Si la fecha ya pasó, no programar
            if ($fechaNotificacion->isPast()) {
                continue;
            }

            // Programar notificación para cada usuario
            foreach ($usuarios as $usuario) {
                $this->scheduleNotification(
                    $usuario['user'],
                    $contrato,
                    'expiring',
                    $fechaNotificacion,
                    $usuario['isEmployee'],
                    ['broadcast', 'mail'],
                    ['days_remaining' => $dias]
                );
            }

            Log::info("Notificación programada para {$dias} días antes del vencimiento", [
                'contrato_id' => $contrato->id,
                'fecha_notificacion' => $fechaNotificacion->format('Y-m-d')
            ]);
        }
    }

    /**
     * Cancela notificaciones programadas para un contrato
     */
    protected function cancelarNotificacionesVencimiento(Contrato $contrato): void
    {
        $deletedJobs = $this->cancelScheduledNotifications($contrato, 'contract_expiring');

        Log::info('Notificaciones programadas anteriores canceladas', [
            'contrato_id' => $contrato->id,
            'jobs_cancelados' => $deletedJobs
        ]);
    }

    /**
     * Obtiene el título para la notificación de contrato
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Contrato)) {
            return "Notificación del Sistema";
        }

        if ($action === 'expiring') {
            $daysRemaining = $model->data['days_remaining'] ?? '?';
            return $isEmployee
                ? "Tu Contrato vence en {$daysRemaining} días"
                : "Contrato próximo a vencer: {$model->empleado->nombre}";
        }

        if ($isEmployee) {
            return match($action) {
                'created' => "Tu Nuevo Contrato",
                'updated' => "Tu Contrato ha sido Actualizado",
                'deleted' => "Tu Contrato ha sido Eliminado",
                default => "Información de tu Contrato"
            };
        }

        return match($action) {
            'created' => "Nuevo Contrato: {$model->empleado->nombre}",
            'updated' => "Contrato Actualizado: {$model->empleado->nombre}",
            'deleted' => "Contrato Eliminado: {$model->empleado->nombre}",
            default => "Contrato: {$model->empleado->nombre}"
        };
    }

    /**
     * Crea el contenido para la notificación de contrato
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Contrato)) {
            return "Notificación del sistema";
        }

        // Contenido específico para vencimiento
        if ($action === 'expiring') {
            $daysRemaining = $model->data['days_remaining'] ?? '?';
            return $this->createContentVencimiento($model, $isEmployee, $daysRemaining);
        }

        $prefix = match($action) {
            'created' => $isEmployee ? "Se ha generado tu nuevo contrato laboral" : "Se ha generado un nuevo contrato para {$model->empleado->nombre}",
            'updated' => $isEmployee ? "Se ha actualizado tu contrato laboral" : "Se ha actualizado el contrato de {$model->empleado->nombre}",
            'deleted' => $isEmployee ? "Se ha eliminado tu contrato laboral" : "Se ha eliminado el contrato de {$model->empleado->nombre}",
            default => $isEmployee ? "Información de tu contrato laboral" : "Información del contrato de {$model->empleado->nombre}"
        };

        return $prefix . ".\n\n" .
            "Detalles del Contrato:\n" .
            "• Tipo: {$model->tipoContrato->nombre}\n" .
            "• Fecha Inicio: {$model->fecha_inicio->format('d/m/Y')}\n" .
            "• Fecha Fin: " . ($model->fecha_fin ? $model->fecha_fin->format('d/m/Y') : 'Indefinido') . "\n" .
            "• Departamento: {$model->departamento->nombre}\n" .
            "• Centro: {$model->centro->nombre}\n" .
            "• Empresa: {$model->empresa->nombre}\n" .
            "• Jornada: {$model->jornada->nombre}\n" .
            "• Expediente: {$model->n_expediente}";
    }

    /**
     * Crea el contenido para la notificación de vencimiento de contrato
     */
    private function createContentVencimiento($contrato, bool $isEmployee, $daysRemaining): string
    {
        // Asegurarnos que $daysRemaining sea un entero
        $daysRemaining = (int) $daysRemaining;

        if ($isEmployee) {
            return "Tu contrato laboral vencerá en {$daysRemaining} días.\n\n" .
                "Detalles del Contrato:\n" .
                "• Tipo: {$contrato->tipoContrato->nombre}\n" .
                "• Fecha Inicio: {$contrato->fecha_inicio->format('d/m/Y')}\n" .
                "• Fecha Fin: {$contrato->fecha_fin->format('d/m/Y')}\n" .
                "• Departamento: {$contrato->departamento->nombre}\n" .
                "• Centro: {$contrato->centro->nombre}\n" .
                "• Empresa: {$contrato->empresa->nombre}\n" .
                "• Jornada: {$contrato->jornada->nombre}\n" .
                "• Expediente: {$contrato->n_expediente}";
        }

        return "El contrato de {$contrato->empleado->nombre} vencerá en {$daysRemaining} días.\n\n" .
            "Detalles del Contrato:\n" .
            "• Tipo: {$contrato->tipoContrato->nombre}\n" .
            "• Fecha Inicio: {$contrato->fecha_inicio->format('d/m/Y')}\n" .
            "• Fecha Fin: {$contrato->fecha_fin->format('d/m/Y')}\n" .
            "• Departamento: {$contrato->departamento->nombre}\n" .
            "• Centro: {$contrato->centro->nombre}\n" .
            "• Empresa: {$contrato->empresa->nombre}\n" .
            "• Jornada: {$contrato->jornada->nombre}\n" .
            "• Expediente: {$contrato->n_expediente}";
    }

    /**
     * Prepara los datos para la notificación de contrato
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Contrato)) {
            return [];
        }

        $route = $action === 'deleted' ? 'admin.contratos.index' : 'admin.contratos.show';
        $routeParams = $action === 'deleted' ? [] : ['contrato' => $model->id];

        // Preparar parámetros específicos para Brevo.
        $brevoParams = [
            'employee_name' => $model->empleado->fullName,
            'contract_type' => $model->tipoContrato->nombre,
            'end_date' => $model->fecha_fin ? $model->fecha_fin->format('d/m/Y') : 'Indefinido',
            'days_remaining' => $model->data['days_remaining'] ?? '?',
            'action_url' => route($route, $routeParams),
            'action_text' => $action === 'deleted' ? 'Ver Contratos' : 'Ver Contrato',
        ];

        return [
            'contrato_id' => $model->id,
            'action_url' => route($route, $routeParams),
            'action_text' => $action === 'deleted' ? 'Ver Contratos' : 'Ver Contrato',
            'days_remaining' => $model->data['days_remaining'] ?? null,
            'contrato' => [
                'empleado' => $model->empleado->nombre,
                'tipo' => $model->tipoContrato->nombre,
                'fecha_inicio' => $model->fecha_inicio,
                'fecha_fin' => $model->fecha_fin,
            ],
            // Añadir la clave esencial para Brevo.
            'brevo_params' => $brevoParams
        ];
    }
}
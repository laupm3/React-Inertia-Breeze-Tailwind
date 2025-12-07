<?php

namespace App\Traits;

use App\Models\Asignacion;
use App\Models\Departamento;
use Illuminate\Support\Facades\Log;

trait AsignacionNotificacionesTrait
{
    use NotificacionesTrait;

    /**
     * Notifica a todos los administradores sobre un cambio en una asignación
     */
    protected function notifyAdminsAboutAsignacion(Asignacion $asignacion, string $action): void
    {
        try {
            // Notificar a administradores con broadcast y mail
            $this->notifyUsersByRole(
                ['Administrator', 'Super Admin'],
                $asignacion,
                $action,
                false,
                ['broadcast', 'mail']  // Se envía a los administradores con broadcast y mail
            );

            Log::info("✅ Notificaciones de asignación ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de asignación ({$action}):", [
                'error' => $e->getMessage(),
                'asignacion_id' => $asignacion->id
            ]);
            throw $e;
        }
    }

    /**
     * Obtiene el título para la notificación de asignación
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Asignacion)) {
            return "Notificación del Sistema";
        }

        return match ($action) {
            'created' => "Nueva Asignación: {$model->titulo}",
            'updated' => "Asignación Actualizada: {$model->titulo}",
            'deleted' => "Asignación Eliminada: {$model->titulo}",
            default => "Asignación: {$model->titulo}"
        };
    }

    /**
     * Crea el contenido para la notificación de asignación
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Asignacion)) {
            return "Notificación del sistema";
        }

        $prefix = match ($action) {
            'created' => "Se ha creado una nueva asignación en el sistema",
            'updated' => "Se ha actualizado una asignación en el sistema",
            'deleted' => "Se ha eliminado una asignación del sistema",
            default => "Información de asignación"
        };

        return $prefix . ".\n\n" .
            "Detalles de la asignación:\n" .
            "• Título: {$model->titulo}\n" .
            "• Descripción: {$model->descripcion}\n" .
            "• Fecha de inicio: {$model->fecha_inicio}\n" .
            "• Fecha de fin: {$model->fecha_fin}";
    }

    /**
     * Prepara los datos para la notificación de asignación
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Departamento)) {
            return [];
        }

        // Preparar parámetros específicos para Brevo
        $brevoParams = [
            'departamento_nombre' => $model->nombre,
            'departamento_descripcion' => $model->descripcion ?? 'Sin descripción',
            'departamento_manager' => $model->manager ?
                ($model->manager->nombre_completo ?? 'No asignado') : 'No asignado',
            'departamento_adjunto' => $model->adjunto ?
                ($model->adjunto->nombre_completo ?? 'No asignado') : 'No asignado',
        ];

        // Obtener número de empleados asociados
        $empleadosCount = $model->contratos()->count();

        return [
            'departamento_id' => $model->id,
            'action_url' => route('admin.departamentos.index'),
            'action_text' => 'Ver Departamentos',
            'departamento' => [
                'nombre' => $model->nombre,
                'descripcion' => $model->descripcion ?? 'Sin descripción',
                'empleados_count' => $empleadosCount,
                'manager' => $model->manager ? [
                    'id' => $model->manager->id,
                    'nombre' => $model->manager->nombre_completo ?? 'No asignado',
                ] : null,
                'adjunto' => $model->adjunto ? [
                    'id' => $model->adjunto->id,
                    'nombre' => $model->adjunto->nombre_completo ?? 'No asignado',
                ] : null,
            ],
            // Añadir parámetros específicos para Brevo
            'brevo_params' => $brevoParams
        ];
    }
}

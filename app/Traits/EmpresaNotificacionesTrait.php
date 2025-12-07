<?php

namespace App\Traits;

use App\Models\Empresa;
use Illuminate\Support\Facades\Log;

trait EmpresaNotificacionesTrait
{
    use NotificacionesTrait;
    
    /**
     * Notifica a todos los administradores sobre un cambio en una empresa
     */
    protected function notifyAdminsAboutEmpresa(Empresa $empresa, string $action): void
    {
        try {
            // Notificar a administradores con broadcast y mail
            $this->notifyUsersByRole(
                ['Administrator', 'Super Admin'], 
                $empresa, 
                $action,
                false,
                ['broadcast', 'mail']  // Se envía a los administradores con broadcast y mail
            );
            
            Log::info("✅ Notificaciones de empresa ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de empresa ({$action}):", [
                'error' => $e->getMessage(),
                'empresa_id' => $empresa->id
            ]);
            throw $e;
        }
    }
    
    /**
     * Obtiene el título para la notificación de empresa
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Empresa)) {
            return "Notificación del Sistema";
        }
        
        return match($action) {
            'created' => "Nueva Empresa: {$model->nombre}",
            'updated' => "Empresa Actualizada: {$model->nombre}",
            'deleted' => "Empresa Eliminada: {$model->nombre}",
            default => "Empresa: {$model->nombre}"
        };
    }
    
    /**
     * Crea el contenido para la notificación de empresa
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Empresa)) {
            return "Notificación del sistema";
        }
        
        $prefix = match($action) {
            'created' => "Se ha creado una nueva empresa en el sistema",
            'updated' => "Se ha actualizado una empresa en el sistema",
            'deleted' => "Se ha eliminado una empresa del sistema",
            default => "Información de empresa"
        };
        
        return $prefix . ".\n\n" .
            "Detalles de la empresa:\n" .
            "• Nombre: {$model->nombre}\n" .
            "• CIF: {$model->cif}\n" .
            "• Email: {$model->email}\n" .
            "• Dirección: " . (isset($model->direccion) ? 
                "{$model->direccion->direccion}, {$model->direccion->ciudad} ({$model->direccion->codigo_postal})" : 
                "No disponible");
    }
    
    /**
     * Prepara los datos para la notificación de empresa
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Empresa)) {
            return [];
        }
        
        // Preparar parámetros específicos para Brevo
        $brevoParams = [
            'empresa_nombre' => $model->nombre,
            'empresa_cif' => $model->cif,
            'empresa_email' => $model->email,
            'empresa_telefono' => $model->telefono,
            'empresa_direccion' => $model->direccion,
        ];
        
        return [
            'empresa_id' => $model->id,
            'action_url' => route('admin.empresas.index'),
            'action_text' => 'Ver Empresas',
            'empresa' => [
                'nombre' => $model->nombre,
                'cif' => $model->cif,
                'email' => $model->email,
                'telefono' => $model->telefono,
                'direccion' => $model->direccion,
            ],
            // Añadir parámetros específicos para Brevo
            'brevo_params' => $brevoParams
        ];
    }
} 
<?php

namespace App\Traits;

use App\Models\Turno;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

trait TurnoNotificacionesTrait
{
    use NotificacionesTrait;

    /**
     * Notifica a todos los administradores sobre un cambio en un turno
     */
    protected function notifyAdminsAboutTurno(Turno $turno, string $action): void
    {
        try {
            $this->notifyUsersByRole(
                ['Administrator', 'Super Admin'], 
                $turno, 
                $action,
                false,
                ['broadcast', 'mail']
            );
            
            Log::info("✅ Notificaciones de turno ({$action}) enviadas a administradores");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de turno ({$action}) a administradores:", [
                'error' => $e->getMessage(),
                'turno_id' => $turno->id
            ]);
            throw $e;
        }
    }
    
    /**
     * Notificar al personal de Recursos Humanos sobre cambios en un turno
     */
    protected function notifyHRAboutTurno(Turno $turno, string $action): void
    {
        try {
            $this->notifyUsersByRole(
                ['Recursos Humanos'], 
                $turno, 
                $action,
                false,
                ['broadcast']
            );
            
            Log::info("✅ Notificaciones de turno ({$action}) enviadas a Recursos Humanos");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de turno ({$action}) a Recursos Humanos:", [
                'error' => $e->getMessage(),
                'turno_id' => $turno->id
            ]);
            throw $e;
        }
    }

    /**
     * Notifica al empleado y gerentes sobre cambios en su turno
     */
    protected function notifyUsersAboutTurno(Turno $turno, string $action): void
    {
        try {
            $empleado = $turno->empleado ?? null;

            if ($empleado && $empleado->user) {
                $this->notifySpecificUser(
                    $empleado->user, 
                    $turno, 
                    $action, 
                    true,
                    ['broadcast']
                );
                Log::info("✅ Notificación de turno ({$action}) enviada al empleado", [
                    'empleado_id' => $empleado->id,
                    'user_id' => $empleado->user->id
                ]);
            }

            $centro = $turno->centro ?? null;

            if ($centro) {
                $managers = collect();
                if ($centro->responsable && $centro->responsable->user) {
                    $managers->push($centro->responsable->user);
                }
                if ($centro->coordinador && $centro->coordinador->user) {
                    $managers->push($centro->coordinador->user);
                }
                
                foreach ($managers->unique('id') as $manager) {
                    $this->notifySpecificUser(
                        $manager,
                        $turno,
                        $action,
                        false,
                        ['broadcast']
                    );
                }
                
                if ($managers->isNotEmpty()) {
                    Log::info("✅ Notificación de turno ({$action}) enviada a gerentes del centro", [
                        'centro_id' => $centro->id,
                        'manager_count' => $managers->count()
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de turno ({$action}) a usuarios:", [
                'error' => $e->getMessage(),
                'turno_id' => $turno->id
            ]);
            throw $e;
        }
    }
    
    /**
     * Obtiene el título para la notificación de turno
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Turno)) {
            return "Notificación del Sistema";
        }
        
        $fechaFormat = Carbon::parse($model->hora_inicio)->format('d/m/Y');
        
        if ($isEmployee) {
            return match($action) {
                'created' => "Se ha programado un nuevo turno para el {$fechaFormat}",
                'updated' => "Ha habido cambios en tu turno del {$fechaFormat}",
                'deleted' => "Se ha cancelado tu turno del {$fechaFormat}",
                default => "Información sobre tu turno del {$fechaFormat}"
            };
        } else {
            $empleadoNombre = $this->getEmpleadoNombre($model);
            
            return match($action) {
                'created' => "Nuevo turno: {$empleadoNombre} ({$fechaFormat})",
                'updated' => "Turno actualizado: {$empleadoNombre} ({$fechaFormat})",
                'deleted' => "Turno cancelado: {$empleadoNombre} ({$fechaFormat})",
                default => "Información de turno: {$empleadoNombre} ({$fechaFormat})"
            };
        }
    }
    
    /**
     * Crea el contenido para la notificación de turno
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof Turno)) {
            return "Notificación del sistema";
        }
        
        $fechaInicio = Carbon::parse($model->hora_inicio)->format('d/m/Y H:i');
        $fechaFin = Carbon::parse($model->hora_fin)->format('d/m/Y H:i');
        
        $centroNombre = $model->centro->nombre ?? 'No asignado';
        
        if ($isEmployee) {
            $prefix = match($action) {
                'created' => "Se ha programado un nuevo turno para ti.",
                'updated' => "Tu turno ha sido modificado.",
                'deleted' => "Tu turno ha sido cancelado.",
                default => "Información sobre tu turno"
            };
            
            return $prefix . "\n\n" .
                "Detalles del turno:\n" .
                "• Centro: {$centroNombre}\n" .
                "• Fecha de inicio: {$fechaInicio}\n" .
                "• Fecha de fin: {$fechaFin}";
        } else {
            $empleadoNombre = $this->getEmpleadoNombre($model);
            
            $prefix = match($action) {
                'created' => "Se ha creado un nuevo turno para {$empleadoNombre}",
                'updated' => "Se ha actualizado el turno de {$empleadoNombre}",
                'deleted' => "Se ha eliminado el turno de {$empleadoNombre}",
                default => "Información del turno de {$empleadoNombre}"
            };
            
            return $prefix . ".\n\n" .
                "Detalles del turno:\n" .
                "• Empleado: {$empleadoNombre}\n" .
                "• Centro: {$centroNombre}\n" .
                "• Fecha de inicio: {$fechaInicio}\n" .
                "• Fecha de fin: {$fechaFin}";
        }
    }
    
    /**
     * Prepara los datos para la notificación de turno
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof Turno)) {
            return [];
        }
        
        $turnoData = [
            'id' => $model->id,
            'hora_inicio' => $model->hora_inicio,
            'hora_fin' => $model->hora_fin,
        ];
        
        $empleado = $model->empleado ?? null;
        $centro = $model->centro ?? null;
        
        return [
            'turno_id' => $model->id,
            'action_url' => route('admin.turnos.index'),
            'action_text' => 'Ver Turnos',
            'turno' => $turnoData,
            'empleado' => $empleado ? [
                'id' => $empleado->id,
                'nombre' => $empleado->nombre,
                'apellido' => $empleado->apellido,
                'email' => $empleado->email,
            ] : null,
            'centro' => $centro ? [
                'id' => $centro->id,
                'nombre' => $centro->nombre,
            ] : null,
        ];
    }
    
    /**
     * Obtiene el nombre del empleado asociado al turno
     */
    protected function getEmpleadoNombre(Turno $turno): string
    {
        $empleado = $turno->empleado ?? null;
        return $empleado ? "{$empleado->nombre} {$empleado->apellido}" : "Empleado no asignado";
    }
}

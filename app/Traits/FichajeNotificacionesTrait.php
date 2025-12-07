<?php

namespace App\Traits;

use App\Models\User;
use App\Models\Horario;
use Illuminate\Support\Facades\Log;
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\Notification;

trait FichajeNotificacionesTrait
{
    /**
     * Notifica a los administradores sobre eventos de fichaje
     */
    protected function notifyAdminsAboutFichaje(Horario $horario, string $action): void
    {
        try {
            // Obtener usuarios con roles de administrador
            $admins = User::whereHas('roles', function($query) {
                $query->whereIn('name', ['Administrator', 'Super Admin']);
            })->get();

            if ($admins->isEmpty()) {
                Log::info('No hay administradores para notificar sobre fichaje');
                return;
            }

            // Preparar datos para la notificación
            $notificationData = $this->prepareFichajeNotificationData($horario, $action);
            
            // Enviar notificaciones
            Notification::send($admins, new SystemNotification(
                $notificationData['title'],
                $notificationData['message'],
                $notificationData['action_url'],
                'fichaje'
            ));

            Log::info("✅ Notificación de fichaje ({$action}) enviada a " . $admins->count() . " administradores");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de fichaje a administradores: " . $e->getMessage());
        }
    }

    /**
     * Notifica al manager del empleado asociado al horario
     */
    protected function notifyManagersAboutFichaje(Horario $horario, string $action): void
    {
        try {
            // Obtener los managers basados en la estructura organizativa
            $managers = $this->getManagers($horario);
            
            if ($managers->isEmpty()) {
                Log::info('No hay managers para notificar sobre fichaje');
                return;
            }

            // Preparar datos para la notificación
            $notificationData = $this->prepareFichajeNotificationData($horario, $action);
            
            // Enviar notificaciones
            Notification::send($managers, new SystemNotification(
                $notificationData['title'],
                $notificationData['message'],
                $notificationData['action_url'],
                'fichaje'
            ));

            Log::info("✅ Notificación de fichaje ({$action}) enviada a managers");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de fichaje a managers: " . $e->getMessage());
        }
    }

    /**
     * Obtiene los managers asociados al empleado del horario
     */
    protected function getManagers(Horario $horario)
    {
        $managers = collect();
        
        try {
            // Obtener el empleado asociado al horario
            $empleado = null;
            if ($horario->contrato_id && $horario->contrato) {
                $empleado = $horario->contrato->empleado ?? null;
            } elseif ($horario->anexo_id && $horario->anexo && $horario->anexo->contrato) {
                $empleado = $horario->anexo->contrato->empleado ?? null;
            }
            
            if (!$empleado) {
                Log::warning('No se encontró empleado asociado al horario', ['horario_id' => $horario->id]);
                return $managers;
            }
            
            // 1. Manager directo del empleado (si existe la relación)
            if (property_exists($empleado, 'manager_id') && $empleado->manager_id) {
                $manager = User::find($empleado->manager_id);
                if ($manager) {
                    $managers->push($manager);
                }
            }
            
            // 2. Responsable de departamento
            if ($horario->contrato && $horario->contrato->departamento && $horario->contrato->departamento->responsable_id) {
                $responsable = User::find($horario->contrato->departamento->responsable_id);
                if ($responsable) {
                    $managers->push($responsable);
                }
            }
            
            // 3. Managers con rol específico y permisos sobre el centro
            if ($horario->contrato && $horario->contrato->centro && $horario->contrato->centro->id) {
                // Usuarios con rol Manager y acceso al centro específico
                $centroManagers = User::whereHas('roles', function($q) {
                    $q->where('name', 'Manager');
                })->whereHas('centros_gestionados', function($q) use ($horario) {
                    $q->where('centro_id', $horario->contrato->centro->id);
                })->get();
                
                if ($centroManagers->isNotEmpty()) {
                    $managers = $managers->merge($centroManagers);
                }
            }
            
        } catch (\Exception $e) {
            Log::error("Error obteniendo managers: " . $e->getMessage(), [
                'horario_id' => $horario->id,
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        // Devolver colección sin duplicados
        return $managers->unique('id');
    }

    /**
     * Obtiene el nombre del empleado asociado al horario
     */
    protected function getEmpleadoNombre(Horario $horario): string
    {
        if ($horario->contrato_id && $horario->contrato && $horario->contrato->empleado) {
            $empleado = $horario->contrato->empleado;
            return $empleado->nombre . ' ' . $empleado->apellido;
        } 
        
        if ($horario->anexo_id && $horario->anexo && $horario->anexo->contrato && $horario->anexo->contrato->empleado) {
            $empleado = $horario->anexo->contrato->empleado;
            return $empleado->nombre . ' ' . $empleado->apellido;
        }
        
        return 'Empleado desconocido';
    }

    /**
     * Prepara los datos para la notificación
     */
    protected function prepareFichajeNotificationData(Horario $horario, string $action): array
    {
        // Obtener el nombre del empleado
        $nombreEmpleado = $this->getEmpleadoNombre($horario);
        
        // Configurar datos según la acción
        switch ($action) {
            case 'iniciar':
                $title = '🕒 Fichaje iniciado';
                $message = "$nombreEmpleado ha iniciado su jornada laboral a las " . 
                    date('H:i', strtotime($horario->fichaje_entrada));
                break;
                
            case 'pausar':
                $title = '⏸️ Fichaje pausado';
                $message = "$nombreEmpleado ha iniciado un descanso";
                break;
                
            case 'reanudar':
                $title = '▶️ Fichaje reanudado';
                $message = "$nombreEmpleado ha finalizado su descanso";
                break;
                
            case 'finalizar':
                $title = '✅ Fichaje finalizado';
                $message = "$nombreEmpleado ha finalizado su jornada laboral a las " . 
                    date('H:i', strtotime($horario->fichaje_salida));
                break;
                
            case 'update':
                $title = '🔄 Fichaje actualizado';
                $message = "Se ha actualizado información del fichaje de $nombreEmpleado";
                break;
                
            default:
                $title = 'Notificación de fichaje';
                $message = "Evento de fichaje para $nombreEmpleado";
        }
        
        // URL para ver los detalles
        $actionUrl = route('admin.horarios.show', $horario->id);
        
        return [
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl
        ];
    }
}
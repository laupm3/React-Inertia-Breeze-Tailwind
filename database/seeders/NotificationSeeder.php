<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        // Definir tipos de modelos que podrían generar notificaciones
        $modelTypes = [
            'App\Models\Contrato',
            'App\Models\Empresa',
            'App\Models\Empleado',
            'App\Models\Departamento',
            'App\Models\Centro',
            'App\Models\Documento',
            'App\Models\Solicitud',
        ];

        // Posibles acciones
        $actions = [
            'created', 
            'updated', 
            'deleted', 
            'approved', 
            'rejected', 
            'shared', 
            'commented',
            'assigned',
            'completed',
            'expired'
        ];

        $users->each(function ($user) use ($users, $modelTypes, $actions) {
            $receivers = $users->filter(function ($value) use ($user) {
                return $value->id !== $user->id;
            });

            // Create a random number of notifications for each user between 1 and 10
            $qtyNotifications = rand(1, 10);

            for ($i = 0; $i < $qtyNotifications; $i++) {
                $receiver = $receivers->random();
                
                // Seleccionar un tipo de modelo aleatorio
                $modelType = $modelTypes[array_rand($modelTypes)];
                $modelName = class_basename($modelType);
                
                // Generar un ID aleatorio para el modelo (simulando que existe)
                $modelId = rand(1, 100);
                
                // Seleccionar una acción aleatoria
                $action = $actions[array_rand($actions)];
                
                // Crear título y contenido
                $title = $this->generateTitle($modelName, $action);
                $content = $this->generateContent($modelName, $action, $user->name);
                
                // Crear la notificación
                Notification::create([
                    'sender_id' => $user->id,
                    'receiver_id' => $receiver->id,
                    'notifiable_model' => $modelType,
                    'model_id' => $modelId,
                    'action_model' => $action,
                    'title' => $title,
                    'content' => $content,
                    'is_read' => rand(0, 1) === 1,
                    'read_at' => rand(0, 1) === 1 ? now()->subMinutes(rand(1, 60)) : null,
                    'sent_at' => now()->subMinutes(rand(1, 120)),
                    'received_at' => now()->subMinutes(rand(1, 60)),
                    'data' => json_encode([
                        'model_type' => $modelName,
                        'model_id' => $modelId,
                        'action' => $action,
                        'url' => '/' . Str::plural(Str::kebab($modelName)) . '/' . $modelId,
                        'icon' => $this->getIconForModel($modelName),
                        'color' => $this->getColorForAction($action),
                    ]),
                ]);
            }
        });
    }

    /**
     * Generate a title for the notification
     */
    private function generateTitle(string $modelName, string $action): string
    {
        $actionText = match($action) {
            'created' => 'Nuevo',
            'updated' => 'Actualización de',
            'deleted' => 'Eliminación de',
            'approved' => 'Aprobación de',
            'rejected' => 'Rechazo de',
            'shared' => 'Compartido',
            'commented' => 'Comentario en',
            'assigned' => 'Asignación de',
            'completed' => 'Completado',
            'expired' => 'Vencimiento de',
            default => ucfirst($action),
        };

        return "{$actionText} {$modelName}";
    }

    /**
     * Generate content for the notification
     */
    private function generateContent(string $modelName, string $action, string $userName): string
    {
        return match($action) {
            'created' => "{$userName} ha creado un nuevo {$modelName}.",
            'updated' => "{$userName} ha actualizado un {$modelName}.",
            'deleted' => "{$userName} ha eliminado un {$modelName}.",
            'approved' => "{$userName} ha aprobado un {$modelName}.",
            'rejected' => "{$userName} ha rechazado un {$modelName}.",
            'shared' => "{$userName} ha compartido un {$modelName} contigo.",
            'commented' => "{$userName} ha comentado en un {$modelName}.",
            'assigned' => "{$userName} te ha asignado un {$modelName}.",
            'completed' => "Un {$modelName} ha sido completado por {$userName}.",
            'expired' => "Un {$modelName} ha vencido o está próximo a vencer.",
            default => "Acción {$action} realizada en {$modelName} por {$userName}.",
        };
    }

    /**
     * Get an appropriate icon for the model type
     */
    private function getIconForModel(string $modelName): string
    {
        return match($modelName) {
            'Contrato' => 'document-text',
            'Empresa' => 'building-office',
            'Empleado' => 'user',
            'Departamento' => 'users',
            'Centro' => 'office-building',
            'Documento' => 'document',
            'Solicitud' => 'clipboard-check',
            default => 'bell',
        };
    }

    /**
     * Get an appropriate color for the action
     */
    private function getColorForAction(string $action): string
    {
        return match($action) {
            'created' => 'green',
            'updated' => 'blue',
            'deleted' => 'red',
            'approved' => 'green',
            'rejected' => 'red',
            'shared' => 'purple',
            'commented' => 'yellow',
            'assigned' => 'orange',
            'completed' => 'green',
            'expired' => 'red',
            default => 'gray',
        };
    }
}

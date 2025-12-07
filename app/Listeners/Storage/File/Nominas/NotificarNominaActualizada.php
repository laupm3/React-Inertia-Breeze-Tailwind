<?php

namespace App\Listeners\Storage\File\Nominas;

use App\Models\File;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Queue\InteractsWithQueue;
use App\Notifications\SystemNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Events\Storage\Files\Nominas\NominaFileUpdated;

class NotificarNominaActualizada implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(NominaFileUpdated $event): void
    {
        $file = $event->file;

        // Obtener información del periodo de la nómina desde el path
        $fileInfo = $this->extractNominaInfo($file);

        // Obtenemos el usuario autenticado o el que actualizó el archivo
        $user = Auth::user() ?? $file->user;

        // Obtenemos los usuarios que deben recibir la notificación
        $recipients = User::role(['admin', 'rrhh'])->get();

        // Evitar duplicados si el usuario actualizador está en la lista
        $recipients = $recipients->unique('id');

        // Datos para la notificación
        $notificationData = [
            'file_id' => $file->id,
            'nombre' => $file->nombre,
            'mes' => $fileInfo['mes'] ?? 'N/A',
            'anio' => $fileInfo['anio'] ?? 'N/A',
            'empleado_nif' => $fileInfo['empleado_nif'] ?? 'N/A',
            'notification_id' => uniqid('nomina_updated_'),
            'action_url' => route('admin.files.show', $file->id),
            'brevo_params' => [
                'nombre_archivo' => $file->nombre,
                'mes' => $fileInfo['mes'] ?? 'N/A',
                'anio' => $fileInfo['anio'] ?? 'N/A',
                'empleado_nif' => $fileInfo['empleado_nif'] ?? 'N/A',
                'action_url' => route('admin.files.show', $file->id),
            ]
        ];

        $title = "Nómina actualizada";
        $message = "Se ha actualizado la nómina: {$file->nombre}";

        if ($fileInfo['mes'] && $fileInfo['anio']) {
            $message .= " para {$fileInfo['mes']}/{$fileInfo['anio']}";
        }

        if ($fileInfo['empleado_nif']) {
            $message .= " del empleado {$fileInfo['empleado_nif']}";
        }

        // Enviamos la notificación a todos los destinatarios
        foreach ($recipients as $recipient) {
            try {
                $recipient->notify(new SystemNotification(
                    'system.file.nomina.updated',
                    $title,
                    $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'profile_photo_url' => $user->profile_photo_url,
                    ] : 'Sistema',
                    $message,
                    $notificationData,
                    ['broadcast', 'database']
                ));

                Log::info('Notificación de nómina actualizada enviada', [
                    'recipient' => $recipient->id,
                    'file_id' => $file->id
                ]);
            } catch (\Exception $e) {
                Log::error('Error al enviar notificación de nómina actualizada', [
                    'error' => $e->getMessage(),
                    'recipient' => $recipient->id,
                    'file_id' => $file->id
                ]);
            }
        }
    }

    /**
     * Extrae información relevante del archivo de nómina basándose en su path
     */
    private function extractNominaInfo(File $file): array
    {
        $info = [
            'mes' => null,
            'anio' => null,
            'empleado_nif' => null
        ];

        // Obtener partes del path
        $parts = explode('/', $file->path);

        // Buscar patrones en el path
        foreach ($parts as $index => $part) {
            // Verificar si hay un año (4 dígitos)
            if (preg_match('/^(20\d{2})$/', $part, $matches)) {
                $info['anio'] = $matches[1];

                // El mes podría estar en la siguiente parte
                if (isset($parts[$index + 1])) {
                    $meses = [
                        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                    ];

                    if (in_array($parts[$index + 1], $meses)) {
                        $info['mes'] = $parts[$index + 1];
                    }
                }
            }

            // Verificar si hay un NIF (patrón de NIF español)
            if (preg_match('/^[0-9XYZ][0-9]{7}[A-Z]$/', $part)) {
                $info['empleado_nif'] = $part;
            }
        }

        // Si no se encontró en el path, buscar en el nombre del archivo
        if (!$info['mes'] || !$info['anio']) {
            // Buscar patrones como "Nomina_Enero_2024_"
            if (preg_match('/Nomina_([A-Za-z]+)_([0-9]{4})_/', $file->nombre, $matches)) {
                $info['mes'] = $matches[1];
                $info['anio'] = $matches[2];
            }
        }

        return $info;
    }
}

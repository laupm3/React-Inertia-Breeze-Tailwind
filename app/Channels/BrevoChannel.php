<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoChannel
{
    /**
     * Envía la notificación a través de Brevo.
     *
     * @param mixed $notifiable
     * @param \Illuminate\Notifications\Notification|\App\Notifications\SystemNotification $notification
     * @return bool
     */
    public function send($notifiable, Notification $notification): bool
    {
        try {
            $apiKey = config('services.brevo.api_key');

            // Obtener los datos preparados para Brevo del método toBrevo() de la notificación
            $message = $notification->toBrevo($notifiable);

            // LOG TEMPORAL PARA DIAGNOSTICAR
            Log::info('🔍 DEBUGGING BrevoChannel - datos recibidos', [
                'notification_class' => get_class($notification),
                'message_structure' => $message,
                'notification_data' => $notification->data ?? 'NO DATA',
                'has_params' => isset($message['params']),
                'params_keys' => isset($message['params']) ? array_keys($message['params']) : 'NO PARAMS'
            ]);

            // Verificar que tenemos los datos necesarios
            if (!isset($message['params'])) {
                Log::error('Faltan parámetros para el envío de correo Brevo', [
                    'notification' => get_class($notification),
                    'notifiable' => get_class($notifiable)
                ]);
                return false;
            }

            // Obtener template_id de los datos preparados o usar fallback
            $templateId = $message['params']['template_id'] ??
                $notification->data['brevo_params']['template_id'] ??
                config('services.brevo.template_id', 46);

            // Log del template_id que vamos a usar
            Log::info('🎯 Template ID siendo enviado a Brevo', [
                'template_id' => $templateId,
                'template_id_type' => gettype($templateId),
                'to' => $notifiable->email,
                'fallback_config' => config('services.brevo.template_id', 'NO CONFIG')
            ]);

            // Aplanar el array 'contact' para que sea compatible con Brevo
            $flattenedParams = $message['params'];

            // Log para verificar la estructura de params enviada
            Log::info('📧 Estructura de params enviada a Brevo', [
                'original_params' => $message['params'],
                'flattened_params' => $flattenedParams,
                'template_id' => $templateId
            ]);

            // Construir el payload para Brevo con la estructura correcta
            $payload = [
                'sender' => [
                    'name' => config('mail.from.name'),
                    'email' => config('mail.from.address'),
                ],
                'to' => [
                    [
                        'email' => $notifiable->email,
                        'name' => $notifiable->name ?? ''
                    ]
                ],
                'templateId' => $templateId,
                'params' => $flattenedParams  // Brevo espera claves planas como 'contact.COMPANY_NAME'
            ];

            // Enviar el correo a través de la API de Brevo
            $response = Http::withHeaders([
                'api-key' => $apiKey,
                'Content-Type' => 'application/json'
            ])
                ->withOptions([
                    'verify' => env('APP_ENV', 'local') === 'production', // Solo para desarrollo
                ])->post('https://api.brevo.com/v3/smtp/email', $payload);

            if ($response->successful()) {
                Log::info('✅ Correo enviado exitosamente a través de Brevo', [
                    'to' => $notifiable->email,
                    'template_id' => $templateId,
                    'message_id' => $response->json()['messageId'] ?? null
                ]);

                return true;
            } else {
                Log::error('❌ Error al enviar correo a través de Brevo', [
                    'status' => $response->status(),
                    'response' => $response->json(),
                    'to' => $notifiable->email,
                    'template_id' => $templateId,
                    'payload' => $payload
                ]);

                return false;
            }
        } catch (\Exception $e) {
            Log::error('❌ Excepción al enviar correo a través de Brevo', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }
}

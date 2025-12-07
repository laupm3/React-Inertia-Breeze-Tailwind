<?php

namespace App\Http\Controllers;

use App\Models\BrevoTemplate;
use App\Models\Brevo_history;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use phpseclib3\Crypt\RC2;

class SendEmailController extends Controller
{
    /**
     * Sincroniza las plantillas desde la API de Brevo.
     * Se recorren los resultados y se actualizan o crean los registros en la tabla `brevo_templates`
     */
    public function syncTemplates()
    {
        $apiKey = config('services.brevo.api_key');

        // Asegúrate de que la URL y la estructura de la respuesta coincidan con la documentación de Brevo
        $response = Http::withHeaders([
            'api-key'      => $apiKey,
            'Content-Type' => 'application/json'
        ])->get('https://api.brevo.com/v3/smtp/templates');

        if ($response->successful()) {
            // Se asume que la respuesta tiene un array en 'templates'
            $templates = $response->json()['templates'] ?? [];

            foreach ($templates as $template) {
                BrevoTemplate::updateOrCreate(
                    ['template_id' => $template['id']],
                    ['name' => $template['name']]
                );
            }

            $all_templates = BrevoTemplate::all();

            return response()->json(['message' => 'Plantillas sincronizadas correctamente', 'templates' => $all_templates]);
        } else {
            return response()->json(['error' => 'No se pudieron obtener las plantillas'], 500);
        }
    }

  
    public function sendMail(Request $request)
    {
        $request->validate([
            'to'          => 'required|array|min:1',
            'to.*'        => 'email',
            'subject'     => 'required|string|max:255',
            'message'     => 'required|string',
            'message1'    => 'nullable|string',
            'message2'    => 'nullable|string',
            'attachments' => 'array|nullable',
            'attachments.*' => 'file|mimes:pdf,doc,docx,jpg,png,zip,rar,webp|max:5120|nullable'
        ]);

        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $fileContent = base64_encode(file_get_contents($file->getRealPath()));
                $attachments[] = [
                    'content' => $fileContent,
                    'name'    => $file->getClientOriginalName(),
                ];
            }
        }

        // Preparar los datos dinámicos para la plantilla
        $params = [
            'subject'  => $request->subject,
            'message'  => $request->message,
            'message1' => $request->message1,
            'message2' => $request->message2,
        ];

        $apiKey     = config('services.brevo.api_key');
        $templateId = config('services.brevo.template_id');
        $errors     = [];

        foreach ($request->to as $email) {
            $payload = [
                'sender' => [
                    'name'  => env('MAIL_FROM_NAME'),
                    'email' => env('MAIL_FROM_ADDRESS'),
                ],
                'to'         => [
                    ['email' => $email],
                ],
                'subject'    => $request->subject,
                'templateId' => (int)$templateId,
                'attachment' => $attachments,
                'params'     => $params,
            ];

            if (count($attachments) < 1) {
                $payload['attachment'] = null;
            }

            $response = Http::withHeaders([
                'api-key'      => $apiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.brevo.com/v3/smtp/email', $payload);

            if ($response->successful()) {
                // Registra el envío exitoso en la tabla `email_logs`
                Brevo_history::create([
                    'destinatario' => $email,
                    'remitente'    => env('MAIL_FROM_ADDRESS'),
                    'template_id'  => (int)$templateId,
                    'fecha'        => now()->toDateString(),
                    'hora'         => now()->toTimeString(),
                ]);
            } else {
                $errors[] = [
                    'email'   => $email,
                    'status'  => $response->status(),
                    'details' => $response->json(),
                ];
            }
        }

        if (!empty($errors)) {
            return response()->json([
                'error'   => 'Error al enviar uno o más correos.',
                'details' => $errors
            ], 500);
        }

        return response()->json(['message' => 'Correos enviados exitosamente']);
    }

    public function sendEmailEvent(Request $request)
    {

        $apiKey     = config('services.brevo.api_key');
        $templateId = config('services.brevo.template_id');
        $errors     = [];

        $payload = [
            'sender' => [
                'name'  => env('MAIL_FROM_NAME'),
                'email' => env('MAIL_FROM_ADDRESS'),
            ],
            'to'         => [
                ['email' => $email],
            ],
            'subject'    => $request->subject,
            'templateId' => (int)$templateId,
            'attachment' => $attachments,
            'params'     => $params,
        ];
        
        $response = Http::withHeaders([
            'api-key'      => $apiKey,
            'Content-Type' => 'application/json'
        ])->post('https://api.brevo.com/v3/smtp/email', $payload);

        if ($response->successful()) {
            // Registra el envío exitoso en la tabla `email_logs`
            Brevo_history::create([
                'destinatario' => $email,
                'remitente'    => env('MAIL_FROM_ADDRESS'),
                'template_id'  => (int)$templateId,
                'fecha'        => now()->toDateString(),
                'hora'         => now()->toTimeString(),
            ]);
        } else {
            $errors[] = [
                'email'   => $email,
                'status'  => $response->status(),
                'details' => $response->json(),
            ];
        }

        if (!empty($errors)) {
            return response()->json([
                'error'   => 'Error al enviar uno o más correos.',
                'details' => $errors
            ], 500);
        }

        return response()->json(['message' => 'Correos enviados exitosamente']);

    }

    /**
     * Renderiza la vista del formulario de envío de correos.
     */
    public function renderView(Request $request)
    {
        $empleados = Empleado::limit(2)->get();

        return Inertia::render('BrevoEmail/BRevoEmailForm', [
            'empleados' => $empleados
        ]);
    }


}

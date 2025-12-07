<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\File;
use App\Services\Contract\ContractStatusService;
use App\Notifications\SystemNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UserStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    // Adaptado para cuando tengamos el servicio de contratos
    public function handle(ContractStatusService $contractStatusService)
    {
        $user = User::find($this->userId);
        if (!$user) {
            Log::warning("UserStatus Job: Usuario no encontrado (ID: {$this->userId})");
            return;
        }

        // Evaluar estado de baja programada usando el nuevo servicio
        $contractStatusService->checkUserContractStatus($user);

        // Si no hay empleado, no podemos continuar con la lógica de nóminas.
        if (!$user->empleado) {
            return;
        }

        // Verificar si la baja supera los 13 días
        $latestContract = $user->empleado->contratos()->latest('fecha_fin')->first();
        if (!$latestContract) {
            return;
        }

        $daysSinceEnd = now()->diffInDays($latestContract->fecha_fin, false);

        if ($daysSinceEnd < -13) {
            // Validar email (formato y que no sea un placeholder típico)
            if (
                !filter_var($user->email, FILTER_VALIDATE_EMAIL) ||
                preg_match('/@(example|test|fake)\./i', $user->email)
            ) {
                Log::warning("UserStatus Job: Email inválido o ficticio para usuario ID {$user->id}: {$user->email}");
                return;
            }

            // Buscar las últimas 3 nóminas (archivos PDF en la carpeta de nóminas)
            $nominas = File::where('user_id', $user->id)
                ->where('path', 'like', '%Nominas%')
                ->orderByDesc('created_at')
                ->limit(3)
                ->get();

            $attachments = [];
            foreach ($nominas as $nomina) {
                $path = storage_path('app/' . $nomina->path);
                // Validar que el archivo existe, es legible y es PDF
                if (file_exists($path) && is_readable($path) && strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'pdf') {
                    $attachments[] = [
                        'content' => base64_encode(file_get_contents($path)),
                        'name' => $nomina->nombre,
                    ];
                } else {
                    Log::warning("UserStatus Job: Archivo de nómina no encontrado o ilegible: $path");
                }
            }

            $user->notify(new \App\Notifications\SystemNotification(
                type: 'user.baja_prolongada',
                title: 'Baja prolongada detectada',
                sender: 'Sistema',
                message: 'Tu baja supera los 13 días. Se adjuntan tus últimas 3 nóminas.',
                data: [
                    'brevo_params' => [
                        'usuario' => $user->name,
                        // otros params que tu plantilla requiera
                    ],
                    'templateId' => 12
                ],
                channels: ['mail', 'database'],
                attachments: $attachments
            ));
        }
    }
}

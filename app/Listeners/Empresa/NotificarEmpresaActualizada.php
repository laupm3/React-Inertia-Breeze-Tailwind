<?php

namespace App\Listeners\Empresa;

use App\Events\Empresa\EmpresaActualizada;
use App\Traits\GenericNotificationTrait;
use Illuminate\Support\Facades\Log;

class NotificarEmpresaActualizada
{
    use GenericNotificationTrait;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(EmpresaActualizada $event): void
    {
        Log::info('🎯 Notificando actualización de empresa con NUEVO sistema', [
            'empresa_id' => $event->empresa->id,
            'empresa_nombre' => $event->empresa->nombre
        ]);

        // Usar el nuevo sistema genérico
        $this->sendNotification($event->empresa, 'updated', [
            'updated_by' => auth()->user()->name ?? 'Sistema',
            'updated_at' => now()->format('Y-m-d H:i:s')
        ]);
    }
}

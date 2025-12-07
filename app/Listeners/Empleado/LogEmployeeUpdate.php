<?php

namespace App\Listeners\Empleado;

use App\Events\Empleado\EmployeeUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class LogEmployeeUpdate implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(EmployeeUpdated $event): void
    {
        $actorName = $event->actor ? $event->actor->name : 'Sistema';
        $empleadoName = $event->empleado->nombre_completo;
        $changes = $this->getChanges($event->originalData, $event->empleado->getAttributes());

        if (empty($changes)) {
            return; // No se registraron cambios relevantes
        }

        Log::channel('audit')->info('Empleado Actualizado', [
            'empleado_id' => $event->empleado->id,
            'empleado_name' => $event->empleado->getFullNameAttribute(),
            'changes' => $changes,
            'actor_id' => $event->actor?->id,
            'actor_name' => $event->actor?->name,
        ]);
    }

    /**
     * Compara los datos originales y nuevos para generar una descripción de los cambios.
     */
    private function getChanges(array $original, array $new): array
    {
        $changes = [];
        $interestingKeys = array_keys($original);

        foreach ($interestingKeys as $key) {
            $originalValue = Arr::get($original, $key);
            $newValue = Arr::get($new, $key);

            if ($originalValue != $newValue) {
                $changes[$key] = [
                    'from' => $originalValue,
                    'to' => $newValue,
                ];
            }
        }
        return $changes;
    }
}

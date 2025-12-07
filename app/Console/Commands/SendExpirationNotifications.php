<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contrato;
use App\Models\Empleado;
use App\Traits\ContratoNotificacionesTrait;
use App\Traits\EmpleadoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class SendExpirationNotifications extends Command
{
    // Usamos los traits directamente en el comando
    use ContratoNotificacionesTrait, EmpleadoNotificacionesTrait {
        ContratoNotificacionesTrait::getTitle insteadof EmpleadoNotificacionesTrait;
        ContratoNotificacionesTrait::createContent insteadof EmpleadoNotificacionesTrait;
        ContratoNotificacionesTrait::prepareData insteadof EmpleadoNotificacionesTrait;
        EmpleadoNotificacionesTrait::getTitle as getTitleEmpleado;
        EmpleadoNotificacionesTrait::createContent as createContentEmpleado;
        EmpleadoNotificacionesTrait::prepareData as prepareDataEmpleado;
    }

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:send-expirations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Busca contratos y documentos a punto de expirar y envía notificaciones.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando la revisión de vencimientos...');

        $this->checkExpiringContracts();
        $this->checkExpiringDocuments();

        $this->info('Revisión de vencimientos finalizada.');
        return 0;
    }

    private function checkExpiringContracts()
    {
        $this->line('Buscando contratos por vencer...');
        $daysToNotify = [30, 15, 5, 1]; // Días clave para notificar

        foreach ($daysToNotify as $days) {
            $expirationDate = now()->addDays($days)->startOfDay();
            $contracts = Contrato::with('empleado.user')
                ->whereDate('fecha_fin', $expirationDate)
                ->get();

            if ($contracts->isEmpty()) {
                continue;
            }

            $this->line("  - {$contracts->count()} contratos vencen en {$days} días. Enviando notificaciones...");
            foreach ($contracts as $contract) {
                // Adjuntamos los días restantes para que el trait los use
                $contract->data = ['days_remaining' => $days];
                $this->notifyAllRelevantUsersAboutContrato($contract, 'expiring');
            }
        }
        $this->info('Revisión de contratos completada.');
    }

    private function checkExpiringDocuments()
    {
        $this->line('Buscando documentos por vencer...');
        $daysToNotify = [30, 15, 5, 1]; // Días clave para notificar

        foreach ($daysToNotify as $days) {
            $expirationDate = now()->addDays($days)->startOfDay();
            $empleados = Empleado::with('user', 'tipoDocumento')
                ->whereDate('caducidad_nif', $expirationDate)
                ->get();

            if ($empleados->isEmpty()) {
                continue;
            }

            $this->line("  - {$empleados->count()} documentos vencen en {$days} días. Enviando notificaciones...");
            foreach ($empleados as $empleado) {
                // Adjuntamos los días restantes para que el trait los use
                $empleado->data = ['days_remaining' => $days];
                // Usamos el método renombrado para empleados
                $this->notifyAllRelevantUsersAboutEmpleado($empleado, 'nif_expiring');
            }
        }
        $this->info('Revisión de documentos completada.');
    }

    /**
     * Requerido por NotificacionesTrait, pero lo delegamos al trait específico.
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if ($model instanceof Empleado) {
            return $this->getTitleEmpleado($model, $action, $isEmployee);
        }
        return $this->getTitleContrato($model, $action, $isEmployee);
    }

    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if ($model instanceof Empleado) {
            return $this->createContentEmpleado($model, $action, $isEmployee);
        }
        return $this->createContentContrato($model, $action, $isEmployee);
    }

    protected function prepareData($model, string $action): array
    {
        if ($model instanceof Empleado) {
            return $this->prepareDataEmpleado($model, $action);
        }
        return $this->prepareDataContrato($model, $action);
    }
}

<?php

namespace App\Jobs\Export;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use App\Services\Export\ContratosExportService;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Exports\ResourceExport;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Job for exporting Contratos data
 */
class ExportContratosJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var int
     */
    public $timeout = 1800; // 30 minutos

    /**
     * @var bool
     */
    public $failOnTimeout = true;

    /**
     * @var int
     */
    protected $userId;

    /**
     * @var string
     */
    protected $filename;

    /**
     * @var string
     */
    protected $exportFormat;

    /**
     * @var array
     */
    protected $columnVisibility;

    /**
     * @var array
     */
    protected $filters;

    /**
     * @var array
     */
    protected $selectedRows;

    /**
     * @var array
     */
    protected $sorting;

    /**
     * @var string
     */
    protected $exportType;

    /**
     * Constructor
     *
     * @param int $userId
     * @param string $filename
     * @param string $exportFormat
     * @param array $columnVisibility
     * @param array $filters
     * @param array $selectedRows
     * @param array $sorting
     * @param string $exportType
     */
    public function __construct($userId, $filename, $exportFormat, $columnVisibility, $filters, $selectedRows, $sorting, $exportType)
    {
        $this->userId = $userId;
        $this->filename = $filename;
        $this->exportFormat = $exportFormat;
        $this->columnVisibility = $columnVisibility;
        $this->filters = $filters;
        $this->selectedRows = $selectedRows;
        $this->sorting = $sorting;
        $this->exportType = $exportType;
        $this->onQueue('exports');
    }

    /**
     * Execute the job.
     *
     * @param ContratosExportService $contratosExportService
     * @return void
     */
    public function handle(ContratosExportService $contratosExportService): void
    {
        try {
            $user = User::find($this->userId);
            if (!$user) {
                return;
            }

            // Notificar al usuario que la exportación ha comenzado
            $this->sendNotification($user, 'processing', 'La exportación de contratos está en proceso.');
            
            // Obtener datos usando el servicio
            $contratos = $contratosExportService->getExportData($this->filters, $this->selectedRows, $this->sorting, $this->columnVisibility);

            $resourceClass = $contratosExportService->getResourceClass();
            $visibleColumns = $contratosExportService->mapVisibleColumns($this->columnVisibility);
            
            $sheetTitle = 'Contratos';
            if (count($this->selectedRows) === 1) {
                $contrato = \App\Models\Contrato::find($this->selectedRows[0]);
                if ($contrato) $sheetTitle = 'Contrato ' . ($contrato->n_expediente ?? $contrato->id);
            }

            $export = new ResourceExport($contratos, $resourceClass, $this->filename, $visibleColumns, $sheetTitle);
            
            $format = $this->exportFormat === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX;
            
            Excel::store($export, "exports/{$this->filename}", 'public', $format);

            // Notificar al usuario que la exportación está lista para descargar
            $downloadUrl = Storage::url("exports/{$this->filename}");
            $this->sendNotification($user, 'completed', 'La exportación de contratos ha finalizado.', $downloadUrl);

        } catch (\Exception $e) {
            if (!empty($this->userId)) {
                $user = User::find($this->userId);
                if ($user) {
                    $this->sendNotification($user, 'failed', 'La exportación de contratos ha fallado. Contacta con el administrador.');
                }
            }
            
            $this->fail($e);
        }
    }

    /**
     * Send notification to user
     *
     * @param User $user
     * @param string $status
     * @param string $message
     * @param string|null $downloadUrl
     * @return void
     */
    protected function sendNotification(User $user, string $status, string $message, ?string $downloadUrl = null): void
    {
        $data = [
            'status' => $status,
            'jobId' => $this->job->getJobId(),
            'filename' => $this->filename,
            'exportType' => 'contratos'
        ];

        if ($downloadUrl) {
            $data['downloadUrl'] = $downloadUrl;
        }

        $notification = new SystemNotification(
            type: 'system.export.completed',
            title: 'Exportación de Contratos',
            sender: 'Sistema de Exportación',
            message: $message,
            data: $data,
            channels: ['broadcast', 'database']
        );

        $user->notify($notification);
    }
} 
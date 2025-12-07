<?php

namespace App\Jobs\Export;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use App\Services\Export\CentrosExportService;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Exports\ResourceExport;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Job for exporting Centros data
 */
class ExportCentrosJob implements ShouldQueue
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
     * @param CentrosExportService $centrosExportService
     * @return void
     */
    public function handle(CentrosExportService $centrosExportService): void
    {
        try {
            $user = User::find($this->userId);
            if (!$user) {
                return;
            }

            // Notificar al usuario que la exportación ha comenzado
            $this->sendNotification($user, 'processing', 'La exportación de centros está en proceso.');
            
            // Obtener datos usando el servicio
            $centros = $centrosExportService->getExportData($this->filters, $this->selectedRows, $this->sorting, $this->columnVisibility);

            $resourceClass = $centrosExportService->getResourceClass();
            $visibleColumns = $centrosExportService->mapVisibleColumns($this->columnVisibility);
            
            $sheetTitle = 'Centros';
            if (count($this->selectedRows) === 1) {
                $centro = \App\Models\Centro::find($this->selectedRows[0]);
                if ($centro) $sheetTitle = mb_substr($centro->nombre, 0, 31);
            }

            $export = new ResourceExport($centros, $resourceClass, $this->filename, $visibleColumns, $sheetTitle);
            
            $format = $this->exportFormat === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX;
            
            Excel::store($export, "exports/{$this->filename}", 'public', $format);

            // Notificar al usuario que la exportación está lista para descargar
            $downloadUrl = Storage::url("exports/{$this->filename}");
            $this->sendNotification($user, 'completed', 'La exportación de centros ha finalizado.', $downloadUrl);

        } catch (\Exception $e) {
            if (!empty($this->userId)) {
                $user = User::find($this->userId);
                if ($user) {
                    $this->sendNotification($user, 'failed', 'La exportación de centros ha fallado. Contacta con el administrador.');
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
            'exportType' => 'centros'
        ];

        if ($downloadUrl) {
            $data['downloadUrl'] = $downloadUrl;
        }

        $notification = new SystemNotification(
            type: 'system.export.completed',
            title: 'Exportación de Centros',
            sender: 'Sistema de Exportación',
            message: $message,
            data: $data,
            channels: ['broadcast', 'database']
        );

        $user->notify($notification);
    }
} 
<?php

namespace App\Jobs\Export;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use App\Services\Export\HorariosExportService;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Exports\ResourceExport;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Job for exporting Horarios data
 */
class ExportHorariosJob implements ShouldQueue
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
     * @param HorariosExportService $HorariosExportService
     * @return void
     */
    public function handle(HorariosExportService $HorariosExportService): void
    {
        try {
            $user = User::find($this->userId);
            if (!$user) {
                return;
            }

            // Obtener datos usando el servicio
            $horarios = $HorariosExportService->getExportData($this->filters, $this->selectedRows, $this->sorting, $this->columnVisibility);

            $resourceClass = $HorariosExportService->getResourceClass();
            $visibleColumns = $HorariosExportService->mapVisibleColumns($this->columnVisibility);

            $format = $this->exportFormat === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX;

            // Calcar exactamente la lógica del controlador
            $entitySheetNames = [
                'empleados' => function ($id) {
                    $empleado = \App\Models\Empleado::find($id);
                    if (!$empleado) return 'Empleado';
                    $nombre = trim($empleado->nombre . ' ' . $empleado->primer_apellido . ($empleado->segundo_apellido ? ' ' . $empleado->segundo_apellido : ''));
                    return mb_substr($nombre, 0, 31);
                }
            ];

            // Lógica de exportación basada en formato y número de empleados seleccionados
            if (count($this->selectedRows) > 1) {
                if ($this->exportFormat === 'csv') {
                    // Para CSV con múltiples empleados: exportar todos juntos en un solo archivo
                    if (!str_ends_with($this->filename, '.csv')) {
                        $this->filename = preg_replace('/\\.[a-zA-Z0-9]+$/', '.csv', $this->filename);
                    }
                    $format = \Maatwebsite\Excel\Excel::CSV;
                    $export = new \App\Exports\HorariosCSVExport($this->selectedRows, $visibleColumns, $this->filename);
                } else {
                    // Para XLSX con múltiples empleados: exportar en pestañas separadas
                    if (!str_ends_with($this->filename, '.xlsx')) {
                        $this->filename = preg_replace('/\\.[a-zA-Z0-9]+$/', '.xlsx', $this->filename);
                    }
                    $format = \Maatwebsite\Excel\Excel::XLSX;
                    $export = new \App\Exports\HorariosPorEmpleadoExport($this->selectedRows, $visibleColumns, $this->filename);
                }
            } elseif (count($this->selectedRows) === 1) {
                // Para un solo empleado, sí usamos la colección de horarios
                $sheetTitle = $entitySheetNames['empleados']($this->selectedRows[0]);
                $export = new ResourceExport($horarios, $resourceClass, $this->filename, $visibleColumns, $sheetTitle);
            } else {
                $sheetTitle = 'Horarios';
                $export = new ResourceExport($horarios, $resourceClass, $this->filename, $visibleColumns, $sheetTitle);
            }

            Excel::store($export, "exports/{$this->filename}", 'public', $format);

            // Notificar al usuario que la exportación está lista para descargar
            $downloadUrl = Storage::url("exports/{$this->filename}");
        } catch (\Exception $e) {
            if (!empty($this->userId)) {
                $user = User::find($this->userId);
                if ($user) {
                    // Notificación de error deshabilitada temporalmente
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
            'exportType' => 'horarios'
        ];

        if ($downloadUrl) {
            $data['downloadUrl'] = $downloadUrl;
        }

        $notification = new SystemNotification(
            type: 'system.export.completed',
            title: 'Exportación de Horarios',
            sender: 'Sistema de Exportación',
            message: $message,
            data: $data,
            channels: ['broadcast', 'database']
        );

        $user->notify($notification);
    }
}

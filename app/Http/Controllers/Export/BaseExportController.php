<?php

namespace App\Http\Controllers\Export;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;

/**
 * @deprecated Use DynamicExportController instead
 * @author @laupm3
 */
abstract class BaseExportController extends Controller
{
    /**
     * Get the export service instance
     *
     * @return mixed
     */
    abstract protected function getExportService();

    /**
     * Get the export request class
     *
     * @return string
     */
    abstract protected function getExportRequestClass();

    /**
     * Handle export request
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function export(Request $request)
    {
        return $this->handleExport($request, $request->type ?? 'xlsx');
    }

    /**
     * Handle CSV export request
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function exportCsv(Request $request)
    {
        return $this->handleExport($request, 'csv');
    }

    /**
     * Handle export with specified format
     *
     * @param Request $request
     * @param string $type
     * @return \Illuminate\Http\Response
     */
    protected function handleExport(Request $request, string $type)
    {
        $requestClass = $this->getExportRequestClass();
        $validated = app($requestClass)->validated();
        $filters = $validated['filters'] ?? [];
        $selectedRows = $validated['selectedRows'] ?? [];
        $sorting = $validated['sorting'] ?? [];
        $columnVisibility = $validated['columnVisibility'] ?? [];
        $exportType = $validated['exportType'] ?? 'filtered';
        $totalRows = $validated['totalRows'] ?? 0;

        $service = $this->getExportService();
        $stats = $service->getQueryStats($filters, $selectedRows, $sorting);
        $useQueue = $stats['total_records'] > config("queue-exports.default_export_max_records", 100);

        if ($useQueue) {
            return $this->handleQueueExport($service, $filters, $selectedRows, $sorting, $columnVisibility, $type, $exportType);
        } else {
            return $this->handleDirectExport($service, $filters, $selectedRows, $sorting, $columnVisibility, $type, $exportType);
        }
    }

    /**
     * Handle direct export (no queue)
     *
     * @param mixed $service
     * @param array $filters
     * @param array $selectedRows
     * @param array $sorting
     * @param array $columnVisibility
     * @param string $exportFormat
     * @param string $exportType
     * @return \Illuminate\Http\Response
     */
    protected function handleDirectExport($service, array $filters, array $selectedRows, array $sorting, array $columnVisibility, string $exportFormat, string $exportType = 'filtered')
    {
        $collection = $service->getExportData($filters, $selectedRows, $sorting, $columnVisibility, $exportType);
        $resourceClass = $service->getResourceClass();
        $filename = $service->getFilename();
        $visibleColumns = $service->mapVisibleColumns($columnVisibility);

        $export = new \App\Exports\ResourceExport($collection, $resourceClass, $filename, $visibleColumns);

        if ($exportFormat === 'csv') {
            $filename = str_replace('.xlsx', '.csv', $filename);
            $response = Excel::download($export, $filename, \Maatwebsite\Excel\Excel::CSV);
        } else {
            $response = Excel::download($export, $filename);
        }

        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');
        return $response;
    }

    /**
     * Handle queue export
     *
     * @param mixed $service
     * @param array $filters
     * @param array $selectedRows
     * @param array $sorting
     * @param array $columnVisibility
     * @param string $exportFormat
     * @param string $exportType
     * @return JsonResponse
     */
    protected function handleQueueExport($service, array $filters, array $selectedRows, array $sorting, array $columnVisibility, string $exportFormat, string $exportType)
    {
        $userId = Auth::id();
        $filename = 'export_' . now()->format('Y-m-d_H-i-s') . '.' . $exportFormat;
        $jobClass = $service->getExportJobClass();

        $jobClass::dispatch($userId, $filename, $exportFormat, $columnVisibility, $filters, $selectedRows, $sorting, $exportType);

        return response()->json([
            'message' => 'La exportación ha sido encolada. Recibirás una notificación cuando esté lista.',
            'filename' => $filename,
        ], 202);
    }
}

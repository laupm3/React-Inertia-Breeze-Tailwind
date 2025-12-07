<?php

namespace App\Http\Controllers;

use App\Enums\JobStatus;
use App\Http\Resources\JobLogResource;
use App\Models\JobLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class JobLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|AnonymousResourceCollection
    {
        $query = JobLog::with('source')
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->byStatus(JobStatus::from($request->status));
            })
            ->when($request->filled('job_name'), function ($query) use ($request) {
                $query->byJobName($request->job_name);
            })
            ->when($request->filled('source_type'), function ($query) use ($request) {
                $query->bySource($request->source_type, $request->source_id);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('job_name', 'like', '%' . $request->search . '%')
                      ->orWhere('error_message', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->whereDate('created_at', '<=', $request->date_to);
            });

        // Si es una petición API, devolver JSON
        if ($request->wantsJson()) {
            $perPage = $request->get('per_page', 15);
            $jobLogs = $query->latest()->paginate($perPage);
            
            return JobLogResource::collection($jobLogs);
        }

        // Si es una petición web, devolver vista Inertia
        $jobLogs = $query->latest()->paginate(15);
        
        return Inertia::render('JobLogs/Index', [
            'jobLogs' => JobLogResource::collection($jobLogs),
            'filters' => $request->only(['status', 'job_name', 'source_type', 'search', 'date_from', 'date_to']),
            'statuses' => collect(JobStatus::cases())->map(fn($status) => [
                'value' => $status->value,
                'label' => $status->label(),
                'color' => $status->color(),
            ]),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(JobLog $jobLog): Response|JsonResponse
    {
        $jobLog->load('source');
        
        if (request()->wantsJson()) {
            return response()->json(new JobLogResource($jobLog));
        }
        
        return Inertia::render('JobLogs/Show', [
            'jobLog' => new JobLogResource($jobLog),
        ]);
    }

    /**
     * Cancelar un job en ejecución
     */
    public function cancel(JobLog $jobLog): JsonResponse
    {
        if (!$jobLog->isRunning() && !$jobLog->isPending()) {
            return response()->json([
                'message' => 'Solo se pueden cancelar jobs en ejecución o pendientes'
            ], 400);
        }

        $jobLog->update([
            'status' => JobStatus::CANCELLED,
            'finished_at' => now(),
        ]);

        return response()->json([
            'message' => 'Job cancelado exitosamente',
            'jobLog' => new JobLogResource($jobLog->fresh()),
        ]);
    }

    /**
     * Reintentar un job fallido
     */
    public function retry(JobLog $jobLog): JsonResponse
    {
        if (!$jobLog->isFailed()) {
            return response()->json([
                'message' => 'Solo se pueden reintentar jobs fallidos'
            ], 400);
        }

        // Crear un nuevo job basado en el job fallido
        $jobClass = $jobLog->job_name;
        
        if (!class_exists($jobClass)) {
            return response()->json([
                'message' => 'No se puede encontrar la clase del job'
            ], 400);
        }

        try {
            // Recrear el job con los datos originales
            $source = $jobLog->source;
            $payload = $jobLog->payload ?? [];
            
            // Dispatch del nuevo job
            $newJob = new $jobClass($source, $payload['export_type'] ?? '', $payload['filters'] ?? []);
            dispatch($newJob);
            
            return response()->json([
                'message' => 'Job enviado a la cola para reintento',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al reintentar el job: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de jobs
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => JobLog::count(),
            'pending' => JobLog::byStatus(JobStatus::PENDING)->count(),
            'running' => JobLog::byStatus(JobStatus::RUNNING)->count(),
            'completed' => JobLog::byStatus(JobStatus::COMPLETED)->count(),
            'failed' => JobLog::byStatus(JobStatus::FAILED)->count(),
            'cancelled' => JobLog::byStatus(JobStatus::CANCELLED)->count(),
        ];

        // Jobs por tipo
        $jobsByType = JobLog::selectRaw('job_name, COUNT(*) as count')
            ->groupBy('job_name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Jobs recientes (últimas 24 horas)
        $recentJobs = JobLog::where('created_at', '>=', now()->subDay())
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return response()->json([
            'stats' => $stats,
            'jobs_by_type' => $jobsByType,
            'recent_jobs' => $recentJobs,
        ]);
    }

    /**
     * Limpiar logs antiguos
     */
    public function cleanup(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        $status = $request->get('status');
        
        $query = JobLog::where('created_at', '<', now()->subDays($days));
        
        if ($status) {
            $query->byStatus(JobStatus::from($status));
        }
        
        $deletedCount = $query->delete();
        
        return response()->json([
            'message' => "Se eliminaron {$deletedCount} logs antiguos",
            'deleted_count' => $deletedCount,
        ]);
    }
}

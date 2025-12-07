<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Enums\TipoAprobacion;
use App\Exceptions\Storage\FileProcessingException;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoShowRequest;
use App\Http\Requests\Vacaciones\VacacionesDestroyRequest;
use App\Http\Requests\Vacaciones\VacacionesIndexRequest;
use App\Http\Requests\Vacaciones\VacacionesStoreRequest;
use App\Http\Requests\Vacaciones\VacacionesUpdateRequest;
use App\Http\Resources\SolicitudPermisoResource;
use App\Models\SolicitudPermiso;
use App\Services\SolicitudPermiso\ApprovalService;
use App\Services\SolicitudPermiso\SolicitudPermisoStatusService;
use App\Services\Storage\DirectoryManagementService;
use App\Services\Storage\FileUploadService;
use App\Services\Storage\StoragePathService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class VacacionesController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private SolicitudPermisoStatusService $statusService,
        private ApprovalService $approvalService,
        private FileUploadService $fileUploadService,
        private DirectoryManagementService $directoryManagementService,
        private StoragePathService $storagePathService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(VacacionesIndexRequest $request)
    {
        $solicitudes = SolicitudPermiso::with(SolicitudPermiso::RELATIONSHIPS)
            ->vacaciones()
            ->withCount('files')
            ->latest()
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'solicitudes' => SolicitudPermisoResource::collection($solicitudes)->values(),
            'user_approval_types' => [$this->approvalService->getUserHighestApprovalLevel($request->user())],
            'approval_types' => TipoAprobacion::getAllValues(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param VacacionesStoreRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(VacacionesStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {

            $solicitudPermiso = SolicitudPermiso::create($request->validated());

            if (!$solicitudPermiso) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear la solicitud de vacaciones.'
                ]);
            }

            $solicitudPermiso->load([
                ...SolicitudPermiso::RELATIONSHIPS,
                'files' => function ($query) {
                    $query->archivos()->orderBy('created_at');
                },
            ]);

            // Generar ruta de almacenamiento usando el servicio especializado
            $folderName = $this->storagePathService->getSolicitudPermisoStoragePath($solicitudPermiso);

            // Obtener el user al que pertenece la solicitud
            $owner = $solicitudPermiso->empleado->user ?? $request->user();

            $destinationFolder = $this->directoryManagementService->createDirectoryPath(
                $folderName,
                owner: $owner,
                creator: $request->user()
            );

            $solicitudPermiso->files()->save($destinationFolder);

            // Procesar archivos adjuntos (opcionales) y asociarlos a la solicitud de permiso
            if ($request->hasFile('files')) {
                try {
                    $uploadedFiles = $this->fileUploadService->handleUploadRequest(
                        $request,
                        $destinationFolder,
                        creator: $request->user()
                    );

                    $uploadedFiles->each(fn($file) => $solicitudPermiso->files()->save($file));
                } catch (FileProcessingException $e) {
                    // Algunos archivos fallaron - asociar los exitosos si los hay
                    if ($e->hasSuccessfulFiles()) {
                        $e->getSuccessfulFiles()->each(fn($file) => $solicitudPermiso->files()->save($file));
                    }
                }
            }

            //TODO: Enviar notificación al empleado sobre la creación de la solicitud (Manager y empleado)

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Solicitud de vacaciones creada exitosamente.',
                'solicitud' => new SolicitudPermisoResource($solicitudPermiso)
            ]);
        });
    }

    /**
     * Display a specific resource with its relationships
     * 
     * @param SolicitudPermisoShowRequest $request
     * @param SolicitudPermiso $solicitudPermiso
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(SolicitudPermisoShowRequest $request, SolicitudPermiso $solicitud)
    {
        if (!Gate::allows('view', $solicitud)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para ver solicitudes de vacaciones.'
            ]);
        }

        $solicitud->load([
            ...SolicitudPermiso::RELATIONSHIPS,
            'files' => function ($query) {
                $query->archivos()->orderBy('created_at');
            },
        ]);

        // Verificar si la solicitud ha sido vista, si no, marcarla como vista
        if (!$solicitud->hasBeenSeen()) {
            $solicitud->markAsSeen();
        }

        // Actualizar el estado de la solicitud
        $this->statusService->updateStatus($solicitud);

        return response()->json(status: Response::HTTP_OK, data: [
            'solicitud' => new SolicitudPermisoResource($solicitud),
            'can_edit' => $this->statusService->canBeEdited($solicitud),
            'user_approval_types' => $this->approvalService->getUserApprovalTypes($request->user()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     * 
     * @param VacacionesUpdateRequest $request
     * @param SolicitudPermiso $solicitudPermiso
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(VacacionesUpdateRequest $request, SolicitudPermiso $solicitud)
    {
        if (!Gate::allows('update', $solicitud)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para actualizar solicitudes de vacaciones.'
            ]);
        }

        return DB::transaction(function () use ($request, $solicitud) {
            $updatedResult = $solicitud->update($request->validated());

            if (!$updatedResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido actualizar la solicitud de vacaciones.'
                ]);
            }

            // Cargar relaciones actualizadas
            $solicitud->load(SolicitudPermiso::RELATIONSHIPS);

            // Obtener la carpeta raíz de la solicitud para eliminarla
            $rootSolicitudFolder = $solicitud->files()->carpetas()->orderBy('created_at')->first();

            // Procesar archivos adjuntos (opcionales) y asociarlos a la solicitud de permiso
            if ($request->hasFile('files')) {
                try {
                    $uploadedFiles = $this->fileUploadService->handleUploadRequest(
                        $request,
                        $rootSolicitudFolder,
                        creator: $request->user(),
                    );

                    $uploadedFiles->each(fn($file) => $solicitud->files()->save($file));
                } catch (FileProcessingException $e) {
                    // Algunos archivos fallaron - asociar los exitosos si los hay
                    if ($e->hasSuccessfulFiles()) {
                        $e->getSuccessfulFiles()->each(fn($file) => $solicitud->files()->save($file));
                    }
                }
            }

            $solicitud->load([
                'files' => function ($query) {
                    $query->archivos()->orderBy('created_at');
                }
            ]);

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Solicitud de vacaciones actualizada correctamente.',
                'solicitud' => new SolicitudPermisoResource($solicitud)
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     * 
     * @param SolicitudPermisoDestroyRequest $request
     * @param SolicitudPermiso $solicitud
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(VacacionesDestroyRequest $request, SolicitudPermiso $solicitud)
    {
        return DB::transaction(function () use ($solicitud) {
            $deleteResult = $solicitud->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar la solicitud de vacaciones.'
                ]);
            }

            // Obtener la carpeta raíz de la solicitud para eliminarla
            $rootSolicitudFolder = $solicitud->files()->carpetas()->orderBy('created_at')->first();

            $deleteFileResult = $this->directoryManagementService->deleteElement($rootSolicitudFolder);

            if (!$deleteFileResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar uno o más archivos asociados a la solicitud de vacaciones.'
                ]);
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Solicitud de vacaciones eliminada correctamente.',
                'solicitud' => new SolicitudPermisoResource($solicitud)
            ]);
        });
    }
}

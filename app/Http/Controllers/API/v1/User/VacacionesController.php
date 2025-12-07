<?php

namespace App\Http\Controllers\API\v1\User;

use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\SolicitudPermiso;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Gate;
use App\Services\Storage\FileUploadService;
use App\Services\Storage\StoragePathService;
use App\Http\Resources\SolicitudPermisoResource;
use App\Services\SolicitudPermiso\ApprovalService;
use App\Exceptions\Storage\FileProcessingException;
use App\Services\Storage\DirectoryManagementService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\User\Vacaciones\VacacionesShowRequest;
use App\Http\Requests\User\Vacaciones\VacacionesIndexRequest;
use App\Http\Requests\User\Vacaciones\VacacionesStoreRequest;
use App\Http\Requests\User\Vacaciones\VacacionesUpdateRequest;
use App\Services\SolicitudPermiso\SolicitudPermisoStatusService;
use App\Http\Requests\User\SolicitudPermiso\SolicitudPermisoDestroyFolderRequest;

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
     * 
     * @param VacacionesIndexRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(VacacionesIndexRequest $request)
    {
        $vacaciones = $request->getEmpleado()
            ->vacaciones()
            ->with(SolicitudPermiso::RELATIONSHIPS)
            ->latest()
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'vacaciones' => SolicitudPermisoResource::collection($vacaciones)->values(),
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
        if (!Gate::allows('create', SolicitudPermiso::class)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para crear solicitudes de vacaciones.'
            ]);
        }

        return DB::transaction(function () use ($request) {
            $validated = $request->validated();

            $solicitud = SolicitudPermiso::create($validated);

            if (!$solicitud) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear la solicitud de vacaciones.'
                ]);
            }

            $solicitud->load(SolicitudPermiso::RELATIONSHIPS);

            // Generar ruta de almacenamiento usando el servicio especializado
            $folderName = $this->storagePathService->getSolicitudPermisoStoragePath($solicitud);

            $destinationFolder = $this->directoryManagementService->createDirectoryPath($folderName);

            $solicitud->files()->save($destinationFolder);

            // Procesar archivos adjuntos (opcionales) y asociarlos a la solicitud de permiso
            // Solo intentar procesar archivos si realmente están presentes en el request
            if ($request->hasFile('files')) {
                try {
                    $uploadedFiles = $this->fileUploadService->handleUploadRequest(
                        $request,
                        $destinationFolder,
                        creator: $request->user()
                    );

                    $uploadedFiles->each(fn($file) => $solicitud->files()->save($file));
                } catch (FileProcessingException $e) {
                    // Algunos archivos fallaron - asociar los exitosos si los hay
                    if ($e->hasSuccessfulFiles()) {
                        $e->getSuccessfulFiles()->each(fn($file) => $solicitud->files()->save($file));
                    }
                }
            }

            //TODO: Enviar notificación al empleado sobre la creación de la solicitud (Manager y empleado)

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Solicitud de vacaciones creada exitosamente.',
                'solicitud' => new SolicitudPermisoResource($solicitud)
            ]);
        });
    }

    /**
     * Display a specific resource with its relationships
     * 
     * @param VacacionesShowRequest $request
     * @param SolicitudPermiso $solicitud
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(VacacionesShowRequest $request, SolicitudPermiso $solicitud)
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

        return response()->json(status: Response::HTTP_OK, data: [
            'solicitudPermiso' => new SolicitudPermisoResource($solicitud),
            'can_edit' => $this->statusService->canBeEdited($solicitud)
        ]);
    }

    /**
     * Update the specified resource in storage.
     * 
     * @param VacacionesUpdateRequest $request
     * @param SolicitudPermiso $solicitud
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
            // Solo intentar procesar archivos si realmente están presentes en el request
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

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Solicitud actualizada correctamente.',
                'solicitudPermiso' => new SolicitudPermisoResource($solicitud)
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     * 
     * @param Request $request
     * @param SolicitudPermiso $solicitud
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, SolicitudPermiso $solicitud)
    {
        if (!Gate::allows('delete', $solicitud)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para eliminar solicitudes de vacaciones.'
            ]);
        }

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
                'message' => 'Solicitud de vacaciones eliminada correctamente.'
            ]);
        });
    }

    /**
     * Elimina un archivo (folder) específico de una solicitud de permiso
     * 
     * @param SolicitudPermisoDestroyFolderRequest $request
     * @param SolicitudPermiso $solicitud
     * @param Folder $folder
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroyFolder(
        SolicitudPermisoDestroyFolderRequest $request,
        SolicitudPermiso $solicitud,
        Folder $folder
    ) {
        // Verificar autorización para eliminar archivos de esta solicitud
        if (!Gate::allows('deleteFile', $solicitud)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para eliminar archivos de esta solicitud de vacaciones.'
            ]);
        }

        return DB::transaction(function () use ($solicitud, $folder) {
            // Eliminar el archivo usando el servicio de gestión de directorios
            $deleteResult = $this->directoryManagementService->deleteElement($folder);

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se pudo eliminar el archivo del almacenamiento.'
                ]);
            }

            // Recargar la solicitud con sus archivos actualizados
            $solicitud->load([
                ...SolicitudPermiso::RELATIONSHIPS,
                'files' => function ($query) {
                    $query->archivos()->orderBy('created_at');
                },
            ]);

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Archivo eliminado correctamente.',
                'solicitud' => new SolicitudPermisoResource($solicitud),
            ]);
        });
    }
}

<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Enums\TipoAprobacion;
use Illuminate\Http\Response;
use App\Models\SolicitudPermiso;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use App\Services\Storage\FileUploadService;
use App\Services\Storage\StoragePathService;
use App\Http\Resources\SolicitudPermisoResource;
use App\Services\SolicitudPermiso\ApprovalService;
use App\Exceptions\Storage\FileProcessingException;
use App\Http\Requests\Admin\SolicitudPermiso\SolicitudPermisoDestroyFolderRequest;
use App\Services\Storage\DirectoryManagementService;
use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\SolicitudPermiso\SolicitudPermisoStatusService;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoShowRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoIndexRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoStoreRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoUpdateRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoDestroyRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoApprovalRequest;
use App\Models\Folder;

class SolicitudPermisoController extends Controller
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
     * @param SolicitudPermisoIndexRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(SolicitudPermisoIndexRequest $request)
    {
        $solicitudes = SolicitudPermiso::with(SolicitudPermiso::RELATIONSHIPS)
            ->withCount('files')
            ->latest()
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'solicitudes' => SolicitudPermisoResource::collection($solicitudes),
            'user_approval_types' => [$this->approvalService->getUserHighestApprovalLevel($request->user())],
            'approval_types' => TipoAprobacion::getAllValues(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param SolicitudPermisoStoreRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(SolicitudPermisoStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {

            $solicitudPermiso = SolicitudPermiso::create($request->validated());

            if (!$solicitudPermiso) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear la solicitud de permiso.'
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
                'message' => 'Solicitud de permiso creada exitosamente.',
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
                'message' => 'No tienes permiso para ver solicitudes de permiso.'
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
     * @param SolicitudPermisoUpdateRequest $request
     * @param SolicitudPermiso $solicitudPermiso
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(SolicitudPermisoUpdateRequest $request, SolicitudPermiso $solicitud)
    {
        if (!Gate::allows('update', $solicitud)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para actualizar solicitudes de permiso.'
            ]);
        }

        return DB::transaction(function () use ($request, $solicitud) {
            $updatedResult = $solicitud->update($request->validated());

            if (!$updatedResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido actualizar la solicitud de permiso.'
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
                'message' => 'Solicitud de permiso actualizada correctamente.',
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
    public function destroy(SolicitudPermisoDestroyRequest $request, SolicitudPermiso $solicitud)
    {
        return DB::transaction(function () use ($solicitud) {
            $deleteResult = $solicitud->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar la solicitud de permiso.'
                ]);
            }

            // Obtener la carpeta raíz de la solicitud para eliminarla
            $rootSolicitudFolder = $solicitud->files()->carpetas()->orderBy('created_at')->first();

            $deleteFileResult = $this->directoryManagementService->deleteElement($rootSolicitudFolder);

            if (!$deleteFileResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar uno o más archivos asociados a la solicitud de permiso.'
                ]);
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Solicitud de permiso eliminada correctamente.',
                'solicitud' => new SolicitudPermisoResource($solicitud)
            ]);
        });
    }

    /**
     * Procesar la aprobación de una solicitud de permiso
     * 
     * @param SolicitudPermisoApprovalRequest $request
     * @param SolicitudPermiso $solicitud
     * @return \Illuminate\Http\JsonResponse
     */
    public function processApproval(SolicitudPermisoApprovalRequest $request, SolicitudPermiso $solicitud)
    {
        return DB::transaction(function () use ($request, $solicitud) {
            $validated = $request->validated();

            $aprobacion = $this->approvalService->processHierarchicalApproval(
                solicitud: $solicitud,
                tipoAprobacion: TipoAprobacion::from($validated['tipo_aprobacion']),
                user: $request->user(),
                aprobado: $validated['aprobado'],
                observacion: $validated['observacion'] ?? null
            );

            if (!$aprobacion) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido procesar la aprobación de la solicitud.'
                ]);
            }

            // Cargar relaciones actualizadas
            $solicitud->load([
                ...SolicitudPermiso::RELATIONSHIPS,
                'files' => function ($query) {
                    $query->archivos()->orderBy('created_at');
                },
            ]);

            // Actualizar el estado de la solicitud
            $this->statusService->updateStatus($solicitud);

            // TODO: Si el estado es rechazado, entonces lanzamos los eventos necesarios (Notificar al empleado)
            /**
             * if ($newStatus === 5) { //RECHAZADO
             *      event(new SolicitudPermisoRejected($solicitud));
             *  }
             */

            // TODO: Si la solicitud está totalmente aprobada, entonces lanzamos los eventos necesarios (Notificar al empleado, Horarios en estado Permiso y relacionados)
            /**
             * if ($newStatus === 4) { //APROBADO
             *      event(new SolicitudPermisoFullyApproved($solicitud));
             *  }
             */

            // TODO: Si el tipo de aprobación es de tipo Manager y no está totalmente aprobada y la aprobación true -> Siguiente paso: notificar a RRHH

            // TODO: Si el tipo de aprobación es de tipo RRHH y no está totalmente aprobada y no existe una aprobación de Dirección y la aprobación true -> Notificar a Dirección

            return response()->json(status: Response::HTTP_OK, data: [
                'solicitud' => new SolicitudPermisoResource($solicitud),
                'message' => $request->aprobado ? 'Solicitud aprobada correctamente.' : 'Solicitud rechazada.'
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
        if (!Gate::allows('update', $solicitud)) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar archivos de esta solicitud de permiso.'
            ], Response::HTTP_FORBIDDEN);
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

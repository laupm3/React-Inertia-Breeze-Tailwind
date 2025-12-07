<?php

namespace App\Http\Controllers\Api\v1\Admin\Inventory;

use Exception;
use Throwable;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Illuminate\Http\JsonResponse;
use App\Models\Inventory\Incident;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Services\Inventory\Incident\IncidentService;
use App\Http\Resources\Inventory\Incident\IncidentResource;
use App\Http\Requests\Inventory\Incident\IncidentIndexRequest;
use App\Http\Requests\Inventory\Incident\IncidentStoreRequest;
use App\Http\Requests\Inventory\Incident\IncidentUpdateRequest;

class IncidentController extends Controller
{
    protected IncidentService $incidentService;

    public function __construct(IncidentService $incidentService)
    {
        $this->incidentService = $incidentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(IncidentIndexRequest $request): JsonResponse
    {
        $incidents = Incident::with([
            'centro',
            'reportedBy',
        ])
            ->orderByDesc('reported_at')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'incidents' => IncidentResource::collection($incidents)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $incidents = Incident::with(Incident::RELATIONSHIPS)->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'incidents' => IncidentResource::collection($incidents)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(IncidentStoreRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            try {
                $validatedData = $request->validated();
                $user = Auth::user();

                $incident = $this->incidentService->createIncident($validatedData, $user);

                $incident->load(Incident::RELATIONSHIPS);

                return response()->json(status: Response::HTTP_CREATED, data: [
                    'message' => 'Incidencia creada exitosamente.',
                    'incident' => new IncidentResource($incident)
                ]);
            } catch (Exception $e) {
                Log::error('IncidentController@store: Error creating incident.', [
                    'user_id' => Auth::id(),
                    'request_data' => $request->all(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                $statusCode = ($e instanceof InvalidArgumentException) ? Response::HTTP_UNPROCESSABLE_ENTITY : Response::HTTP_INTERNAL_SERVER_ERROR;
                return response()->json(status: $statusCode, data: [
                    'message' => $e->getMessage(),
                    'error' => 'Error al crear la incidencia.'
                ]);
            }
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Incident $incident): JsonResponse
    {
        $incident->load(Incident::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'incident' => new IncidentResource($incident)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Incident $incident)
    {
        $incident->load([
            ...Incident::RELATIONSHIPS,
            'reportedBy',
            'resolvedBy',
            'centro',
            'order',
            'transfer',
            'details.product'
        ]);

        return response()->json(status: Response::HTTP_OK, data: [
            'incident' => new IncidentResource($incident)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(IncidentUpdateRequest $request, Incident $incident): JsonResponse
    {
        return DB::transaction(function () use ($request, $incident) {
            try {
                $validatedData = $request->validated();
                $user = Auth::user();

                $updatedIncident = $this->incidentService->updateIncident($incident, $validatedData, $user);

                $updatedIncident->load(Incident::RELATIONSHIPS);

                return response()->json(status: Response::HTTP_OK, data: [
                    'message' => 'Incidencia actualizada exitosamente.',
                    'incident' => new IncidentResource($updatedIncident)
                ]);
            } catch (Exception $e) {
                Log::error('IncidentController@update: Error updating incident.', [
                    'user_id' => Auth::id(),
                    'incident_id' => $incident->id,
                    'request_data' => $request->all(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                $statusCode = ($e instanceof InvalidArgumentException) ? Response::HTTP_UNPROCESSABLE_ENTITY : Response::HTTP_INTERNAL_SERVER_ERROR;
                return response()->json(status: $statusCode, data: [
                    'message' => $e->getMessage(),
                    'error' => 'Error al actualizar la incidencia.'
                ]);
            }
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Incident $incident): JsonResponse
    {
        try {
            DB::transaction(function () use ($incident) {
                $user = Auth::user();
                $incidentId = $incident->id;

                $this->incidentService->revertSideEffectsForDeletion($incident, $user);

                $deleteResult = $incident->delete();

                if (! $deleteResult) {
                    Log::error('Failed to soft delete incident', ['incident_id' => $incidentId, 'user_id' => $user->id]);
                    throw new Exception('Failed to soft delete the incident.');
                }
            });

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Incidencia eliminada correctamente.'
            ]);
        } catch (Throwable $e) {
            Log::error('IncidentController@destroy: Error deleting incident or reverting effects: ' . $e->getMessage(), [
                'incident_id' => $incident->id,
                'exception' => $e,
                'user_id' => Auth::id()
            ]);

            $statusCode = ($e instanceof InvalidArgumentException) ? Response::HTTP_UNPROCESSABLE_ENTITY : Response::HTTP_INTERNAL_SERVER_ERROR;
            return response()->json(status: $statusCode, data: [
                'message' => $e->getMessage(),
                'error' => 'No se ha podido eliminar la incidencia o revertir sus efectos.',
            ]);
        }
    }

    /**
     * Resolver una incidencia.
     *
     * @param Request $request
     * @param Incident $incident
     * @return \Illuminate\Http\JsonResponse
     */

    public function resolveIncident(Request $request, Incident $incident)
    {
        $user = auth()->user();

        if (!$this->permissionService->hasIncidentPermission($user, $incident, 'resolveIncident')) {
            return response()->json(['error' => 'No tienes permiso para resolver esta incidencia'], 403);
        }

        $incident->update(['status' => 'resolved', 'resolved_by_id' => $user->id]);

        return response()->json(['message' => 'Incidencia resuelta correctamente']);
    }

    /**
     * Updates the status of the specified incident.
     * Uses PATCH method. Delegates the action logic to the IncidentService.
     *
     * @param IncidentStatusUpdateRequest $request
     * @param Incident $incident The incident instance injected by Route Model Binding.
     * @return JsonResponse
     */
    public function updateStatus(IncidentStatusUpdateRequest $request, Incident $incident): JsonResponse
    {
        return DB::transaction(function () use ($request, $incident) {
            try {
                $validatedData = $request->validated();
                $user = Auth::user();
                $action = $validatedData['action'];

                switch ($action) {
                    case 'resolve':
                        $this->incidentService->resolveIncident($incident, $user, $validatedData);
                        break;
                    case 'cancel':
                        $this->incidentService->cancelIncident($incident, $user, $validatedData);
                        break;
                    default:
                        throw new InvalidArgumentException("Action '{$action}' is not supported for status updates.");
                }

                $incident->refresh()->load(Incident::RELATIONSHIPS);

                return response()->json(status: Response::HTTP_OK, data: [
                    'message' => "Estado de la incidencia {$incident->id} actualizado a '{$incident->status->value}'.",
                    'incident' => new IncidentResource($incident)
                ]);
            } catch (Exception $e) {
                Log::error('IncidentController@updateStatus: Error updating incident status.', [
                    'user_id' => Auth::id(),
                    'incident_id' => $incident->id,
                    'request_data' => $request->all(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                $statusCode = ($e instanceof InvalidArgumentException) ? Response::HTTP_UNPROCESSABLE_ENTITY : Response::HTTP_INTERNAL_SERVER_ERROR;
                return response()->json(status: $statusCode, data: [
                    'message' => $e->getMessage(),
                    'error' => 'Error al actualizar el estado de la incidencia.'
                ]);
            }
        });
    }

    public function handleIncidentAction(Request $request, Incident $incident)
    {
        $user = auth()->user();
        $action = $request->input('action'); // 'resolve', 'cancel', 'assign'

        $newStatus = $incident->status->handleAction($action, $user);

        if ($newStatus) {
            $incident->update(['status' => $newStatus->value]);
            return response()->json(['message' => 'Acción realizada correctamente', 'status' => $newStatus->label()]);
        }

        return response()->json(['error' => 'No tienes permiso para realizar esta acción o la acción no es válida'], 403);
    }
}

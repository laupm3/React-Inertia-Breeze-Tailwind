<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Team;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\TeamResource;
use App\Http\Requests\Team\TeamIndexRequest;
use App\Http\Requests\Team\TeamShowRequest;
use App\Http\Requests\Team\TeamStoreRequest;
use App\Http\Requests\Team\TeamUpdateRequest;
use App\Http\Requests\Team\TeamDestroyRequest;
use App\Services\Team\TeamPermissionService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Gate;

class TeamController extends Controller
{
    use AuthorizesRequests;

    /**
     * Service to get the permissions for teams.
     */
    protected TeamPermissionService $teamPermissionService;

    /**
     * Create a new controller instance.
     *
     * @param TeamPermissionService $teamPermissionService
     * @return void
     */
    public function __construct(TeamPermissionService $teamPermissionService)
    {
        $this->teamPermissionService = $teamPermissionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(TeamIndexRequest $request)
    {
        if (!Gate::allows('viewAny', Team::class)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para ver los equipos.'
            ]);
        }

        $teams = Team::with(Team::RELATIONSHIPS)
            ->orderBy('name', 'asc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'teams' => TeamResource::collection($teams)->values()
        ]);
    }

    /**
     * Store a newly created team in storage.
     *
     * @param TeamStoreRequest $request Validated request with team data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(TeamStoreRequest $request)
{
    if (!Gate::allows('create', Team::class)) {
        return response()->json(status: Response::HTTP_FORBIDDEN, data: [
            'message' => 'No tienes permiso para crear equipos.'
        ]);
    }

    $validated = $request->validated();
    
    try {
        return DB::transaction(function () use ($validated, $request) {
            // Asignar el usuario actual como propietario del equipo
            $validated['user_id'] = $request->user()->id;
            $validated['personal_team'] = false;
            
            $team = Team::create($validated);

            if (!$team) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear el equipo.'
                ]);
            }

            $team->load(Team::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Equipo creado correctamente.',
                'team' => new TeamResource($team)
            ]);
        });
    } catch (\Exception $e) {
        return response()->json(status: Response::HTTP_INTERNAL_SERVER_ERROR, data: [
            'message' => 'Error interno al crear el equipo.',
            'error' => $e->getMessage()
        ]);
    }
}

    /**
     * Display a specific team with its relationships
     * 
     * @param TeamShowRequest $request
     * @param Team $team
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(TeamShowRequest $request, Team $team)
    {
        if (!Gate::allows('view', $team)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para acceder a este equipo.'
            ]);
        }

        $team->load(Team::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'team' => new TeamResource($team),
            'teamPermissions' => $this->teamPermissionService->getTeamPermissions($team)
        ]);
    }

    /**
     * Update the specified team in storage.
     *
     * @param TeamUpdateRequest $request Validated request with updated team data
     * @param Team $team The team to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(TeamUpdateRequest $request, Team $team)
    {
        if (!Gate::allows('update', $team)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para actualizar a este equipo.'
            ]);
        }

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $team) {

            $updateResult = $team->update($validated);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el equipo.'
                ]);
            }

            $team->load(Team::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Equipo actualizado correctamente.',
                'team' => new TeamResource($team)
            ]);
        });
    }

    /**
     * Remove the specified team from storage.
     *
     * @param TeamDestroyRequest $request
     * @param Team $team The team to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(TeamDestroyRequest $request, Team $team)
    {
        if (!Gate::allows('delete', $team)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para eliminar este equipo.'
            ]);
        }

        return DB::transaction(function () use ($team) {
            // No permitir eliminar teams personales
            if ($team->personal_team) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se puede eliminar un equipo personal.'
                ]);
            }

            // Verificar si el equipo tiene miembros
            /* if ($team->users()->count() > 0) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se puede eliminar el equipo porque tiene miembros asociados.'
                ]);
            } */

            // Desvincular todos los usuarios del equipo
            $team->purge();

            $deleteResult = $team->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar el equipo.'
                ]);
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Equipo eliminado correctamente.'
            ]);
        });
    }
}

<?php

namespace App\Http\Controllers\API\v1\User;

// TODO: Implementar la logica para tener los eventos de hoy en adelante y la api para eventos pasados

use App\Models\Evento;
use App\Models\TipoEvento;
use Illuminate\Http\Request;
use App\Services\EventService;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventoResource;
use App\Http\Resources\TipoEventoResource;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\DepartamentoResource;
use App\Http\Requests\TeamRequest;
use App\Http\Resources\TeamResource;
use App\Http\Resources\EmpresaResource;
use Illuminate\Support\Facades\Auth;
use App\Models\Departamento;

class EventoController extends Controller
{
    protected $eventService;

    public function __construct(EventService $eventService)
    {
        $this->eventService = $eventService;
    }

    /**
     * Obtener todos los eventos del usuario
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();
        $eventos = $this->eventService->getEventosForUser($user);

        return response()->json([
            'eventos' => EventoResource::collection($eventos),
            'permissions' => [
                'canCreateEmpresa' => $this->eventService->canCreateEvento($user, 'Empresa'),
                'canCreateDepartamento' => $this->eventService->canCreateEvento($user, 'Departamento'),
                'canCreateTeam' => $this->eventService->canCreateEvento($user, 'Equipo'),
                'canCreateRRHH' => $this->eventService->canCreateEvento($user, 'Recursos Humanos'),
                'canCreatePersonal' => $this->eventService->canCreateEvento($user, 'Personal')
            ]
        ], Response::HTTP_OK);
    }

    /**
     * Obtener todos los tipos de evento
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function tipos()
    {
        $user = auth()->user();
        $allTiposEvento = TipoEvento::all();

        // Filtrar solo los tipos que el usuario puede crear
        $tiposPermitidos = $allTiposEvento->filter(function ($tipo) use ($user) {
            return $this->eventService->canCreateEvento($user, $tipo->nombre);
        })->values();

        return response()->json([
            'tiposEvento' => TipoEventoResource::collection($tiposPermitidos)
        ], Response::HTTP_OK);
    }

    /**
     * Obtener un evento específico
     * 
     * @param Evento $evento
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Evento $evento)
    {

        $evento->load(['tipoEvento', 'createdBy', 'users', 'team', 'departamento']);

        return response()->json([
            'evento' => new EventoResource($evento),
            'canModify' => $this->eventService->canModifyEvento(auth()->user(), $evento)
        ], Response::HTTP_OK);
    }

    /**
     * Eliminar un participante de un evento
     * 
     * @param Evento $evento
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeParticipant(Evento $evento, $userId)
    {
        if (!$this->eventService->canModifyEvento(auth()->user(), $evento)) {
            return response()->json([
                'message' => 'No tienes permisos para modificar este evento'
            ], Response::HTTP_FORBIDDEN);
        }

        $evento->users()->detach($userId);

        return response()->json([
            'message' => 'Participante eliminado correctamente'
        ], Response::HTTP_OK);
    }

    /**
     * Obtener los departamentos del usuario en los que tiene un contrato activo
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDepartmentsWithContract()
    {
        $user = auth()->user();

        $user->load('empleado');

        if (!$user->has('empleado')) {
            return response()->json(['departments' => [], 'message' => 'Usuario sin contrato'], Response::HTTP_OK);
        }

        try {
            // Obtener departamentos a través de los contratos activos
            $departments = Departamento::whereHas('contratos', function ($query) use ($user) {
                $query->where('empleado_id', $user->empleado->id)
                    ->where('fecha_inicio', '<=',  now())
                    ->where(function ($query) {
                        $query->where('fecha_fin', '>=', now())
                            ->orWhereNull('fecha_fin');
                    });
            })
            ->select('id', 'nombre')
            ->get()
            ->map(function($departamento) {
                return [
                    'id' => $departamento->id,
                    'nombre' => $departamento->nombre
                ];
            });

            return response()->json(
                status: Response::HTTP_OK,
                data: [
                    'departments' => $departments
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error al obtener departamentos:', [
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);
            
            return response()->json([
                'message' => 'Error al obtener departamentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener equipos donde el usuario tiene permisos de crear y actualizar
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTeamsWithPermissions()
    {
        $teams = $this->eventService->getTeamsWithPermissions(auth()->user());

        //Log::info('Equipos con permisos de creación y actualización', ['teams' => $teams]);

        return response()->json([
            'teams' => TeamResource::collection($teams)
        ], Response::HTTP_OK);
    }

    /**
     * Obtener empresas donde el usuario tiene permisos para crear eventos
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEmpresasWithPermissions()
    {
        $empresas = $this->eventService->getEmpresasWithPermissions(auth()->user());

        return response()->json([
            'empresas' => EmpresaResource::collection($empresas)
        ], Response::HTTP_OK);
    }
}

<?php

namespace App\Http\Controllers\User;


use App\Http\Controllers\Controller;
use App\Http\Requests\EventoRequest;
use App\Http\Resources\EventoResource;
use App\Models\Evento;
use App\Models\TipoEvento;
use App\Services\EventService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Events\Evento\EventoCreado;
use App\Events\Evento\EventoActualizado;
use App\Events\Calendario\EventoCalendarioCreado;
class EventoController extends Controller
{
    protected $eventService;

    public function __construct(EventService $eventService)
    {
        $this->eventService = $eventService;
    }

    /**
     * Mostrar todos los eventos del usuario
     * 
     * @return \Inertia\Response
     */
    public function index()
    {
        /* $user = Auth::user();
        $eventos = $this->eventService->getEventosForUser($user); */

        return inertia('AllEvents/AllEvents', []);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Crear un nuevo evento
     * 
     * @param EventoRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(EventoRequest $request)
    {
        Log::info('Datos recibidos:', $request->all());
        try {
            $validated = $request->validated();
            Log::info('Datos validados para crear evento:', $validated);

            $evento = $this->eventService->createEvento($validated);

            // Disparar el evento de creación
            event(new EventoCreado($evento));

            // Disparar el evento de calendario
            event(new EventoCalendarioCreado($evento));

            return response()->json([
                'message' => 'Evento creado exitosamente',
                'evento' => new EventoResource($evento)
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al crear evento:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al crear el evento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un evento
     * 
     * @param Evento $evento
     * @return \Inertia\Response
     */
    public function show(Evento $evento)
    {
        return inertia('User/Eventos/Show', [
            'evento' => $evento->withFullRelations()->first(),
            'canModify' => $this->eventService->canModifyEvento(Auth::user(), $evento)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Evento $evento)
    {
        //
    }

    /**
     * Actualizar un evento
     * 
     * @param EventoRequest $request
     * @param Evento $evento
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function update(EventoRequest $request, Evento $evento)
    {
        try {
            // Verificar si el usuario puede modificar el evento usando EventService
            if (!$this->eventService->canManageEvento(Auth::user(), $evento)) {
                return $request->wantsJson()
                    ? response()->json(['message' => 'No tienes permisos para modificar este evento'], 403)
                    : redirect()->back()->with('error', 'No tienes permisos para modificar este evento');
            }

            // Actualizar el evento
            $evento = $this->eventService->updateEvento($evento, $request->validated());

            // Disparar evento de actualización
            event(new EventoActualizado($evento));

            // Responder según el tipo de petición
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Evento actualizado exitosamente',
                    'evento' => new EventoResource($evento)
                ], 200);
            }

            return redirect()->back()->with('success', 'Evento actualizado exitosamente');

        } catch (\Exception $e) {
            Log::error('Error al actualizar evento:', [
                'evento_id' => $evento->id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);

            return $request->wantsJson()
                ? response()->json(['message' => 'Error al actualizar el evento', 'error' => $e->getMessage()], 500)
                : redirect()->back()->with('error', 'Error al actualizar el evento: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar un evento
     * 
     * @param Evento $evento
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Evento $evento)
    {
        if (!$this->eventService->canManageEvento(Auth::user(), $evento)) {
            abort(403);
        }

        $evento->delete();

        return redirect()->back()->with('success', 'Evento eliminado exitosamente');
    }

    /**
     * Eliminar un participante del evento
     *
     * @param Evento $evento
     * @param int $userId
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function removeParticipant(Evento $evento, $userId)
    {
        try {
            // Verificar permisos
            if (!$this->eventService->canManageEvento(Auth::user(), $evento)) {
                return $request->wantsJson()
                    ? response()->json(['message' => 'No tienes permisos para modificar este evento'], 403)
                    : redirect()->back()->with('error', 'No tienes permisos para modificar este evento');
            }

            // No permitir eliminar al creador del evento
            if ($evento->created_by == $userId) {
                return $request->wantsJson()
                    ? response()->json(['message' => 'No se puede eliminar al creador del evento'], 400)
                    : redirect()->back()->with('error', 'No se puede eliminar al creador del evento');
            }

            // Eliminar la relación del usuario con el evento
            $evento->users()->detach($userId);

            // Recargar la relación de usuarios
            $evento->load('users');

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Participante eliminado exitosamente',
                    'evento' => new EventoResource($evento)
                ], 200);
            }

            return redirect()->back()->with('success', 'Participante eliminado exitosamente');

        } catch (\Exception $e) {
            Log::error('Error al eliminar participante:', [
                'evento_id' => $evento->id,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return $request->wantsJson()
                ? response()->json(['message' => 'Error al eliminar el participante', 'error' => $e->getMessage()], 500)
                : redirect()->back()->with('error', 'Error al eliminar el participante: ' . $e->getMessage());
        }
    }
}

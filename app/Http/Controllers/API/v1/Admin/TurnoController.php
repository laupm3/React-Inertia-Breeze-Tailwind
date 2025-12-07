<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Turno;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\TurnoResource;
use App\Http\Requests\Turno\TurnoIndexRequest;
use App\Http\Requests\Turno\TurnoShowRequest;
use App\Http\Requests\Turno\TurnoStoreRequest;
use App\Http\Requests\Turno\TurnoUpdateRequest;
use App\Http\Requests\Turno\TurnoDestroyRequest;

class TurnoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(TurnoIndexRequest $request)
    {
        $turnos = Turno::with(Turno::RELATIONSHIPS)
            ->orderBy('nombre', 'asc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'turnos' => TurnoResource::collection($turnos)->values()
        ]);
    }

    /**
     * Store a newly created turno in storage.
     *
     * @param TurnoStoreRequest $request Validated request with turno data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(TurnoStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $turno = Turno::create($validated);

            if (!$turno) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear el turno.'
                ]);
            }

            $turno->load(Turno::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Turno creado correctamente.',
                'turno' => new TurnoResource($turno)
            ]);
        });
    }

    /**
     * Display a specific turno with its relationships
     * 
     * @param TurnoShowRequest $request
     * @param Turno $turno
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(TurnoShowRequest $request, Turno $turno)
    {
        $turno->load(Turno::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'turno' => new TurnoResource($turno)
        ]);
    }

    /**
     * Update the specified turno in storage.
     *
     * @param TurnoUpdateRequest $request Validated request with updated turno data
     * @param Turno $turno The turno to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(TurnoUpdateRequest $request, Turno $turno)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $turno) {

            $updateResult = $turno->update($validated);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el turno.'
                ]);
            }

            $turno->load(Turno::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Turno actualizado correctamente.',
                'turno' => new TurnoResource($turno)
            ]);
        });
    }

    /**
     * Remove the specified turno from storage.
     *
     * @param TurnoDestroyRequest $request
     * @param Turno $turno The turno to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(TurnoDestroyRequest $request, Turno $turno)
    {
        return DB::transaction(function () use ($turno) {
            // Verificar si el turno tiene jornadas asociadas
            if ($turno->jornadaTurnos()->count() > 0) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se puede eliminar el turno porque tiene jornadas asociadas.'
                ]);
            }

            $deleteResult = $turno->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar el turno.'
                ]);
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Turno eliminado correctamente.'
            ]);
        });
    }
}

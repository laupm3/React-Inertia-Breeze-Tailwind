<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Asignacion;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\AsignacionResource;
use App\Events\Asignacion\AsignacionCreada;
use App\Events\Asignacion\AsignacionEliminada;
use App\Events\Asignacion\AsignacionActualizada;
use App\Http\Requests\Asignacion\AsignacionShowRequest;
use App\Http\Requests\Asignacion\AsignacionIndexRequest;
use App\Http\Requests\Asignacion\AsignacionStoreRequest;
use App\Http\Requests\Asignacion\AsignacionUpdateRequest;
use App\Http\Requests\Asignacion\AsignacionDestroyRequest;

class AsignacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(AsignacionIndexRequest $request)
    {
        $asignaciones = Asignacion::with(Asignacion::RELATIONSHIPS)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'asignaciones' => AsignacionResource::collection($asignaciones)->values()
        ]);
    }

    /**
     * Store a newly created asignacion in storage.
     *
     * @param AsignacionStoreRequest $request Validated request with asignacion data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(AsignacionStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $asignacion = Asignacion::create($validated);

            if (!$asignacion) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear la asignación.'
                ]);
            }

            event(new AsignacionCreada($asignacion));

            $asignacion->load(Asignacion::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Asignación creada correctamente.',
                'asignacion' => new AsignacionResource($asignacion)
            ]);
        });
    }

    /**
     * Display a specific asignacion with its relationships
     * 
     * @param AsignacionShowRequest $request
     * @param Asignacion $asignacion
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(AsignacionShowRequest $request, Asignacion $asignacion)
    {
        $asignacion->load(Asignacion::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'asignacion' => new AsignacionResource($asignacion)
        ]);
    }

    /**
     * Update the specified asignacion in storage.
     *
     * @param AsignacionUpdateRequest $request Validated request with updated asignacion data
     * @param Asignacion $asignacion The asignacion to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(AsignacionUpdateRequest $request, Asignacion $asignacion)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $asignacion) {

            $updateResult = $asignacion->update($validated);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar la asignación.'
                ]);
            }

            event(new AsignacionActualizada($asignacion));

            $asignacion->load(Asignacion::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Asignación creada correctamente.',
                'asignacion' => new AsignacionResource($asignacion)
            ]);
        });
    }

    /**
     * Remove the specified asignacion from storage.
     *
     * @param AsignacionDestroyRequest $request
     * @param Asignacion $asignacion The asignacion to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(AsignacionDestroyRequest $request, Asignacion $asignacion)
    {
        return DB::transaction(function () use ($asignacion) {
            $deleteResult = $asignacion->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar la asignación.'
                ]);
            }

            event(new AsignacionEliminada($asignacion));

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Asignación eliminada correctamente.'
            ]);
        });
    }
}

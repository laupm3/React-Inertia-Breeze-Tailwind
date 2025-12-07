<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Jornada;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\JornadaResource;
use App\Http\Requests\Jornada\JornadaIndexRequest;
use App\Http\Requests\Jornada\JornadaShowRequest;
use App\Http\Requests\Jornada\JornadaStoreRequest;
use App\Http\Requests\Jornada\JornadaUpdateRequest;
use App\Http\Requests\Jornada\JornadaDestroyRequest;

class JornadaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(JornadaIndexRequest $request)
    {
        $jornadas = Jornada::with(Jornada::RELATIONSHIPS)
            ->orderBy('name', 'asc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'jornadas' => JornadaResource::collection($jornadas)->values()
        ]);
    }

    /**
     * Store a newly created jornada in storage.
     *
     * @param JornadaStoreRequest $request Validated request with jornada data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(JornadaStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            // Separar datos de jornada del esquema
            $jornadaData = [
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ];
            
            $esquemaData = $validated['esquema'] ?? [];

            // Crear la jornada
            $jornada = Jornada::create($jornadaData);

            if (!$jornada) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear la jornada.'
                ]);
            }

            // Crear los registros del esquema en jornada_turno
            foreach ($esquemaData as $esquemaItem) {
                $jornada->jornadaTurnos()->create([
                    'turno_id' => $esquemaItem['turno_id'],
                    'modalidad_id' => $esquemaItem['modalidad_id'],
                    'weekday_number' => $esquemaItem['weekday_number'],
                ]);
            }

            $jornada->load(Jornada::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Jornada creada correctamente.',
                'jornada' => new JornadaResource($jornada)
            ]);
        });
    }

    /**
     * Display a specific jornada with its relationships
     * 
     * @param JornadaShowRequest $request
     * @param Jornada $jornada
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(JornadaShowRequest $request, Jornada $jornada)
    {
        $jornada->load(Jornada::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'jornada' => new JornadaResource($jornada)
        ]);
    }

    /**
     * Update the specified jornada in storage.
     *
     * @param JornadaUpdateRequest $request Validated request with updated jornada data
     * @param Jornada $jornada The jornada to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(JornadaUpdateRequest $request, Jornada $jornada)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $jornada) {
            // Separar datos de jornada del esquema
            $jornadaData = [
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ];
            
            $esquemaData = $validated['esquema'] ?? [];

            // Actualizar los datos básicos de la jornada
            $updateResult = $jornada->update($jornadaData);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar la jornada.'
                ]);
            }

            // Eliminar todos los registros existentes del esquema
            $jornada->jornadaTurnos()->delete();

            // Crear los nuevos registros del esquema
            foreach ($esquemaData as $esquemaItem) {
                $jornada->jornadaTurnos()->create([
                    'turno_id' => $esquemaItem['turno_id'],
                    'modalidad_id' => $esquemaItem['modalidad_id'],
                    'weekday_number' => $esquemaItem['weekday_number'],
                ]);
            }

            $jornada->load(Jornada::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Jornada actualizada correctamente.',
                'jornada' => new JornadaResource($jornada)
            ]);
        });
    }

    /**
     * Remove the specified jornada from storage.
     *
     * @param JornadaDestroyRequest $request
     * @param Jornada $jornada The jornada to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(JornadaDestroyRequest $request, Jornada $jornada)
    {
        return DB::transaction(function () use ($jornada) {
            // Verificar si la jornada tiene contratos asociados
            if ($jornada->contrato()->exists()) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se puede eliminar la jornada porque tiene contratos asociados.'
                ]);
            }

            // Verificar si la jornada tiene anexos asociados
            if ($jornada->anexo()->exists()) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se puede eliminar la jornada porque tiene anexos asociados.'
                ]);
            }

            $deleteResult = $jornada->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar la jornada.'
                ]);
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Jornada eliminada correctamente.'
            ]);
        });
    }
}

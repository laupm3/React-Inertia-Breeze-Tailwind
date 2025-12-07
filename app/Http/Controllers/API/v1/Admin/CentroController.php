<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Centro;
use App\Models\Direccion;
use App\Models\EstadoCentro;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use App\Events\Centro\CentroCreado;
use App\Events\Centro\CentroActualizado;
use App\Http\Controllers\Controller;
use App\Http\Resources\CentroResource;
use App\Http\Resources\EstadoCentroResource;
use App\Http\Requests\Centro\CentroShowRequest;
use App\Http\Requests\Centro\CentroIndexRequest;
use App\Http\Requests\Centro\CentroStoreRequest;
use App\Http\Requests\Centro\CentroUpdateRequest;
use App\Http\Requests\Centro\CentroDestroyRequest;

class CentroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(CentroIndexRequest $request)
    {
        $centros = Centro::with(Centro::RELATIONSHIPS)->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'centros' => CentroResource::collection($centros)->values()
        ]);
    }

    /**
     * Display a specific centro with its relationships
     * 
     * @param CentroShowRequest $request
     * @param Centro $centro
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(CentroShowRequest $request, Centro $centro)
    {
        $centro->load([
            ...Centro::RELATIONSHIPS,
            'departamentos.manager.user',
            'departamentos.contratosVigentes'
        ]);

        return response()->json(status: Response::HTTP_OK, data: [
            'centro' => new CentroResource($centro)
        ]);
    }

    /**
     * Store a newly created centro in storage.
     *
     * @param CentroStoreRequest $request Validated request with centro data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CentroStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $direccionData = Arr::get($validated, 'direccion');
            $direccion = Direccion::create($direccionData);

            if (!$direccion) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al crear la dirección.'
                ]);
            }

            $centroData = [
                ...Arr::except($validated, 'direccion'),
                'direccion_id' => $direccion->id
            ];

            $centro = Centro::create($centroData);

            if (!$centro) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear el centro.'
                ]);
            }

            event(new CentroCreado($centro));

            $centro->load(Centro::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Centro creado correctamente.',
                'centro' => new CentroResource($centro)
            ]);
        });
    }

    /**
     * Update the specified centro in storage.
     *
     * @param CentroUpdateRequest $request Validated request with updated centro data
     * @param Centro $centro The centro to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(CentroUpdateRequest $request, Centro $centro)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $centro) {
            $direccionData = Arr::get($validated, 'direccion');
            $direccion = Direccion::find($direccionData['id']);

            if (!$direccion) {
                return response()->json(status: Response::HTTP_NOT_FOUND, data: [
                    'message' => 'No se ha encontrado la dirección asociada al centro.'
                ]);
            }

            $direccionUpdateResult = $direccion->update($direccionData);

            if (!$direccionUpdateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar la dirección.'
                ]);
            }

            $centroData = [
                ...Arr::except($validated, 'direccion'),
                'direccion_id' => $direccionData['id']
            ];

            $updateResult = $centro->update($centroData);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el centro.'
                ]);
            }

            event(new CentroActualizado($centro));

            $centro->load(Centro::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Centro actualizado correctamente.',
                'centro' => new CentroResource($centro)
            ]);
        });
    }

    /**
     * Remove the specified centro from storage.
     *
     * @param CentroDestroyRequest $request Validated request with centro data
     * @param Centro $centro The centro to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(CentroDestroyRequest $request, Centro $centro)
    {
        return DB::transaction(function () use ($centro) {
            $centro->load('direccion');
            $direccion = $centro->direccion;

            $deleteResult = $centro->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar el centro.'
                ]);
            }

            if ($direccion) {
                $direccionDeleteResult = $direccion->delete();

                if (!$direccionDeleteResult) {
                    return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                        'message' => 'Centro eliminado pero no se pudo eliminar la dirección asociada.'
                    ]);
                }
            }

            // event(new CentroEliminado($centro->id));

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Centro eliminado correctamente.'
            ]);
        });
    }

    public function status()
    {
        $estadoCentros = EstadoCentro::all();

        return response()->json(status: Response::HTTP_OK, data: [
            'estadoCentros' => EstadoCentroResource::collection($estadoCentros)
                ->values()
        ]);
    }
}

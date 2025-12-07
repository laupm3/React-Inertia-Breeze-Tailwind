<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Empresa;
use App\Models\Direccion;
use Illuminate\Support\Arr;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\EmpresaResource;
use App\Events\Empresa\EmpresaEliminada;
use App\Events\Empresa\EmpresaActualizada;
use App\Http\Requests\Empresa\EmpresaDestroyRequest;
use App\Http\Requests\Empresa\EmpresaIndexRequest;
use App\Http\Requests\Empresa\EmpresaShowRequest;
use App\Http\Requests\Empresa\EmpresaStoreRequest;
use App\Http\Requests\Empresa\EmpresaUpdateRequest;

class EmpresaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(EmpresaIndexRequest $request)
    {
        $empresas = Empresa::with(Empresa::RELATIONSHIPS)
            ->orderBy('nombre', 'asc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'empresas' => EmpresaResource::collection($empresas)->values()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param EmpresaStoreRequest $request Validated request with resource data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(EmpresaStoreRequest $request)
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

            $empresaData = [
                ...Arr::except($validated, 'direccion'),
                'direccion_id' => $direccion->id
            ];

            $empresa = Empresa::create($empresaData);

            if (!$empresa) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear la empresa.'
                ]);
            }

            $empresa->load(Empresa::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Empresa creada correctamente.',
                'empresa' => new EmpresaResource($empresa)
            ]);
        });
    }

    /**
     * Display a specific centro with its relationships
     * 
     * @param EmpresaShowRequest $request
     * @param Empresa $empresa
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(EmpresaShowRequest $request, Empresa $empresa)
    {
        $empresa->load([
            ...Empresa::RELATIONSHIPS,
            'centros.responsable.user',
            'centros.direccion',
        ]);

        return response()->json(status: Response::HTTP_OK, data: [
            'empresa' => new EmpresaResource($empresa)
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param EmpresaUpdateRequest $request Validated request with updated resource data
     * @param Empresa $empresa The resource to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(EmpresaUpdateRequest $request, Empresa $empresa)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $empresa) {
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

            $empresaData = [
                ...Arr::except($validated, 'direccion'),
                'direccion_id' => $direccionData['id']
            ];

            $updateResult = $empresa->update($empresaData);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el centro.'
                ]);
            }

            event(new EmpresaActualizada($empresa));

            $empresa->load(Empresa::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Empresa actualizada correctamente.',
                'empresa' => new EmpresaResource($empresa)
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param EmpresaDestroyRequest $request
     * @param Empresa $empresa The centro to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(EmpresaDestroyRequest $request, Empresa $empresa)
    {
        return DB::transaction(function () use ($empresa) {
            $empresa->load('direccion');
            $direccion = $empresa->direccion;

            $deleteResult = $empresa->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar la empresa.'
                ]);
            }

            if ($direccion) {
                $direccionDeleteResult = $direccion->delete();

                if (!$direccionDeleteResult) {
                    return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                        'message' => 'Empresa eliminada pero no se pudo eliminar la dirección asociada.'
                    ]);
                }
            }

            // event(new EmpresaEliminada($empresa));

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Empresa eliminada correctamente.'
            ]);
        });
    }
}

<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Departamento;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\DepartamentoResource;
use App\Events\Departamento\DepartamentoCreado;
use App\Events\Departamento\DepartamentoEliminado;
use App\Events\Departamento\DepartamentoActualizado;
use App\Http\Requests\Departamento\DepartamentoStoreRequest;
use App\Http\Requests\Departamento\DepartamentoShowRequest;
use App\Http\Requests\Departamento\DepartamentoUpdateRequest;
use App\Http\Requests\Departamento\DepartamentoIndexRequest;
use App\Http\Requests\Departamento\DepartamentoDestroyRequest;

class DepartamentoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(DepartamentoIndexRequest $request)
    {
        $departamentos = Departamento::with(Departamento::RELATIONSHIPS)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'departamentos' => DepartamentoResource::collection($departamentos)->values()
        ]);
    }

    /**
     * Store a newly created departamento in storage.
     *
     * @param DepartamentoStoreRequest $request Validated request with departamento data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(DepartamentoStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $departamento = Departamento::create($validated);

            if (!$departamento) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear el departamento.'
                ]);
            }

            event(new DepartamentoCreado($departamento));

            $departamento->load(Departamento::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Departamento creado correctamente.',
                'departamento' => new DepartamentoResource($departamento)
            ]);
        });
    }

    /**
     * Display a specific departamento with its relationships
     * 
     * @param DepartamentoShowRequest $request
     * @param Departamento $departamento
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(DepartamentoShowRequest $request, Departamento $departamento)
    {
        $departamento->load(Departamento::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'departamento' => new DepartamentoResource($departamento)
        ]);
    }

    /**
     * Update the specified departamento in storage.
     *
     * @param DepartamentoUpdateRequest $request Validated request with updated departamento data
     * @param Departamento $departamento The departamento to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(DepartamentoUpdateRequest $request, Departamento $departamento)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $departamento) {

            $updateResult = $departamento->update($validated);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el departamento.'
                ]);
            }

            event(new DepartamentoActualizado($departamento));

            $departamento->load(Departamento::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Departamento actualizado correctamente.',
                'departamento' => new DepartamentoResource($departamento)
            ]);
        });
    }

    /**
     * Remove the specified departamento from storage.
     *
     * @param DepartamentoDestroyRequest $request
     * @param Departamento $departamento The departamento to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(DepartamentoDestroyRequest $request, Departamento $departamento)
    {
        return DB::transaction(function () use ($departamento) {
            $deleteResult = $departamento->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar el departamento.'
                ]);
            }

            event(new DepartamentoEliminado($departamento));

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Departamento eliminado correctamente.'
            ]);
        });
    }
}

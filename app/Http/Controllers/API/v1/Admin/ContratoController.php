<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Anexo\AnexoDestroyRequest;
use App\Http\Requests\Anexo\AnexoStoreRequest;
use App\Http\Requests\Anexo\AnexoUpdateRequest;
use App\Http\Requests\Contrato\ContratoDestroyRequest;
use App\Http\Requests\Contrato\ContratoIndexRequest;
use App\Http\Requests\Contrato\ContratoShowRequest;
use App\Http\Requests\Contrato\ContratoStoreRequest;
use App\Http\Requests\Contrato\ContratoUpdateRequest;
use App\Http\Resources\AnexoResource;
use App\Http\Resources\ContratoResource;
use App\Http\Resources\TipoContratoResource;
use App\Models\Anexo;
use App\Models\Contrato;
use App\Models\TipoContrato;
use App\Services\Anexo\AnexoService;
use App\Services\Contrato\ContratoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ContratoController extends Controller
{
    protected ContratoService $contratoService;
    protected AnexoService $anexoService;

    public function __construct(ContratoService $contratoService, AnexoService $anexoService)
    {
        $this->contratoService = $contratoService;
        $this->anexoService = $anexoService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(ContratoIndexRequest $request): JsonResponse
    {
        $contratos = $this->contratoService->getAllContratos();
        return response()->json(status: Response::HTTP_OK, data: [
            'contratos' => ContratoResource::collection($contratos)->values()
        ]);
    }

    /**
     * Store a newly created contrato in storage.
     */
    public function store(ContratoStoreRequest $request): JsonResponse
    {
        $contrato = $this->contratoService->createContrato($request->validated());
        return response()->json(status: Response::HTTP_CREATED, data: [
            'message' => 'Contrato creado correctamente.',
            'contrato' => new ContratoResource($contrato)
        ]);
    }

    /**
     * Display a specific contrato with its relationships
     */
    public function show(ContratoShowRequest $request, Contrato $contrato): JsonResponse
    {
        $contrato = $this->contratoService->getContrato($contrato);
        return response()->json(status: Response::HTTP_OK, data: [
            'contrato' => new ContratoResource($contrato)
        ]);
    }

    /**
     * Update the specified contrato in storage.
     */
    public function update(ContratoUpdateRequest $request, Contrato $contrato): JsonResponse
    {
        $contrato = $this->contratoService->updateContrato($contrato, $request->validated());
        return response()->json(status: Response::HTTP_OK, data: [
            'message' => 'Contrato actualizado correctamente.',
            'contrato' => new ContratoResource($contrato)
        ]);
    }

    /**
     * Remove the specified contrato from storage.
     */
    public function destroy(ContratoDestroyRequest $request, Contrato $contrato): JsonResponse
    {
        $this->contratoService->deleteContrato($contrato);
        return response()->json(status: Response::HTTP_OK, data: [
            'message' => 'Contrato eliminado correctamente.'
        ]);
    }

    /**
     * Display contract types.
     */
    public function types(): JsonResponse
    {
        $tipos = TipoContrato::all();
        return response()->json(status: Response::HTTP_OK, data: [
            'tipos' => TipoContratoResource::collection($tipos)->values()
        ]);
    }

    /**
     * Create a new annex for a contract.
     */
    public function createAnnexes(AnexoStoreRequest $request, Contrato $contrato): JsonResponse
    {
        $anexo = $this->anexoService->createAnexo($request->validated());
        return response()->json(status: Response::HTTP_CREATED, data: [
            'anexo' => new AnexoResource($anexo),
            'message' => 'Anexo creado correctamente.'
        ]);
    }

    /**
     * Update an existing annex.
     */
    public function editAnnexes(AnexoUpdateRequest $request, Contrato $contrato, Anexo $anexo): JsonResponse
    {
        $anexo = $this->anexoService->updateAnexo($anexo, $request->validated());
        return response()->json(status: Response::HTTP_OK, data: [
            'anexo' => new AnexoResource($anexo),
            'message' => 'Anexo actualizado correctamente.'
        ]);
    }

    /**
     * Delete an annex.
     */
    public function deleteAnnexes(AnexoDestroyRequest $request, Contrato $contrato, Anexo $anexo): JsonResponse
    {
        $anexo->load('jornada');
        $this->anexoService->deleteAnexo($anexo);
        return response()->json(status: Response::HTTP_OK, data: [
            'message' => 'Anexo eliminado correctamente.',
            'anexo' => new AnexoResource($anexo)
        ]);
    }
}

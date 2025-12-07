<?php

namespace App\Http\Controllers\API\v1\User\Fichaje;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\v1\Fichaje\FichajeRequest;
use App\Services\Fichaje\FichajeService;
use App\Http\Resources\HorarioResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\Fichaje\EstadisticaService;
use App\Services\Fichaje\ValidacionService;

class FichajeController extends Controller
{
    public function __construct(
        private FichajeService $fichajeService,
        private ValidacionService $validacionService,
        private EstadisticaService $estadisticaService
    ) {}

    /**
     * Ejecuta una acción de fichaje
     */
    public function accion(FichajeRequest $request): JsonResponse
    {
        Log::info('FichajeController@accion', [
            'request' => $request->all()
        ]);
        try {
            $resultado = $this->fichajeService->ejecutarAccion(
                accion: $request->accion,
                horarioId: $request->horario_id,
                coordenadas: $request->coordenadas
            );

            // Obtener todos los horarios activos  y preparar la respuesta
            $contratos = Auth::user()->empleado->contratosVigentes()->get();
            $horarios = $this->validacionService->obtenerHorariosActivos($contratos);

            return response()->json([
                'mensaje' => 'Acción ejecutada correctamente',
                'success_code' => '200.1',
                'datos' => [
                    'horarios' => $horarios->map(fn($h) => HorarioResource::fichaje($h)),
                    'estadisticas' => $this->estadisticaService->obtenerEstadisticas($horarios),
                    'permisos' => [
                        'puede_fichar' => $this->validacionService->puedeFichar($horarios),
                        'puede_tomar_descanso' => $this->validacionService->puedeTomarDescanso($horarios),
                        'puede_tomar_descanso_obligatorio' => $this->validacionService->puedeTomarDescansoObligatorio($horarios)
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en acción de fichaje:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'request' => $request->validated()
            ]);

            // Determinar código de error basado en el mensaje
            $errorCode = match (true) {
                str_contains($e->getMessage(), 'sin empleado') => '404.1',
                str_contains($e->getMessage(), 'sin horario') => '404.2',
                str_contains($e->getMessage(), 'demasiado pronto') => '422.1',
                str_contains($e->getMessage(), 'demasiado tarde') => '422.2',
                default => '500.1'
            };

            $httpCode = match (explode('.', $errorCode)[0]) {
                '404' => 404,
                '422' => 422,
                default => 500
            };

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => $errorCode,
                    'mensaje' => config('app.debug') ? $e->getMessage() : 'Error en la operación'
                ]
            ], $httpCode);
        }
    }
} 
<?php

namespace App\Http\Controllers\API\v1\User\Fichaje;

use App\Http\Controllers\Controller;
use App\Http\Resources\HorarioResource;
use App\Services\Fichaje\EstadisticaService;
use App\Services\Fichaje\ValidacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class EstadoController extends Controller
{
    public function __construct(
        private ValidacionService $validacionService,
        private EstadisticaService $estadisticaService
    ) {}

    /**
     * Obtiene el estado actual del fichaje del usuario autenticado
     *
     * @return JsonResponse
     */
    public function __invoke(): JsonResponse
    {
        try {
            // 1. Obtener empleado autenticado
            $user = Auth::user();
            $empleado = $user->empleado;
            
            // 2. MODIFICACIÓN: Si el usuario no es un empleado o no tiene contratos,
            // devolvemos una respuesta exitosa pero vacía.
            if (!$empleado || !$empleado->contratosVigentes()->exists()) {
                return response()->json([
                    'mensaje' => 'Usuario no es un empleado con fichaje activo.',
                    'success_code' => '200.2',
                    'datos' => [
                        'horarios' => [],
                        'permisos' => [
                            'puede_fichar' => false,
                            'puede_tomar_descanso' => false,
                            'puede_tomar_descanso_obligatorio' => false,
                        ]
                    ]
                ]);
            }

            // 3. Obtener contratos vigentes
            $contratos = $empleado->contratosVigentes()->get();

            // 4. Obtener horarios activos para hoy
            $horarios = $this->validacionService->obtenerHorariosActivos($contratos);

            // 5. Preparar respuesta
            return response()->json([
                'mensaje' => 'Estado obtenido correctamente',
                'success_code' => '200.1',
                'datos' => [
                    'horarios' => $horarios->map(fn($h) => HorarioResource::fichaje($h)),
                    //'estadisticas' => $this->estadisticaService->obtenerEstadisticas($horarios),
                    'permisos' => [
                        'puede_fichar' => $this->validacionService->puedeFichar($horarios),
                        'puede_tomar_descanso' => $this->validacionService->puedeTomarDescanso($horarios),
                        'puede_tomar_descanso_obligatorio' => $this->validacionService->puedeTomarDescansoObligatorio($horarios)
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener estado de fichaje:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => '500.1',
                    'mensaje' => config('app.debug') ? $e->getMessage() : 'Error al obtener el estado del fichaje'
                ]
            ], 500);
        }
    }
} 
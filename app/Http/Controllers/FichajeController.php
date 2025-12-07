<?php

namespace App\Http\Controllers;

use App\Models\Horario;
use App\Models\Empleado;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Services\Fichaje\FichajeService;
use App\Services\Fichaje\DescansoService;
use App\Services\Fichaje\EstadisticaService;
use App\Http\Resources\HorarioResource;
use Carbon\Carbon;
use App\Jobs\TransicionAutomaticaHorario;

class FichajeController extends Controller
{
    protected $fichajeService;
    protected $descansoService;
    protected $estadisticaService;

    public function __construct(
        FichajeService $fichajeService,
        DescansoService $descansoService,
        EstadisticaService $estadisticaService
    ) {
        $this->fichajeService = $fichajeService;
        $this->descansoService = $descansoService;
        $this->estadisticaService = $estadisticaService;
    }

    /**
     * Obtiene el estado actual del fichaje
     */
    public function estado()
    {
        try {
            $user = Auth::user();
            $empleado = Empleado::obtenerEmpleadoPorUsuario($user->id);
            $contratos = $empleado?->contratosVigentes()->get();

            Log::info('Contratos obtenidos>>>>> ', ['contratos' => $contratos]);

            if (!$empleado || $contratos->isEmpty()) {
                return response()->json([
                    'mensaje' => 'Usuario no asociado a ningún empleado o no tiene contratos vigentes',
                    'error_code' => '404.1'
                ], 404);
            }

            $horarios = Horario::obtenerHorarioActivo($contratos);

            Log::info('Horarios obtenidos>>>>> ', ['horarios' => $horarios]);

            if ($horarios->isEmpty()) {
                return response()->json([
                    'mensaje' => 'No hay horarios asignados para hoy',
                    'error_code' => '404.2'
                ], 404);
            }

            $currentTime = now();

            // Ordenar horarios por hora de inicio
            $horarios = $horarios->sortBy('horario_inicio');

            // Determinar el estado general
            if ($horarios->contains('estado_fichaje', 'en_curso')) {
                $mensaje = 'Tienes un horario en curso';
                $codigo = '200.1';
            } else {
                $mensaje = 'Estado del fichaje obtenido correctamente';
                $codigo = '200.2';
            }

            return response()->json([
                'mensaje' => $mensaje,
                'success_code' => $codigo,
                'datos' => [
                    'horarios' => $horarios->map(fn($h) => HorarioResource::fichaje($h))
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en estado fichaje:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'mensaje' => 'Error al obtener el estado del fichaje',
                'error_code' => '500.1',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Maneja las acciones del fichaje (iniciar, pausar, reanudar, finalizar)
     */
    public function accion(Request $request)
    {
        try {
            $request->validate([
                'accion' => ['required', 'string', 'in:iniciar,pausar,reanudar,finalizar'],
                'horario_id' => ['required', 'exists:horarios,id'],
                'horario_siguiente_id' => ['sometimes', 'exists:horarios,id'],
                'coordenadas' => ['required', 'array'],
                'coordenadas.latitud' => ['required', 'numeric'],
                'coordenadas.longitud' => ['required', 'numeric'],
            ]);

            // Obtener el horario específico
            $horario = Horario::findOrFail($request->horario_id);

            // Si existe horario siguiente, lo validamos
            $horarioSiguiente = null;
            if ($request->horario_siguiente_id) {
                $horarioSiguiente = Horario::findOrFail($request->horario_siguiente_id);

                // Validar que los horarios sean continuos
                if ($horario->horario_fin->format('H:i') !== $horarioSiguiente->horario_inicio->format('H:i')) {
                    throw new \Exception('Los horarios no son continuos', 422);
                }
            }
            // fin de la validacion de horario siguiente

            // Validar que el horario pertenece al usuario
            $user = Auth::user();
            $empleado = Empleado::obtenerEmpleadoPorUsuario($user->id);

            if ($horario->contrato->empleado_id !== $empleado->id) {
                return response()->json([
                    'mensaje' => 'No tienes permiso para modificar este horario',
                    'error_code' => '403.1'
                ], 403);
            }

            // Validar que no haya otro horario en curso si se intenta iniciar
            if ($request->accion === 'iniciar') {
                $horarioEnCurso = Horario::where('estado_fichaje', 'en_curso')
                    ->whereDate('horario_inicio', now()->toDateString())
                    ->where('id', '!=', $horario->id)
                    ->whereHas('contrato', function($query) use ($empleado) {
                        $query->where('empleado_id', $empleado->id);
                    })
                    ->exists();

                if ($horarioEnCurso) {
                    return response()->json([
                        'mensaje' => 'Ya tienes otro horario en curso',
                        'error_code' => '422.3'
                    ], 422);
                }
            }

            // Verificar que el horario no esté finalizado
            if ($horario->estado_fichaje === 'finalizado') {
                return response()->json([
                    'mensaje' => 'Este fichaje ya está finalizado',
                    'error_code' => '422.1'
                ], 422);
            }

            // Ejecutar la acción correspondiente
            switch ($request->accion) {
                case 'iniciar':
                    $resultado = $this->fichajeService->iniciar($horario, $request->coordenadas);

                    // Si hay horario siguiente, programamos la transición
                    if ($horarioSiguiente) {
                        $tiempoHastaTransicion = Carbon::parse($horario->horario_fin)->diffInSeconds(now());

                        TransicionAutomaticaHorario::dispatch($horario, $horarioSiguiente)
                            ->delay(now()->addSeconds($tiempoHastaTransicion));

                        Log::info('Transición automática programada', [
                            'horario_actual' => $horario->id,
                            'horario_siguiente' => $horarioSiguiente->id,
                            'hora_transicion' => $horario->horario_fin
                        ]);
                    }
                    // fin de la transicion automatica
                    break;
                case 'descanso':
                    if (!$this->descansoService->puedeTomarDescansoObligatorio($horario)) {
                        return response()->json([
                            'mensaje' => 'No puedes tomar el descanso obligatorio en este momento',
                            'error_code' => '422.2'
                        ], 422);
                    }
                    $resultado = $this->descansoService->iniciarDescanso($horario, $request->coordenadas, true);
                    break;
                case 'pausar':
                    if (!$this->descansoService->puedeTomarDescansoAdicional($horario)) {
                        return response()->json([
                            'mensaje' => 'No puedes tomar un descanso adicional en este momento',
                            'error_code' => '422.3'
                        ], 422);
                    }
                    $resultado = $this->descansoService->iniciarDescanso($horario, $request->coordenadas, false);
                    break;
                case 'reanudar':
                    $resultado = $this->descansoService->finalizarDescanso($horario, $request->coordenadas);
                    break;
                case 'finalizar':
                    $resultado = $this->fichajeService->finalizar($horario, $request->coordenadas);
                    break;
            }

            return response()->json([
                'mensaje' => 'Acción realizada correctamente',
                'success_code' => '200.1',
                'datos' => [
                    'horario_actualizado' => HorarioResource::fichaje($horario->fresh()),
                    'horarios' => Horario::obtenerHorarioActivo($empleado)
                        ->map(fn($h) => HorarioResource::fichaje($h))
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en acción fichaje:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'mensaje' => $e->getMessage(),
                'error_code' => $e->getCode() ?: '500.1'
            ], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }

    protected function obtenerHorarioDesdeRequest(Request $request): Horario
    {
        $horarioActual = $request->input('horario_actual');

        $horarioId = isset($horarioActual['id']) ? $horarioActual['id'] : null;

        if (!$horarioId) {
            throw new \Exception('No se pudo obtener el ID del horario');
        }

        return Horario::findOrFail($horarioId);
    }
}
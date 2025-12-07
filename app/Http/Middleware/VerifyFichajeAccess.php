<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Horario;
use Illuminate\Http\Request;
use App\Services\Fichaje\FichajeService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VerifyFichajeAccess
{
    public function __construct(private FichajeService $fichajeService)
    {}

    public function handle(Request $request, Closure $next): Response
    {
        try {
            Log::info('VerifyFichajeAccess - Inicio', [
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
                'current_time' => now()->format('Y-m-d H:i:s')
            ]);

            $empleado = $this->verificarEmpleado();
            $horarioHoy = $this->obtenerHorarioActivo($empleado);

            // Usar el servicio para validar el horario con los 30 minutos de margen
            $validacion = $this->fichajeService->ejecutarValidacion($horarioHoy);
            if (!$validacion['valido']) {
                throw new \Exception($validacion['mensaje'], 403);
            }
            
            $request->merge(['horario_actual' => $horarioHoy]);
            
            return $next($request);
        } catch (\Exception $e) {
            Log::error('VerifyFichajeAccess - Error', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'error_code' => $e->getCode()
            ], 403);
        }
    }

    private function verificarEmpleado()
    {
        $empleado = Auth::user()->empleado;
        if (!$empleado) {
            throw new \Exception('No se encontró un empleado asociado a este usuario', '403.1');
        }
        return $empleado;
    }

    private function obtenerHorarioActivo($empleado)
    {
        $horario = Horario::where(function ($query) use ($empleado) {
            $query->whereHas('contrato', function($q) use ($empleado) {
                $q->where('empleado_id', $empleado->id);
            });
        })
        ->whereDate('horario_inicio', now()->toDateString())
        ->first();

        if (!$horario) {
            throw new \Exception('No tienes un horario asignado para hoy', '403.2');
        }

        return $horario;
    }
} 
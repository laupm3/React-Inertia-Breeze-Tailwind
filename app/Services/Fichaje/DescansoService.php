<?php

namespace App\Services\Fichaje;

use App\Models\Horario;
use App\Models\DescansoAdicional;
use Illuminate\Support\Carbon;
use App\Events\Fichaje\DescansoIniciado;
use App\Events\Fichaje\DescansoFinalizado;
use Illuminate\Support\Facades\DB;
//use App\Events\Fichaje\DescansoIniciar;
//use App\Events\Fichaje\DescansoFinalizar;

class DescansoService
{
    // Estados del fichaje
    const ESTADO_EN_CURSO = 'en_curso';
    const ESTADO_EN_PAUSA = 'en_pausa';
    const ESTADO_FINALIZADO = 'finalizado';

    // Tipos de descanso
    const TIPO_OBLIGATORIO = 'obligatorio';
    const TIPO_ADICIONAL = 'adicional';

    /**
     * Inicia un descanso (obligatorio o adicional)
     * 
     * @param Horario $horario - Horario actual
     * @param string $tipoDescanso - Tipo de descanso ('obligatorio' o 'adicional')
     * @throws \Exception Si el horario no está en curso
     */
    public function iniciarDescanso(Horario $horario, string $tipoDescanso): array
    {
        if ($horario->estado_fichaje !== self::ESTADO_EN_CURSO) {
            throw new \Exception('No se puede iniciar un descanso en el estado actual');
        }

        return DB::transaction(function () use ($horario, $tipoDescanso) {
            // Obtener coordenadas de la request
            $coordenadas = request()->get('coordenadas', null);

            if (!$coordenadas || !isset($coordenadas['latitud']) || !isset($coordenadas['longitud'])) {
                throw new \Exception('Las coordenadas son requeridas para iniciar un descanso');
            }

            // Crear registro de descanso
            $descanso = new DescansoAdicional([
                'tipo_descanso' => $tipoDescanso,
                'descanso_inicio' => now()->setTimezone('Europe/Madrid'),
                'ip_address_inicio' => request()->ip(),
                'user_agent_inicio' => request()->userAgent(),
                'latitud_inicio' => $coordenadas['latitud'],
                'longitud_inicio' => $coordenadas['longitud']
            ]);

            $horario->descansosAdicionales()->save($descanso);
            $horario->estado_fichaje = self::ESTADO_EN_PAUSA;
            $horario->save();

            event(new DescansoIniciado($horario, $descanso));

            return [
                'horario' => $horario->fresh(),
                'descanso' => $descanso
            ];
        });
    }

    /**
     * Finaliza el descanso actual y maneja posibles excesos
     * 
     * @param Horario $horario - Horario actual
     * @throws \Exception Si no hay descanso activo
     */
    public function finalizarDescanso(Horario $horario): array
    {
        if ($horario->estado_fichaje !== self::ESTADO_EN_PAUSA) {
            throw new \Exception('No hay un descanso activo para finalizar');
        }

        return DB::transaction(function () use ($horario) {
            $descansoActivo = $horario->descansosAdicionales()
                ->whereNull('descanso_fin')
                ->latest()
                ->firstOrFail();

            $ahora = now()->setTimezone('Europe/Madrid');
            
            // Actualizar descanso
            $descansoActivo->descanso_fin = $ahora;
            $descansoActivo->ip_address_fin = request()->ip();
            $descansoActivo->user_agent_fin = request()->userAgent();
            $descansoActivo->save();

            // Solo manejar exceso si es descanso obligatorio
            if ($descansoActivo->tipo_descanso === self::TIPO_OBLIGATORIO) {
                $this->manejarExceso($descansoActivo, $horario);
            }

            $horario->estado_fichaje = self::ESTADO_EN_CURSO;
            $horario->save();

            event(new DescansoFinalizado($horario, $descansoActivo));

            return [
                'horario' => $horario->fresh(),
                'descanso' => $descansoActivo
            ];
        });
    }

    /**
     * Maneja el exceso de tiempo en descansos obligatorios
     * Para descansos adicionales no hay exceso, todo el tiempo cuenta como debido
     * 
     * @param DescansoAdicional $descanso - Descanso a verificar
     * @param Horario $horario - Horario actual
     */
    private function manejarExceso(DescansoAdicional $descanso, Horario $horario): void
    {
        // Si es descanso adicional, no hay exceso
        if ($descanso->tipo_descanso === self::TIPO_ADICIONAL) {
            return;
        }

        // Obtener tiempo permitido del horario
        $tiempoPermitido = $this->obtenerTiempoDescansoObligatorio($horario);
        $duracionTotal = $descanso->getDuracionEnMinutos();

        if ($duracionTotal > $tiempoPermitido) {
            $tiempoExceso = $duracionTotal - $tiempoPermitido;
            
            // Crear registro para el exceso
            $exceso = new DescansoAdicional([
                'horario_id' => $horario->id,
                'tipo_descanso' => self::TIPO_ADICIONAL,
                'descanso_inicio' => $descanso->descanso_inicio->addMinutes($tiempoPermitido),
                'descanso_fin' => $descanso->descanso_fin,
                'tiempo_debido' => $tiempoExceso,
                'observaciones' => "Exceso de descanso obligatorio: {$tiempoExceso} minutos"
            ]);

            $horario->descansosAdicionales()->save($exceso);
        }
    }

    /**
     * Verifica si se puede tomar un descanso obligatorio
     */
    public function puedeTomarDescansoObligatorio(Horario $horario): bool
    {
        return !DescansoAdicional::descansoObligatorioTomadoHoy($horario) &&
               $horario->estado_fichaje === 'en_curso';
    }

    /**
     * Verifica si se puede tomar un descanso adicional
     */
    public function puedeTomarDescansoAdicional(Horario $horario): bool
    {
        return $horario->estado_fichaje === 'en_curso' &&
               !DescansoAdicional::obtenerDescansoActivo($horario);
    }

    /**
     * Verifica si es hora del descanso obligatorio
     */
    public function esDescansoObligatorio(Horario $horario): bool
    {
        if (!$horario->descanso_inicio || !$horario->descanso_fin) {
            return false;
        }

        $horaActual = now()->setTimezone('Europe/Madrid');
        $descansoInicio = Carbon::parse($horario->descanso_inicio);
        $descansoFin = Carbon::parse($horario->descanso_fin);
        
        $horaActualTime = $horaActual->format('H:i:s');
        $descansoInicioTime = $descansoInicio->format('H:i:s');
        $descansoFinTime = $descansoFin->format('H:i:s');
        
        return $horaActualTime >= $descansoInicioTime && $horaActualTime <= $descansoFinTime;
    }

    public function registrarDescansoAdicional(Horario $horario, array $datos): array
    {
        $descansos = $horario->descansos ? json_decode($horario->descansos, true) : [];
        $horaActual = now()->setTimezone('Europe/Madrid');

        $nuevoDescanso = [
            'inicio' => $horaActual->format('Y-m-d H:i:s'),
            'latitud_inicio' => $datos['latitud'] ?? null,
            'longitud_inicio' => $datos['longitud'] ?? null,
            'ip_inicio' => $datos['ip'] ?? null
        ];

        $descansos[] = $nuevoDescanso;
        return $descansos;
    }

    public function finalizarDescansoAdicional(Horario $horario, array $datos): array
    {
        $descansos = $horario->descansos ? json_decode($horario->descansos, true) : [];
        if (empty($descansos)) {
            throw new \Exception('No hay descansos registrados para este fichaje');
        }

        $ultimoIndex = count($descansos) - 1;
        $ultimoDescanso = $descansos[$ultimoIndex];

        if (!isset($ultimoDescanso['inicio']) || isset($ultimoDescanso['fin'])) {
            throw new \Exception('No hay un descanso en curso para finalizar');
        }

        $horaActual = now()->setTimezone('Europe/Madrid');

        // Añadir datos de fin de descanso
        $descansos[$ultimoIndex]['fin'] = $horaActual->format('Y-m-d H:i:s');
        $descansos[$ultimoIndex]['latitud_fin'] = $datos['latitud'] ?? null;
        $descansos[$ultimoIndex]['longitud_fin'] = $datos['longitud'] ?? null;
        $descansos[$ultimoIndex]['ip_fin'] = $datos['ip'] ?? null;

        // Calcular duración del descanso
        $inicio = Carbon::parse($descansos[$ultimoIndex]['inicio']);
        $fin = Carbon::parse($descansos[$ultimoIndex]['fin']);
        $descansos[$ultimoIndex]['duracion_minutos'] = $fin->diffInMinutes($inicio);

        return $descansos;
    }

    /**
     * Maneja el exceso de tiempo y crea un descanso adicional si es necesario
     */
    public function manejarDescansoExcedido(DescansoAdicional $descanso, Horario $horario): void
    {
        if ($descanso->tipo_descanso === self::TIPO_OBLIGATORIO) {
            $tiempoPermitido = $this->obtenerTiempoDescansoObligatorio($horario);
            $duracionReal = $descanso->getDuracionEnMinutos();

            if ($duracionReal > $tiempoPermitido) {
                $finDescansoOriginal = $descanso->descanso_inicio->copy()->addMinutes($tiempoPermitido);
                
                $descanso->update([
                    'descanso_fin' => $finDescansoOriginal,
                    'observaciones' => "Descanso obligatorio ajustado a {$tiempoPermitido} minutos."
                ]);

                $exceso = new DescansoAdicional([
                    'horario_id' => $horario->id,
                    'tipo_descanso' => self::TIPO_ADICIONAL,
                    'descanso_inicio' => $finDescansoOriginal,
                    'descanso_fin' => $descanso->descanso_fin,
                    'latitud_inicio' => $descanso->latitud_fin,
                    'longitud_inicio' => $descanso->longitud_fin,
                    'ip_address_inicio' => $descanso->ip_address_fin,
                    'user_agent_inicio' => $descanso->user_agent_fin,
                    'latitud_fin' => $descanso->latitud_fin,
                    'longitud_fin' => $descanso->longitud_fin,
                    'ip_address_fin' => $descanso->ip_address_fin,
                    'user_agent_fin' => $descanso->user_agent_fin,
                    'observaciones' => "Exceso de descanso obligatorio: " . ($duracionReal - $tiempoPermitido) . " minutos."
                ]);

                $horario->descansosAdicionales()->save($exceso);
            }
        }
    }

    /**
     * Maneja el exceso de tiempo en descansos
     */
    private function manejarExcesoTiempo(DescansoAdicional $descanso, Horario $horario): void
    {
        $tiempoPermitido = $descanso->tipo_descanso === self::TIPO_OBLIGATORIO
            ? $this->obtenerTiempoDescansoObligatorio($horario)
            : 60; // 60 minutos para descansos adicionales

        $duracion = $descanso->getDuracionEnMinutos();

        if ($duracion > $tiempoPermitido) {
            // Crear nuevo registro para el exceso
            $exceso = new DescansoAdicional([
                'horario_id' => $horario->id,
                'tipo_descanso' => self::TIPO_ADICIONAL,
                'descanso_inicio' => $descanso->descanso_inicio->addMinutes($tiempoPermitido),
                'descanso_fin' => $descanso->descanso_fin,
                'latitud_inicio' => $descanso->latitud_fin,
                'longitud_inicio' => $descanso->longitud_fin,
                'ip_address_inicio' => $descanso->ip_address_fin,
                'user_agent_inicio' => $descanso->user_agent_fin,
                'latitud_fin' => $descanso->latitud_fin,
                'longitud_fin' => $descanso->longitud_fin,
                'ip_address_fin' => $descanso->ip_address_fin,
                'user_agent_fin' => $descanso->user_agent_fin
            ]);

            // Ajustar el descanso original al tiempo permitido
            $finDescansoOriginal = $descanso->descanso_inicio->copy()->addMinutes($tiempoPermitido);
            
            $descanso->update([
                'descanso_fin' => $finDescansoOriginal,
                'observaciones' => "Descanso ajustado al tiempo máximo permitido de {$tiempoPermitido} minutos. Exceso registrado como descanso adicional."
            ]);

            $exceso->observaciones = "Exceso de tiempo del descanso " . 
                ($descanso->tipo_descanso === self::TIPO_OBLIGATORIO ? 'obligatorio' : 'adicional') . 
                ". Duración del exceso: " . ($duracion - $tiempoPermitido) . " minutos.";

            $horario->descansosAdicionales()->save($exceso);

            // Notificar del exceso
            if ($descanso->tipo_descanso === self::TIPO_OBLIGATORIO) {
                // TODO: Implementar notificación
                // event(new DescansoExcedido($horario, $descanso, $exceso));
            }
        }
    }

    /**
     * Obtiene el tiempo de descanso obligatorio configurado en minutos
     * 
     * @param Horario $horario - Horario actual
     * @return int - Minutos de descanso permitidos (0 si no hay configuración)
     */
    private function obtenerTiempoDescansoObligatorio(Horario $horario): int
    {
        if (!$horario->descanso_inicio || !$horario->descanso_fin) {
            return 0;
        }

        $inicio = Carbon::parse($horario->descanso_inicio);
        $fin = Carbon::parse($horario->descanso_fin);

        return $inicio->diffInMinutes($fin);
    }

    /**
     * Verifica si un descanso está excedido
     */
    public function descansoExcedido(DescansoAdicional $descanso, Horario $horario): bool
    {
        // Solo verificamos exceso para descansos obligatorios
        if ($descanso->tipo_descanso === self::TIPO_OBLIGATORIO) {
            $tiempoPermitido = $this->obtenerTiempoDescansoObligatorio($horario);
            return $descanso->getDuracionEnMinutos() > $tiempoPermitido;
        }

        return false;
    }

    /**
     * Inicia un descanso obligatorio verificando la configuración del horario
     */
    public function iniciarDescansoObligatorio(Horario $horario): array
    {
        // Verificar si ya tomó el descanso obligatorio hoy
        if ($this->descansoObligatorioTomadoHoy($horario->empleado_id)) {
            throw new \Exception('Ya has tomado tu descanso obligatorio hoy');
        }

        // Verificar si tiene configurado descanso obligatorio en algún horario del día
        $tiempoDescanso = $this->obtenerTiempoDescansoObligatorio($horario);
        if ($tiempoDescanso === 0) {
            throw new \Exception('No hay descanso obligatorio configurado para hoy');
        }

        return $this->iniciarDescanso($horario, self::TIPO_OBLIGATORIO);
    }

    /**
     * Verifica si el empleado ya tomó su descanso obligatorio hoy
     * 
     * @param int $empleadoId - ID del empleado
     * @return bool
     */
    private function descansoObligatorioTomadoHoy(int $empleadoId): bool
    {
        $hoy = now()->setTimezone('Europe/Madrid')->format('Y-m-d');
        
        return DescansoAdicional::whereHas('horario', function ($query) use ($empleadoId) {
                $query->where('empleado_id', $empleadoId);
            })
            ->where('tipo_descanso', self::TIPO_OBLIGATORIO)
            ->whereDate('descanso_inicio', $hoy)
            ->exists();
    }

    /**
     * Obtiene el descanso activo de un horario si existe
     * 
     * @param Horario $horario
     * @return DescansoAdicional|null
     */
    public function obtenerDescansoActivo(Horario $horario): ?DescansoAdicional
    {
        if ($horario->estado_fichaje !== self::ESTADO_EN_PAUSA) {
            return null;
        }

        return $horario->descansosAdicionales()
            ->whereNull('descanso_fin')
            ->latest()
            ->first();
    }
} 
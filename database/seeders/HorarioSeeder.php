<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\Horario;
use App\Models\Contrato;
use App\Models\EstadoHorario;
use Illuminate\Database\Seeder;
use App\Models\DescansoAdicional;
use Illuminate\Support\Arr;

class HorarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contratos = Contrato::with([
            'jornada.jornadaTurnos.modalidad',
            'jornada.jornadaTurnos.turno',
            'anexos.jornada.jornadaTurnos.modalidad',
            'anexos.jornada.jornadaTurnos.turno',
            'empleado.user'
        ])->get();

        $estadosHorarios = EstadoHorario::all();

        foreach ($contratos as $contrato) {

            if ($contrato->anexos->count() > 0) {

                $anexo = $contrato->anexos->first();

                // Swap the index of the array with the weekday number of the jornadaTurnos
                $jornadaTurnos = $anexo->jornada->jornadaTurnos->keyBy('weekday_number');

                $inicio = Carbon::parse($anexo->fecha_inicio);
                $fin = $inicio->copy()->addDays(30);

                // Generate an array of dates between the start and end date
                $fechas = $this->generateDates($inicio, $fin);

                foreach ($fechas as $fecha) {

                    // El objetivo es obtener el día de la semana de la fecha actual
                    $diaSemana = $fecha->dayOfWeek;

                    // Verificar si el índice del array de jornadaTurnos coincide con el día de la semana
                    if (!$jornadaTurnos->has($diaSemana)) {
                        continue;
                    }

                    $jornadaTurno = $jornadaTurnos->get($diaSemana);
                    $turno = $jornadaTurno->turno;

                    // Calcular horarios base antes de determinar fichajes
                    $horarioInicio = $fecha->copy()->setTimeFromTimeString($turno->hora_inicio);
                    $horarioFin = ($turno->hora_fin > $turno->hora_inicio)
                        ? $fecha->copy()->setTimeFromTimeString($turno->hora_fin)
                        : $fecha->copy()->addDay()->setTimeFromTimeString($turno->hora_fin);

                    // Determinar si es un horario del pasado, presente o futuro
                $esPasado = $fecha->lt(now()->startOfDay());
                $esHoy = $fecha->isSameDay(now());
                $esFuturo = $fecha->gt(now()->startOfDay());

                // Para horarios del pasado: generar fichajes completos
                // Para horarios de hoy: posibilidad de fichajes parciales
                // Para horarios futuros: solo horarios programados sin fichajes
                
                $fichaje_entrada = null;
                $fichaje_salida = null;

                if ($esPasado) {
                    // Horarios del pasado: 85% tienen fichajes completos
                    $tieneFichajes = rand(1, 100) <= 85;
                    
                    if ($tieneFichajes) {
                        $fichaje_entrada = rand(0, 1)
                            ? $horarioInicio->copy()->subMinutes(rand(0, 15)) // Entrada temprana
                            : $horarioInicio->copy()->addMinutes(rand(1, 30)); // Entrada tardía
                        
                        $fichaje_salida = rand(0, 1)
                            ? $horarioFin->copy()->subMinutes(rand(0, 15)) // Salida temprana
                            : $horarioFin->copy()->addMinutes(rand(1, 45)); // Salida tardía
                    }
                } elseif ($esHoy) {
                    // Horarios de hoy: pueden tener entrada pero no salida
                    $horaActual = now();
                    
                    if ($horarioInicio->lt($horaActual)) {
                        // Ya debería haber empezado
                        $fichaje_entrada = rand(0, 1)
                            ? $horarioInicio->copy()->subMinutes(rand(0, 15))
                            : $horarioInicio->copy()->addMinutes(rand(1, 30));
                        
                        // Solo fichar salida si ya pasó la hora de fin
                        if ($horarioFin->lt($horaActual) && rand(1, 100) <= 80) {
                            $fichaje_salida = rand(0, 1)
                                ? $horarioFin->copy()->subMinutes(rand(0, 15))
                                : $horarioFin->copy()->addMinutes(rand(1, 45));
                        }
                    }
                }
                // Para horarios futuros: $fichaje_entrada y $fichaje_salida quedan null

                $horario = Horario::factory()->create([
                    'contrato_id' => null,
                    'anexo_id' => $anexo->id,
                    'estado_horario_id' => $estadosHorarios->random()->id,
                    'modalidad_id' => $jornadaTurno->modalidad_id,
                    'turno_id' => $jornadaTurno->turno_id,
                    'solicitud_permiso_id' => null,
                    'horario_inicio' => $horarioInicio = $fecha->copy()->setTimeFromTimeString($turno->hora_inicio),
                    'horario_fin' => $horarioFin = ($turno->hora_fin > $turno->hora_inicio)
                        ? $fecha->copy()->setTimeFromTimeString($turno->hora_fin)
                        : $fecha->copy()->addDay()->setTimeFromTimeString($turno->hora_fin),
                    'descanso_inicio' => $turno->descanso_inicio ? $fecha->copy()->setTimeFromTimeString($turno->descanso_inicio) : null,
                    'descanso_fin' => (!$turno->descanso_fin)
                        ? null
                        : ($turno->descanso_fin > $turno->descanso_inicio
                            ? $fecha->copy()->setTimeFromTimeString($turno->descanso_fin)
                            : $fecha->copy()->addDay()->setTimeFromTimeString($turno->descanso_fin)
                        ),
                    'fichaje_entrada' => $fichaje_entrada,
                    'fichaje_salida' => $fichaje_salida
                ]);

                    // Solo generar descansos adicionales para horarios del pasado con fichaje de entrada
                    if ($horario->fichaje_entrada && $esPasado) {

                        if (Arr::random([true, false])) {
                            DescansoAdicional::factory()->create([
                                'horario_id' => $horario->id,
                                'descanso_inicio' => $descansoAdicionalInicio = $horario->horario_inicio->copy()->addMinutes(rand(30, 75)),
                                'descanso_fin' => $descansoAdicionalInicio->copy()->addMinutes(rand(3, 10)),
                            ]);

                            if ($horario->descanso_inicio && $horario->descanso_fin) {
                                DescansoAdicional::factory()->create([
                                    'horario_id' => $horario->id,
                                    'descanso_inicio' => $descansoAdicionalInicio = $horario->descanso_fin->copy()->addMinutes(rand(30, 60)),
                                    'descanso_fin' => $descansoAdicionalInicio->copy()->addMinutes(rand(3, 10)),
                                ]);
                            } else {
                                if (Arr::random([true, false])) {
                                    DescansoAdicional::factory()->create([
                                        'horario_id' => $horario->id,
                                        'descanso_inicio' => $descansoAdicionalInicio = $horario->horario_fin->copy()->subMinutes(rand(60, 75)),
                                        'descanso_fin' => $descansoAdicionalInicio->copy()->addMinutes(rand(3, 10)),
                                    ]);
                                }
                            }
                        }
                    }
                }

                continue;
            }

            // Swap the index of the array with the weekday number of the jornadaTurnos
            $jornadaTurnos = $contrato->jornada->jornadaTurnos->keyBy('weekday_number');

            $inicio = Carbon::parse($contrato->fecha_inicio);
            $fin = $inicio->copy()->addDays(30);

            // Generate an array of dates between the start and end date
            $fechas = $this->generateDates($inicio, $fin);

            foreach ($fechas as $fecha) {

                // El objetivo es obtener el día de la semana de la fecha actual
                $diaSemana = $fecha->dayOfWeek;

                // Verificar si el índice del array de jornadaTurnos coincide con el día de la semana
                if (!$jornadaTurnos->has($diaSemana)) {
                    continue;
                }

                $jornadaTurno = $jornadaTurnos->get($diaSemana);
                $turno = $jornadaTurno->turno;

                // Calcular horarios base antes de determinar fichajes
                $horarioInicio = $fecha->copy()->setTimeFromTimeString($turno->hora_inicio);
                $horarioFin = ($turno->hora_fin > $turno->hora_inicio)
                    ? $fecha->copy()->setTimeFromTimeString($turno->hora_fin)
                    : $fecha->copy()->addDay()->setTimeFromTimeString($turno->hora_fin);

                // Determinar si es un horario del pasado, presente o futuro
                $esPasado = $fecha->lt(now()->startOfDay());
                $esHoy = $fecha->isSameDay(now());
                $esFuturo = $fecha->gt(now()->startOfDay());

                // Para horarios del pasado: generar fichajes completos
                // Para horarios de hoy: posibilidad de fichajes parciales
                // Para horarios futuros: solo horarios programados sin fichajes
                
                $fichaje_entrada = null;
                $fichaje_salida = null;

                if ($esPasado) {
                    // Horarios del pasado: 85% tienen fichajes completos
                    $tieneFichajes = rand(1, 100) <= 85;
                    
                    if ($tieneFichajes) {
                        $fichaje_entrada = rand(0, 1)
                            ? $horarioInicio->copy()->subMinutes(rand(0, 15)) // Entrada temprana
                            : $horarioInicio->copy()->addMinutes(rand(1, 30)); // Entrada tardía
                        
                        $fichaje_salida = rand(0, 1)
                            ? $horarioFin->copy()->subMinutes(rand(0, 15)) // Salida temprana
                            : $horarioFin->copy()->addMinutes(rand(1, 45)); // Salida tardía
                    }
                } elseif ($esHoy) {
                    // Horarios de hoy: pueden tener entrada pero no salida
                    $horaActual = now();
                    
                    if ($horarioInicio->lt($horaActual)) {
                        // Ya debería haber empezado
                        $fichaje_entrada = rand(0, 1)
                            ? $horarioInicio->copy()->subMinutes(rand(0, 15))
                            : $horarioInicio->copy()->addMinutes(rand(1, 30));
                        
                        // Solo fichar salida si ya pasó la hora de fin
                        if ($horarioFin->lt($horaActual) && rand(1, 100) <= 80) {
                            $fichaje_salida = rand(0, 1)
                                ? $horarioFin->copy()->subMinutes(rand(0, 15))
                                : $horarioFin->copy()->addMinutes(rand(1, 45));
                        }
                    }
                }
                // Para horarios futuros: $fichaje_entrada y $fichaje_salida quedan null

                $horario = Horario::factory()->create([
                    'contrato_id' => $contrato->id,
                    'anexo_id' => null,
                    'estado_horario_id' => $estadosHorarios->random()->id,
                    'modalidad_id' => $jornadaTurno->modalidad_id,
                    'turno_id' => $jornadaTurno->turno_id,
                    'solicitud_permiso_id' => null,
                    'horario_inicio' => $horarioInicio,
                    'horario_fin' => $horarioFin,
                    'descanso_inicio' => $turno->descanso_inicio ? $fecha->copy()->setTimeFromTimeString($turno->descanso_inicio) : null,
                    'descanso_fin' => (!$turno->descanso_fin)
                        ? null
                        : ($turno->descanso_fin > $turno->descanso_inicio
                            ? $fecha->copy()->setTimeFromTimeString($turno->descanso_fin)
                            : $fecha->copy()->addDay()->setTimeFromTimeString($turno->descanso_fin)
                        ),
                    'fichaje_entrada' => $fichaje_entrada,
                    'fichaje_salida' => $fichaje_salida
                ]);

                // Solo generar descansos adicionales para horarios del pasado con fichaje de entrada
                if ($horario->fichaje_entrada && $esPasado) {

                    if (Arr::random([true, false])) {
                        DescansoAdicional::factory()->create([
                            'horario_id' => $horario->id,
                            'descanso_inicio' => $descansoAdicionalInicio = $horario->horario_inicio->copy()->addMinutes(rand(30, 75)),
                            'descanso_fin' => $descansoAdicionalInicio->copy()->addMinutes(rand(3, 10)),
                        ]);

                        if ($horario->descanso_inicio && $horario->descanso_fin) {
                            DescansoAdicional::factory()->create([
                                'horario_id' => $horario->id,
                                'descanso_inicio' => $descansoAdicionalInicio = $horario->descanso_fin->copy()->addMinutes(rand(30, 60)),
                                'descanso_fin' => $descansoAdicionalInicio->copy()->addMinutes(rand(3, 10)),
                            ]);
                        } else {
                            if (Arr::random([true, false])) {
                                DescansoAdicional::factory()->create([
                                    'horario_id' => $horario->id,
                                    'descanso_inicio' => $descansoAdicionalInicio = $horario->horario_fin->copy()->subMinutes(rand(60, 75)),
                                    'descanso_fin' => $descansoAdicionalInicio->copy()->addMinutes(rand(3, 10)),
                                ]);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Generate an array of Carbon dates between the start and end date
     * 
     * @param \Carbon\Carbon $start
     * @param \Carbon\Carbon $end
     * 
     * @return array<Carbon>
     */
    private function generateDates(Carbon $start, Carbon $end)
    {
        $dates = [];

        for ($date = $start; $date->lte($end); $date->addDay()) {
            $dates[] = $date->copy();
        }

        return $dates;
    }
}

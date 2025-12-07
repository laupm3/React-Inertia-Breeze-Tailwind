<?php

namespace Database\Seeders;

use App\Models\Jornada;
use App\Models\Turno;
use App\Models\Centro;
use App\Models\Modalidad;
use App\Models\JornadaTurno;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class JornadaTurnoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $centros = Centro::all();
        $modalidades = Modalidad::all();

        // Definición de jornadas completas con sus turnos asociados
        $jornadasCompletas = [
            // Jornadas de 40 horas (8h/día)
            [
                'jornada' => [
                    'name' => 'Mañana 40 horas de Lunes a Viernes Presencial',
                    'description' => 'Jornada completa de 40 horas semanales en horario de mañana, de lunes a viernes en modalidad presencial.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Mañana 8h (8:00-16:00)',
                        'descripcion' => 'Turno de mañana jornada completa',
                        'hora_inicio' => '08:00:00',
                        'hora_fin' => '16:00:00',
                        'descanso_inicio' => '12:00:00',
                        'descanso_fin' => '13:00:00',
                        'color' => '#E3F2FD',
                        'dias' => [0, 1, 2, 3, 4] // Lunes a Viernes (0=Lunes, 6=Domingo)
                    ]
                ]
            ],
            [
                'jornada' => [
                    'name' => 'Tarde 40 horas de Lunes a Viernes Presencial',
                    'description' => 'Jornada completa de 40 horas semanales en horario de tarde, de lunes a viernes en modalidad presencial.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Tarde 8h (14:00-22:00)',
                        'descripcion' => 'Turno de tarde jornada completa',
                        'hora_inicio' => '14:00:00',
                        'hora_fin' => '22:00:00',
                        'descanso_inicio' => '18:00:00',
                        'descanso_fin' => '19:00:00',
                        'color' => '#FFF3E0',
                        'dias' => [0, 1, 2, 3, 4]
                    ]
                ]
            ],
            [
                'jornada' => [
                    'name' => 'Noche 40 horas de Lunes a Viernes Presencial',
                    'description' => 'Jornada completa de 40 horas semanales en horario nocturno, de lunes a viernes en modalidad presencial.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Noche 8h (22:00-06:00)',
                        'descripcion' => 'Turno de noche jornada completa',
                        'hora_inicio' => '22:00:00',
                        'hora_fin' => '06:00:00',
                        'descanso_inicio' => '02:00:00',
                        'descanso_fin' => '02:30:00',
                        'color' => '#F3E5F5',
                        'dias' => [0, 1, 2, 3, 4]
                    ]
                ]
            ],

            // Jornadas de 30 horas (6h/día)
            [
                'jornada' => [
                    'name' => 'Mañana 30 horas de Lunes a Viernes Presencial',
                    'description' => 'Jornada reducida de 30 horas semanales en horario de mañana, de lunes a viernes en modalidad presencial.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Mañana 6h (08:00-14:00)',
                        'descripcion' => 'Turno de mañana jornada reducida',
                        'hora_inicio' => '08:00:00',
                        'hora_fin' => '14:00:00',
                        'descanso_inicio' => '11:00:00',
                        'descanso_fin' => '11:30:00',
                        'color' => '#E8F5E8',
                        'dias' => [0, 1, 2, 3, 4]
                    ]
                ]
            ],
            [
                'jornada' => [
                    'name' => 'Tarde 30 horas de Lunes a Viernes Presencial',
                    'description' => 'Jornada reducida de 30 horas semanales en horario de tarde, de lunes a viernes en modalidad presencial.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Tarde 6h (15:00-21:00)',
                        'descripcion' => 'Turno de tarde jornada reducida',
                        'hora_inicio' => '15:00:00',
                        'hora_fin' => '21:00:00',
                        'descanso_inicio' => '18:00:00',
                        'descanso_fin' => '18:30:00',
                        'color' => '#FFF8E1',
                        'dias' => [0, 1, 2, 3, 4]
                    ]
                ]
            ],

            // Jornadas de 20 horas (4h/día)
            [
                'jornada' => [
                    'name' => 'Mañana 20 horas de Lunes a Viernes Presencial',
                    'description' => 'Media jornada de 20 horas semanales en horario de mañana, de lunes a viernes en modalidad presencial.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Mañana 4h (08:00-12:00)',
                        'descripcion' => 'Media jornada de mañana',
                        'hora_inicio' => '08:00:00',
                        'hora_fin' => '12:00:00',
                        'descanso_inicio' => null,
                        'descanso_fin' => null,
                        'color' => '#E1F5FE',
                        'dias' => [0, 1, 2, 3, 4]
                    ]
                ]
            ],
            [
                'jornada' => [
                    'name' => 'Tarde 20 horas de Lunes a Viernes Presencial',
                    'description' => 'Media jornada de 20 horas semanales en horario de tarde, de lunes a viernes en modalidad presencial.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Tarde 4h (16:00-20:00)',
                        'descripcion' => 'Media jornada de tarde',
                        'hora_inicio' => '16:00:00',
                        'hora_fin' => '20:00:00',
                        'descanso_inicio' => null,
                        'descanso_fin' => null,
                        'color' => '#FCE4EC',
                        'dias' => [0, 1, 2, 3, 4]
                    ]
                ]
            ],

            // Jornadas híbridas
            [
                'jornada' => [
                    'name' => 'Mañana 40 horas de Lunes a Viernes Híbrida',
                    'description' => 'Jornada completa de 40 horas semanales en horario de mañana, modalidad híbrida (presencial y teletrabajo).'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Mañana Híbrida 8h (09:00-17:00)',
                        'descripcion' => 'Turno de mañana modalidad híbrida',
                        'hora_inicio' => '09:00:00',
                        'hora_fin' => '17:00:00',
                        'descanso_inicio' => '13:00:00',
                        'descanso_fin' => '14:00:00',
                        'color' => '#F1F8E9',
                        'dias' => [0, 1, 2, 3, 4]
                    ]
                ]
            ],

            // Jornadas de teletrabajo
            [
                'jornada' => [
                    'name' => 'Mañana 40 horas de Lunes a Viernes Teletrabajo',
                    'description' => 'Jornada completa de 40 horas semanales en horario de mañana, modalidad teletrabajo.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Mañana Remoto 8h (09:00-17:00)',
                        'descripcion' => 'Turno de mañana modalidad teletrabajo',
                        'hora_inicio' => '09:00:00',
                        'hora_fin' => '17:00:00',
                        'descanso_inicio' => '13:00:00',
                        'descanso_fin' => '14:00:00',
                        'color' => '#E8EAF6',
                        'dias' => [0, 1, 2, 3, 4]
                    ]
                ]
            ],

            // Jornadas de fin de semana
            [
                'jornada' => [
                    'name' => 'Fin de Semana 16 horas Presencial',
                    'description' => 'Jornada de fin de semana de 16 horas (8h sábado + 8h domingo) en modalidad presencial.'
                ],
                'turnos' => [
                    [
                        'nombre' => 'Fin de Semana 8h (10:00-18:00)',
                        'descripcion' => 'Turno de fin de semana',
                        'hora_inicio' => '10:00:00',
                        'hora_fin' => '18:00:00',
                        'descanso_inicio' => '14:00:00',
                        'descanso_fin' => '15:00:00',
                        'color' => '#FFECB3',
                        'dias' => [5, 6] // Sábado y Domingo (0=Lunes, 5=Sábado, 6=Domingo)
                    ]
                ]
            ]
        ];

        // Crear jornadas y turnos para cada centro
        foreach ($centros as $centro) {
            // Seleccionar aleatoriamente entre 4 y 8 jornadas por centro
            $jornadasSeleccionadas = Arr::random($jornadasCompletas, rand(4, 8));

            foreach ($jornadasSeleccionadas as $jornadaData) {
                // Crear la jornada
                $jornada = Jornada::create($jornadaData['jornada']);

                // Crear los turnos asociados a esta jornada
                foreach ($jornadaData['turnos'] as $turnoData) {
                    $dias = $turnoData['dias'];
                    unset($turnoData['dias']); // Remover 'dias' antes de crear el turno

                    $turno = Turno::create([
                        'centro_id' => $centro->id,
                        ...$turnoData
                    ]);

                    // Crear las relaciones jornada-turno para cada día de la semana
                    foreach ($dias as $dia) {
                        // Seleccionar una modalidad aleatoria (o específica según el nombre de la jornada)
                        $modalidad = $this->getModalidadPorJornada($jornadaData['jornada']['name'], $modalidades);

                        JornadaTurno::create([
                            'jornada_id' => $jornada->id,
                            'turno_id' => $turno->id,
                            'modalidad_id' => $modalidad->id,
                            'weekday_number' => $dia
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Obtener modalidad basada en el nombre de la jornada
     */
    private function getModalidadPorJornada(string $nombreJornada, $modalidades)
    {
        if (str_contains($nombreJornada, 'Presencial')) {
            return $modalidades->where('nombre', 'Presencial')->first() ?? $modalidades->random();
        } elseif (str_contains($nombreJornada, 'Híbrida')) {
            return $modalidades->where('nombre', 'Híbrida')->first() ?? $modalidades->random();
        } elseif (str_contains($nombreJornada, 'Teletrabajo')) {
            return $modalidades->where('nombre', 'Teletrabajo')->first() ?? $modalidades->random();
        }

        return $modalidades->random();
    }
}

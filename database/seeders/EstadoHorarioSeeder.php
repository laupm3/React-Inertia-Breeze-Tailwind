<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EstadoHorarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $estados = [
            ['name' => 'Absentismo', 'description' => 'Cuando el empleado no se presenta sin justificación'],
            ['name' => 'Pendiente', 'description' => 'Cuando aún no se ha registrado o confirmado el estado del horario'],
            ['name' => 'Completo', 'description' => 'Cuando el horario de trabajo se cumplió en su totalidad'],
            ['name' => 'Parcial', 'description' => 'Cuando el horario de trabajo se cumplió parcialmente'],
            ['name' => 'En Revisión', 'description' => 'Cuando un empleado presenta una justificación y está pendiente de ser aprobado'],
            ['name' => 'Justificado', 'description' => 'Cuando el empleado tiene una ausencia con justificación (como enfermedad o motivos personales)'],
            ['name' => 'Permiso', 'description' => 'Cuando el empleado tiene un permiso previamente aprobado'],
            ['name' => 'Retraso', 'description' => 'Cuando el empleado llegó tarde, pero cumplió el resto del horario'],
            ['name' => 'Suspensión', 'description' => 'Cuando el horario no se realiza debido a decisiones administrativas (ej. suspensión del trabajo por fuerza mayor)'],
            ['name' => 'Capacitación', 'description' => 'Cuando el empleado estuvo participando en actividades de formación en lugar de cumplir el horario regular'],
            ['name' => 'Vacaciones', 'description' => 'Cuando el empleado está de vacaciones y no se espera que cumpla con su horario regular']
        ];

        foreach ($estados as $estado) {
            \App\Models\EstadoHorario::create($estado);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use App\Models\Evento;
use App\Models\TipoEvento;
use App\Models\Departamento;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class EventoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiposEvento = TipoEvento::all();
        $teams = Team::all();
        $departamentos = Departamento::all();
        $users = User::all();

        Evento::factory(100)->make()->each(function ($evento) use ($tiposEvento, $teams, $departamentos, $users) {
            $tipoEvento = $tiposEvento->random();
            $this->modificarEventoPorTipo($tipoEvento, $evento, $teams, $departamentos);
            $evento->tipo_evento_id = $tipoEvento->id;
            $evento->created_by = $users->random()->id;
            $evento->save();

            // Asignar algunos usuarios al evento
            $users = User::inRandomOrder()->take(rand(2, 5))->get();
            $evento->users()->attach($users);
            
            // Asegurarse de que el creador también es participante
            $evento->users()->syncWithoutDetaching([$evento->created_by]);
        });
    }

    private function modificarEventoPorTipo($tipoEvento, &$evento, $teams, $departamentos)
    {
        return match ($tipoEvento->nombre) {
            'Equipo' => $evento->team_id = $teams->random()->id,
            'Departamento' => $evento->departamento_id = $departamentos->random()->id,
            default => null
        };
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Evento;
use App\Models\User;
use App\Models\Team;
use App\Models\Departamento;

class EventoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $eventos = Evento::all();
        $users = User::whereNotNull('name')->get();

        $eventos->each(function ($evento) use ($users) {
            switch ($evento->tipo_evento_id) {
                case 1: // Privado
                    // Asigna de 1 a 5 usuarios random al evento
                    $evento->users()->attach($users->random(rand(1, 5)));
                    break;

                case 2: // Team
                    if ($evento->team_id) {
                        // Obtiene los usuarios del team y los asocia al evento
                        $team = Team::find($evento->team_id);
                        if ($team) {
                            $evento->users()->attach($team->users);
                        }
                    }
                    break;

                case 3: // Departamento
                    if ($evento->departamento_id) {
                        // Obtiene los usuarios del departamento y los asocia al evento
                        $departamento = Departamento::find($evento->departamento_id);
                        if ($departamento) {
                            $evento->users()->attach($departamento->users);
                        }
                    }
                    break;

                case 4: // Empresa
                    // Para eventos de empresa, todos los usuarios activos
                    $evento->users()->attach($users);
                    break;
            }
        });
    }
}

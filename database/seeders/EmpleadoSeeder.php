<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Genero;
use App\Models\Empleado;
use App\Models\Direccion;
use App\Models\TipoEmpleado;
use App\Models\TipoDocumento;
use App\Models\EstadoEmpleado;
use Illuminate\Database\Seeder;

class EmpleadoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtenemos todos los tipos de empleados disponibles
        $tipo_empleados = TipoEmpleado::all();

        // Obtenemos todos los géneros disponibles
        $generos = Genero::all();

        // Obtenemos todos los estado de empleados disponibles
        $estados = EstadoEmpleado::all();

        // Obtenemos todos los tipos de documentos disponibles
        $tipo_documentos = TipoDocumento::all();

        // Empleado::factory(20)->make()->each(function ($empleado) use ($tipo_empleados, $generos, $estados, $tipo_documentos) {
        Empleado::factory(100)->make()->each(function ($empleado) use ($tipo_empleados, $generos, $estados, $tipo_documentos) {
            $empleado->tipo_empleado_id = $tipo_empleados->random()->id;
            $empleado->genero_id = $generos->random()->id;
            $empleado->estado_id = $estados->random()->id;
            $empleado->tipo_documento_id = $tipo_documentos->random()->id;
            $empleado->direccion_id = Direccion::factory()->create()->id;
            $empleado->save();

            /** @var User $user */
            $user = User::factory()->withPersonalTeam()->create([
                'name' => $empleado->nombre . ' ' . $empleado->primer_apellido . ' ' . $empleado->segundo_apellido,
                'email' => $empleado->email,
                'password' => bcrypt('password'),
                'empleado_id' => $empleado->id,
            ]);

            // Generate a random number between 1 and 39
            $random_number = rand(1, 39);

            // Get Resources/images path 
            $path = resource_path('images/profiles/profile_' . $random_number . '.jpg');

            $user->updateProfilePhotoFromPath($path); // Update the user's profile photo
        });

        // Crear un empleado con datos específicos para pruebas
        $empleado = Empleado::factory()->create([
            'nombre' => 'David',
            'primer_apellido' => 'Villa',
            'segundo_apellido' => 'Maravilla',
            'tipo_empleado_id' => 1,
            'genero_id' => 1,
            'estado_id' => 1,
            'tipo_documento_id' => 1,
            'direccion_id' => Direccion::factory()->create()->id,
            'observaciones_salud' => 'Alergia a la penicilina. Requiere atención especial en caso de emergencia médica.',
        ]);

        $user = User::factory()->withPersonalTeam()->create([
            'name' => $empleado->nombre . ' ' . $empleado->primer_apellido . ' ' . $empleado->segundo_apellido,
            'email' => 'villamaravilla@example.com',
            'password' => bcrypt('password'),
            'empleado_id' => $empleado->id,
        ]);

        // Generate a random number between 1 and 39
        $random_number = rand(1, 39);

        // Get Resources/images path
        $path = resource_path('images/profiles/profile_' . $random_number . '.jpg');

        $user->updateProfilePhotoFromPath($path); // Update the user's profile photo
    }
}

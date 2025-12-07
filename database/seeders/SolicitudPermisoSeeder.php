<?php

namespace Database\Seeders;

use App\Enums\TipoAprobacion;
use App\Models\AprobacionSolicitudPermiso;
use App\Models\User;
use App\Models\Permiso;
use App\Models\Empleado;
use Illuminate\Support\Arr;
use Illuminate\Database\Seeder;
use App\Models\SolicitudPermiso;
use App\Models\EstadoSolicitudPermiso;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SolicitudPermisoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $empleados = Empleado::all();
        $estadoSolicitudesPermiso = EstadoSolicitudPermiso::all(['id']);
        $permisos = Permiso::all(['id']);

        $users = User::all()->pluck('id')->toArray();
        $tiposAprobacion = TipoAprobacion::getAllValues();

        $empleados->each(function ($empleado) use ($estadoSolicitudesPermiso, $permisos, $users, $tiposAprobacion) {

            // Generate a 25% chance of creating a permission request

            $numberPermissions = rand(0, 3);

            for ($i = 0; $i < $numberPermissions; $i++) {

                $intDays = rand(-365, 365); // Random number of days between -365 and 365

                $solicitud = SolicitudPermiso::factory()->create([
                    'empleado_id' => $empleado->id,
                    'estado_id' => $estadoSolicitudesPermiso->random()->id,
                    'permiso_id' => $permisos->random()->id,
                    'fecha_inicio' => $fecha_inicio = ($intDays > 0) ? now()->addDays($intDays) : now()->subDays($intDays),
                    'fecha_fin' => $fecha_inicio->copy()->addDays(rand(1, 15)),
                ]);

                // Generate a random number of approvals for the permission request between 0 and 3
                $numberAprobaciones = rand(0, 3);

                for ($j = 0, $approvals = []; $j < $numberAprobaciones; $j++) {

                    // Get an approval type that is not already in the approvals array
                    $tipoAprobacion = Arr::first($tiposAprobacion, function ($tipo) use ($approvals) {
                        return !in_array($tipo, $approvals);
                    });

                    // Add the approval type to the approvals array
                    $approvals[] = $tipoAprobacion;

                    AprobacionSolicitudPermiso::factory()->create([
                        'solicitud_permiso_id' => $solicitud->id,
                        'user_id' => Arr::random($users),
                        'tipo_aprobacion' => $tipoAprobacion,
                        'aprobado' => rand(0, 1),
                    ]);
                }

                // Assign an status to the request based on the approvals
                $solicitud->updateStatus();
            }
        });
    }
}

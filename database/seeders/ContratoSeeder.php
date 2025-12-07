<?php

namespace Database\Seeders;

use App\Models\Centro;
use App\Models\Empresa;
use App\Models\Jornada;
use App\Models\Contrato;
use App\Models\Empleado;
use App\Models\Asignacion;
use Illuminate\Support\Arr;
use App\Models\Departamento;
use App\Models\TipoContrato;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ContratoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $empleados = Empleado::all();
        $tiposContrato = TipoContrato::all();
        $asignaciones = Asignacion::all();
        $departamentos = Departamento::all();
        $centros = Centro::all();
        $empresas = Empresa::all();

        $empleados->each(function ($empleado) use ($tiposContrato, $asignaciones, $departamentos, $centros, $empresas) {

            // Generate a number of contracts between 1 and 3 for each employee
            $numContratos = Arr::random([1, 1, 2, 2, 2, 3, 3]);
            $ultimaFechaFin = null;

            for ($i = 0; $i < $numContratos; $i++) {
                // Para el primer contrato o si el anterior ya terminó
                if ($i === 0 || $ultimaFechaFin === null) {
                    // Contratos más realistas: entre 6 meses atrás y hoy
                    $fecha_inicio = now()->subMonths(rand(0, 6))->startOfMonth();
                } else {
                    // Contratos consecutivos: empiezan cuando termina el anterior
                    $fecha_inicio = $ultimaFechaFin->copy()->addDay();
                }

                // Determinar duración del contrato de forma más realista
                $duracionMeses = Arr::random([
                    3,
                    3,
                    6,
                    6,
                    6,
                    12,
                    12,
                    12,
                    18,
                    24  // Duraciones comunes en meses
                ]);

                // 70% de contratos tienen fecha fin, 30% son indefinidos
                if (rand(1, 10) <= 7) {
                    $fecha_fin = $fecha_inicio->copy()->addMonths($duracionMeses);

                    // Si la fecha fin es muy futura, limitarla a máximo 2 años desde hoy
                    if ($fecha_fin->gt(now()->addYears(2))) {
                        $fecha_fin = now()->addMonths(rand(1, 24));
                    }
                } else {
                    $fecha_fin = null; // Contrato indefinido
                }

                $ultimaFechaFin = $fecha_fin;

                Contrato::factory()->createWithAnexo([
                    'empleado_id' => $empleado->id,
                    'departamento_id' => $departamentos->random()->id,
                    'centro_id' => $centros->random()->id,
                    'empresa_id' => $empresas->random()->id,
                    'tipo_contrato_id' => $tiposContrato->random()->id,
                    'asignacion_id' => $asignaciones->random()->id,
                    'jornada_id' => Cache::remember('jornadas', now()->addDay(), function () {
                        return Jornada::all();
                    })->random()->id,
                    'fecha_inicio' => $fecha_inicio,
                    'fecha_fin' => $fecha_fin,
                ], 30);
            }
        });
    }
}

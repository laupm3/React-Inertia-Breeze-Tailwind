<?php

namespace App\Console\Commands;

use App\Models\Contrato;
use App\Models\Empleado;
use App\Models\TipoContrato;
use App\Models\Departamento;
use App\Models\Centro;
use App\Models\Jornada;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CrearContratosPruebaCommand extends Command
{
    protected $signature = 'contratos:crear-pruebas
                            {--vence-hoy : Crear un contrato que vence hoy}
                            {--vence-pronto=3 : Crear un contrato que vence en X días}
                            {--vence-pasado=5 : Crear un contrato que venció hace X días}';

    protected $description = 'Crea contratos de prueba para verificar el sistema de notificaciones de vencimiento';

    public function handle()
    {
        $this->info('Creando contratos de prueba...');

        try {
            // Verificar las columnas existentes en la tabla contratos
            $columnasContratos = Schema::getColumnListing('contratos');
            $this->info('Columnas disponibles en la tabla contratos: ' . implode(', ', $columnasContratos));

            // Verificar si existen empleados y tipos de contrato
            $empleados = Empleado::count();
            $tipoContratos = TipoContrato::count();
            $departamentos = Departamento::count();
            $centros = Centro::count();
            $jornadas = Jornada::count();

            if ($empleados === 0) {
                $this->error('No hay empleados en la base de datos. Crea algunos primero.');
                return Command::FAILURE;
            }

            if ($tipoContratos === 0) {
                $this->error('No hay tipos de contrato en la base de datos. Crea algunos primero.');
                return Command::FAILURE;
            }

            if ($departamentos === 0) {
                $this->error('No hay departamentos en la base de datos. Crea algunos primero.');
                return Command::FAILURE;
            }

            if ($centros === 0) {
                $this->error('No hay centros en la base de datos. Crea algunos primero.');
                return Command::FAILURE;
            }

            if ($jornadas === 0) {
                $this->error('No hay jornadas en la base de datos. Crea algunas primero.');
                return Command::FAILURE;
            }

            // Crear contrato que vence hoy
            if ($this->option('vence-hoy')) {
                $this->crearContratoVenceHoy($columnasContratos);
            }

            // Crear contrato que vence pronto
            $diasProximo = (int)$this->option('vence-pronto');
            if ($diasProximo > 0) {
                $this->crearContratoVenceProximo($diasProximo, $columnasContratos);
            }

            // Crear contrato que ya venció
            $diasPasado = (int)$this->option('vence-pasado');
            if ($diasPasado > 0) {
                $this->crearContratoVencido($diasPasado, $columnasContratos);
            }

            $this->info('Contratos de prueba creados exitosamente.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error al crear contratos de prueba: {$e->getMessage()}");
            $this->error("Línea: {$e->getLine()} en {$e->getFile()}");
            return Command::FAILURE;
        }
    }

    private function crearContratoVenceHoy(array $columnasDisponibles)
    {
        $empleado = Empleado::inRandomOrder()->first();
        $tipoContrato = TipoContrato::inRandomOrder()->first();
        $departamento = Departamento::inRandomOrder()->first();
        $centro = Centro::inRandomOrder()->first();
        $jornada = Jornada::inRandomOrder()->first();

        // Obtener una asignación al azar si es necesario
        $asignacionId = null;
        if (in_array('asignacion_id', $columnasDisponibles)) {
            $asignacionId = $this->getOrCreateAsignacion();
        }

        // Obtener una empresa al azar si es necesario
        $empresaId = null;
        if (in_array('empresa_id', $columnasDisponibles)) {
            $empresaId = $this->getOrCreateEmpresa();
        }

        $contrato = new Contrato();

        // Agregar solo los campos que existen en la tabla
        if (in_array('empleado_id', $columnasDisponibles)) {
            $contrato->empleado_id = $empleado->id;
        }

        if (in_array('tipo_contrato_id', $columnasDisponibles)) {
            $contrato->tipo_contrato_id = $tipoContrato->id;
        }

        if (in_array('departamento_id', $columnasDisponibles)) {
            $contrato->departamento_id = $departamento->id;
        }

        if (in_array('centro_id', $columnasDisponibles)) {
            $contrato->centro_id = $centro->id;
        }

        if (in_array('jornada_id', $columnasDisponibles)) {
            $contrato->jornada_id = $jornada->id;
        }

        if (in_array('asignacion_id', $columnasDisponibles) && $asignacionId) {
            $contrato->asignacion_id = $asignacionId;
        }

        if (in_array('empresa_id', $columnasDisponibles) && $empresaId) {
            $contrato->empresa_id = $empresaId;
        }

        if (in_array('fecha_inicio', $columnasDisponibles)) {
            $contrato->fecha_inicio = Carbon::now()->subMonths(3);
        }

        if (in_array('fecha_fin', $columnasDisponibles)) {
            $contrato->fecha_fin = Carbon::today();
        }

        if (in_array('n_expediente', $columnasDisponibles)) {
            $contrato->n_expediente = 'TEST-HOY-' . rand(1000, 9999);
        }

        try {
            $contrato->save();
            $this->info("Contrato creado con ID: {$contrato->id}, vence hoy: {$contrato->fecha_fin->format('Y-m-d')}");
            $this->info("Empleado: {$empleado->nombre} {$empleado->apellido} (ID: {$empleado->id})");
        } catch (\Exception $e) {
            $this->error("Error al guardar contrato: {$e->getMessage()}");

            // Analizar el error para determinar qué campos obligatorios faltan
            $errorMsg = $e->getMessage();
            if (strpos($errorMsg, 'constraint failed') !== false) {
                preg_match('/failed: (\w+)\.(\w+)/', $errorMsg, $matches);
                if (isset($matches[2])) {
                    $missingField = $matches[2];
                    $this->warn("Campo obligatorio no proporcionado: {$missingField}");

                    // Intentar crear un valor para el campo faltante
                    $this->crearValorParaCampoFaltante($contrato, $missingField);

                    // Intentar guardar nuevamente
                    try {
                        $contrato->save();
                        $this->info("Contrato creado con ID: {$contrato->id} después de agregar {$missingField}");
                    } catch (\Exception $retryE) {
                        $this->error("Error al guardar contrato después de agregar {$missingField}: {$retryE->getMessage()}");
                    }
                }
            }
        }
    }

    private function crearContratoVenceProximo(int $dias, array $columnasDisponibles)
    {
        $empleado = Empleado::inRandomOrder()->first();
        $tipoContrato = TipoContrato::inRandomOrder()->first();
        $departamento = Departamento::inRandomOrder()->first();
        $centro = Centro::inRandomOrder()->first();
        $jornada = Jornada::inRandomOrder()->first();

        // Obtener una asignación al azar si es necesario
        $asignacionId = null;
        if (in_array('asignacion_id', $columnasDisponibles)) {
            $asignacionId = $this->getOrCreateAsignacion();
        }

        // Obtener una empresa al azar si es necesario
        $empresaId = null;
        if (in_array('empresa_id', $columnasDisponibles)) {
            $empresaId = $this->getOrCreateEmpresa();
        }

        $contrato = new Contrato();

        // Agregar solo los campos que existen en la tabla
        if (in_array('empleado_id', $columnasDisponibles)) {
            $contrato->empleado_id = $empleado->id;
        }

        if (in_array('tipo_contrato_id', $columnasDisponibles)) {
            $contrato->tipo_contrato_id = $tipoContrato->id;
        }

        if (in_array('departamento_id', $columnasDisponibles)) {
            $contrato->departamento_id = $departamento->id;
        }

        if (in_array('centro_id', $columnasDisponibles)) {
            $contrato->centro_id = $centro->id;
        }

        if (in_array('jornada_id', $columnasDisponibles)) {
            $contrato->jornada_id = $jornada->id;
        }

        if (in_array('asignacion_id', $columnasDisponibles) && $asignacionId) {
            $contrato->asignacion_id = $asignacionId;
        }

        if (in_array('empresa_id', $columnasDisponibles) && $empresaId) {
            $contrato->empresa_id = $empresaId;
        }

        if (in_array('fecha_inicio', $columnasDisponibles)) {
            $contrato->fecha_inicio = Carbon::now()->subMonths(1);
        }

        if (in_array('fecha_fin', $columnasDisponibles)) {
            $contrato->fecha_fin = Carbon::today()->addDays($dias);
        }

        if (in_array('n_expediente', $columnasDisponibles)) {
            $contrato->n_expediente = "TEST-PROX{$dias}-" . rand(1000, 9999);
        }

        try {
            $contrato->save();
            $this->info("Contrato creado con ID: {$contrato->id}, vence en {$dias} días: {$contrato->fecha_fin->format('Y-m-d')}");
            $this->info("Empleado: {$empleado->nombre} {$empleado->apellido} (ID: {$empleado->id})");
        } catch (\Exception $e) {
            $this->error("Error al guardar contrato: {$e->getMessage()}");

            // Analizar el error para determinar qué campos obligatorios faltan
            $errorMsg = $e->getMessage();
            if (strpos($errorMsg, 'constraint failed') !== false) {
                preg_match('/failed: (\w+)\.(\w+)/', $errorMsg, $matches);
                if (isset($matches[2])) {
                    $missingField = $matches[2];
                    $this->warn("Campo obligatorio no proporcionado: {$missingField}");

                    // Intentar crear un valor para el campo faltante
                    $this->crearValorParaCampoFaltante($contrato, $missingField);

                    // Intentar guardar nuevamente
                    try {
                        $contrato->save();
                        $this->info("Contrato creado con ID: {$contrato->id} después de agregar {$missingField}");
                    } catch (\Exception $retryE) {
                        $this->error("Error al guardar contrato después de agregar {$missingField}: {$retryE->getMessage()}");
                    }
                }
            }
        }
    }

    private function crearContratoVencido(int $dias, array $columnasDisponibles)
    {
        $empleado = Empleado::inRandomOrder()->first();
        $tipoContrato = TipoContrato::inRandomOrder()->first();
        $departamento = Departamento::inRandomOrder()->first();
        $centro = Centro::inRandomOrder()->first();
        $jornada = Jornada::inRandomOrder()->first();

        // Obtener una asignación al azar si es necesario
        $asignacionId = null;
        if (in_array('asignacion_id', $columnasDisponibles)) {
            $asignacionId = $this->getOrCreateAsignacion();
        }

        // Obtener una empresa al azar si es necesario
        $empresaId = null;
        if (in_array('empresa_id', $columnasDisponibles)) {
            $empresaId = $this->getOrCreateEmpresa();
        }

        $contrato = new Contrato();

        // Agregar solo los campos que existen en la tabla
        if (in_array('empleado_id', $columnasDisponibles)) {
            $contrato->empleado_id = $empleado->id;
        }

        if (in_array('tipo_contrato_id', $columnasDisponibles)) {
            $contrato->tipo_contrato_id = $tipoContrato->id;
        }

        if (in_array('departamento_id', $columnasDisponibles)) {
            $contrato->departamento_id = $departamento->id;
        }

        if (in_array('centro_id', $columnasDisponibles)) {
            $contrato->centro_id = $centro->id;
        }

        if (in_array('jornada_id', $columnasDisponibles)) {
            $contrato->jornada_id = $jornada->id;
        }

        if (in_array('asignacion_id', $columnasDisponibles) && $asignacionId) {
            $contrato->asignacion_id = $asignacionId;
        }

        if (in_array('empresa_id', $columnasDisponibles) && $empresaId) {
            $contrato->empresa_id = $empresaId;
        }

        if (in_array('fecha_inicio', $columnasDisponibles)) {
            $contrato->fecha_inicio = Carbon::now()->subMonths(6);
        }

        if (in_array('fecha_fin', $columnasDisponibles)) {
            $contrato->fecha_fin = Carbon::today()->subDays($dias);
        }

        if (in_array('n_expediente', $columnasDisponibles)) {
            $contrato->n_expediente = "TEST-PAST{$dias}-" . rand(1000, 9999);
        }

        try {
            $contrato->save();
            $this->info("Contrato creado con ID: {$contrato->id}, venció hace {$dias} días: {$contrato->fecha_fin->format('Y-m-d')}");
            $this->info("Empleado: {$empleado->nombre} {$empleado->apellido} (ID: {$empleado->id})");
        } catch (\Exception $e) {
            $this->error("Error al guardar contrato: {$e->getMessage()}");

            // Analizar el error para determinar qué campos obligatorios faltan
            $errorMsg = $e->getMessage();
            if (strpos($errorMsg, 'constraint failed') !== false) {
                preg_match('/failed: (\w+)\.(\w+)/', $errorMsg, $matches);
                if (isset($matches[2])) {
                    $missingField = $matches[2];
                    $this->warn("Campo obligatorio no proporcionado: {$missingField}");

                    // Intentar crear un valor para el campo faltante
                    $this->crearValorParaCampoFaltante($contrato, $missingField);

                    // Intentar guardar nuevamente
                    try {
                        $contrato->save();
                        $this->info("Contrato creado con ID: {$contrato->id} después de agregar {$missingField}");
                    } catch (\Exception $retryE) {
                        $this->error("Error al guardar contrato después de agregar {$missingField}: {$retryE->getMessage()}");
                    }
                }
            }
        }

        $this->info("Contrato creado con ID: {$contrato->id}, venció hace {$dias} días: {$contrato->fecha_fin->format('Y-m-d')}");
        $this->info("Empleado: {$empleado->nombre} {$empleado->apellido} (ID: {$empleado->id})");
    }

    /**
     * Intenta crear un valor para un campo faltante en un contrato
     */
    private function crearValorParaCampoFaltante(Contrato $contrato, string $campoFaltante): void
    {
        $this->info("Intentando crear valor para el campo: {$campoFaltante}");

        switch ($campoFaltante) {
            case 'asignacion_id':
                $asignacionId = $this->getOrCreateAsignacion();
                if ($asignacionId) {
                    $contrato->asignacion_id = $asignacionId;
                }
                break;

            case 'empresa_id':
                $empresaId = $this->getOrCreateEmpresa();
                if ($empresaId) {
                    $contrato->empresa_id = $empresaId;
                }
                break;

            // Agregar más casos según sea necesario
            default:
                $this->warn("No hay manejador para el campo faltante: {$campoFaltante}");
                break;
        }
    }

    /**
     * Obtiene una asignación existente o crea una nueva
     *
     * @return int|null ID de la asignación o null en caso de error
     */
    private function getOrCreateAsignacion(): ?int
    {
        try {
            // Verificar si la tabla existe
            if (Schema::hasTable('asignaciones')) {
                // Intentar obtener una asignación existente
                $asignacion = DB::table('asignaciones')->inRandomOrder()->first();

                if ($asignacion) {
                    $this->info("Usando asignación existente con id = {$asignacion->id}");
                    return $asignacion->id;
                } else {
                    // Crear una nueva asignación
                    $nombre = 'Asignación de prueba ' . rand(1000, 9999);
                    $asignacionId = DB::table('asignaciones')->insertGetId([
                        'nombre' => $nombre,
                        'descripcion' => 'Asignación creada automáticamente para pruebas',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    $this->info("Creada nueva asignación con id = {$asignacionId}");
                    return $asignacionId;
                }
            } else {
                $this->error("La tabla 'asignaciones' no existe en la base de datos");
                return null;
            }
        } catch (\Exception $e) {
            $this->error("Error al obtener/crear asignación: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Obtiene una empresa existente o crea una nueva
     *
     * @return int|null ID de la empresa o null en caso de error
     */
    private function getOrCreateEmpresa(): ?int
    {
        try {
            // Verificar si la tabla existe
            if (Schema::hasTable('empresas')) {
                // Intentar obtener una empresa existente
                $empresa = DB::table('empresas')->inRandomOrder()->first();

                if ($empresa) {
                    $this->info("Usando empresa existente con id = {$empresa->id}");
                    return $empresa->id;
                } else {
                    // Crear una nueva empresa con los campos mínimos requeridos
                    $nombre = 'Empresa de prueba ' . rand(1000, 9999);
                    $empresaId = DB::table('empresas')->insertGetId([
                        'nombre' => $nombre,
                        'siglas' => substr($nombre, 0, 3) . rand(10, 99),
                        'cif' => 'B' . rand(10000000, 99999999),
                        'email' => 'empresa' . rand(1000, 9999) . '@test.com',
                        'telefono' => '+34' . rand(600000000, 699999999),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    $this->info("Creada nueva empresa con id = {$empresaId}");
                    return $empresaId;
                }
            } else {
                $this->error("La tabla 'empresas' no existe en la base de datos");
                return null;
            }
        } catch (\Exception $e) {
            $this->error("Error al obtener/crear empresa: {$e->getMessage()}");
            return null;
        }
    }
}

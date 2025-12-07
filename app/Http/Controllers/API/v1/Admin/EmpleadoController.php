<?php

namespace App\Http\Controllers\API\v1\Admin;

use Carbon\Carbon;
use App\Models\Genero;
use App\Models\Permiso;
use App\Models\Contrato;
use App\Models\Empleado;
use App\Models\Direccion;
use Illuminate\Support\Arr;
use App\Models\TipoEmpleado;
use App\Models\TipoDocumento;
use Illuminate\Http\Response;
use App\Models\EstadoEmpleado;
use App\Models\SolicitudPermiso;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\Empleado\EmpleadoUserService;
use App\Events\Empleado\EmployeeCreated;
use App\Events\Empleado\EmployeeUpdated;
use App\Http\Resources\ContratoResource;
use App\Http\Resources\EmpleadoResource;
use App\Http\Resources\EmpleadoAdminResource;
use App\Http\Resources\TipoEmpleadoResource;
use App\Http\Resources\TipoDocumentoResource;
use App\Http\Resources\EstadoEmpleadoResource;
use App\Http\Resources\GeneroEmpleadoResource;
use App\Http\Requests\Empleado\EmpleadoShowRequest;
use App\Http\Requests\Empleado\EmpleadoIndexRequest;
use App\Http\Requests\Empleado\EmpleadoStoreRequest;
use App\Http\Requests\Empleado\EmpleadoUpdateRequest;
use App\Http\Requests\Empleado\EmpleadoDestroyRequest;
use App\Http\Requests\Empleado\ContratosEmpleadoRequest;
use App\Http\Requests\Empleado\AvailableContractsRequest;
use App\Http\Requests\Empleado\GetPermisoUsageStatsRequest;
use App\Services\SolicitudPermiso\SolicitudPermisoValidationService;
use Illuminate\Support\Facades\Auth;

class EmpleadoController extends Controller
{
    protected $empleadoUserService;

    public function __construct(EmpleadoUserService $empleadoUserService)
    {
        $this->empleadoUserService = $empleadoUserService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(EmpleadoIndexRequest $request)
    {
        $query = Empleado::with(Empleado::RELATIONSHIPS);

        $empleados = $query->get();

        // Determinar si el usuario puede ver observaciones de salud
        $canViewHealthObservations = $request->user()->hasRole(['Administrator', 'Super Admin']);

        return response()->json(status: Response::HTTP_OK, data: [
            'empleados' => EmpleadoResource::collection($empleados)->values(),
            'canViewHealthObservations' => $canViewHealthObservations
        ]);
    }



    /**
     * Store a newly created employee in storage.
     *
     * @param EmpleadoStoreRequest $request Validated request with employee data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(EmpleadoStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $direccionData = Arr::get($validated, 'direccion');
            $direccion = Direccion::create($direccionData);

            if (!$direccion) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al crear la dirección.'
                ]);
            }

            $empleadoData = [
                ...Arr::except($validated, ['direccion', 'user_id', 'create_user']),
                'direccion_id' => $direccion->id
            ];

            $empleado = Empleado::create($empleadoData);

            if (!$empleado) {
                return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                    'message' => 'No se ha podido crear el empleado.'
                ]);
            }
            // Metodo para manejar el usuario para el empleado 
            try {
                $user = $this->empleadoUserService->handleUserForEmpleado($empleado, $validated);
            } catch (\Exception $e) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al manejar el usuario: ' . $e->getMessage()
                ]);
            }

            event(new EmployeeCreated($empleado));

            $empleado->load(Empleado::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Empleado creado correctamente.',
                'empleado' => new EmpleadoResource($empleado)
            ]);
        });
    }

    /**
     * Display a specific employee with its relationships
     * 
     * @param EmpleadoShowRequest $request
     * @param Empleado $empleado
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(EmpleadoShowRequest $request, Empleado $empleado)
    {
        $empleado->load([
            ...Empleado::RELATIONSHIPS,
            'genero',
            'direccion',
            'contratos.asignacion'
        ]);

        return response()->json(status: Response::HTTP_OK, data: [
            'empleado' => new EmpleadoResource($empleado)
        ]);
    }

    /**
     * Update the specified employee in storage.
     *
     * @param EmpleadoUpdateRequest $request Validated request with updated employee data
     * @param Empleado $empleado The employee to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(EmpleadoUpdateRequest $request, Empleado $empleado)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $empleado) {
            $direccionData = Arr::get($validated, 'direccion');
            $direccion = Direccion::find($direccionData['id']);

            if (!$direccion) {
                return response()->json(status: Response::HTTP_NOT_FOUND, data: [
                    'message' => 'No se ha encontrado la dirección asociada al centro.'
                ]);
            }

            $direccionUpdateResult = $direccion->update($direccionData);

            if (!$direccionUpdateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar la dirección.'
                ]);
            }

            $empleadoData = [
                ...Arr::except($validated, ['direccion', 'user_id', 'create_user', 'remove_user']),
                'direccion_id' => $direccionData['id']
            ];

            $updateResult = $empleado->update($empleadoData);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el empleado.'
                ]);
            }

            // Metodo para manejar el usuario para el empleado 
            try {
                $user = $this->empleadoUserService->handleUserUpdateForEmpleado($empleado, $validated);
            } catch (\Exception $e) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al manejar el usuario: ' . $e->getMessage()
                ]);
            }

            event(new EmployeeUpdated($empleado, $empleadoData));

            $empleado->load(Empleado::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Empleado actualizado correctamente.',
                'empleado' => new EmpleadoResource($empleado)
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmpleadoDestroyRequest $request, Empleado $empleado)
    {
        return DB::transaction(function () use ($empleado) {
            $empleado->load('direccion');
            $direccion = $empleado->direccion;

            $deleteResult = $empleado->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar el empleado.'
                ]);
            }

            if ($direccion) {
                $direccionDeleteResult = $direccion->delete();

                if (!$direccionDeleteResult) {
                    return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                        'message' => 'Empleado eliminado pero no se pudo eliminar la dirección asociada.'
                    ]);
                }
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Empleado eliminado correctamente.'
            ]);
        });
    }

    /**
     * Display genders for employees - Response is a JSON object, not a view.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function genders()
    {
        $generos = Genero::all();

        return response()->json(status: Response::HTTP_OK, data: [
            'generos' => GeneroEmpleadoResource::collection($generos)->values()
        ]);
    }

    /**
     * Display status for employees - Response is a JSON object, not a view.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function statuses()
    {
        $estados = EstadoEmpleado::all();

        return response()->json(status: Response::HTTP_OK, data: [
            'estados' => EstadoEmpleadoResource::collection($estados)->values()
        ]);
    }

    /**
     * Display employee types - Response is a JSON object, not a view.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function types()
    {
        $tipos = TipoEmpleado::all();

        return response()->json(status: Response::HTTP_OK, data: [
            'tipos' => TipoEmpleadoResource::collection($tipos)->values()
        ]);
    }

    /**
     * Display document types - Response is a JSON object, not a view.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function typeDocuments()
    {
        $tipoDocumentos = TipoDocumento::all();

        return response()->json(status: Response::HTTP_OK, data: [
            'tipoDocumentos' => TipoDocumentoResource::collection($tipoDocumentos)->values()
        ]);
    }

    /**
     * Display a specific employee with information about their contracts.
     * 
     * @param ContratosEmpleadoRequest $request
     * @param Empleado $empleado
     * @return \Illuminate\Http\JsonResponse
     */
    public function contratos(ContratosEmpleadoRequest $request, Empleado $empleado)
    {
        $empleado->load([
            'user',
            'estadoEmpleado',
            'contratos.empresa',
            'contratos.tipoContrato',
            'contratos.asignacion',
            'contratos.departamento',
            'contratos.centro',
            'contratos.anexos.jornada.esquema',
            'contratos.jornada.esquema'
        ]);

        return response()->json(status: Response::HTTP_OK, data: [
            'empleado' => new EmpleadoResource($empleado)
        ]);
    }

    /**
     * Display a list of resources based on the employee type - Response is a JSON object, not a view.
     * 
     * Use an estandar response for API resources, with validations and error handling.
     * 
     * @param  string  $id
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchByType(string $typeId)
    {
        $tipoEmpleado = TipoEmpleado::find((int) $typeId);

        if (!$tipoEmpleado) {
            return response()->json([], Response::HTTP_NOT_FOUND);
        }

        $empleados = Empleado::with(['user'])->where('tipo_empleado_id', $tipoEmpleado->id)->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'empleados' => EmpleadoResource::collection($empleados)
        ]);
    }

    /**
     * Get available contracts for empleados in specified date ranges.
     * 
     * @param AvailableContractsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableContracts(AvailableContractsRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $empleados = $request->getValidatedEmpleados();
            $empleadoIds = $request->getEmpleadoIds();
            $dateRange = $request->getDateRange();

            // Query optimizada: Una sola consulta para todos los contratos
            /**
             * @var \Illuminate\Database\Eloquent\Collection<Contrato> $contratos
             */
            $contratos = Contrato::with(['anexos' => function ($query) use ($dateRange) {
                // Solo anexos que intersecten con el rango de fechas
                $query->where(function ($q) use ($dateRange) {
                    $q->where('fecha_inicio', '<=', $dateRange['max'])
                        ->where(function ($subq) use ($dateRange) {
                            $subq->where('fecha_fin', '>=', $dateRange['min'])
                                ->orWhereNull('fecha_fin');
                        });
                });
            }])
                ->whereIn('empleado_id', $empleadoIds)
                ->where('fecha_inicio', '<=', $dateRange['max'])
                ->where(function ($query) use ($dateRange) {
                    $query->where('fecha_fin', '>=', $dateRange['min'])
                        ->orWhereNull('fecha_fin');
                })
                ->get();

            // Procesar disponibilidad por empleado y fecha
            $disponibilidad = [];

            foreach ($empleados as $empleadoData) {
                $empleadoId = $empleadoData['empleado_id'];
                $fechas = $empleadoData['fechas'];

                $contratosEmpleado = $contratos
                    ->load(['asignacion', 'departamento', 'centro', 'tipoContrato'])
                    ->where('empleado_id', $empleadoId);

                foreach ($fechas as $fecha) {
                    $contratosDisponibles = $this->findAvailableContractsForDate(
                        $contratosEmpleado,
                        $fecha
                    );

                    // Usar ContratoResource para formatear la respuesta
                    $disponibilidad[$empleadoId][$fecha->format('Y-m-d')] =
                        ContratoResource::collection($contratosDisponibles);
                }
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'disponibilidad' => $disponibilidad,
                'total_empleados' => count($empleados),
                'total_fechas_unicas' => collect($empleados)
                    ->pluck('fechas')
                    ->flatten()
                    ->unique()
                    ->count(),
                'message' => 'Consulta de contratos disponibles realizada correctamente.'
            ]);
        });
    }

    /**
     * Find available contracts for a specific date.
     * 
     * @param \Illuminate\Database\Eloquent\Collection $contratos
     * @param \Carbon\Carbon $fecha
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function findAvailableContractsForDate($contratos, $fecha)
    {
        return $contratos->filter(function ($contrato) use ($fecha) {
            return $this->isContractAvailableForDate($contrato, $fecha);
        });
    }

    /**
     * Check if a contract is available for a specific date.
     * 
     * @param \App\Models\Contrato $contract
     * @param \Carbon\Carbon $fecha
     * @return bool
     */
    private function isContractAvailableForDate($contract, $fecha)
    {
        $inicio = \Carbon\Carbon::parse($contract->fecha_inicio);
        $fin = $contract->fecha_fin ? \Carbon\Carbon::parse($contract->fecha_fin) : null;

        return $fecha->gte($inicio) && ($fin === null || $fecha->lte($fin));
    }

    /**
     * Get usage statistics for a specific permission by an employee.
     */
    public function getPermisoUsageStats(GetPermisoUsageStatsRequest $request, Empleado $empleado, Permiso $permiso)
    {
        $solicitudPermisoValidationService = app(SolicitudPermisoValidationService::class);

        $yearsInvolved = $solicitudPermisoValidationService->getYearsInvolved(
            fechaInicio: Carbon::parse($request->fecha_inicio),
            fechaFin: Carbon::parse($request->fecha_fin)
        );

        $stats = $solicitudPermisoValidationService->getPermisoUsageStatsForMultipleYears(
            $empleado,
            $permiso,
            years: $yearsInvolved
        );

        return response()->json(status: Response::HTTP_OK, data: [
            'empleado' => new EmpleadoResource($empleado),
            'permiso' => $permiso,
            'stats' => $stats
        ]);
    }
}

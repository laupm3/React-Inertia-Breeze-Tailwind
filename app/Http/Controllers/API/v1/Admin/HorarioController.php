<?php

namespace App\Http\Controllers\API\v1\Admin;

use DateTimeZone;
use Carbon\Carbon;
use App\Models\Horario;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\Horario\HorarioBulkShowRequest;
use App\Http\Requests\Horario\HorarioDeleteRequest;
use App\Http\Requests\Horario\HorarioIndexRequest;
use App\Http\Requests\Horario\HorarioShowRequest;
use App\Http\Requests\Horario\HorarioStoreRequest;
use App\Http\Requests\Horario\HorarioUpdateRequest;
use App\Http\Resources\HorarioResource;
use Illuminate\Support\Facades\Log;

class HorarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(HorarioIndexRequest $request)
    {
        $from = $request->query('from', now(tz: new DateTimeZone('Europe/Madrid'))->startOfWeek());
        $to = $request->query('to', now(tz: new DateTimeZone('Europe/Madrid'))->endOfWeek());

        $from = (!$from instanceof Carbon) ? Carbon::parse($from, new DateTimeZone('Europe/Madrid'))->startOfDay() : $from;
        $to = (!$to instanceof Carbon) ? Carbon::parse($to, new DateTimeZone('Europe/Madrid'))->endOfDay() : $to;

        $horarios = Horario::with(Horario::RELATIONSHIPS)
            ->whereBetween('horario_inicio', [$from, $to])
            ->orderBy('horario_inicio')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'horarios' => HorarioResource::collection($horarios)->values(),
        ]);
    }

    /**
     * Display a specific resource with its relationships
     * 
     * @param HorarioShowRequest $request
     * @param Horario $horario
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(HorarioShowRequest $request, Horario $horario)
    {
        $horario->load(Horario::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'horario' => new HorarioResource($horario),
        ]);
    }

    /**
     * Display multiple horarios based on IDs from the request - Used for bulk read operations.
     * 
     * @param HorarioBulkShowRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkShow(HorarioBulkShowRequest $request): \Illuminate\Http\JsonResponse
    {
        $horarios = $request->getValidatedHorarios();

        Log::info('horarios', $horarios->toArray());
        return response()->json(status: Response::HTTP_OK, data: [
            'horarios' => HorarioResource::collection($horarios)->values(),
        ]);
    }

    /**
     * Create multiple horarios in storage via bulk operation.
     * Validates contract dates and determines if horarios belong to contract or anexo.
     * 
     * @param HorarioStoreRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkStore(HorarioStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {
            // Obtener contratos validados y datos desde el Request
            $validatedContratos = $request->getValidatedContratos();
            $horariosData = $request->getHorarioData();

            $createdHorarios = collect();
            $creationErrors = collect();

            foreach ($horariosData as $index => $horarioData) {
                try {
                    $contrato = $validatedContratos->get($horarioData['contrato_id']);

                    // Determinar si el horario pertenece al contrato o a un anexo
                    $horarioAssignment = $this->determineHorarioAssignment($contrato, $horarioData);

                    // Crear el horario con la asignación determinada
                    $horario = Horario::create([
                        'contrato_id' => $horarioAssignment['contrato_id'],
                        'anexo_id' => $horarioAssignment['anexo_id'],
                        'modalidad_id' => $horarioData['modalidad_id'],
                        'estado_horario_id' => $horarioData['estado_horario_id'],
                        'turno_id' => $horarioData['turno_id'],
                        'horario_inicio' => $horarioData['horario_inicio'],
                        'horario_fin' => $horarioData['horario_fin'],
                        'descanso_inicio' => $horarioData['descanso_inicio'] ?? null,
                        'descanso_fin' => $horarioData['descanso_fin'] ?? null,
                        'observaciones' => $horarioData['observaciones'] ?? null,
                    ]);

                    $createdHorarios->push($horario);
                } catch (\Exception $e) {
                    $creationErrors->push([
                        'index' => $index,
                        'error' => $e->getMessage(),
                        'data' => $horarioData
                    ]);
                }
            }

            // Verificar si hubo errores en las creaciones
            if ($creationErrors->isNotEmpty()) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al crear algunos horarios.',
                    'errors' => $creationErrors->toArray(),
                ]);
            }

            // Cargar todas las relaciones de una vez al final (mucho más eficiente)
            $createdHorarioIds = $createdHorarios->pluck('id');
            $horariosWithRelations = Horario::with(Horario::RELATIONSHIPS)
                ->whereIn('id', $createdHorarioIds)
                ->get();

            return response()->json(status: Response::HTTP_CREATED, data: [
                'horarios' => HorarioResource::collection($horariosWithRelations)->values(),
                'message' => 'Horarios creados correctamente.',
                'created_count' => $createdHorarios->count(),
            ]);
        });
    }

    /**
     * Update multiple horarios in storage via bulk operation.
     * 
     * @param HorarioUpdateRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkUpdate(HorarioUpdateRequest $request)
    {
        return DB::transaction(function () use ($request) {
            // Obtener horarios validados y datos desde el Request
            $existingHorarios = $request->getValidatedHorarios();
            $horariosData = collect($request->getHorarioData())->keyBy('id');

            $updateErrors = collect();

            $existingHorarios->each(function ($horario) use ($horariosData, $updateErrors) {
                $horarioData = $horariosData->get($horario->id);

                $updateResult = $horario->update([
                    'turno_id' => $horarioData['turno_id'],
                    'modalidad_id' => $horarioData['modalidad_id'],
                    'estado_horario_id' => $horarioData['estado_horario_id'],
                    'horario_inicio' => $horarioData['horario_inicio'],
                    'horario_fin' => $horarioData['horario_fin'],
                    'descanso_inicio' => $horarioData['descanso_inicio'] ?? null,
                    'descanso_fin' => $horarioData['descanso_fin'] ?? null,
                    'observaciones' => $horarioData['observaciones'] ?? null,
                ]);

                if (!$updateResult) {
                    $updateErrors->push($horario->id);
                }
            });

            // Verificar si hubo errores en las actualizaciones
            if ($updateErrors->isNotEmpty()) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => "Error al actualizar los horarios con IDs: {$updateErrors->implode(', ')}.",
                ],);
            }

            // Cargar todas las relaciones de una vez al final (mucho más eficiente)
            $updatedHorarioIds = $existingHorarios->pluck('id');
            $horariosWithRelations = Horario::with(Horario::RELATIONSHIPS)
                ->whereIn('id', $updatedHorarioIds)
                ->get();

            return response()->json(status: Response::HTTP_OK, data: [
                'horarios' => HorarioResource::collection($horariosWithRelations)->values(),
                'message' => 'Horarios actualizados correctamente.',
            ]);
        });
    }

    /**
     * Destroy multiple horarios via bulk operation.
     * 
     * @param HorarioDeleteRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkDestroy(HorarioDeleteRequest $request)
    {
        return DB::transaction(function () use ($request) {
            // Obtener horarios validados desde el Request
            $existingHorarios = $request->getValidatedHorarios();
            $horarioIds = $request->getHorarioIds();

            $deleteErrors = collect();

            // Eliminar cada horario individualmente para tener control sobre errores
            $existingHorarios->each(function ($horario) use ($deleteErrors) {
                try {
                    $deleteResult = $horario->delete();

                    if (!$deleteResult) {
                        $deleteErrors->push($horario->id);
                    }
                } catch (\Exception $e) {
                    $deleteErrors->push($horario->id);
                }
            });

            // Verificar si hubo errores en las eliminaciones
            if ($deleteErrors->isNotEmpty()) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => "Error al eliminar los horarios con IDs: {$deleteErrors->implode(', ')}.",
                ]);
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'deleted_ids' => $horarioIds,
                'message' => 'Horarios eliminados correctamente.',
            ]);
        });
    }

    /**
     * Determine if a horario belongs to the main contract or to an anexo.
     * 
     * @param \App\Models\Contrato $contrato
     * @param array $horarioData
     * @return array
     */
    private function determineHorarioAssignment($contrato, $horarioData)
    {
        $horarioInicio = Carbon::parse($horarioData['horario_inicio']);
        $horarioFin = Carbon::parse($horarioData['horario_fin']);

        // First, check if the horario fits within any anexo period
        foreach ($contrato->anexos as $anexo) {
            if ($this->isHorarioWithinPeriod($anexo, $horarioInicio, $horarioFin)) {
                return [
                    'contrato_id' => $contrato->id,
                    'anexo_id' => $anexo->id,
                ];
            }
        }

        // If not within any anexo, check if it's within the main contract period
        if ($this->isHorarioWithinPeriod($contrato, $horarioInicio, $horarioFin)) {
            return [
                'contrato_id' => $contrato->id,
                'anexo_id' => null,
            ];
        }

        // This should not happen as validation should catch it, but as a fallback
        throw new \Exception("El horario no está dentro de ningún periodo válido del contrato o sus anexos.");
    }

    /**
     * Check if the horario dates are within the given entity's period.
     * 
     * @param mixed $entity (Contrato or Anexo)
     * @param \Carbon\Carbon $horarioInicio
     * @param \Carbon\Carbon $horarioFin
     * @return bool
     */
    private function isHorarioWithinPeriod($entity, $horarioInicio, $horarioFin): bool
    {
        // fecha_inicio is mandatory for all entities
        $entityInicio = \Carbon\Carbon::parse($entity->fecha_inicio);

        // fecha_fin is optional - null means indefinite duration
        $entityFin = $entity->fecha_fin ? \Carbon\Carbon::parse($entity->fecha_fin) : null;

        // Horario must start after or on the entity's start date
        $startValid = $horarioInicio->gte($entityInicio);

        // If no end date is defined (indefinite), horario is valid
        // Otherwise, horario must end before or on the entity's end date
        $endValid = !$entityFin || $horarioFin->lte($entityFin);

        return $startValid && $endValid;
    }

    /**
     * Create a single horario in storage.
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        return response()->json(status: Response::HTTP_NOT_IMPLEMENTED, data: [
            'message' => 'Creación individual no implementada. Use bulk-create para múltiples horarios.',
        ]);
    }

    /**
     * Update a single horario in storage.
     * 
     * @param \Illuminate\Http\Request $request
     * @param Horario $horario
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Horario $horario)
    {
        return response()->json(status: Response::HTTP_NOT_IMPLEMENTED, data: [
            'message' => 'Actualización individual no implementada. Use bulk-update para múltiples horarios.',
        ]);
    }

    /**
     * Delete a single horario in storage.
     * 
     * @param \Illuminate\Http\Request $request
     * @param Horario $horario
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, Horario $horario)
    {
        return response()->json(status: Response::HTTP_NOT_IMPLEMENTED, data: [
            'message' => 'Eliminación individual no implementada. Use bulk-delete para múltiples horarios.',
        ]);
    }
}

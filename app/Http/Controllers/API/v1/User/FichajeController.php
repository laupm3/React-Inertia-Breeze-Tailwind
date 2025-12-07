<?php

namespace App\Http\Controllers\API\v1\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fichaje\UserFichajesIndexRequest;
use App\Http\Resources\HorarioResource;
use App\Models\Horario;
use Carbon\Carbon;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FichajeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(UserFichajesIndexRequest $request)
    {
        $from = $request->query('from', now(tz: new DateTimeZone('Europe/Madrid'))->startOfWeek());
        $to = $request->query('to', now(tz: new DateTimeZone('Europe/Madrid'))->endOfWeek());

        $from = (!$from instanceof Carbon) ? Carbon::parse($from, new DateTimeZone('Europe/Madrid'))->startOfDay() : $from;
        $to = (!$to instanceof Carbon) ? Carbon::parse($to, new DateTimeZone('Europe/Madrid'))->endOfDay() : $to;

        $empleado = $request->getEmployee();

        $horarios = Horario::with([
            'contrato' => function ($query) use ($empleado) {
                $query->where('empleado_id', $empleado->id)
                    ->with(['empleado.user', 'empleado.empresas', 'empleado.departamentos', 'jornada', 'empresa', 'departamento', 'asignacion']);
            },
            'anexo.contrato' => function ($query) use ($empleado) {
                $query->where('empleado_id', $empleado->id)
                    ->with(['empleado.user', 'asignacion']);
            },
            'anexo.jornada',
            'estadoHorario',
            'modalidad',
            'turno.centro',
            'descansosAdicionales',
        ])
            ->where(function ($query) use ($empleado) {
                $query->whereHas('contrato', function ($subQuery) use ($empleado) {
                    $subQuery->where('empleado_id', $empleado->id);
                })->orWhereHas('anexo.contrato', function ($subQuery) use ($empleado) {
                    $subQuery->where('empleado_id', $empleado->id);
                });
            })
            ->whereBetween('horario_inicio', [$from, $to])
            ->orderBy('horario_inicio')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'horarios' => HorarioResource::collection($horarios)->values(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Horario $horario)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Horario $horario)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Horario $horario)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Horario $horario)
    {
        //
    }
}

<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Horario;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Horario\HorarioIndexRequest;

class HorarioController extends Controller
{
    public function __construct() {}

    /**
     * Lista los horarios basado en un rango de fechas, por defecto la semana actual
     */
    public function index(HorarioIndexRequest $request)
    {
        return Inertia::render('Admin/Horarios/Index');
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

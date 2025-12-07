<?php

namespace App\Http\Controllers\Admin;

use App\Models\Team;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Team\TeamIndexRequest;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource - Contratos.
     * 
     * @return \Inertia\Response 
     */
    public function index(TeamIndexRequest $request)
    {
        return Inertia::render('Admin/Teams/Index/Index', [
            // TODO: AQUI ES NECESARIO CARGAR LOS PERMISOS DISPONIBLES; ROLES Y PERMISOS DEL USUARIO
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Team $team)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Team $team)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team)
    {
        //
    }
}

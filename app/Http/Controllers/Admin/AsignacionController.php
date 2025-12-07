<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Asignacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Asignacion\AsignacionIndexRequest;

class AsignacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(AsignacionIndexRequest $request)
    {
        return Inertia::render('Admin/Asignaciones/Index/Index');
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
    public function show(Request $request, Asignacion $asignacion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Asignacion $asignacion)
    {
        //
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Asignacion $asignacion)
    {
        //
    }
}

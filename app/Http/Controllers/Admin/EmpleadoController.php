<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Empleado;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Empleado\EmpleadoIndexRequest;

class EmpleadoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(EmpleadoIndexRequest $request)
    {
        return Inertia::render('Admin/Empleados/Index/Index');
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
    public function update(Request $request, Empleado $empleado)
    {
        //
    }

    /**
     * Remove the specified resource from storage based on the id.
     */
    public function destroy(Empleado $empleado)
    {
        //
    }

    /**
     * Display the specified resource
     */
    public function show(Empleado $empleado)
    {
        //
    }
}

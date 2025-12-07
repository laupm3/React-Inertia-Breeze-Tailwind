<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Departamento;
use App\Http\Controllers\Controller;
use App\Http\Requests\Departamento\DepartamentoIndexRequest;
use Illuminate\Http\Request;
class DepartamentoController extends Controller
{
    /**
     * Display a listing of the resource - Departamentos.
     * 
     * @return \Inertia\Response 
     */
    public function index(DepartamentoIndexRequest $request)
    {
        return Inertia::render('Admin/Departamentos/Index/Index');
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
    public function update(Request $request, Departamento $departamento)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Departamento $departamento)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Departamento $departamento)
    {
        //
    }
}


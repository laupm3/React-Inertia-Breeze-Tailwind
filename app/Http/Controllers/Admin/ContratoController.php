<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Contrato;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contrato\ContratoIndexRequest;
use Illuminate\Http\Request;

class ContratoController extends Controller
{
    /**
     * Display a listing of the resource - Contratos.
     * 
     * @return \Inertia\Response 
     */
    public function index(ContratoIndexRequest $request)
    {
        return Inertia::render('Admin/Contratos/Index/Index');
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
    public function update(Request $request, Contrato $contrato)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Contrato $contrato)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Contrato $contrato)
    {
        //
    }
}

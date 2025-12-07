<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Empresa;
use App\Http\Controllers\Controller;
use App\Http\Requests\Empresa\EmpresaStoreRequest;
use App\Http\Requests\Empresa\EmpresaUpdateRequest;

class EmpresaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Empresas/Index/Index');
    }

    /**
     * Store a newly created resource in storage validating the request previously.
     */
    public function store(EmpresaStoreRequest $request)
    {
        //
    }

    /**
     * Display the specified resource. 
     */
    public function show(Empresa $empresa)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EmpresaUpdateRequest $request, Empresa $empresa)
    {
        //
    }

    /**
     * Remove the specified resource from storage based on the id.
     */
    public function destroy(Empresa $empresa)
    {
        //
    }
}
<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\SolicitudPermiso;
use App\Http\Controllers\Controller;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoIndexRequest;

class SolicitudPermisoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(SolicitudPermisoIndexRequest $request)
    {
        return Inertia::render('Admin/SolicitudPermisos/Index/Index');
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
    public function show(SolicitudPermiso $solicitudPermiso)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SolicitudPermiso $solicitudPermiso)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SolicitudPermiso $solicitudPermiso)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SolicitudPermiso $solicitudPermiso)
    {
        //
    }
}

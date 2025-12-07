<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Turno;
use App\Http\Controllers\Controller;
use App\Http\Requests\Turno\TurnoIndexRequest;
use Illuminate\Http\Request;


class TurnoController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(TurnoIndexRequest $request)
    {
          return Inertia::render('Admin/Turnos/Index/Index');
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
    public function update(Request $request, Turno $turno)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Turno $turno)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Turno $turno)
    {
        //
    }
}

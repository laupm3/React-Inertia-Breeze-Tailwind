<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Jornada;
use App\Http\Controllers\Controller;
use App\Http\Requests\Jornada\JornadaIndexRequest;
use Illuminate\Http\Request;


class JornadaController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(JornadaIndexRequest $request)
    {
          return Inertia::render('Admin/Jornadas/Index/Index');
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
    public function update(Request $request, Jornada $jornada)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Jornada $jornada)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Jornada $jornada)
    {
        //
    }
}

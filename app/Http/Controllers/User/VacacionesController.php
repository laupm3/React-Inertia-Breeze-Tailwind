<?php

namespace App\Http\Controllers\User;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Vacaciones\VacacionesIndexRequest;

class VacacionesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(VacacionesIndexRequest $request)
    {
        return Inertia::render('User/Vacaciones/Index');
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
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

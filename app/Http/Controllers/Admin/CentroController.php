<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Centro;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Centro\CentroIndexRequest;

class CentroController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Inertia\Response 
     */
    public function index(CentroIndexRequest $request)
    {
        return Inertia::render('Admin/Centros/Index/Index');
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
    public function show(Request $request, Centro $centro)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Centro $centro)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Centro $centro)
    {
        //
    }
}

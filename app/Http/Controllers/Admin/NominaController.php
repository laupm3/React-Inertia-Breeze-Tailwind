<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Nomina\HistoricoNominasIndexRequest;
use App\Models\File;
use App\Models\TipoFichero;
use App\Models\User;

class NominaController extends Controller
{

    /**
     * Display a listing of the resource.
     * 
     * @return \Inertia\Response 
     */
    public function index()
    {
        return Inertia::render('Admin/Nominas/UploadNominas', [
            //
        ]);
    }

    /**
     * Display the history of payroll files.
     */
    public function history(HistoricoNominasIndexRequest $request)
    {
        $tipoArchivoId = TipoFichero::where('nombre', 'Archivo')->first()->id;

        $files = File::with(['user', 'createdBy'])
            ->where('tipo_fichero_id', $tipoArchivoId)
            ->where('path', 'like', '%Nominas%')
            ->get();

        return Inertia::render('Admin/HistoricoNominas/Index', [
            'nominas' => $files,
        ]);
    }


    /**
     * Show the form for creating a new resource.
     * 
     * @return \Inertia\Response
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
    public function show(Request $request)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        //
    }
}

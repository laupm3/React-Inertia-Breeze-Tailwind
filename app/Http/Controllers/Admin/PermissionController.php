<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Permission\PermissionIndexRequest;
use Illuminate\Http\Request;

class PermissionController extends Controller
{

    /**
     * Display a listing of the resource - Permissions.
     * 
     * @return \Inertia\Response 
     */
    public function index(PermissionIndexRequest $request)
    {
        return Inertia::render('Admin/Permissions/Index/Index');
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
    public function update(Request $request, Permission $permission)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Permission $permission)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        //
    }
}
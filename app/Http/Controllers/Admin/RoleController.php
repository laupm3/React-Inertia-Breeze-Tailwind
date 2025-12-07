<?php

namespace App\Http\Controllers\Admin;

use App\Models\Role;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Role\RoleIndexRequest;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(RoleIndexRequest $request)
    {
        return Inertia::render('Admin/Roles/Index/Index');
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
    public function update(Request $request, Role $role)
    {
        //
    }

    /**
     * Remove the specified resource from storage
     */
    public function destroy(Role $role)
    {
        //
    }

    /**
     * Display the specified resource. 
     */
    public function show(Role $role)
    {
        //
    }
}

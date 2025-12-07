<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\UserPanelRequest;
use App\Http\Requests\User\UserIndexRequest;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;

class UserController extends Controller implements UpdatesUserProfileInformation
{
    /**
     * Display a listing of the resource.
     */
    public function index(UserPanelRequest $request)
    {
        return Inertia::render('Admin/Usuarios/Index/Index');
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
    public function show(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Show the application welcome screen, provide the different options to login
     * 
     * @return \Inertia\Response
     */
    public function index()
    {
        if (Auth::check()) {
            return redirect('dashboard');
        }

        return Inertia::render(
            component: 'Welcome',
            props: [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'canResetPassword' => Route::has('password.request'),
            ]
        );
    }

    /**
     * Show the application login screen using the email and password.
     * 
     * @return \Inertia\Response
     */
    public function default()
    {
        if (Auth::check()) {
            return redirect('dashboard');
        }

        return Inertia::render(
            component: 'Auth/Login',
            props: [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'canResetPassword' => Route::has('password.request'),
            ]
        );
    }
}

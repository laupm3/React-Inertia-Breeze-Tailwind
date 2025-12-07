<?php

namespace App\Http\Controllers;

use App\Http\Resources\EmpleadoResource;
use App\Models\Empleado;
use Inertia\Inertia;

class SharedController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Shared/Dashboard');
    }

    public function calendar()
    {
        return "Ruta Calendar";
    }

    public function document()
    {
        return "Ruta Document";
    }

    public function schedule()
    {
        return Inertia::render('Shared/Schedule');
    }

    public function organization()
    {
        return Inertia::render('Shared/Organization');
    }

    public function vacations()
    {
        return Inertia::render('Shared/Vacations');
    }

    public function onboarding()
    {
        $empleados = Empleado::with([
            'user', 
            'estadoEmpleado', 
            'tipoDocumento', 
            'tipoEmpleado', 
            'empresas',
            'departamentos.manager.user'
            ])->get();

        return Inertia::render('Shared/Onboarding/OnboardingPage', [
            'empleados' => EmpleadoResource::collection($empleados)->values(),
        ]);
    }

    public function privacyPolicy()
    {
        return Inertia::render('Shared/PrivacyPolicy');
    }

    public function cookiesPolicy()
    {
        return Inertia::render('Shared/CookiesPolicy');
    }

    public function termsOfService()
    {
        return Inertia::render('Shared/TermsOfService');
    }
}
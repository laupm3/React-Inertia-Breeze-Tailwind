<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brevo\BrevoTemplatesIndexRequest;
use Inertia\Inertia;

class PlantillasBrevoController extends Controller
{
    public function index(BrevoTemplatesIndexRequest $request){
        return Inertia::render('Admin/Brevo/Index');

    }
}

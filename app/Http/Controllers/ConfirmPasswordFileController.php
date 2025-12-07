<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; // Asegúrate de importar Hash
use Inertia\Inertia;

class ConfirmPasswordFileController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Folders/ConfirmPasswordFile');
    }

    public function confirmPassword(Request $request)
    {
        // Obtener la contraseña del cuerpo de la solicitud
        $password = $request->input('password');

        // Verificar si la contraseña proporcionada coincide con la del usuario autenticado
        $userPassword = Auth::user()->password;

        // Usar Hash::check para comparar contraseñas de forma segura
        if (Hash::check($password, $userPassword)) {
           // return Inertia::render('Folders/FoldersComponent', ['currentFolderBackend' => 'seguridad']);
            return redirect()->route('folders');
        } else {
            return response()->json(['error' => 'Error 400'], 400);
        }
    }
}
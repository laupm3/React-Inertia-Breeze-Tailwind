<?php

namespace App\Http\Controllers\API\v1\Shared;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Resources\PublicUserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Controlador para interacciones públicas (de solo lectura) con usuarios.
 * Accesible por cualquier usuario autenticado.
 * Utiliza PublicUserResource para garantizar que no se exponga información sensible.
 */
class UserController extends Controller
{
    /**
     * Muestra una lista de usuarios con información pública.
     * Útil para funcionalidades como buscadores de usuarios, @menciones, etc.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // NOTA: Aquí podrías añadir una paginación y filtros de búsqueda si es necesario.
        // Ejemplo: $users = User::query()->paginate();
        $users = User::all();
        return PublicUserResource::collection($users);
    }

    /**
     * Muestra la información pública de un único usuario.
     */
    public function show(User $user): PublicUserResource
    {
        return new PublicUserResource($user);
    }
}

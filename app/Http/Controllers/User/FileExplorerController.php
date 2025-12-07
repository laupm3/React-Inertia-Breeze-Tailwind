<?php

namespace App\Http\Controllers\User;

use App\Models\File;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\EmpleadoResource;
use App\Http\Resources\FileResource;
use App\Models\Centro;
use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Empresa;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class FileExplorerController extends Controller
{
    /**
     * Display a listing of the resource - This method is used for the root folder of the user
     * 
     * @return \Inertia\Response | RedirectResponse
     */
    public function index(Request $request): \Inertia\Response | RedirectResponse
    {
        // Check if the user that make the request is the same user that is logged in
        $user = Auth::user();

        //$empleados = Empleado::with('user')->get();
        $empleados = Empleado::with([
            'user',
            'tipoEmpleado',
            'estadoEmpleado',
            'tipoDocumento',
            'contratos.departamento',
            'contratos.centro',
            'empresas',
            'asignaciones'
        ])->get();

        if (!$user) {
            return redirect()->route('dashboard')->warningBanner('You are not authorized to view this page.');
        }

        $empleado = $user->empleado;

        if (!$empleado) {
            return redirect()->route('dashboard')->warningBanner('This section is only available for employees.');
        }

        /**
         * @var File $root The root folder of the user
         */
        $root = File::where('user_id', $user->id)
            ->where('nombre', $empleado->nif)
            ->first();
        $rootHash = $root->hash;

        if (!$root) {
            return redirect()->route('dashboard')->with('warning', 'Contact to an administrator to solve documentation issue.');
        }

        
        $files = File::with('children')->where('parent_id', $root->id)->get();
        $files_resource = FileResource::collection($files);

        //return Inertia::render('User/Files/Index', [
        return Inertia::render('Admin/Ficheros/Index', [
            'files' => $files_resource->values(),
            'currentFolder' => $root,
            'breadcrumb' => $root->getBreadcrumbForUser(),
            'empleados' => EmpleadoResource::collection($empleados)->values(),
            'rootHash' => $rootHash,
        ]);
    }


    /**
     * Navigate to a folder using its hash - This method is used for not root folders
     * 
     * @param string $hash The hash of the folder to navigate to
     * 
     * @return \Inertia\Response | JsonResponse
     */
    public function navigate(string $hash): \Inertia\Response | JsonResponse
    {
        // Check if the user that make the request is the same user that is logged in
        $user = Auth::user();

        $empleados = Empleado::with([
            'user',
            'tipoEmpleado',
            'estadoEmpleado',
            'tipoDocumento',
            'contratos.departamento',
            'contratos.centro',
            'empresas',
            'asignaciones'
        ])->get();

        if (!$user) {
            return redirect()->route('dashboard')->warningBanner('You are not authorized to view this page.');
        }

        /**
         * @var File $file The folder to navigate to
         */
        $file = File::where('hash', $hash)
            ->where('user_id', $user->id)
            ->first();

        if (!$file) {
            return response()->json(['message' => 'Carpeta no encontrada'], Response::HTTP_NOT_FOUND);
        }

        $files = File::where('parent_id', $file->id)->with('children')->get();
        $files_resource = FileResource::collection($files);

        //Obtenemos el hash de la carpeta raíz del empleado
        $empleado = $user->empleado;
        $root = File::where('user_id', $user->id)
            ->where('nombre', $empleado->nif)
            ->first();

        $rootHash = $root->hash;
            
        //return Inertia::render('User/Files/Index', [
        return Inertia::render('Admin/Ficheros/Index', [
            'files' => $files_resource->values(),
            'currentFolder' => $file,
            'breadcrumb' => $file->getBreadcrumbForUser(),
            'empleados' => EmpleadoResource::collection($empleados)->values(),
            'rootHash' => $rootHash,
        ]);
    }

}

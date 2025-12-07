<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Permiso;
use App\Models\SolicitudPermiso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\Permiso\PermisosLaborales\PermisoLaboralCreado;
use App\Events\Permiso\PermisosLaborales\PermisoLaboralEliminado;
use App\Events\Permiso\PermisosLaborales\PermisoLaboralActualizado;

use Illuminate\Routing\Controller;

class PermisoController extends Controller
{
    /**
     * Constructor para verificar permisos
     */
    public function __construct()
    {
        $this->middleware(['role:Administrator|Super Admin|RRHH|Human Resources'])
             ->only(['create', 'store', 'edit', 'update', 'destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permisos = Permiso::all();
        return Inertia::render('Permisos/Index', [
            'permisos' => $permisos
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Permisos/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'retribuido' => 'required|boolean',
            'activo' => 'boolean',
        ]);

        // Asegurar que activo sea true por defecto si no se proporciona
        if (!isset($validated['activo'])) {
            $validated['activo'] = true;
        }

        $permiso = Permiso::create($validated);
        
        // Disparamos el evento de creación de un permiso laboral
        event(new PermisoLaboralCreado($permiso));

        return redirect()->route('user.permisos.index')
            ->with('success', 'Tipo de permiso laboral creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Permiso $permiso)
    {
        return Inertia::render('Permisos/Show', [
            'permiso' => $permiso
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Permiso $permiso)
    {
        return Inertia::render('Permisos/Edit', [
            'permiso' => $permiso
        ]);
    }

    // Corrección del método update()
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permiso $permiso)
    {
        // Validar datos
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'retribuido' => 'required|boolean',
            'activo' => 'required|boolean',
        ]);

        $cambios = [];
        $datosAnteriores = $permiso->toArray();

        // Actualizar el permiso
        $permiso->update($validated);

        // Registrar cambios para las notificaciones
        foreach ($validated as $campo => $valor) {
            if (isset($datosAnteriores[$campo]) && $datosAnteriores[$campo] != $valor) {
                $cambios[$campo] = [
                    'anterior' => $datosAnteriores[$campo],
                    'nuevo' => $valor
                ];
            }
        }

        // Disparar evento solo si hubo cambios
        if (!empty($cambios)) {
            event(new PermisoLaboralActualizado($permiso, $cambios));
        }

        return redirect()->route('user.permisos.index')
            ->with('success', 'Tipo de permiso laboral actualizado correctamente.');
    }

    // Corrección del método destroy()
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permiso $permiso)
    {
        // Verificar si el permiso está siendo utilizado en solicitudes
        $solicitudesActivas = SolicitudPermiso::where('permiso_id', $permiso->id)
            ->whereIn('estado_id', [1, 2]) // 1=Pendiente, 2=Aprobado
            ->exists();

        if ($solicitudesActivas) {
            return redirect()->route('user.permisos.index')
                ->with('error', 'No se puede eliminar este tipo de permiso porque existen solicitudes activas asociadas.');
        }

        // Guardar datos antes de eliminar para la notificación
        $id = $permiso->id;
        $nombre = $permiso->nombre;
        $descripcion = $permiso->descripcion;
        $retribuido = $permiso->retribuido;

        // Eliminar el permiso
        $permiso->delete();

        // Disparar evento de eliminación
        event(new PermisoLaboralEliminado($id, $nombre, $descripcion, $retribuido));

        return redirect()->route('user.permisos.index')
            ->with('success', 'Tipo de permiso laboral eliminado correctamente.');
    }

    // Corrección de los métodos de redirección
    /**
     * Aprobar una solicitud (debería moverse a SolicitudPermisoController)
     */
    public function aprobar(Request $request, $id)
    {
        return app(SolicitudPermisoController::class)
            ->aprobar($request, SolicitudPermiso::findOrFail($id));
    }

    /**
     * Rechazar una solicitud (debería moverse a SolicitudPermisoController)
     */
    public function rechazar(Request $request, $id)
    {
        return app(SolicitudPermisoController::class)
            ->rechazar($request, SolicitudPermiso::findOrFail($id));
    }

    /**
     * Cancelar una solicitud (debería moverse a SolicitudPermisoController)
     */
    public function cancelar($id)
    {
        return app(SolicitudPermisoController::class)
            ->cancelar(SolicitudPermiso::findOrFail($id));
    }
}
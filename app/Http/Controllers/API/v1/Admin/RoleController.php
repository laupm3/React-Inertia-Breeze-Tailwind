<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Events\Rol\RolActualizado;
use App\Events\Rol\RolCreado;
use App\Events\Rol\RolEliminado;
use App\Models\Role;
use App\Models\Module;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\Role\RoleDestroyRequest;
use App\Http\Resources\RoleResource;
use App\Http\Requests\Role\RoleIndexRequest;
use App\Http\Requests\Role\RoleShowRequest;
use App\Http\Requests\Role\RoleStoreRequest;
use App\Http\Requests\Role\RoleTogglePermissionRequest;
use App\Http\Requests\Role\RoleUpdateRequest;
use Illuminate\Support\Facades\Log;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(RoleIndexRequest $request)
    {
        $roles = Role::with(Role::RELATIONSHIPS)
            ->withCount('users')
            ->withCount('permissions')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'roles' => RoleResource::collection($roles)
        ]);
    }

    /**
     * Store a newly created role in storage.
     *
     * @param RoleStoreRequest $request Validated request with role data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(RoleStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $role = Role::create($validated);

            if (!$role) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear el rol.'
                ]);
            }

            event(new RolCreado($role));

            $role->load(Role::RELATIONSHIPS)
                ->loadCount(['users', 'permissions']);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Rol creada correctamente.',
                'role' => new RoleResource($role)
            ]);
        });
    }

    /**
     * Display a specific role with its relationships
     * 
     * @param RoleShowRequest $request
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(RoleShowRequest $request, Role $role)
    {
        $role->load(['permissions.module', 'users']);

        return response()->json(status: Response::HTTP_OK, data: [
            'role' => new RoleResource($role)
        ]);
    }

    /**
     * Update the specified role in storage.
     *
     * @param RoleUpdateRequest $request Validated request with updated role data
     * @param Role $asignacion The role to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(RoleUpdateRequest $request, Role $role)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $role) {

            $updateResult = $role->update($validated);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el rol.'
                ]);
            }

            event(new RolActualizado($role));

            $role->load(Role::RELATIONSHIPS)
                ->loadCount(['users', 'permissions']);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Rol actualizado correctamente.',
                'role' => new RoleResource($role)
            ]);
        });
    }

    /**
     * Remove the specified role from storage.
     *
     * @param RoleDestroyRequest $request
     * @param Role $role The role to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(RoleDestroyRequest $request, Role $role)
    {
        return DB::transaction(function () use ($role) {

            if ($role->users()->count() > 0) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se puede eliminar el rol porque tiene usuarios asociados.'
                ]);
            }

            $deleteResult = $role->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar el rol.'
                ]);
            }

            event(new RolEliminado($role));

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Role eliminado correctamente.'
            ]);
        });
    }

    /**
     * Verify if a role has a permission, and toggle it.
     * 
     * @param  RoleTogglePermissionRequest  $request
     * @param  Role  $role
     * @param  Permission  $permission
     * 
     * @return \Illuminate\Http\JsonResponse 
     */
    public function switchPermission(RoleTogglePermissionRequest $request, Role $role, Permission $permission)
    {
        return response()->json(status: Response::HTTP_OK, data: [
            'roleHasPermission' => $role->togglePermission($permission)
        ]);
    }
}

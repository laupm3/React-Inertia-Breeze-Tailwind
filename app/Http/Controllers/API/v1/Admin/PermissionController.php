<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Permission;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Http\Requests\Permission\PermissionStoreRequest;
use App\Http\Requests\Permission\PermissionShowRequest;
use App\Http\Requests\Permission\PermissionUpdateRequest;
use App\Http\Requests\Permission\PermissionIndexRequest;
use App\Http\Requests\Permission\PermissionDestroyRequest;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(PermissionIndexRequest $request)
    {
        $permissions = Permission::with(Permission::RELATIONSHIPS)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'permissions' => PermissionResource::collection($permissions)->values()
        ]);
    }

    /**
     * Store a newly created permission in storage.
     *
     * @param PermissionStoreRequest $request Validated request with permission data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(PermissionStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $permission = Permission::create($validated);

            if (!$permission) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear el permiso.'
                ]);
            }

            $permission->load(Permission::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Permiso creado correctamente.',
                'permission' => new PermissionResource($permission)
            ]);
        });
    }

    /**
     * Display a specific permission with its relationships
     * 
     * @param PermissionShowRequest $request
     * @param Permission $permission
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(PermissionShowRequest $request, Permission $permission)
    {
        $permission->load([
            ...Permission::RELATIONSHIPS,
            'users'
        ]);

        return response()->json(status: Response::HTTP_OK, data: [
            'permission' => new PermissionResource($permission)
        ]);
    }

    /**
     * Update the specified permission in storage.
     *
     * @param PermissionUpdateRequest $request Validated request with updated permission data
     * @param Permission $permission The permission to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(PermissionUpdateRequest $request, Permission $permission)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $permission) {

            $updateResult = $permission->update($validated);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el permiso.'
                ]);
            }

            $permission->load(Permission::RELATIONSHIPS);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Permiso actualizado correctamente.',
                'permission' => new PermissionResource($permission)
            ]);
        });
    }

    /**
     * Remove the specified permission from storage.
     *
     * @param PermissionDestroyRequest $request
     * @param Permission $permission The permission to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(PermissionDestroyRequest $request, Permission $permission)
    {
        return DB::transaction(function () use ($permission) {
            // Check if permission has roles associated
            if ($permission->roles()->count() > 0) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se puede eliminar el permiso porque tiene roles asociados.'
                ]);
            }

            $deleteResult = $permission->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar el permiso.'
                ]);
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Permiso eliminado correctamente.'
            ]);
        });
    }
}

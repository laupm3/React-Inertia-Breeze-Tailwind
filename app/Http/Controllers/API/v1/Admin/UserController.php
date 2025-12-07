<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateUserStatusRequest;
use App\Http\Requests\User\UserDeleteProfilePhotoRequest;
use App\Http\Requests\User\UserDestroyRequest;
use App\Http\Requests\User\UserIndexRequest;
use App\Http\Requests\User\UserShowRequest;
use App\Http\Requests\User\UserStoreRequest;
use App\Http\Requests\User\UserTogglePermissionRequest;
use App\Http\Requests\User\UserToggleRoleRequest;
use App\Http\Requests\User\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\User\UserService;
use App\Services\User\UserStatusService;
use Illuminate\Http\Response;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected UserStatusService $userStatusService
    ) {
    }

    public function index(UserIndexRequest $request)
    {
        // 1. Obtenemos los usuarios con sus relaciones.
        $users = User::with(User::RELATIONSHIPS)->get();

        // 2. Usamos el UserResource para formatear los datos de cada usuario.
        $userCollection = UserResource::collection($users);

        // 3. Devolvemos la respuesta JSON en el formato que el frontend espera.
        return response()->json(status: Response::HTTP_OK, data: [
            'users' => $userCollection
        ]);
    }

    public function store(UserStoreRequest $request)
    {
        $user = $this->userService->createUser($request->validated());
        $user->load(User::RELATIONSHIPS);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'user' => new UserResource($user)
        ], Response::HTTP_CREATED);
    }

    public function show(UserShowRequest $request, User $user)
    {
        $user->load(User::RELATIONSHIPS);
        return response()->json([
            'user' => new UserResource($user)
        ]);
    }

    public function update(UserUpdateRequest $request, User $user)
    {
        $updatedUser = $this->userService->updateUser($user, $request->validated());
        $updatedUser->load(User::RELATIONSHIPS);

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'user' => new UserResource($updatedUser)
        ], Response::HTTP_OK);
    }

    public function destroy(UserDestroyRequest $request, User $user)
    {
        $this->userService->deleteUser($user);

        return response()->json([
            'message' => 'Usuario eliminado correctamente.'
        ], Response::HTTP_OK);
    }

    public function withoutEmployee(UserIndexRequest $request)
    {
        $users = User::with(['roles'])->whereNull('empleado_id')->get();
        return UserResource::collection($users);
    }

    public function switchPermission(UserTogglePermissionRequest $request, User $user, Permission $permission)
    {
        return response()->json([
            'userHasPermission' => $user->togglePermission($permission)
        ]);
    }

    public function switchRole(UserToggleRoleRequest $request, User $user, Role $role)
    {
        return response()->json([
            'userHasRole' => $user->toggleRole($role)
        ]);
    }

    public function deleteProfilePhoto(UserDeleteProfilePhotoRequest $request, User $user)
    {
        $user->deleteProfilePhoto();
        $user->load(User::RELATIONSHIPS);

        return response()->json([
            'message' => 'Foto de perfil eliminada correctamente.',
            'user' => new UserResource($user)
        ], Response::HTTP_OK);
    }

    public function getAvailableStatuses()
    {
        $statuses = collect(UserStatus::cases())->map(fn ($status) => [
            'id' => $status->value,
            'name' => $status->name,
            'label' => $status->label()
        ]);

        return response()->json(['statuses' => $statuses]);
    }

    /**
     * Actualiza el estado de un usuario específico.
     */
    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        $newStatus = UserStatus::from($request->validated('status'));

        $this->userStatusService->changeStatus(
            $user,
            $newStatus,
            $request->user() // El actor es el admin autenticado
        );

        return response()->json([
            'message' => 'Estado del usuario actualizado correctamente.',
            'user' => [
                'id' => $user->id,
                'status' => [
                    'id' => $user->status->value,
                    'name' => $user->status->label(),
                ],
            ],
        ], Response::HTTP_OK);
    }
}

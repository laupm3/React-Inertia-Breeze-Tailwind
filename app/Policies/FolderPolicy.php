<?php

namespace App\Policies;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FolderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Folder $folder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Folder $folder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Folder $folder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Folder $folder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Folder $folder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can download the folder or file.
     * 
     * If the folder is owned by the user or created by the user, they can download it. 
     * When the user has the 'downloadFiles' permission, they can also download any folder.
     * 
     * @param User $user
     * @param Folder $folder
     * @return bool
     */
    public function download(User $user, Folder $folder): bool
    {
        return (
            ($folder->user_id === $user->id || $folder->created_by === $user->id) ||
            $user->hasPermissionTo('downloadFiles', 'web')
        );
    }
}

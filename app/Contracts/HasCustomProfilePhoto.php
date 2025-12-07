<?php

namespace App\Contracts;

use Illuminate\Support\Facades\Storage;

trait HasCustomProfilePhoto
{
    /**
     * Update the user's profile photo from a given path.
     *
     * @param  string  $photoPath
     * @param  string  $storagePath
     * @return void
     */
    public function updateProfilePhotoFromPath(string $photoPath, $storagePath = 'profile-photos')
    {
        tap($this->profile_photo_path, function ($previous) use ($photoPath, $storagePath) {
            $newPhotoPath = Storage::disk($this->profilePhotoDisk())->putFile($storagePath, $photoPath);

            $this->forceFill([
                'profile_photo_path' => $newPhotoPath,
            ])->save();

            if ($previous) {
                Storage::disk($this->profilePhotoDisk())->delete($previous);
            }
        });
    }
}

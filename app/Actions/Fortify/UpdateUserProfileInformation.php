<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;

class UpdateUserProfileInformation implements UpdatesUserProfileInformation
{
    /**
     * Validate and update the given user's profile information.
     *
     * @param  array<string, mixed>  $input
     */
    public function update(User $user, array $input): void
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'photo' => ['nullable', 'mimes:jpg,jpeg,png', 'max:1024'],
            'telefono_personal_movil' => ['nullable', 'string', 'max:20'],
            'telefono_personal_fijo' => ['nullable', 'string', 'max:20'],
            'email_secundario' => ['nullable', 'email', 'max:255'],
            'contacto_emergencia' => ['nullable', 'string', 'max:255'],
            'telefono_emergencia' => ['nullable', 'string', 'max:20'],
            'fecha_nacimiento' => ['nullable', 'date', 'before:today'],
            'full_address' => ['nullable', 'string', 'max:500'],
            'numero' => ['nullable', 'string', 'max:10'],
            'piso' => ['nullable', 'string', 'max:10'],
            'puerta' => ['nullable', 'string', 'max:10'],
            'escalera' => ['nullable', 'string', 'max:10'],
            'bloque' => ['nullable', 'string', 'max:10'],
            'codigo_postal' => ['nullable', 'string', 'max:10'],
        ])->validateWithBag('updateProfileInformation');

        if (isset($input['photo'])) {
            $user->updateProfilePhoto($input['photo']);
        }

        if ($input['email'] !== $user->email &&
            $user instanceof MustVerifyEmail) {
            $this->updateVerifiedUser($user, $input);
        } else {
            $user->forceFill([
                'name' => $input['name'],
                'email' => $input['email'],
                'descripcion' => $input['descripcion'] ?? null,
            ])->save();
        }

        if ($user->empleado) {
            $empleadoFields = [
                'email_secundario', 'telefono_personal_movil', 'telefono_personal_fijo',
                'contacto_emergencia', 'telefono_emergencia', 'fecha_nacimiento'
            ];
            
            $empleadoData = array_intersect_key($input, array_flip($empleadoFields));
            
            if (!empty($empleadoData)) {
                $user->empleado->forceFill($empleadoData)->save();
            }
            
            if ($user->empleado->direccion) {
                $direccionFields = [
                    'full_address', 'numero', 'piso', 'puerta', 
                    'escalera', 'bloque', 'codigo_postal'
                ];
                
                $direccionData = array_intersect_key($input, array_flip($direccionFields));
                
                if (!empty($direccionData)) {
                    $user->empleado->direccion->forceFill($direccionData)->save();
                }
            }
        }
    }

    /**
     * Update the given verified user's profile information.
     *
     * @param  array<string, string>  $input
     */
    protected function updateVerifiedUser(User $user, array $input): void
    {
        $user->forceFill([
            'name' => $input['name'],
            'email' => $input['email'],
            'descripcion' => $input['descripcion'] ?? null,
            'email_verified_at' => null,
        ])->save();

        $user->sendEmailVerificationNotification();

        // Actualizar información del empleado si existe
        if ($user->empleado) {
            $empleadoFields = [
                'email_secundario', 'telefono_personal_movil', 'telefono_personal_fijo',
                'contacto_emergencia', 'telefono_emergencia', 'fecha_nacimiento'
            ];
            
            $empleadoData = array_intersect_key($input, array_flip($empleadoFields));
            
            if (!empty($empleadoData)) {
                $user->empleado->forceFill($empleadoData)->save();
            }

            // Actualizar dirección del empleado si existe
            if ($user->empleado->direccion) {
                $direccionFields = [
                    'full_address', 'numero', 'piso', 'puerta', 
                    'escalera', 'bloque', 'codigo_postal'
                ];
                
                $direccionData = array_intersect_key($input, array_flip($direccionFields));
                
                if (!empty($direccionData)) {
                    $user->empleado->direccion->forceFill($direccionData)->save();
                }
            }
        }
    }
}

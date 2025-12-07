<?php

namespace App\Http\Requests\User\SolicitudPermiso;

use App\Models\Empleado;
use App\Models\Folder;
use App\Models\SolicitudPermiso;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SolicitudPermisoDestroyFolderRequest extends FormRequest
{
    /**
     * El empleado autenticado que realiza la solicitud
     */
    protected ?Empleado $empleado = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $this->empleado = $this->user()->empleado;
        return $this->empleado !== null;
    }

    /**
     * Obtener el empleado validado durante el proceso de autorización
     */
    public function getEmpleado(): ?Empleado
    {
        return $this->empleado;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $solicitud = $this->route('solicitud');
            $folder = $this->route('folder');

            // Validar que ambos modelos existen (model binding debería asegurar esto)
            if (!$solicitud instanceof SolicitudPermiso) {
                $validator->errors()->add('solicitud', 'La solicitud de permiso no existe.');
                return;
            }

            if (!$folder instanceof Folder) {
                $validator->errors()->add('folder', 'El archivo no existe.');
                return;
            }

            // Validar que el folder pertenece a esta solicitud
            $belongsToSolicitud = $solicitud->files()
                ->where('id', $folder->id)
                ->exists();

            if (!$belongsToSolicitud) {
                $validator->errors()->add('folder', 'El archivo no pertenece a esta solicitud de permiso.');
            }

            // Validar que es un archivo y no una carpeta
            if ($folder->esCarpeta()) {
                $validator->errors()->add('folder', 'No se pueden eliminar carpetas, solo archivos individuales.');
            }

            // Validar que el archivo existe físicamente
            $this->validateFileExists($validator, $folder);
        });
    }

    /**
     * Valida que el archivo existe físicamente en el almacenamiento
     */
    protected function validateFileExists(Validator $validator, Folder $folder): void
    {
        $fileSystemService = app(\App\Services\Storage\FileSystemService::class);

        if (!$fileSystemService->directoryExists($folder)) {
            $validator->errors()->add('folder', 'El archivo no existe en el almacenamiento.');
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'solicitud.required' => 'La solicitud de permiso es requerida.',
            'folder.required' => 'El archivo es requerido.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'solicitud' => 'solicitud de permiso',
            'folder' => 'archivo',
        ];
    }
}

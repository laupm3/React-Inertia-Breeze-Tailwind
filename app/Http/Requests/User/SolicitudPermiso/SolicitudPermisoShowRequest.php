<?php

namespace App\Http\Requests\User\SolicitudPermiso;

use App\Models\Empleado;
use Illuminate\Foundation\Http\FormRequest;

class SolicitudPermisoShowRequest extends FormRequest
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
}

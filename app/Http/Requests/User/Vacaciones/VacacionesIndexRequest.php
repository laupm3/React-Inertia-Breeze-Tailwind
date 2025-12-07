<?php

namespace App\Http\Requests\User\Vacaciones;

use App\Models\Empleado;
use Illuminate\Foundation\Http\FormRequest;

class VacacionesIndexRequest extends FormRequest
{
    protected ?Empleado $empleado = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $this->empleado = $this->user()->empleado;
        return $this->empleado !== null && $this->user()->hasPermissionTo('viewMyHolidaysRequests', 'web');
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

    public function getEmpleado(): Empleado|null
    {
        return $this->empleado;
    }
}

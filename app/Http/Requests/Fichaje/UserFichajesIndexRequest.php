<?php

namespace App\Http\Requests\Fichaje;

use App\Models\Empleado;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UserFichajesIndexRequest extends FormRequest
{
    /**
     * The authenticated employee.
     *
     * @var Empleado
     */
    protected Empleado|null $employee = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check that exists an Authenticated user
        $authUser = Auth::user();
        if (!$authUser) {
            return false;
        }

        $this->employee = $authUser->empleado;

        // Check that the authenticated user is an employee
        return ($this->employee) ? true : false;
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
     * Get the employee instance.
     *
     * @return Empleado|null
     */
    public function getEmployee(): Empleado|null
    {
        return $this->employee;
    }
}

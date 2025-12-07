<?php

namespace App\Http\Requests\Jornada;

use Illuminate\Foundation\Http\FormRequest;

class JornadaStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:jornadas,name'],
            'description' => ['nullable', 'string'],
            'esquema' => ['required', 'array'],
            'esquema.*.turno_id' => ['required', 'integer', 'exists:turnos,id'],
            'esquema.*.modalidad_id' => ['required', 'integer', 'exists:modalidades,id'],
            'esquema.*.weekday_number' => ['required', 'integer', 'min:0', 'max:6'],
            'esquema.*.weekday_number' => ['distinct'],
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'weekdays.*.weekday_number.distinct' => 'Los valores de weekday_number no pueden estar repetidos.',
        ];
    }
}

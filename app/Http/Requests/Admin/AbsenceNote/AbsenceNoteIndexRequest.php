<?php

namespace App\Http\Requests\Admin\AbsenceNote;

use App\Enums\AbsenceNoteStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AbsenceNoteIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    } // TODO: Añadir Policy

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', Rule::in(array_column(AbsenceNoteStatus::cases(), 'value'))],
            'empleado_id' => ['nullable', 'integer', 'exists:empleados,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

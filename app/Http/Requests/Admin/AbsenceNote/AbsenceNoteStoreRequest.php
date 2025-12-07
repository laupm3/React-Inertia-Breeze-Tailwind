<?php

namespace App\Http\Requests\Admin\AbsenceNote;

use Illuminate\Foundation\Http\FormRequest;

class AbsenceNoteStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    } // TODO: Añadir Policy

    public function rules(): array
    {
        return [
            'horario_id' => ['required', 'integer', 'exists:horarios,id'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

<?php

namespace App\Http\Requests\Admin\AbsenceNote;

use App\Enums\AbsenceNoteStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AbsenceNoteUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    } // TODO: Añadir Policy

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(array_column(AbsenceNoteStatus::cases(), 'value'))],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

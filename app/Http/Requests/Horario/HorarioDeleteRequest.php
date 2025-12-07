<?php

namespace App\Http\Requests\Horario;

use App\Models\Horario;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class HorarioDeleteRequest extends FormRequest
{
    /**
     * Cache for validated horarios to avoid duplicate queries
     */
    private $validatedHorarios = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('deleteSchedule', 'web');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'horarios' => 'required|array|min:1',
            'horarios.*' => 'required|integer', // IDs de horarios a eliminar
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'horarios.required' => 'El campo horarios es obligatorio.',
            'horarios.array' => 'El campo horarios debe ser un array.',
            'horarios.min' => 'Debe proporcionar al menos un horario para eliminar.',
            'horarios.*.required' => 'El ID del horario es obligatorio.',
            'horarios.*.integer' => 'El ID del horario debe ser un número entero.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'horarios' => 'horarios',
            'horarios.*' => 'ID del horario',
        ];
    }

    /**
     * Get validated horarios with their IDs for efficient batch processing.
     * Uses cached results from withValidator to avoid duplicate queries.
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getValidatedHorarios()
    {
        // Return cached results if available (from withValidator)
        if ($this->validatedHorarios !== null) {
            return $this->validatedHorarios;
        }

        // Fallback: fetch if not cached (shouldn't happen after validation)
        $horarioIds = collect($this->validated()['horarios']);
        $this->validatedHorarios = Horario::whereIn('id', $horarioIds)->get()->keyBy('id');

        return $this->validatedHorarios;
    }

    /**
     * Get the validated horario IDs array.
     * 
     * @return array
     */
    public function getHorarioIds(): array
    {
        return $this->validated()['horarios'];
    }

    /**
     * Configure the validator instance with custom validation.
     * This validates horario existence in a single query and caches results.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return; // Skip if there are already validation errors
            }

            $horarioIds = collect($this->input('horarios', []))->filter();

            if ($horarioIds->isEmpty()) {
                return;
            }

            // Single query to validate existence and cache results
            $this->validatedHorarios = Horario::whereIn('id', $horarioIds)->get()->keyBy('id');

            // Validate that all horarios exist
            foreach ($this->input('horarios', []) as $index => $horarioId) {
                if (!$this->validatedHorarios->has($horarioId)) {
                    $validator->errors()->add(
                        "horarios.{$index}",
                        'El horario especificado no existe.'
                    );
                }
            }
        });
    }
}

<?php

namespace App\Http\Requests\Horario;

use App\Models\Horario;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Validator;

class HorarioUpdateRequest extends FormRequest
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
        return $this->user()->hasPermissionTo('editSchedule', 'web');
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
            'horarios.*.id' => 'required|integer', // ✅ Removemos exists - validaremos en withValidator
            'horarios.*.turno_id' => 'required|integer|exists:turnos,id',
            'horarios.*.modalidad_id' => 'required|integer|exists:modalidades,id',
            'horarios.*.estado_horario_id' => 'required|integer|exists:estado_horarios,id',
            'horarios.*.horario_inicio' => 'required|date',
            'horarios.*.horario_fin' => 'required|date|after:horarios.*.horario_inicio',
            'horarios.*.descanso_inicio' => 'nullable|date|after:horarios.*.horario_inicio|before:horarios.*.horario_fin',
            'horarios.*.descanso_fin' => 'nullable|date|after:horarios.*.descanso_inicio|before:horarios.*.horario_fin',
            'horarios.*.observaciones' => 'nullable|string|max:255',
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
            'horarios.min' => 'Debe proporcionar al menos un horario.',

            'horarios.*.id.required' => 'El ID del horario es obligatorio.',
            'horarios.*.id.integer' => 'El ID del horario debe ser un número entero.',
            'horarios.*.id.exists' => 'El horario especificado no existe.',

            'horarios.*.turno_id.required' => 'El turno es obligatorio.',
            'horarios.*.turno_id.integer' => 'El turno debe ser un número entero.',
            'horarios.*.turno_id.exists' => 'El turno especificado no existe.',

            'horarios.*.modalidad_id.required' => 'La modalidad es obligatoria.',
            'horarios.*.modalidad_id.integer' => 'La modalidad debe ser un número entero.',
            'horarios.*.modalidad_id.exists' => 'La modalidad especificada no existe.',

            'horarios.*.estado_horario_id.required' => 'El estado del horario es obligatorio.',
            'horarios.*.estado_horario_id.integer' => 'El estado del horario debe ser un número entero.',
            'horarios.*.estado_horario_id.exists' => 'El estado del horario especificado no existe.',

            'horarios.*.horario_inicio.required' => 'La hora de inicio es obligatoria.',
            'horarios.*.horario_inicio.date' => 'La hora de inicio debe ser una fecha válida.',

            'horarios.*.horario_fin.required' => 'La hora de fin es obligatoria.',
            'horarios.*.horario_fin.date' => 'La hora de fin debe ser una fecha válida.',
            'horarios.*.horario_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio.',

            'horarios.*.descanso_inicio.date' => 'La hora de inicio del descanso debe ser una fecha válida.',
            'horarios.*.descanso_inicio.after' => 'La hora de inicio del descanso debe ser posterior a la hora de inicio del horario.',
            'horarios.*.descanso_inicio.before' => 'La hora de inicio del descanso debe ser anterior a la hora de fin del horario.',

            'horarios.*.descanso_fin.date' => 'La hora de fin del descanso debe ser una fecha válida.',
            'horarios.*.descanso_fin.after' => 'La hora de fin del descanso debe ser posterior a la hora de inicio del descanso.',
            'horarios.*.descanso_fin.before' => 'La hora de fin del descanso debe ser anterior a la hora de fin del horario.',

            'horarios.*.observaciones.string' => 'Las observaciones deben ser una cadena de texto.',
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
            'horarios.*.id' => 'ID del horario',
            'horarios.*.turno_id' => 'turno',
            'horarios.*.modalidad_id' => 'modalidad',
            'horarios.*.estado_horario_id' => 'estado del horario',
            'horarios.*.horario_inicio' => 'hora de inicio',
            'horarios.*.horario_fin' => 'hora de fin',
            'horarios.*.descanso_inicio' => 'hora de inicio del descanso',
            'horarios.*.descanso_fin' => 'hora de fin del descanso',
            'horarios.*.observaciones' => 'observaciones',
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
        $horarioIds = collect($this->validated()['horarios'])->pluck('id');
        $this->validatedHorarios = Horario::whereIn('id', $horarioIds)->get()->keyBy('id');

        return $this->validatedHorarios;
    }

    /**
     * Get the validated horario data array.
     * 
     * @return array
     */
    public function getHorarioData(): array
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

            $horarioIds = collect($this->input('horarios', []))->pluck('id')->filter();

            if ($horarioIds->isEmpty()) {
                return;
            }

            // Single query to validate existence and cache results
            $this->validatedHorarios = Horario::whereIn('id', $horarioIds)->get()->keyBy('id');

            // Validate that all horarios exist
            foreach ($this->input('horarios', []) as $index => $horarioData) {
                if (!isset($horarioData['id']) || !$this->validatedHorarios->has($horarioData['id'])) {
                    $validator->errors()->add(
                        "horarios.{$index}.id",
                        'El horario especificado no existe.'
                    );
                }
            }
        });
    }
}

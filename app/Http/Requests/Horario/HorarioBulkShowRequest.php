<?php

namespace App\Http\Requests\Horario;

use App\Models\Horario;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class HorarioBulkShowRequest extends FormRequest
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
        return $this->user()->hasPermissionTo('viewSchedule', 'web');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'horarios' => [
                'required',
                'array',
                'min:1',
            ],
            'horarios.*' => [
                'integer',
            ],
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
            'horarios.required' => 'Los horarios son obligatorios.',
            'horarios.array' => 'El campo horarios debe ser un array.',
            'horarios.min' => 'Debe proporcionar al menos un horario.',
            'horarios.*.integer' => 'Cada horario debe ser un número entero.',
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
        $this->validatedHorarios = Horario::with(Horario::RELATIONSHIPS)
            ->whereIn('id', $horarioIds)
            ->get()
            ->keyBy('id');

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

            $horarioIds = collect($this->input('horarios', []))->filter();

            if ($horarioIds->isEmpty()) {
                return;
            }

            // Step 1: Validate existence with a lightweight count query
            $existingCount = Horario::whereIn('id', $horarioIds)->count();

            if ($existingCount !== $horarioIds->count()) {
                // If counts don't match, we need to identify which ones are missing
                $existingIds = Horario::whereIn('id', $horarioIds)->pluck('id');

                foreach ($this->input('horarios', []) as $index => $horarioData) {
                    if (!isset($horarioData['id']) || !$existingIds->contains($horarioData['id'])) {
                        $validator->errors()->add(
                            "horarios.{$index}.id",
                            'El horario especificado no existe.'
                        );
                    }
                }
                return;
            }

            // Step 2: If validation passes, load with relationships for caching
            $this->validatedHorarios = Horario::with(Horario::RELATIONSHIPS)
                ->whereIn('id', $horarioIds)
                ->get()
                ->keyBy('id');
        });
    }
}

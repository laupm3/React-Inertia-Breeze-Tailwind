<?php

namespace App\Http\Requests\Horario;

use App\Models\Contrato;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class HorarioStoreRequest extends FormRequest
{
    /**
     * Cache for validated contratos to avoid duplicate queries
     */
    private $validatedContratos = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('createSchedule', 'web');
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
            'horarios.*.contrato_id' => 'required|integer',
            'horarios.*.modalidad_id' => 'required|integer|exists:modalidades,id',
            'horarios.*.estado_horario_id' => 'required|integer|exists:estado_horarios,id',
            'horarios.*.turno_id' => 'required|integer|exists:turnos,id',
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

            'horarios.*.contrato_id.required' => 'El ID del contrato es obligatorio.',
            'horarios.*.contrato_id.integer' => 'El ID del contrato debe ser un número entero.',

            'horarios.*.modalidad_id.required' => 'La modalidad es obligatoria.',
            'horarios.*.modalidad_id.integer' => 'La modalidad debe ser un número entero.',
            'horarios.*.modalidad_id.exists' => 'La modalidad especificada no existe.',

            'horarios.*.estado_horario_id.required' => 'El estado del horario es obligatorio.',
            'horarios.*.estado_horario_id.integer' => 'El estado del horario debe ser un número entero.',
            'horarios.*.estado_horario_id.exists' => 'El estado del horario especificado no existe.',

            'horarios.*.turno_id.required' => 'El turno es obligatorio.',
            'horarios.*.turno_id.integer' => 'El turno debe ser un número entero.',
            'horarios.*.turno_id.exists' => 'El turno especificado no existe.',

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
            'horarios.*.observaciones.max' => 'Las observaciones no pueden exceder 255 caracteres.',
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
            'horarios.*.contrato_id' => 'ID del contrato',
            'horarios.*.modalidad_id' => 'modalidad',
            'horarios.*.estado_horario_id' => 'estado del horario',
            'horarios.*.turno_id' => 'turno',
            'horarios.*.horario_inicio' => 'hora de inicio',
            'horarios.*.horario_fin' => 'hora de fin',
            'horarios.*.descanso_inicio' => 'hora de inicio del descanso',
            'horarios.*.descanso_fin' => 'hora de fin del descanso',
            'horarios.*.observaciones' => 'observaciones',
        ];
    }

    /**
     * Get validated contratos with their IDs for efficient batch processing.
     * Uses cached results from withValidator to avoid duplicate queries.
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getValidatedContratos()
    {
        // Return cached results if available (from withValidator)
        if ($this->validatedContratos !== null) {
            return $this->validatedContratos;
        }        // Fallback: fetch if not cached (shouldn't happen after validation)
        $contratoIds = collect($this->validated()['horarios'])->pluck('contrato_id')->unique();
        $this->validatedContratos = Contrato::with('anexos')
            ->whereIn('id', $contratoIds)
            ->get()
            ->keyBy('id');

        return $this->validatedContratos;
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
     * This validates contrato existence and date ranges in a single query and caches results.
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

            $horariosData = $this->input('horarios', []);
            $contratoIds = collect($horariosData)->pluck('contrato_id')->filter()->unique();

            if ($contratoIds->isEmpty()) {
                return;
            }
            // Single query to validate contrato existence and cache results with anexos
            $this->validatedContratos = Contrato::with('anexos')
                ->whereIn('id', $contratoIds)
                ->get()
                ->keyBy('id');

            // Validate that all contratos exist and check date ranges
            foreach ($horariosData as $index => $horarioData) {
                if (!isset($horarioData['contrato_id']) || !$this->validatedContratos->has($horarioData['contrato_id'])) {
                    $validator->errors()->add(
                        "horarios.{$index}.contrato_id",
                        'El contrato especificado no existe.'
                    );
                    continue;
                }

                // Validate date ranges against contract and anexos dates
                $contrato = $this->validatedContratos->get($horarioData['contrato_id']);

                if (isset($horarioData['horario_inicio']) && isset($horarioData['horario_fin'])) {
                    $horarioInicio = \Carbon\Carbon::parse($horarioData['horario_inicio']);
                    $horarioFin = \Carbon\Carbon::parse($horarioData['horario_fin']);

                    // Check if horario dates are within any valid period (contract or anexos)
                    $isWithinValidPeriod = $this->validateHorarioDateRanges(
                        $contrato,
                        $horarioInicio,
                        $horarioFin,
                        $validator,
                        $index
                    );

                    if (!$isWithinValidPeriod) {
                        $validator->errors()->add(
                            "horarios.{$index}.horario_inicio",
                            'Las fechas del horario deben estar dentro del periodo de duración del contrato o alguno de sus anexos.'
                        );
                    }
                }
            }
        });
    }

    /**
     * Validate if horario dates are within any valid period (contract or anexos).
     * 
     * @param \App\Models\Contrato $contrato
     * @param \Carbon\Carbon $horarioInicio
     * @param \Carbon\Carbon $horarioFin
     * @param \Illuminate\Validation\Validator $validator
     * @param int $index
     * @return bool
     */
    private function validateHorarioDateRanges($contrato, $horarioInicio, $horarioFin, $validator, $index): bool
    {
        // Check if horario is within main contract period
        if ($this->isDateRangeValid($contrato, $horarioInicio, $horarioFin)) {
            return true;
        }

        // Check if horario is within any anexo period
        foreach ($contrato->anexos as $anexo) {
            if ($this->isDateRangeValid($anexo, $horarioInicio, $horarioFin)) {
                return true;
            }
        }

        return false;
    }    /**
     * Check if the given dates are within the contract/anexo period.
     * 
     * @param mixed $entity (Contrato or Anexo)
     * @param \Carbon\Carbon $horarioInicio
     * @param \Carbon\Carbon $horarioFin
     * @return bool
     */
    private function isDateRangeValid($entity, $horarioInicio, $horarioFin): bool
    {
        // fecha_inicio is mandatory for all entities
        $entityInicio = \Carbon\Carbon::parse($entity->fecha_inicio);
        
        // fecha_fin is optional - null means indefinite duration
        $entityFin = $entity->fecha_fin ? \Carbon\Carbon::parse($entity->fecha_fin) : null;

        // Horario must start after or on the entity's start date
        $startValid = $horarioInicio->gte($entityInicio);
        
        // If no end date is defined (indefinite), horario is valid
        // Otherwise, horario must end before or on the entity's end date
        $endValid = !$entityFin || $horarioFin->lte($entityFin);

        return $startValid && $endValid;
    }
}

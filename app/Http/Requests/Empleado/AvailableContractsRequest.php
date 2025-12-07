<?php

namespace App\Http\Requests\Empleado;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use App\Models\Empleado;

class AvailableContractsRequest extends FormRequest
{
    /**
     * Cache for validated empleados to avoid duplicate queries
     */
    private $validatedEmpleados = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('viewContracts', 'web');
    }

    /**
     * Get the validation rules that apply to the request.
     */    public function rules(): array
    {
        return [
            'empleados' => 'required|array|min:1',
            'empleados.*.empleado_id' => 'required|integer',
            'empleados.*.fechas' => 'required|array|min:1',
            'empleados.*.fechas.*' => 'required|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'empleados.required' => 'El campo empleados es obligatorio.',
            'empleados.array' => 'El campo empleados debe ser un array.',
            'empleados.min' => 'Debe consultar al menos un empleado.',
            'empleados.*.empleado_id.required' => 'El ID del empleado es obligatorio.',
            'empleados.*.empleado_id.integer' => 'El ID del empleado debe ser un número entero.',
            'empleados.*.fechas.required' => 'Las fechas son obligatorias.',
            'empleados.*.fechas.array' => 'Las fechas deben ser un array.',
            'empleados.*.fechas.min' => 'Debe especificar al menos una fecha.',
            'empleados.*.fechas.*.required' => 'Cada fecha es obligatoria.',
            'empleados.*.fechas.*.date' => 'Cada fecha debe tener un formato válido.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'empleados.*.empleado_id' => 'ID del empleado',
            'empleados.*.fechas' => 'fechas',
            'empleados.*.fechas.*' => 'fecha',
        ];
    }

    /**
     * Get the validated empleados data with parsed dates.
     */
    public function getValidatedEmpleados(): array
    {
        $empleados = $this->validated()['empleados'];

        foreach ($empleados as &$empleado) {
            $empleado['fechas'] = collect($empleado['fechas'])
                ->map(fn($fecha) => \Carbon\Carbon::parse($fecha))
                ->sort()
                ->values()
                ->all();
        }

        return $empleados;
    }

    /**
     * Get all unique empleado IDs from the request.
     */
    public function getEmpleadoIds(): array
    {
        return collect($this->empleados)
            ->pluck('empleado_id')
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Get the date range for all empleados.
     */
    public function getDateRange(): array
    {
        $todasLasFechas = collect($this->empleados)
            ->pluck('fechas')
            ->flatten()
            ->unique()
            ->sort();

        return [
            'min' => $todasLasFechas->min(),
            'max' => $todasLasFechas->max()
        ];
    }

    /**
     * Get cached validated empleados to avoid duplicate queries.
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCachedValidatedEmpleados()
    {
        return $this->validatedEmpleados;
    }

    /**
     * Configure the validator instance with custom validation.
     * This validates empleado existence in a single query and caches results.
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

            $empleadosData = $this->input('empleados', []);
            $empleadoIds = collect($empleadosData)->pluck('empleado_id')->filter()->unique();

            if ($empleadoIds->isEmpty()) {
                return;
            }

            // Single query to validate empleado existence and cache results
            $this->validatedEmpleados = Empleado::whereIn('id', $empleadoIds)->get()->keyBy('id');

            // Validate that all empleados exist
            foreach ($empleadosData as $index => $empleadoData) {
                if (!isset($empleadoData['empleado_id']) || !$this->validatedEmpleados->has($empleadoData['empleado_id'])) {
                    $validator->errors()->add(
                        "empleados.{$index}.empleado_id",
                        'El empleado especificado no existe.'
                    );
                }
            }
        });
    }
}

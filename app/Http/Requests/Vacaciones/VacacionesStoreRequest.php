<?php

namespace App\Http\Requests\Vacaciones;

use App\Services\SolicitudPermiso\SolicitudPermisoValidationService;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Validator;

class VacacionesStoreRequest extends FormRequest
{
    const VACACIONES_PERMISO_ID = 1;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('createWorkPermitRequests', 'web');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'empleado_id' => 'required|integer|exists:empleados,id',
            'permiso_id' => [
                'required',
                'integer',
                'exists:permisos,id',
                // Validación adicional para permisos de vacaciones
                function ($attribute, $value, $fail) {
                    if ((int)$value !== self::VACACIONES_PERMISO_ID) {
                        $fail('El permiso seleccionado no es válido para vacaciones.');
                    }
                },
            ],
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i',
            'dia_completo' => 'required|boolean',
            'motivo' => 'required|string|max:500',
            'recuperable' => 'boolean',
            'observaciones' => 'nullable|string|max:1000',

            // Validación de archivos
            'files' => 'nullable|array|max:10',
            'files.*' => [
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg,png',
                'max:10240', // 10MB
            ],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Verificar que no existen errores previos
            if ($validator->errors()->count() > 0) {
                return;
            }

            // Validar reglas de fechas
            $validationService = app(SolicitudPermisoValidationService::class);

            // Validar que las fechas de inicio y fin son correctas
            $dateErrors = $validationService->validateDates($this->fecha_inicio, $this->fecha_fin);

            foreach ($dateErrors as $field => $error) {
                $validator->errors()->add($field, $error);
            }

            /**
             * TODO: Aquí va la validación de vacaciones aportada por el Servicio BalanceService
             * TODO: Obtiene el balance de vacaciones del empleado y valida que la duración solicitada es correcta y se ajusta a las reglas de la empresa.
             */

            // Verify that exits a conflict with other approved requests
            $existsConflicts = $validationService->hasDateConflicts(
                $this->getEmpleado()->id,
                $this->fecha_inicio,
                $this->fecha_fin
            );

            if ($existsConflicts) {
                $validator->errors()->add(
                    'fecha_inicio',
                    'Existe un conflicto con otras solicitudes aprobadas en este período.'
                );
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'permiso_id.required' => 'El tipo de permiso es obligatorio.',
            'permiso_id.exists' => 'El tipo de permiso especificado no existe.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'motivo.required' => 'El motivo es obligatorio.',
            'motivo.max' => 'El motivo no puede exceder 500 caracteres.',
            'recuperable.boolean' => 'El campo recuperable debe ser verdadero o falso.',
            'observaciones.max' => 'Las observaciones no pueden exceder 1000 caracteres.',
            'files.max' => 'No puede adjuntar más de 10 archivos.',
            'files.*.mimes' => 'Solo se permiten archivos PDF, DOC, DOCX, JPG, JPEG, PNG.',
            'files.*.max' => 'Cada archivo no puede exceder 10MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $fecha_inicio = Carbon::parse($this->fecha_inicio)->startOfDay();
        $fecha_fin = Carbon::parse($this->fecha_fin);

        // Normalizar fecha_fin para días completos
        if ($this->dia_completo) {
            $fecha_fin = $fecha_fin->startOfDay()->addDay()->subSecond(); // 23:59:59
        } else {
            if ($this->hora_fin) {
                $fecha_fin->setTimeFromTimeString($this->hora_fin);
            } else {
                $fecha_fin = $fecha_fin->startOfDay()->addDay()->subSecond();
            }
        }

        $this->merge([
            'fecha_inicio' => $fecha_inicio,
            'fecha_fin' => $fecha_fin,
        ]);
    }

    protected function afterValidation(): void
    {
        // Aquí puedes realizar cualquier acción adicional después de la validación
        // Por ejemplo, registrar un evento o enviar una notificación
    }

    /**
     * Obtener los datos validados con procesamiento adicional.
     * Sobreescribe el método validated() para personalizar los datos retornados.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        $validated['empleado_id'] = $this->getEmpleado()->id;
        $validated['estado_id'] = 2; // Estado inicial, por ejemplo, "En revisión"
        $validated['seen_at'] = now();

        return Arr::except($validated, ['hora_inicio', 'hora_fin']);
    }

    /**
     * Obtener el empleado basado en el empleado_id del request
     */
    public function getEmpleado()
    {
        if (!$this->empleado_id) {
            return null;
        }

        return \App\Models\Empleado::find($this->empleado_id);
    }
}

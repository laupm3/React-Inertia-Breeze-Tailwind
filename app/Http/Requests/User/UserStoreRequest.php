<?php

namespace App\Http\Requests\User;

use App\Rules\User\DateAfterTodayInTimezone;
use App\Rules\User\DateOrderInTimezone;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('createUsers', 'web');
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $userTimezone = $this->getUserTimezone();
        $processedData = [];

        if ($this->status_initial_date) {
            $processedData['status_initial_date_user_tz'] = Carbon::parse($this->status_initial_date)
                ->setTimezone($userTimezone);
        }

        if ($this->status_final_date) {
            $processedData['status_final_date_user_tz'] = Carbon::parse($this->status_final_date)
                ->setTimezone($userTimezone);
        }

        // Obtenemos la fecha y hora actual en la zona horaria del usuario, no solo la fecha
        $processedData['today_user_tz'] = Carbon::now($userTimezone);

        $this->merge($processedData);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $userTimezone = $this->getUserTimezone();

        return [
            ...$this->getBasicRules(),
            ...$this->getStatusRules($userTimezone),
            ...$this->getTimezoneRules(),
        ];
    }

    /**
     * Handle a passed validation attempt.
     */
    protected function passedValidation(): void
    {
        $backendTimezone = config('app.timezone');
        $processedData = [];

        if ($this->status_initial_date) {
            $processedData['status_initial_date'] = Carbon::parse($this->status_initial_date)
                ->utc()  // ✅ Especificar que la fecha viene en UTC
                ->setTimezone($backendTimezone)
                ->format('Y-m-d H:i:s'); // ✅ Convertir a string para la base de datos
        }

        if ($this->status_final_date) {
            $processedData['status_final_date'] = Carbon::parse($this->status_final_date)
                ->utc()  // ✅ Especificar que la fecha viene en UTC
                ->setTimezone($backendTimezone)
                ->format('Y-m-d H:i:s'); // ✅ Convertir a string para la base de datos
        }

        $this->logDateConversions($processedData);
        $this->merge($processedData);
    }

    /**
     * Obtiene la zona horaria del usuario o la por defecto
     */
    protected function getUserTimezone(): string
    {
        return $this->user_timezone ?? config('app.timezone');
    }

    /**
     * Reglas básicas de validación
     */
    protected function getBasicRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'unique:users,email'
            ],
            'empleado_id' => [
                'nullable',
                'exists:empleados,id',
                Rule::unique('users', 'empleado_id')->ignore($this->empleado_id)
            ],
            'role_id' => ['nullable', 'exists:roles,id'],
            'photo' => ['nullable', 'mimes:jpg,jpeg,png', 'max:1024'],
        ];
    }

    /**
     * Reglas de validación para el estado
     */
    protected function getStatusRules(string $userTimezone): array
    {
        return [
            'status' => ['nullable', 'integer', 'in:0,1,2,3,4'],
            'status_initial_date' => [
                'nullable',
                'date_format:Y-m-d\TH:i:s.v\Z',
                new DateAfterTodayInTimezone($userTimezone),
                new DateOrderInTimezone($this->status_final_date, $userTimezone, 'before_or_equal'),
            ],
            'status_final_date' => [
                'nullable',
                'date_format:Y-m-d\TH:i:s.v\Z',
                new DateAfterTodayInTimezone($userTimezone),
                new DateOrderInTimezone($this->status_initial_date, $userTimezone, 'after_or_equal'),
            ],
        ];
    }

    /**
     * Reglas de validación para zona horaria
     */
    protected function getTimezoneRules(): array
    {
        return [
            'user_timezone' => [
                'required_with:status_initial_date,status_final_date',
                'string',
                'timezone'
            ],
        ];
    }

    /**
     * Log del intento de validación
     */
    protected function logValidationAttempt(): void
    {
        Log::info('Validating UserStoreRequest', [
            'user_id' => $this->user()->id,
            'request_data' => $this->except(['photo']) // Excluir archivos del log
        ]);
    }

    /**
     * Log de las conversiones de fecha
     */
    protected function logDateConversions(array $processedData): void
    {
        $userTimezone = $this->getUserTimezone();
        $backendTimezone = config('app.timezone');

        if (!empty($processedData['status_initial_date'])) {
            Log::info('Converted status_initial_date', [
                'original_utc' => $this->status_initial_date,
                'user_timezone' => $userTimezone,
                'backend_timezone' => $backendTimezone,
                'converted' => $processedData['status_initial_date']
            ]);
        }

        if (!empty($processedData['status_final_date'])) {
            Log::info('Converted status_final_date', [
                'original_utc' => $this->status_final_date,
                'user_timezone' => $userTimezone,
                'backend_timezone' => $backendTimezone,
                'converted' => $processedData['status_final_date']
            ]);
        }
    }

    /**
     * Get the validated data from the request.
     * Override para incluir datos procesados después de passedValidation()
     */
    public function validated($key = null, $default = null): array
    {
        // Obtener las claves de los campos validados
        $validatedKeys = array_keys($this->rules());

        // Filtrar solo los campos validados de todos los datos (incluyendo procesados)
        $processedValidated = collect($this->all())
            ->only($validatedKeys)
            ->toArray();

        if (is_null($key)) {
            return $processedValidated;
        }

        return data_get($processedValidated, $key, $default);
    }
}

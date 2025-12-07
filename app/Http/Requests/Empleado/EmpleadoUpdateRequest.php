<?php

namespace App\Http\Requests\Empleado;

use Closure;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use App\Services\DocumentoValidationService;

class EmpleadoUpdateRequest extends FormRequest
{
    protected $documentoValidationService;

    public function __construct(DocumentoValidationService $documentoValidationService)
    {
        $this->documentoValidationService = $documentoValidationService;
    }

    /**
     * Assoc array with the key as the error bag and the value as the error message
     */
    protected $errorBag = 'updateOrCreateEmpleado';

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $empleadoId = $this->route('empleado'); // esto es para que el usuario no pueda cambiar el id del empleado
        
        return [
            'id' => ['required', 'exists:empleados,id'],
            'tipo_empleado_id' => ['required', 'exists:tipo_empleados,id'],
            'genero_id' => ['required', 'exists:generos,id'],
            'estado_id' => ['required', 'exists:estado_empleados,id'],
            'tipo_documento_id' => ['required', 'exists:tipo_documentos,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'primer_apellido' => ['required', 'string', 'max:255'],
            'segundo_apellido' => ['required', 'string', 'max:255'],
            'nif' => [
                'required', 
                'string', 
                'max:255', 
                'unique:empleados,nif,' . $this->id,
                // Validación personalizada usando el servicio de documentos
                function (string $attribute, mixed $value, Closure $fail) {
                    if (!$this->documentoValidationService->validateDocumento($value, $this->tipo_documento_id)) {
                        $fail($this->documentoValidationService->getErrorMessage($this->tipo_documento_id));
                    }
                }
            ],
            'caducidad_nif' => ['required', 'date', 'after:today'],
            'email' => ['required', 'email', 'unique:empleados,email,' . $this->id],
            'email_secundario' => ['nullable', 'email'],
            'telefono' => ['required', 'string', 'max:15'],
            'telefono_personal_movil' => ['nullable', 'string', 'max:15'],
            'telefono_personal_fijo' => ['nullable', 'string', 'max:15'],
            'extension_centrex' => ['nullable', 'string', 'max:15'],
            'fecha_nacimiento' => ['required', 'date'],
            'niss' => ['required', 'string', 'max:255', 'unique:empleados,niss,' . $this->id],
            'contacto_emergencia' => ['nullable', 'string', 'max:255'],
            'telefono_emergencia' => ['nullable', 'string', 'max:15'],
            'observaciones_salud' => [
                'nullable', 
                'string', 
                'max:1000',
                // Solo validar si el usuario tiene permisos para ver observaciones de salud
                function (string $attribute, mixed $value, Closure $fail) {
                    if ($value && !$this->user()->hasRole(['Administrator', 'Super Admin'])) {
                        $fail('No tienes permisos para establecer observaciones de salud.');
                    }
                }
            ],
            'direccion.id' => ['required', 'exists:direcciones,id'],
            'direccion.full_address' => ['required', 'string', 'max:255'],
            'direccion.latitud' => ['required', 'numeric', 'decimal:-90,90'],
            'direccion.longitud' => ['required', 'numeric', 'between:-180,180'],
            'direccion.codigo_postal' => ['nullable', 'string', 'max:255'],
            'direccion.numero' => ['nullable', 'string', 'max:255'],
            'direccion.piso' => ['nullable', 'string', 'max:255'],
            'direccion.puerta' => ['nullable', 'string', 'max:255'],
            'direccion.escalera' => ['nullable', 'string', 'max:255'],
            'direccion.bloque' => ['nullable', 'string', 'max:255'],
            
            // NUEVAS REGLAS PARA EL MANEJO DE USUARIOS (SIMPLIFICADAS)
            'user_id' => [
                'nullable',
                'exists:users,id',
            ],
            'create_user' => [
                'nullable',
                'boolean',
            ],
            'remove_user' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'user_id.exists' => 'El usuario seleccionado no existe o ya tiene un empleado asociado.',
            'create_user.boolean' => 'El campo create_user debe ser verdadero o falso.',
            'remove_user.boolean' => 'El campo remove_user debe ser verdadero o falso.',
        ];
    }
}

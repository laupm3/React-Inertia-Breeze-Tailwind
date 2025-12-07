<?php

namespace App\Services\Import;

use App\Models\User;
use App\Models\Empleado;
use App\Enums\UserStatus;

class UsuarioImportService extends BaseImportService
{
    protected function getEntityName(): string
    {
        return 'Usuarios';
    }

    protected function getModelClass(): string
    {
        return User::class;
    }

    public function getSchema(): array
    {
        $statusLabels = array_map(fn($case) => $case->label(), UserStatus::cases());

        return [
            'entity' => 'usuarios',
            'fields' => [
                [
                    'name' => 'name',
                    'label' => 'Nombre (*)',
                    'type' => 'string',
                    'required' => true,
                    'max_length' => 255,
                ],
                [
                    'name' => 'email',
                    'label' => 'Email (*)',
                    'type' => 'email',
                    'required' => true,
                    'unique' => true,
                ],
                [
                    'name' => 'empleado_email',
                    'label' => 'Email del Empleado',
                    'type' => 'string',
                    'required' => false,
                    'description' => 'Email del empleado para vincular el usuario',
                ],
                [
                    'name' => 'descripcion',
                    'label' => 'Descripción',
                    'type' => 'text',
                    'required' => false,
                ],
                [
                    'name' => 'status',
                    'label' => 'Estado (*)',
                    'type' => 'select',
                    'required' => true,
                    'options' => $statusLabels,
                    'default' => 'Pendiente',
                    'help' => 'También acepta valores en inglés: inactive, active, suspended, pending, banned'
                ],
            ]
        ];
    }

    protected function getValidationRules(): array
    {
        // Generar dinámicamente la lista de estados válidos
        $validStatuses = array_map(fn($case) => strtolower($case->name), UserStatus::cases());
        $statusRule = 'in:' . implode(',', $validStatuses);
        
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'empleado_email' => ['nullable', 'email'],
            'descripcion' => ['nullable', 'string'],
            'status' => ['required', $statusRule],
        ];
    }

    protected function processRecord(array $data): array
    {
        $errors = [];
        $processedData = [];

        // Validar y procesar nombre
        $name = $this->normalizeText($data['name'] ?? null);
        if (empty($name)) {
            $errors[] = 'El nombre es obligatorio';
        } else {
            $processedData['name'] = $name;
        }

        // Validar y procesar email
        $email = $this->normalizeEmail($data['email'] ?? null);
        if (empty($email)) {
            $errors[] = 'El email es obligatorio';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El formato del email no es válido';
        } elseif (!$this->validateUniqueness('email', $email)) {
            $errors[] = 'Ya existe un usuario con este email';
        } else {
            $processedData['email'] = $email;
        }

        // Generar contraseña automáticamente (10 caracteres: minúsculas, mayúsculas y números)
        $processedData['password'] = bcrypt($this->generateRandomPassword(10));

        // Procesar empleado (opcional)
        $empleadoEmail = $this->normalizeEmail($data['empleado_email'] ?? null);
        if (!empty($empleadoEmail)) {
            $empleado = Empleado::where('email', $empleadoEmail)->first();
            if (!$empleado) {
                $errors[] = 'No se encontró un empleado con el email proporcionado';
            } elseif ($empleado->user) {
                $errors[] = 'El empleado ya tiene un usuario asignado';
            } else {
                $processedData['empleado_id'] = $empleado->id;
            }
        }

        // Procesar descripción
        $descripcion = $this->normalizeText($data['descripcion'] ?? null);
        if (!empty($descripcion)) {
            $processedData['descripcion'] = $descripcion;
        }

        // Validar y procesar estado
        $status = strtolower(trim($data['status'] ?? 'active'));
        
        // Mapeo de valores en español a inglés
        $spanishToEnglish = [
            'inactivo' => 'inactive',
            'activo' => 'active', 
            'suspendido' => 'suspended',
            'pendiente' => 'pending',
            'bloqueado' => 'banned'
        ];
        
        // Si el valor está en español, convertir a inglés
        if (isset($spanishToEnglish[$status])) {
            $status = $spanishToEnglish[$status];
        }
        
        // Obtener todos los valores válidos del Enum UserStatus
        $validStatuses = [];
        $enumCases = UserStatus::cases();
        foreach ($enumCases as $case) {
            $validStatuses[] = strtolower($case->name);
        }
        
        if (!in_array($status, $validStatuses)) {
            // Mostrar tanto valores en inglés como en español en el mensaje de error
            $validSpanishValues = array_keys($spanishToEnglish);
            $allValidValues = array_merge($validStatuses, $validSpanishValues);
            $statusList = implode(', ', $allValidValues);
            $errors[] = "El estado debe ser uno de: {$statusList}";
        } else {
            // Buscar el caso del enum que coincida con el valor ingresado
            $enumCase = null;
            foreach ($enumCases as $case) {
                if (strtolower($case->name) === $status) {
                    $enumCase = $case;
                    break;
                }
            }
            // Guardar como string para que coincida con el campo varchar de la BD
            $processedData['status'] = (string) $enumCase->value;
        }

        return [
            'data' => $processedData,
            'errors' => $errors
        ];
    }

    protected function getExampleData(): array
    {
        return [
            'Juan Pérez',
            'juan.perez@empresa.com',
            'juan.perez@empleados.com',
            'Usuario administrador del sistema',
            'Activo'
        ];
    }

    /**
     * Usa el método genérico de procesamiento con validación de duplicados
     */
    public function processImport(array $validatedData): array
    {
        return $this->processImportGeneric($validatedData);
    }

    /**
     * Mapea nombres de campos del backend a nombres del esquema/CSV
     */
    protected function mapFieldToSchemaName(string $field): string
    {
        $mapping = [
            'name' => 'Nombre (*)',
            'email' => 'Email (*)',
            'empleado_email' => 'Email del Empleado',
            'descripcion' => 'Descripción',
            'status' => 'Estado (*)'
        ];

        return $mapping[$field] ?? $field;
    }

    /**
     * Genera una contraseña aleatoria de longitud especificada
     * Incluye minúsculas, mayúsculas y números
     */
    private function generateRandomPassword(int $length = 10): string
    {
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $numbers = '0123456789';
        $allChars = $lowercase . $uppercase . $numbers;
        
        $password = '';
        
        // Asegurar que al menos haya una minúscula, una mayúscula y un número
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        
        // Completar el resto de la contraseña con caracteres aleatorios
        for ($i = 3; $i < $length; $i++) {
            $password .= $allChars[random_int(0, strlen($allChars) - 1)];
        }
        
        // Mezclar los caracteres para que no estén en orden predecible
        return str_shuffle($password);
    }
}

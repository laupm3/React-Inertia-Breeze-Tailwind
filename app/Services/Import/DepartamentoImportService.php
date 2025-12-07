<?php

namespace App\Services\Import;

use App\Models\Departamento;
use App\Models\Empleado;
use Illuminate\Support\Facades\Log;

class DepartamentoImportService extends BaseImportService
{
    protected function getEntityName(): string
    {
        return 'Departamentos';
    }

    protected function getModelClass(): string
    {
        return Departamento::class;
    }

    public function getSchema(): array
    {
        return [
            'entity' => 'departamentos',
            'fields' => [
                [
                    'name' => 'nombre',
                    'label' => 'Nombre (*)',
                    'type' => 'string',
                    'required' => true,
                    'max_length' => 255,
                ],
                [
                    'name' => 'descripcion',
                    'label' => 'Descripción',
                    'type' => 'text',
                    'required' => false,
                ],
                [
                    'name' => 'manager_nombre_completo',
                    'label' => 'Manager (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre completo del empleado que será manager del departamento',
                ],
                [
                    'name' => 'adjunto_nombre_completo',
                    'label' => 'Adjunto (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre completo del empleado que será adjunto del departamento',
                ],
                [
                    'name' => 'parent_department_name',
                    'label' => 'Departamento Padre',
                    'type' => 'string',
                    'required' => false,
                    'description' => 'Nombre del departamento padre (para jerarquías)',
                ],
            ]
        ];
    }

    protected function getValidationRules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'manager_email' => ['nullable', 'email'],
            'adjunto_email' => ['nullable', 'email'],
            'parent_department_name' => ['nullable', 'string'],
        ];
    }

    protected function processRecord(array $data): array
    {
        $errors = [];
        $processedData = [];
        $errorFields = []; // Para mapear errores específicos por campo

        Log::info("[DepartamentosImport] Procesando registro", [
            'data' => $data
        ]);

        // Validar y procesar nombre
        $nombre = $this->normalizeText($data['nombre'] ?? null);
        if (empty($nombre)) {
            $errors[] = 'El nombre es obligatorio';
            $errorFields[] = 'nombre';
        } else {
            // Verificar que no exista otro departamento con el mismo nombre
            if (Departamento::where('nombre', $nombre)->exists()) {
                $errors[] = 'Ya existe un departamento con este nombre';
                $errorFields[] = 'nombre';
            } else {
                $processedData['nombre'] = $nombre;
            }
        }

        // Procesar descripción
        $descripcion = $this->normalizeText($data['descripcion'] ?? null);
        if (!empty($descripcion)) {
            $processedData['descripcion'] = $descripcion;
        }

        // Procesar manager (obligatorio)
        $managerNombreCompleto = $this->normalizeText($data['manager_nombre_completo'] ?? null);
        Log::info("[DepartamentosImport] Validando manager", [
            'manager_nombre_completo' => $managerNombreCompleto,
            'original_data' => $data['manager_nombre_completo'] ?? 'NO_EXISTE'
        ]);
        
        if (empty($managerNombreCompleto)) {
            $errors[] = 'El Manager es obligatorio';
            $errorFields[] = 'manager_nombre_completo';
        } else {
            // Buscar empleado por nombre completo usando el accessor full_name
            // Optimización: obtener todos los empleados una sola vez
            $manager = null;
            $empleados = Empleado::all();
            
            foreach ($empleados as $empleado) {
                if ($empleado->full_name === $managerNombreCompleto) {
                    $manager = $empleado;
                    break;
                }
            }
            
            if (!$manager) {
                $errors[] = "No se encontró un empleado con el nombre completo: {$managerNombreCompleto}";
                $errorFields[] = 'manager_nombre_completo';
                Log::warning("[DepartamentosImport] Manager no encontrado", [
                    'nombre_buscado' => $managerNombreCompleto,
                    'empleados_disponibles' => $empleados->map(function($emp) { return $emp->full_name; })->toArray()
                ]);
            } else {
                $processedData['manager_id'] = $manager->id;
                Log::info("[DepartamentosImport] Manager encontrado", [
                    'manager_id' => $manager->id,
                    'nombre_completo' => $manager->full_name
                ]);
            }
        }

        // Procesar adjunto (obligatorio)
        $adjuntoNombreCompleto = $this->normalizeText($data['adjunto_nombre_completo'] ?? null);
        Log::info("[DepartamentosImport] Validando adjunto", [
            'adjunto_nombre_completo' => $adjuntoNombreCompleto,
            'original_data' => $data['adjunto_nombre_completo'] ?? 'NO_EXISTE'
        ]);
        
        if (empty($adjuntoNombreCompleto)) {
            $errors[] = 'El Adjunto es obligatorio';
            $errorFields[] = 'adjunto_nombre_completo';
        } else {
            // Buscar empleado por nombre completo usando el accessor full_name
            // Reutilizar la misma lista de empleados si ya se obtuvo antes
            if (!isset($empleados)) {
                $empleados = Empleado::all();
            }
            
            $adjunto = null;
            foreach ($empleados as $empleado) {
                if ($empleado->full_name === $adjuntoNombreCompleto) {
                    $adjunto = $empleado;
                    break;
                }
            }
            
            if (!$adjunto) {
                $errors[] = "No se encontró un empleado con el nombre completo: {$adjuntoNombreCompleto}";
                $errorFields[] = 'adjunto_nombre_completo';
                Log::warning("[DepartamentosImport] Adjunto no encontrado", [
                    'nombre_buscado' => $adjuntoNombreCompleto,
                    'empleados_disponibles' => $empleados->map(function($emp) { return $emp->full_name; })->toArray()
                ]);
            } else {
                $processedData['adjunto_id'] = $adjunto->id;
                Log::info("[DepartamentosImport] Adjunto encontrado", [
                    'adjunto_id' => $adjunto->id,
                    'nombre_completo' => $adjunto->full_name
                ]);
            }
        }

        // Procesar departamento padre (opcional)
        $parentDepartmentName = $this->normalizeText($data['parent_department_name'] ?? null);
        if (!empty($parentDepartmentName)) {
            $parentDepartment = Departamento::where('nombre', $parentDepartmentName)->first();
            if (!$parentDepartment) {
                $errors[] = 'No se encontró un departamento padre con el nombre proporcionado';
                $errorFields[] = 'parent_department_name';
            } else {
                $processedData['parent_department_id'] = $parentDepartment->id;
            }
        }

        // Convertir errores a la estructura esperada por processImportGeneric
        $errorResult = [];
        if (!empty($errors)) {
            $errorResult = [
                'messages' => $errors,
                'fields' => $errorFields // Campos específicos que tienen errores
            ];
        }

        return [
            'data' => $processedData,
            'errors' => $errorResult
        ];
    }

    protected function getExampleData(): array
    {
        return [
            'Recursos Humanos',
            'Departamento encargado de la gestión del personal y recursos humanos',
            'Juan Pérez García',
            'María González López', 
            'Administración'
        ];
    }

    /**
     * Mapea errores de campos de base de datos a nombres del schema
     */
    protected function mapDatabaseErrorsToSchemaFields(array $errors): array
    {
        $fieldMapping = [
            'manager_id' => 'manager_nombre_completo',
            'adjunto_id' => 'adjunto_nombre_completo',
        ];

        $mappedErrors = [];
        
        foreach ($errors as $field => $messages) {
            $schemaField = $fieldMapping[$field] ?? $field;
            $mappedErrors[$schemaField] = $messages;
        }

        return $mappedErrors;
    }

    /**
     * Convierte errores de base de datos en mensajes amigables específicos para departamentos
     */
    protected function convertDatabaseErrorToFriendlyMessage(\Exception $e, array $row): array
    {
        $errorMessage = $e->getMessage();
        
        // Detectar errores de constraint NOT NULL específicos para departamentos
        if (strpos($errorMessage, 'NOT NULL constraint failed') !== false) {
            if (preg_match('/NOT NULL constraint failed: \w+\.(\w+)/', $errorMessage, $matches)) {
                $fieldName = $matches[1];
                
                // Mapeo específico para departamentos
                $fieldMapping = [
                    'manager_id' => 'Manager (*)',
                    'adjunto_id' => 'Adjunto (*)',
                    'nombre' => 'Nombre (*)'
                ];
                
                $schemaFieldMapping = [
                    'manager_id' => 'manager_nombre_completo',
                    'adjunto_id' => 'adjunto_nombre_completo',
                    'nombre' => 'nombre'
                ];
                
                if (isset($fieldMapping[$fieldName])) {
                    $fieldLabel = $fieldMapping[$fieldName];
                    $schemaField = $schemaFieldMapping[$fieldName];
                    
                    return [
                        'messages' => ["El campo {$fieldLabel} es obligatorio"],
                        'fields' => [$schemaField]
                    ];
                }
            }
        }
        
        // Para otros errores, usar el método padre
        return parent::convertDatabaseErrorToFriendlyMessage($e, $row);
    }

    /**
     * Usa el método genérico de procesamiento con validación de duplicados
     */
    public function processImport(array $validatedData): array
    {
        return $this->processImportGeneric($validatedData);
    }
}

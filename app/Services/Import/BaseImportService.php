<?php

namespace App\Services\Import;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use Illuminate\Support\Facades\Storage;

abstract class BaseImportService
{
    protected string $entityName;
    protected string $modelClass;
    
    public function __construct()
    {
        $this->entityName = $this->getEntityName();
        $this->modelClass = $this->getModelClass();
    }

    /**
     * Obtiene el nombre de la entidad
     */
    abstract protected function getEntityName(): string;

    /**
     * Obtiene la clase del modelo
     */
    abstract protected function getModelClass(): string;

    /**
     * Obtiene el esquema de campos para la importación
     */
    abstract public function getSchema(): array;

    /**
     * Obtiene las reglas de validación para la importación
     */
    abstract protected function getValidationRules(): array;

    /**
     * Procesa un registro individual para importación
     */
    abstract protected function processRecord(array $data): array;

    /**
     * Obtiene los datos de ejemplo para la plantilla
     */
    abstract protected function getExampleData(): array;

    /**
     * Genera los datos para la plantilla de importación
     */
    public function getTemplateData(): array
    {
        $schema = $this->getSchema();
        $headers = array_column($schema['fields'], 'label');
        $exampleData = $this->getExampleData();
        
        return [
            'headers' => $headers,
            'example_data' => $exampleData,
            'instructions' => $this->getTemplateInstructions()
        ];
    }

    /**
     * Obtiene las instrucciones para la plantilla
     */
    protected function getTemplateInstructions(): array
    {
        return [
            'No modifique los nombres de las columnas (primera fila)',
            'No elimine la fila de ejemplo (segunda fila)',
            'Los campos marcados con (*) son obligatorios',
            'Agregue sus datos a partir de la tercera fila',
            'Mantenga el formato de la fila de ejemplo'
        ];
    }

    /**
     * Procesa la importación de datos
     */
    public function processImport(array $validatedData): array
    {
        try {
            Log::info("[{$this->entityName}Import] Iniciando procesamiento", [
                'records_count' => count($validatedData['data'] ?? [])
            ]);

            $data = $validatedData['data'] ?? [];
            $results = [
                'success' => true,
                'success_count' => 0,
                'error_count' => 0,
                'errors' => [],
                'created_ids' => []
            ];

            foreach ($data as $index => $record) {
                try {
                    $processedRecord = $this->processRecord($record);
                    
                    if (isset($processedRecord['errors']) && !empty($processedRecord['errors'])) {
                        $results['error_count']++;
                        $results['errors'][] = [
                            'row' => $index + 1,
                            'errors' => $processedRecord['errors']
                        ];
                        continue;
                    }

                    // Crear el registro
                    $model = new $this->modelClass();
                    $created = $model->create($processedRecord['data']);
                    
                    $results['success_count']++;
                    $results['created_ids'][] = $created->id;

                } catch (\Exception $e) {
                    $results['error_count']++;
                    $results['errors'][] = [
                        'row' => $index + 1,
                        'errors' => ['Error general: ' . $e->getMessage()]
                    ];
                    
                    Log::error("[{$this->entityName}Import] Error procesando registro", [
                        'row' => $index + 1,
                        'error' => $e->getMessage(),
                        'data' => $record
                    ]);
                }
            }

            if ($results['error_count'] > 0) {
                $results['success'] = false;
                $results['message'] = "Se encontraron {$results['error_count']} errores. No se importará ningún registro hasta que se corrijan todos los errores.";
            } else {
                $results['message'] = "Importación completada exitosamente. {$results['success_count']} registros importados.";
            }

            Log::info("[{$this->entityName}Import] Procesamiento completado", $results);
            
            return $results;

        } catch (\Exception $e) {
            Log::error("[{$this->entityName}Import] Error general en importación", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error durante la importación: ' . $e->getMessage(),
                'success_count' => 0,
                'error_count' => 0,
                'errors' => []
            ];
        }
    }

    /**
     * Valida un campo específico
     */
    protected function validateField(string $field, $value, array $rules): array
    {
        $validator = Validator::make(
            [$field => $value],
            [$field => $rules]
        );

        return $validator->errors()->get($field);
    }

    /**
     * Normaliza un valor de texto
     */
    protected function normalizeText(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }
        
        return trim($value);
    }

    /**
     * Normaliza una fecha
     */
    protected function normalizeDate($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Normaliza un email
     */
    protected function normalizeEmail(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }
        
        return strtolower(trim($value));
    }

    /**
     * Busca un modelo por campo
     */
    protected function findModelByField(string $modelClass, string $field, $value)
    {
        if (empty($value)) {
            return null;
        }

        return $modelClass::where($field, $value)->first();
    }

    /**
     * Valida la unicidad de un campo
     */
    protected function validateUniqueness(string $field, $value, ?int $excludeId = null): bool
    {
        if (empty($value)) {
            return true;
        }

        $query = $this->modelClass::where($field, $value);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return !$query->exists();
    }

    /**
     * Verifica duplicados en la base de datos usando el esquema dinámico
     */
    protected function checkDuplicatesInDB(array $row): array
    {
        $errors = [];
        $duplicateFields = [];
        $schema = $this->getSchema();

        // Buscar campos únicos en el esquema
        foreach ($schema['fields'] as $field) {
            if (!empty($field['unique'])) {
                $fieldLabel = $field['label'];
                $fieldName = $field['name'];
                
                // Intentar obtener el valor usando el name del campo primero, luego el label
                $value = $row[$fieldName] ?? $row[$fieldLabel] ?? null;
                
                if (!empty($value) && !$this->validateUniqueness($fieldName, $value)) {
                    $fieldDisplayName = str_replace(' (*)', '', $fieldLabel);
                    
                    $errors[] = "Ya existe un registro con el mismo {$fieldDisplayName}";
                    $duplicateFields[] = $fieldName; // Usar el name para consistencia
                }
            }
        }

        return [
            'messages' => $errors,
            'fields' => $duplicateFields
        ];
    }

    /**
     * Valida una fila de datos usando las reglas dinámicas
     */
    protected function validateRowWithSchema(array $row): array
    {
        $errors = [];
        $errorFields = [];
        $schema = $this->getSchema();

        foreach ($schema['fields'] as $field) {
            $fieldLabel = $field['label'];
            $fieldName = $field['name'];
            
            // Intentar obtener el valor usando el name del campo primero, luego el label
            $value = $row[$fieldName] ?? $row[$fieldLabel] ?? null;

            // Validar campos requeridos
            if ($field['required'] && (empty($value) || trim($value) === '')) {
                $errors[] = "El campo {$fieldLabel} es obligatorio";
                $errorFields[] = $fieldName;
                continue;
            }

            // Si no hay valor y no es requerido, continuar
            if (empty($value) || trim($value) === '') {
                continue;
            }

            // Validar por tipo
            switch ($field['type']) {
                case 'email':
                    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[] = "El formato del email en {$fieldLabel} no es válido";
                        $errorFields[] = $fieldName;
                    }
                    break;
                
                case 'date':
                    if (!$this->isValidDate($value)) {
                        $errors[] = "La fecha en {$fieldLabel} no es válida";
                        $errorFields[] = $fieldName;
                    }
                    break;
                
                case 'boolean':
                    if (isset($field['options']) && !in_array($value, $field['options'])) {
                        $validOptions = implode(', ', $field['options']);
                        $errors[] = "El valor en {$fieldLabel} debe ser uno de: {$validOptions}";
                        $errorFields[] = $fieldName;
                    }
                    break;
                
                case 'select':
                    if (isset($field['options']) && !in_array($value, $field['options'])) {
                        $optionsText = implode(', ', $field['options']);
                        $errors[] = "El valor en {$fieldLabel} debe ser uno de: {$optionsText}";
                        $errorFields[] = $fieldName;
                    }
                    break;
                
                case 'string':
                    if (isset($field['max_length']) && strlen($value) > $field['max_length']) {
                        $errors[] = "{$fieldLabel} excede la longitud máxima de {$field['max_length']} caracteres";
                        $errorFields[] = $fieldName;
                    }
                    if (isset($field['min_length']) && strlen($value) < $field['min_length']) {
                        $errors[] = "{$fieldLabel} debe tener al menos {$field['min_length']} caracteres";
                        $errorFields[] = $fieldName;
                    }
                    break;
            }
        }

        return [
            'messages' => $errors,
            'fields' => array_unique($errorFields)
        ];
    }

    /**
     * Valida si una fecha es válida
     */
    protected function isValidDate($value): bool
    {
        if (empty($value)) {
            return true;
        }

        // Verificar formato YYYY-MM-DD
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            $date = \DateTime::createFromFormat('Y-m-d', $value);
            return $date && $date->format('Y-m-d') === $value;
        }
        
        // Verificar formato DD/MM/YYYY o DD-MM-YYYY
        if (preg_match('/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/', $value)) {
            return true; // Se normalizará después
        }
        
        return false;
    }

    /**
     * Procesa la importación con validación genérica
     */
    public function processImportGeneric(array $validatedData): array
    {
        try {
            DB::beginTransaction();

            $data = $validatedData['data'] ?? [];
            $imported = 0;
            $invalidRows = [];
            $validRows = [];
            $importedData = [];

            Log::info("[{$this->entityName}Import] Iniciando procesamiento genérico", [
                'records_count' => count($data)
            ]);

            foreach ($data as $index => $row) {
                try {
                    // Verificar duplicados en la base de datos
                    $duplicateErrors = $this->checkDuplicatesInDB($row);
                    if (!empty($duplicateErrors['messages'])) {
                        Log::info("[{$this->entityName}Import] Duplicados encontrados en fila " . ($index + 1), $duplicateErrors);
                        $invalidRows[] = [
                            'row' => $index + 1,
                            'data' => $row,
                            'errors' => $duplicateErrors,
                            'type' => 'duplicate'
                        ];
                        continue;
                    }

                    // Validar la fila usando el esquema
                    $validationResult = $this->validateRowWithSchema($row);
                    if (!empty($validationResult['messages'])) {
                        Log::info("[{$this->entityName}Import] Errores de validación en fila " . ($index + 1), $validationResult);
                        
                        $invalidRows[] = [
                            'row' => $index + 1,
                            'data' => $row,
                            'errors' => $validationResult,
                            'type' => 'validation'
                        ];
                        continue;
                    }

                    // Procesar el registro usando el método específico de cada servicio
                    $processedResult = $this->processRecord($row);
                    
                    if (!empty($processedResult['errors']['messages'])) {
                        $invalidRows[] = [
                            'row' => $index + 1,
                            'data' => $row,
                            'errors' => $processedResult['errors'],
                            'type' => 'processing'
                        ];
                        continue;
                    }

                    // Crear o actualizar el registro en la base de datos
                    $result = $this->createOrUpdateRecord($processedResult['data']);
                    $record = $result['record'];
                    $action = $result['action'];
                    
                    $validRows[] = $row;
                    $importedData[] = $record;
                    $imported++;
                    
                    Log::info("[{$this->entityName}Import] Registro procesado exitosamente", [
                        'row' => $index + 1,
                        'id' => $record->id,
                        'action' => $action
                    ]);

                } catch (\Exception $e) {
                    Log::error("[{$this->entityName}Import] Error procesando fila " . ($index + 1), [
                        'error' => $e->getMessage(),
                        'data' => $row
                    ]);
                    
                    // Convertir errores técnicos en mensajes amigables
                    $friendlyError = $this->convertDatabaseErrorToFriendlyMessage($e, $row);
                    
                    $invalidRows[] = [
                        'row' => $index + 1,
                        'data' => $row,
                        'errors' => $friendlyError,
                        'type' => 'database_error'
                    ];
                }
            }

            if (count($invalidRows) > 0) {
                DB::rollBack();
                
                return [
                    'success' => false,
                    'imported' => 0,
                    'validRows' => [],
                    'invalidRows' => $invalidRows,
                    'importedData' => [],
                    'message' => "Se encontraron errores en " . count($invalidRows) . " filas. Corrija los errores antes de continuar."
                ];
            }

            DB::commit();
            
            return [
                'success' => true,
                'imported' => $imported,
                'validRows' => $validRows,
                'invalidRows' => [],
                'importedData' => $importedData,
                'message' => "Importación completada exitosamente. {$imported} registros importados."
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("[{$this->entityName}Import] Error general en importación genérica", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'imported' => 0,
                'validRows' => [],
                'invalidRows' => [],
                'importedData' => [],
                'message' => 'Error durante la importación: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Convierte errores técnicos de base de datos en mensajes amigables para el usuario
     */
    protected function convertDatabaseErrorToFriendlyMessage(\Exception $e, array $row): array
    {
        $errorMessage = $e->getMessage();
        $schema = $this->getSchema();
        
        // Detectar errores de constraint UNIQUE
        if (strpos($errorMessage, 'UNIQUE constraint failed') !== false) {
            // Extraer el nombre del campo del error
            if (preg_match('/UNIQUE constraint failed: \w+\.(\w+)/', $errorMessage, $matches)) {
                $fieldName = $matches[1];
                
                // Buscar el campo en el schema para obtener el label amigable
                foreach ($schema['fields'] as $field) {
                    if ($field['name'] === $fieldName) {
                        $fieldLabel = str_replace(' (*)', '', $field['label']);
                        $value = $row[$fieldName] ?? $row[$field['label']] ?? 'N/A';
                        
                        return [
                            'messages' => ["Ya existe un registro con el mismo {$fieldLabel}: '{$value}'"],
                            'fields' => [$fieldName]
                        ];
                    }
                }
                
                // Fallback si no se encuentra en el schema
                return [
                    'messages' => ["Ya existe un registro con el mismo {$fieldName}"],
                    'fields' => [$fieldName]
                ];
            }
        }
        
        // Detectar errores de constraint NOT NULL
        if (strpos($errorMessage, 'NOT NULL constraint failed') !== false) {
            if (preg_match('/NOT NULL constraint failed: \w+\.(\w+)/', $errorMessage, $matches)) {
                $fieldName = $matches[1];
                
                foreach ($schema['fields'] as $field) {
                    if ($field['name'] === $fieldName) {
                        $fieldLabel = $field['label'];
                        return [
                            'messages' => ["El campo {$fieldLabel} es obligatorio"],
                            'fields' => [$fieldName]
                        ];
                    }
                }
                
                return [
                    'messages' => ["El campo {$fieldName} es obligatorio"],
                    'fields' => [$fieldName]
                ];
            }
        }
        
        // Para otros tipos de errores, devolver un mensaje genérico
        return [
            'messages' => ['Error al procesar el registro. Verifique que los datos sean correctos.'],
            'fields' => []
        ];
    }

    /**
     * Dispara el evento correspondiente para el modelo según la acción
     */
    protected function dispatchModelEvent($record, string $action): void
    {
        $modelClass = get_class($record);
        $modelName = class_basename($modelClass);
        
        // Mapeo de modelos a sus carpetas de eventos
        $modelEventFolderMap = [
            'User' => 'Usuario',
            'Centro' => 'Centro', 
            'Empresa' => 'Empresa',
            'Empleado' => 'Empleado',
            'Contrato' => 'Contrato',
            'Departamento' => 'Departamento',
            'Horario' => 'Horario',
            'Permiso' => 'Permiso',
            'Rol' => 'Rol',
            'Turno' => 'Turno',
            'Anexo' => 'Anexo',
            'Asignacion' => 'Asignacion',
            // Agregar más mapeos según sea necesario
        ];
        
        // Mapeo de acciones a sufijos de eventos (considerando género)
        $actionEventMap = [
            'Usuario' => [
                'created' => 'Creado',
                'updated' => 'Actualizado', 
                'deleted' => 'Eliminado'
            ],
            'Centro' => [
                'created' => 'Creado',
                'updated' => 'Actualizado', 
                'deleted' => 'Eliminado'
            ],
            'Empresa' => [
                'created' => 'Creada',
                'updated' => 'Actualizada', 
                'deleted' => 'Eliminada'
            ],
            'Empleado' => [
                'created' => 'Creado',
                'updated' => 'Actualizado', 
                'deleted' => 'Eliminado'
            ],
            'Asignacion' => [
                'created' => 'Creada',
                'updated' => 'Actualizada', 
                'deleted' => 'Eliminada'
            ],
            // Mapeo por defecto (masculino)
            'default' => [
                'created' => 'Creado',
                'updated' => 'Actualizado', 
                'deleted' => 'Eliminado'
            ]
        ];
        
        $eventFolder = $modelEventFolderMap[$modelName] ?? $modelName;
        $eventModelName = $eventFolder; // Usar el nombre mapeado para el evento
        $modelActionMap = $actionEventMap[$eventModelName] ?? $actionEventMap['default'];
        $eventSuffix = $modelActionMap[$action] ?? 'Creado';
        
        // Construir el nombre de la clase del evento
        // Formato: App\Events\{Folder}\{EventModelName}{Action}
        $eventClass = "App\\Events\\{$eventFolder}\\{$eventModelName}{$eventSuffix}";
        
        // Verificar que la clase del evento existe
        if (class_exists($eventClass)) {
            try {
                // Crear instancia del evento pasando el registro
                event(new $eventClass($record));
                
                Log::info("[{$this->entityName}Import] Evento disparado", [
                    'event' => $eventClass,
                    'action' => $action,
                    'model_id' => $record->id,
                    'model_class' => $modelClass
                ]);
            } catch (\Exception $e) {
                Log::warning("[{$this->entityName}Import] Error al disparar evento", [
                    'event' => $eventClass,
                    'action' => $action,
                    'error' => $e->getMessage(),
                    'model_id' => $record->id
                ]);
            }
        } else {
            Log::debug("[{$this->entityName}Import] Evento no encontrado", [
                'expected_event' => $eventClass,
                'action' => $action,
                'model_class' => $modelClass
            ]);
        }
    }

    /**
     * Verifica si un registro ya existe y debe ser actualizado
     * Por defecto busca por campos únicos definidos en el esquema
     */
    protected function findExistingRecord(array $data): ?object
    {
        $schema = $this->getSchema();
        
        // Buscar por campos únicos
        foreach ($schema['fields'] as $field) {
            if (!empty($field['unique'])) {
                $fieldName = $field['name'];
                $value = $data[$fieldName] ?? null;
                
                if (!empty($value)) {
                    $existing = $this->modelClass::where($fieldName, $value)->first();
                    if ($existing) {
                        return $existing;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Procesa un registro determinando si es creación o actualización
     */
    protected function createOrUpdateRecord(array $processedData): array
    {
        $existing = $this->findExistingRecord($processedData);
        
        if ($existing) {
            // Actualizar registro existente
            $existing->update($processedData);
            $this->dispatchModelEvent($existing, 'updated');
            
            return [
                'record' => $existing,
                'action' => 'updated'
            ];
        } else {
            // Crear nuevo registro
            $record = $this->modelClass::create($processedData);
            $this->dispatchModelEvent($record, 'created');
            
            return [
                'record' => $record,
                'action' => 'created'
            ];
        }
    }

}

<?php

namespace App\Services\Import;

use App\Events\Empleado\EmployeeCreated;
use App\Models\Empleado;
use App\Models\User;
use App\Models\TipoDocumento;
use App\Models\TipoEmpleado;
use App\Models\EstadoEmpleado;
use App\Models\Genero;
use App\Models\Direccion;
use App\Services\User\UserService; // Agregar este import
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class EmpleadoImportService extends BaseImportService
{
    /**
     * Limpia valores vacíos o "null" string para campos opcionales
     */
    private function cleanOptionalValue($value): ?string
    {
        // Si es null, devolver null
        if (is_null($value)) {
            return null;
        }
        
        // Convertir a string y limpiar
        $value = trim((string) $value);
        
        // Considerar como vacío si está vacío, es "null", "NULL", solo espacios, guiones, etc.
        if (empty($value) || 
            $value === 'null' || 
            $value === 'NULL' || 
            $value === '-' || 
            $value === '--' || 
            $value === '---' ||
            $value === 'N/A' ||
            $value === 'n/a' ||
            $value === 'NA' ||
            $value === 'na') {
            return null;
        }
        
        return $value;
    }

    protected function getEntityName(): string
    {
        return 'Empleados';
    }

    protected function getModelClass(): string
    {
        return Empleado::class;
    }
    /**
     * Obtiene el esquema para la importación
     */
    public function getSchema(): array
    {
        return [
            'entity' => 'empleados',
            'fields' => [
                [
                    'name' => 'generar_usuario',
                    'label' => 'Generar Usuario (*)',
                    'type' => 'select',
                    'options' => ['Sí', 'No'],
                    'required' => false,
                    'default' => 'No',
                    'help' => 'Indica si se debe crear usuario para este empleado. Valores: Sí/No. Por defecto: No.'
                ],
                [
                    'name' => 'nombre',
                    'label' => 'Nombre (*)',
                    'type' => 'string',
                    'required' => true,
                ],
                [
                    'name' => 'primer_apellido',
                    'label' => 'Primer Apellido (*)',
                    'type' => 'string',
                    'required' => true,
                ],
                [
                    'name' => 'segundo_apellido',
                    'label' => 'Segundo Apellido',
                    'type' => 'string',
                    'required' => false,
                ],
                [
                    'name' => 'tipo_documento',
                    'label' => 'Tipo de Documento (*)',
                    'type' => 'select',
                    'options' => TipoDocumento::pluck('nombre')->values()->toArray(),
                    'required' => true,
                ],
                [
                    'name' => 'nif',
                    'label' => 'Nº Documento (*)',
                    'type' => 'string',
                    'required' => true,
                ],
                [
                    'name' => 'niss',
                    'label' => 'NISS (*)',
                    'type' => 'string',
                    'required' => true,
                ],
                [
                    'name' => 'email',
                    'label' => 'Email (*)',
                    'type' => 'email',
                    'required' => true,
                ],
                [
                    'name' => 'email_secundario',
                    'label' => 'Email Secundario',
                    'type' => 'email',
                    'required' => false,
                ],
                [
                    'name' => 'telefono',
                    'label' => 'Teléfono (*)',
                    'type' => 'string',
                    'required' => true,
                ],
                [
                    'name' => 'telefono_personal_movil',
                    'label' => 'Teléfono Personal Móvil',
                    'type' => 'string',
                    'required' => false,
                ],
                [
                    'name' => 'telefono_personal_fijo',
                    'label' => 'Teléfono Personal Fijo',
                    'type' => 'string',
                    'required' => false,
                ],
                [
                    'name' => 'extension_centrex',
                    'label' => 'Extensión Centrex',
                    'type' => 'string',
                    'required' => false,
                ],
                [
                    'name' => 'direccion',
                    'label' => 'Dirección (*)',
                    'type' => 'string',
                    'required' => true,
                ],
                [
                    'name' => 'fecha_nacimiento',
                    'label' => 'Fecha Nacimiento (*)',
                    'type' => 'date',
                    'required' => true,
                ],
                [
                    'name' => 'genero',
                    'label' => 'Género (*)',
                    'type' => 'select',
                    'options' => Genero::pluck('nombre')->values()->toArray(),
                    'required' => true,
                ],
                [
                    'name' => 'tipo_empleado',
                    'label' => 'Tipo Empleado (*)',
                    'type' => 'select',
                    'options' => TipoEmpleado::pluck('nombre')->values()->toArray(),
                    'required' => true,
                ],
                [
                    'name' => 'estado_empleado',
                    'label' => 'Estado Empleado (*)',
                    'type' => 'select',
                    'options' => EstadoEmpleado::pluck('nombre')->values()->toArray(),
                    'required' => true,
                ],
                [
                    'name' => 'contacto_emergencia',
                    'label' => 'Contacto Emergencia',
                    'type' => 'string',
                    'required' => false,
                ],
                [
                    'name' => 'telefono_emergencia',
                    'label' => 'Teléfono de Emergencia',
                    'type' => 'string',
                    'required' => false,
                ]
            ]
        ];
    }

    /**
     * Genera los datos para la plantilla de importación (para compatibilidad con sistema dinámico)
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
            'Para "Generar Usuario (*)" use: Sí o No',
            'Para fechas use formato: YYYY-MM-DD (ej: 1990-01-15)',
            'Agregue sus datos a partir de la tercera fila',
            'Mantenga el formato de la fila de ejemplo'
        ];
    }

    /**
     * Valida los datos antes de importar
     */
    public function validateImportData(array $data): array
    {
        $errors = [];
        $duplicates = [];
        $validRows = [];

        // Primero validamos duplicados dentro del mismo Excel
        $nifs = [];
        $nisses = [];
        $emails = [];

        foreach ($data as $index => $row) {
            $rowErrors = [];

            // Validar campos requeridos y formatos
            $validationResult = $this->validateRow($row);
            if (!empty($validationResult)) {
                $rowErrors = array_merge($rowErrors, $validationResult);
            }

            // Verificar duplicados internos
            if (!empty($row['Nº Documento (*)'])) {
                if (isset($nifs[$row['Nº Documento (*)']])) {
                    $rowErrors[] = 'NIF duplicado en la fila ' . ($nifs[$row['Nº Documento (*)']] + 1);
                    $duplicates['Nº Documento (*)'][] = $row['Nº Documento (*)'];
                } else {
                    $nifs[$row['Nº Documento (*)']] = $index;
                }
            }

            if (!empty($row['NISS (*)'])) {
                if (isset($nisses[$row['NISS (*)']])) {
                    $rowErrors[] = 'NISS duplicado en la fila ' . ($nisses[$row['NISS (*)']] + 1);
                    $duplicates['NISS (*)'][] = $row['NISS (*)'];
                } else {
                    $nisses[$row['NISS (*)']] = $index;
                }
            }

            if (!empty($row['Email (*)'])) {
                if (isset($emails[$row['Email (*)']])) {
                    $rowErrors[] = 'Email duplicado en la fila ' . ($emails[$row['Email (*)']] + 1);
                    $duplicates['Email (*)'][] = $row['Email (*)'];
                } else {
                    $emails[$row['Email (*)']] = $index;
                }
            }

            if (!empty($rowErrors)) {
                $errors[] = [
                    'row' => $index + 1,
                    'data' => $row,
                    'errors' => $rowErrors
                ];
            } else {
                $validRows[] = $row;
            }
        }

        return [
            'success' => empty($errors),
            'errors' => $errors,
            'duplicates' => $duplicates,
            'validRows' => $validRows
        ];
    }

    /**
     * Procesa la importación de datos
     */
    public function processImport(array $data, array $createUsers = []): array
    {
        try {
            $imported = 0;
            $invalidRows = [];
            $validRows = [];
            $importedData = [];
            $processedData = []; // Almacenar datos procesados para guardar después

            Log::info("=== INICIO DE IMPORTACIÓN ===");
            Log::info("Total de filas a procesar: " . count($data));

            // PRIMERA PASADA: Validar todas las filas sin guardar nada
            foreach ($data as $index => $row) {
                try {
                    Log::info("=== VALIDANDO FILA " . ($index + 1) . " ===");
                    Log::info("Datos de la fila: " . json_encode($row, JSON_PRETTY_PRINT));

                    // Verificar duplicados en la base de datos
                    $duplicateErrors = $this->checkDuplicatesInDB($row);
                    if (!empty($duplicateErrors['messages'])) {
                        Log::info("❌ DUPLICADOS ENCONTRADOS en fila " . ($index + 1) . ": " . json_encode($duplicateErrors));
                        $invalidRows[] = [
                            'row' => $index + 1,
                            'data' => $row,
                            'errors' => $duplicateErrors,
                            'type' => 'duplicate'
                        ];
                        continue;
                    }

                    // Validar la fila antes de intentar guardar
                    $validationErrors = $this->validateRow($row);
                    if (!empty($validationErrors)) {
                        Log::info("❌ ERRORES DE VALIDACIÓN en fila " . ($index + 1) . ": " . json_encode($validationErrors));
                        $invalidRows[] = [
                            'row' => $index + 1,
                            'data' => $row,
                            'errors' => $validationErrors,
                            'type' => 'validation'
                        ];
                        continue;
                    }

                    // Mapear IDs antes de crear el empleado
                    $tipoDocumentoId = $this->getTipoDocumentoId($row['Tipo de Documento (*)']);
                    $generoId = $this->getGeneroId($row['Género (*)']);
                    $tipoEmpleadoId = $this->getTipoEmpleadoId($row['Tipo Empleado (*)']);
                    $estadoId = $this->getEstadoId($row['Estado Empleado (*)']);

                    // Verificar que todos los IDs se mapearon correctamente
                    if (!$tipoDocumentoId || !$generoId || !$tipoEmpleadoId || !$estadoId) {
                        $error = "Error en el mapeo de IDs: ";
                        if (!$tipoDocumentoId) $error .= "Tipo de Documento inválido. ";
                        if (!$generoId) $error .= "Género inválido. ";
                        if (!$tipoEmpleadoId) $error .= "Tipo de Empleado inválido. ";
                        if (!$estadoId) $error .= "Estado inválido.";

                        Log::info("❌ ERROR DE MAPEO en fila " . ($index + 1) . ": " . $error);
                        $invalidRows[] = [
                            'row' => $index + 1,
                            'data' => $row,
                            'errors' => [$error],
                            'type' => 'mapping'
                        ];
                        continue;
                    }

                    // Si llegamos aquí, la fila es válida - preparar datos para guardar después
                    $processedData[] = [
                        'row' => $row,
                        'index' => $index,
                        'tipoDocumentoId' => $tipoDocumentoId,
                        'generoId' => $generoId,
                        'tipoEmpleadoId' => $tipoEmpleadoId,
                        'estadoId' => $estadoId
                    ];

                    $validRows[] = $row;

                } catch (\Exception $e) {
                    Log::error("❌ ERROR procesando fila " . ($index + 1) . ": " . $e->getMessage());
                    $invalidRows[] = [
                        'row' => $index + 1,
                        'data' => $row,
                        'errors' => [$e->getMessage()],
                        'type' => 'error'
                    ];
                }
            }

            // Si hay errores en cualquier fila, NO proceder con la importación
            if (count($invalidRows) > 0) {
                Log::info("❌ SE ENCONTRARON ERRORES. No se importará ningún registro.");
                Log::info("Total de filas con errores: " . count($invalidRows));
                
                return [
                    'success' => false,
                    'imported' => 0,
                    'validRows' => [],
                    'invalidRows' => $invalidRows,
                    'importedData' => [],
                    'message' => "Se encontraron errores en " . count($invalidRows) . " filas. No se importará ningún registro hasta que se corrijan todos los errores."
                ];
            }

            // SEGUNDA PASADA: Si todas las filas son válidas, guardar todo en una transacción
            Log::info("✅ TODAS LAS FILAS SON VÁLIDAS. Procediendo con la importación...");
            
            DB::beginTransaction();
            
            try {
                foreach ($processedData as $item) {
                    $row = $item['row'];
                    $index = $item['index'];
                    
                    Log::info("=== GUARDANDO FILA " . ($index + 1) . " ===");
                    
                    // Crear la dirección
                    $direccion = DB::table('direcciones')->insertGetId([
                        'full_address' => $row['Dirección (*)'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    Log::info("✅ Dirección creada para fila " . ($index + 1) . " con ID: " . $direccion);

                    // Crear el empleado
                    $segundoApellido = $this->cleanOptionalValue($row['Segundo Apellido'] ?? null);
                    
                    Log::info("🔍 DEBUG - Segundo Apellido:", [
                        'valor_original' => $row['Segundo Apellido'] ?? 'NO_EXISTE',
                        'valor_limpio' => $segundoApellido,
                        'es_null' => is_null($segundoApellido),
                        'es_vacio' => empty($segundoApellido)
                    ]);
                    
                    $empleado = new Empleado([
                        'nombre' => $row['Nombre (*)'],
                        'primer_apellido' => $row['Primer Apellido (*)'],
                        'segundo_apellido' => $segundoApellido,
                        'tipo_documento_id' => $item['tipoDocumentoId'],
                        'nif' => $row['Nº Documento (*)'],
                        'niss' => $row['NISS (*)'],
                        'email' => $row['Email (*)'],
                        'email_secundario' => $this->cleanOptionalValue($row['Email Secundario'] ?? null),
                        'telefono' => $row['Teléfono (*)'],
                        'telefono_personal_movil' => $this->cleanOptionalValue($row['Teléfono Personal Móvil'] ?? null),
                        'telefono_personal_fijo' => $this->cleanOptionalValue($row['Teléfono Personal Fijo'] ?? null),
                        'extension_centrex' => $this->cleanOptionalValue($row['Extensión Centrex'] ?? null),
                        'direccion_id' => $direccion,
                        'fecha_nacimiento' => Carbon::parse($row['Fecha Nacimiento (*)']),
                        'genero_id' => $item['generoId'],
                        'tipo_empleado_id' => $item['tipoEmpleadoId'],
                        'estado_id' => $item['estadoId'],
                        'contacto_emergencia' => $this->cleanOptionalValue($row['Contacto Emergencia'] ?? null),
                        'telefono_emergencia' => $this->cleanOptionalValue($row['Teléfono de Emergencia'] ?? null)
                    ]);

                    Log::info('Datos recibidos para crear empleado:', $empleado->toArray());

                    $empleado->save();
                    $imported++;

                    // Disparar evento de empleado creado
                    event(new EmployeeCreated($empleado));

                    // Guardar los datos importados exitosamente
                    $importedData[] = [
                        'row' => $index + 1,
                        'empleado' => [
                            'id' => $empleado->id,
                            'nombre_completo' => $empleado->nombre . ' ' . $empleado->primer_apellido . ' ' . $empleado->segundo_apellido,
                            'nif' => $empleado->nif,
                            'email' => $empleado->email,
                            'direccion_id' => $direccion
                        ]
                    ];

                    Log::info("✅ EMPLEADO GUARDADO EXITOSAMENTE");
                    Log::info("Datos del empleado guardado: " . json_encode([
                        'id' => $empleado->id,
                        'nombre_completo' => $empleado->nombre . ' ' . $empleado->primer_apellido . ' ' . $empleado->segundo_apellido,
                        'nif' => $empleado->nif,
                        'email' => $empleado->email,
                        'direccion_id' => $direccion
                    ], JSON_PRETTY_PRINT));

                    $generarUsuario = isset($row['Generar Usuario (*)']) ? strtolower(trim($row['Generar Usuario (*)'])) : 'no';
                    $generarUsuario = in_array($generarUsuario, ['sí', 'si', 'yes', '1', 'true', 'verdadero']) ? true : false;
                    if ($generarUsuario) {
                        $this->createUserForEmployee($empleado);
                        Log::info("✅ Usuario creado para empleado en fila " . ($index + 1));
                    }
                }

                // Si llegamos aquí, todo se guardó correctamente
                DB::commit();
                
                Log::info("=== RESUMEN DE IMPORTACIÓN ===");
                Log::info("✅ Transacción completada exitosamente");
                Log::info("Total de filas importadas: " . $imported);
                Log::info("Datos importados exitosamente: " . json_encode($importedData, JSON_PRETTY_PRINT));

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
                Log::error("❌ ERROR durante el guardado en transacción: " . $e->getMessage());
                
                return [
                    'success' => false,
                    'imported' => 0,
                    'validRows' => [],
                    'invalidRows' => [['row' => 'General', 'errors' => ['Error durante el guardado: ' . $e->getMessage()], 'type' => 'transaction_error']],
                    'importedData' => [],
                    'message' => 'Error durante la importación: ' . $e->getMessage()
                ];
            }

        } catch (\Exception $e) {
            Log::error("❌ ERROR GENERAL en la importación: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Valida una fila de datos
     */
    private function validateRow(array $row): array
    {
        $errors = [];
        $requiredFields = [
            'Nombre (*)',
            'Primer Apellido (*)',
            //'Segundo Apellido (*)',
            'Tipo de Documento (*)',
            'Nº Documento (*)',
            'NISS (*)',
            'Email (*)',
            'Teléfono (*)',
            'Dirección (*)',
            'Fecha Nacimiento (*)',
            'Género (*)',
            'Tipo Empleado (*)',
            'Estado Empleado (*)'
        ];

        // Validar campos requeridos
        foreach ($requiredFields as $field) {
            if (empty($row[$field])) {
                $errors[] = "El campo {$field} es obligatorio";
            }
        }

        // Validar email
        if (!empty($row['Email (*)']) && !filter_var($row['Email (*)'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "El email no es válido";
        }

        if (!empty($row['Email Secundario']) && !filter_var($row['Email Secundario'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "El email secundario no es válido";
        }

        // Validar fecha
        if (!empty($row['Fecha Nacimiento (*)'])) {
            try {
                Carbon::parse($row['Fecha Nacimiento (*)']);
            } catch (\Exception $e) {
                $errors[] = "La fecha de nacimiento no es válida";
            }
        }

        return $errors;
    }

    /**
     * Crea un usuario para un empleado
     */
    private function createUserForEmployee(Empleado $empleado): void
    {
        // Usar el UserService existente en lugar de crear directamente
        $userService = app(\App\Services\User\UserService::class);
        
        $userData = [
            'name' => $empleado->nombre . ' ' . $empleado->primer_apellido . ' ' . $empleado->segundo_apellido,
            'email' => $empleado->email,
            'empleado_id' => $empleado->id,
        ];
        
        $user = $userService->createUser($userData, null); // null = Sistema como actor
        
        Log::info("✅ Usuario creado usando UserService para empleado", [
            'empleado_id' => $empleado->id,
            'user_id' => $user->id,
            'user_email' => $user->email
        ]);
    }

    // MÉTODOS ACTIVOS PARA EL SISTEMA DINÁMICO

    /**
     * Mapea tipos de documento para el sistema dinámico
     */
    private function getTipoDocumentoId($tipo)
    {
        $tipoDoc = TipoDocumento::where('nombre', $tipo)->first();
        return $tipoDoc ? $tipoDoc->id : null;
    }

    /**
     * Mapea géneros para el sistema dinámico
     */
    private function getGeneroId($genero)
    {
        $generoObj = Genero::where('nombre', $genero)->first();
        return $generoObj ? $generoObj->id : null;
    }

    /**
     * Mapea tipos de empleado para el sistema dinámico
     */
    private function getTipoEmpleadoId($tipo)
    {
        $tipoObj = TipoEmpleado::where('nombre', $tipo)->first();
        return $tipoObj ? $tipoObj->id : null;
    }

    /**
     * Mapea estados de empleado para el sistema dinámico
     */
    private function getEstadoId($estado)
    {
        static $estados = null;

        if ($estados === null) {
            $estados = EstadoEmpleado::all(['id', 'nombre']);
        }

        $estadoObj = $estados->where('nombre', $estado)->first();
        return $estadoObj ? $estadoObj->id : null;
    }

    /**
     * Verifica duplicados en la base de datos
     */
    protected function checkDuplicatesInDB(array $row): array
    {
        $errors = [];
        $duplicateFields = [];

        if (Empleado::where('nif', $row['Nº Documento (*)'])->exists()) {
            $errors[] = 'Ya existe un empleado con el mismo NIF en el sistema';
            $duplicateFields[] = 'Nº Documento (*)';
        }

        if (Empleado::where('niss', $row['NISS (*)'])->exists()) {
            $errors[] = 'Ya existe un empleado con el mismo NISS en el sistema';
            $duplicateFields[] = 'NISS (*)';
        }

        if (Empleado::where('email', $row['Email (*)'])->exists()) {
            $errors[] = 'Ya existe un empleado con el mismo email en el sistema';
            $duplicateFields[] = 'Email (*)';
        }

        return [
            'messages' => $errors,
            'fields' => $duplicateFields
        ];
    }

    /**
     * Obtiene las reglas de validación para la importación
     */
    protected function getValidationRules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'primer_apellido' => ['required', 'string', 'max:255'],
            'segundo_apellido' => ['nullable', 'string', 'max:255'],
            'tipo_documento' => ['required', 'string'],
            'nif' => ['required', 'string', 'max:20', 'unique:empleados,nif'],
            'niss' => ['required', 'string', 'max:20', 'unique:empleados,niss'],
            'email' => ['required', 'email', 'unique:empleados,email'],
            'email_secundario' => ['nullable', 'email'],
            'telefono' => ['required', 'string', 'max:20'],
            'telefono_personal_movil' => ['nullable', 'string', 'max:20'],
            'telefono_personal_fijo' => ['nullable', 'string', 'max:20'],
            'extension_centrex' => ['nullable', 'string', 'max:10'],
            'direccion' => ['required', 'string'],
            'fecha_nacimiento' => ['required', 'date'],
            'genero' => ['required', 'string'],
            'tipo_empleado' => ['required', 'string'],
            'estado_empleado' => ['required', 'string'],
            'contacto_emergencia' => ['nullable', 'string', 'max:255'],
            'telefono_emergencia' => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * Procesa un registro individual para importación
     */
    protected function processRecord(array $data): array
    {
        $errors = [];
        $processedData = [];

        // Validar y procesar nombre
        $nombre = $this->normalizeText($data['nombre'] ?? null);
        if (empty($nombre)) {
            $errors[] = 'El nombre es obligatorio';
        } else {
            $processedData['nombre'] = $nombre;
        }

        // Validar y procesar primer apellido
        $primerApellido = $this->normalizeText($data['primer_apellido'] ?? null);
        if (empty($primerApellido)) {
            $errors[] = 'El primer apellido es obligatorio';
        } else {
            $processedData['primer_apellido'] = $primerApellido;
        }

        // Validar y procesar segundo apellido
        $segundoApellido = $this->normalizeText($data['segundo_apellido'] ?? null);
        /* if (empty($segundoApellido)) {
            $errors[] = 'El segundo apellido es obligatorio';
        } else {
            $processedData['segundo_apellido'] = $segundoApellido;
        } */
       if (!empty($data['segundo_apellido'])) {
            $processedData['segundo_apellido'] = $this->normalizeText($data['segundo_apellido']);
        }

        // Validar y procesar tipo de documento
        $tipoDocumento = $this->normalizeText($data['tipo_documento'] ?? null);
        if (empty($tipoDocumento)) {
            $errors[] = 'El tipo de documento es obligatorio';
        } else {
            $tipoDoc = TipoDocumento::where('nombre', $tipoDocumento)->first();
            if (!$tipoDoc) {
                $errors[] = 'Tipo de documento no válido';
            } else {
                $processedData['tipo_documento_id'] = $tipoDoc->id;
            }
        }

        // Validar y procesar NIF
        $nif = $this->normalizeText($data['nif'] ?? null);
        if (empty($nif)) {
            $errors[] = 'El número de documento es obligatorio';
        } elseif (!$this->validateUniqueness('nif', $nif)) {
            $errors[] = 'Ya existe un empleado con este número de documento en el sistema';
        } else {
            $processedData['nif'] = strtoupper($nif);
        }

        // Validar y procesar NISS
        $niss = $this->normalizeText($data['niss'] ?? null);
        if (empty($niss)) {
            $errors[] = 'El NISS es obligatorio';
        } elseif (!$this->validateUniqueness('niss', $niss)) {
            $errors[] = 'Ya existe un empleado con este NISS en el sistema';
        } else {
            $processedData['niss'] = $niss;
        }

        // Validar y procesar email
        $email = $this->normalizeEmail($data['email'] ?? null);
        if (empty($email)) {
            $errors[] = 'El email es obligatorio';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El formato del email no es válido';
        } elseif (!$this->validateUniqueness('email', $email)) {
            $errors[] = 'Ya existe un empleado con este email en el sistema';
        } else {
            $processedData['email'] = $email;
        }

        // Procesar email secundario
        $emailSecundario = $this->normalizeEmail($data['email_secundario'] ?? null);
        if (!empty($emailSecundario)) {
            if (!filter_var($emailSecundario, FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'El formato del email secundario no es válido';
            } else {
                $processedData['email_secundario'] = $emailSecundario;
            }
        }

        // Validar y procesar teléfono
        $telefono = $this->normalizeText($data['telefono'] ?? null);
        if (empty($telefono)) {
            $errors[] = 'El teléfono es obligatorio';
        } else {
            $processedData['telefono'] = $telefono;
        }

        // Procesar teléfonos opcionales
        if (!empty($data['telefono_personal_movil'])) {
            $processedData['telefono_personal_movil'] = $this->normalizeText($data['telefono_personal_movil']);
        }
        if (!empty($data['telefono_personal_fijo'])) {
            $processedData['telefono_personal_fijo'] = $this->normalizeText($data['telefono_personal_fijo']);
        }
        if (!empty($data['extension_centrex'])) {
            $processedData['extension_centrex'] = $this->normalizeText($data['extension_centrex']);
        }

        // Procesar dirección
        $direccion = $this->normalizeText($data['direccion'] ?? null);
        if (empty($direccion)) {
            $errors[] = 'La dirección es obligatoria';
        } else {
            // Crear la dirección
            try {
                $direccionObj = Direccion::create([
                    'direccion_completa' => $direccion,
                    'calle' => $direccion,
                ]);
                $processedData['direccion_id'] = $direccionObj->id;
            } catch (\Exception $e) {
                $errors[] = 'Error al crear la dirección: ' . $e->getMessage();
            }
        }

        // Validar y procesar fecha de nacimiento
        $fechaNacimiento = $this->normalizeDate($data['fecha_nacimiento'] ?? null);
        if (empty($fechaNacimiento)) {
            $errors[] = 'La fecha de nacimiento es obligatoria';
        } else {
            $processedData['fecha_nacimiento'] = $fechaNacimiento;
        }

        // Validar y procesar género
        $genero = $this->normalizeText($data['genero'] ?? null);
        if (empty($genero)) {
            $errors[] = 'El género es obligatorio';
        } else {
            $generoObj = Genero::where('nombre', $genero)->first();
            if (!$generoObj) {
                $errors[] = 'Género no válido';
            } else {
                $processedData['genero_id'] = $generoObj->id;
            }
        }

        // Validar y procesar tipo de empleado
        $tipoEmpleado = $this->normalizeText($data['tipo_empleado'] ?? null);
        if (empty($tipoEmpleado)) {
            $errors[] = 'El tipo de empleado es obligatorio';
        } else {
            $tipoEmp = TipoEmpleado::where('nombre', $tipoEmpleado)->first();
            if (!$tipoEmp) {
                $errors[] = 'Tipo de empleado no válido';
            } else {
                $processedData['tipo_empleado_id'] = $tipoEmp->id;
            }
        }

        // Validar y procesar estado del empleado
        $estadoEmpleado = $this->normalizeText($data['estado_empleado'] ?? null);
        if (empty($estadoEmpleado)) {
            $errors[] = 'El estado del empleado es obligatorio';
        } else {
            $estadoEmp = EstadoEmpleado::where('nombre', $estadoEmpleado)->first();
            if (!$estadoEmp) {
                $errors[] = 'Estado del empleado no válido';
            } else {
                $processedData['estado_id'] = $estadoEmp->id;
            }
        }

        // Procesar contacto de emergencia
        if (!empty($data['contacto_emergencia'])) {
            $processedData['contacto_emergencia'] = $this->normalizeText($data['contacto_emergencia']);
        }
        if (!empty($data['telefono_emergencia'])) {
            $processedData['telefono_emergencia'] = $this->normalizeText($data['telefono_emergencia']);
        }

        return [
            'data' => $processedData,
            'errors' => $errors
        ];
    }

    /**
     * Obtiene los datos de ejemplo para la plantilla
     */
    protected function getExampleData(): array
    {
        return [
            'No', // Generar Usuario
            'Juan',
            'García',
            'López',
            'DNI',
            '12345678Z',
            '123456789012',
            'juan.garcia@empresa.com',
            'juan.personal@email.com',
            '+34 600 123 456',
            '+34 600 987 654',
            '+34 91 123 45 67',
            '1234',
            'Calle Ejemplo, 123, 28001 Madrid',
            '1990-01-15',
            'Masculino',
            'Empleado',
            'Activo',
            'María García',
            '+34 600 111 222'
        ];
    }

    /**
     * Mapea nombres de campos del backend a nombres del esquema/CSV
     */
    protected function mapFieldToSchemaName(string $field): string
    {
        $mapping = [
            'generar_usuario' => 'Generar Usuario (*)',
            'nombre' => 'Nombre (*)',
            'primer_apellido' => 'Primer Apellido (*)',
            'segundo_apellido' => 'Segundo Apellido',
            'tipo_documento' => 'Tipo de Documento (*)',
            'nif' => 'Nº Documento (*)',
            'niss' => 'NISS (*)',
            'email' => 'Email (*)',
            'email_secundario' => 'Email Secundario',
            'telefono' => 'Teléfono (*)',
            'telefono_personal_movil' => 'Teléfono Personal Móvil',
            'telefono_personal_fijo' => 'Teléfono Personal Fijo',
            'extension_centrex' => 'Extensión Centrex',
            'direccion' => 'Dirección (*)',
            'fecha_nacimiento' => 'Fecha Nacimiento (*)',
            'genero' => 'Género (*)',
            'tipo_empleado' => 'Tipo Empleado (*)',
            'estado_empleado' => 'Estado Empleado (*)',
            'contacto_emergencia' => 'Contacto Emergencia',
            'telefono_emergencia' => 'Teléfono de Emergencia'
        ];

        return $mapping[$field] ?? $field;
    }

}

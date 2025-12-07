<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Centro;
use App\Models\Empresa;
use App\Models\Folder;
use App\Models\Empleado;
use App\Models\NivelAcceso;
use App\Models\NivelSeguridad;
use Illuminate\Database\Seeder;
use App\Services\Storage\DirectoryManagementService;
use App\Services\Storage\FolderService;
use App\Services\Storage\FileUploadService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Testing\File as TestFile;

class FolderSeeder extends Seeder
{
    protected DirectoryManagementService $directoryService;
    protected FolderService $folderService;
    protected FileUploadService $fileUploadService;
    protected User $systemUser;
    /**
     * @var \Illuminate\Support\Collection<NivelSeguridad>
     */
    protected $nivelesSeguridad;
    /**
     * @var \Illuminate\Support\Collection<NivelAcceso>
     */
    protected $nivelesAcceso;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Inicializar servicios
        $this->directoryService = app(DirectoryManagementService::class);
        $this->folderService = app(FolderService::class);
        $this->fileUploadService = app(FileUploadService::class);

        // Obtener datos de referencia
        $this->nivelesSeguridad = NivelSeguridad::all()->keyBy('nombre');
        $this->nivelesAcceso = NivelAcceso::all()->keyBy('nombre');
        $this->systemUser = User::role('Super Admin')->first();

        if (!$this->systemUser) {
            Log::error('No se encontró un usuario con el rol de Super Admin');
            return;
        }

        // Configurar parámetros de SQLite para mejor rendimiento
        $this->configureSQLite();

        // Ejecutar operaciones con manejo de transacciones mejorado
        $this->executeWithRetry(function() {
            // 1. LIMPIAR estructura HR existente
            $this->cleanHRStructure();

            // 2. RECREAR estructura raíz HR
            $this->createHRStructure();

            Log::info('Estructura de carpetas HR limpiada y recreada exitosamente');
        });
    }

    /**
     * Configura SQLite para mejor rendimiento y manejo de bloqueos
     */
    protected function configureSQLite(): void
    {
        try {
            DB::unprepared('PRAGMA busy_timeout = 30000;'); // 30 segundos timeout
            DB::unprepared('PRAGMA journal_mode = WAL;'); // Modo WAL para mejor concurrencia
            DB::unprepared('PRAGMA synchronous = NORMAL;'); // Mejor rendimiento
            DB::unprepared('PRAGMA cache_size = 10000;'); // Aumentar cache
            DB::unprepared('PRAGMA temp_store = MEMORY;'); // Almacenar temporales en memoria
            
            Log::info('SQLite configurado para mejor rendimiento');
        } catch (\Exception $e) {
            Log::warning('No se pudo configurar SQLite: ' . $e->getMessage());
        }
    }

    /**
     * Ejecuta una operación con reintentos automáticos
     */
    protected function executeWithRetry(callable $operation, int $maxRetries = 3): void
    {
        $attempt = 0;
        
        while ($attempt < $maxRetries) {
            try {
                $operation();
                return; // Éxito, salir del bucle
            } catch (\Exception $e) {
                $attempt++;
                
                // Si es un error de base de datos bloqueada y no es el último intento
                if ($this->isDatabaseLockError($e) && $attempt < $maxRetries) {
                    Log::warning("Intento {$attempt} falló por bloqueo de base de datos, reintentando...");
                    
                    // Esperar antes de reintentar (backoff exponencial)
                    sleep(pow(2, $attempt - 1));
                    continue;
                }
                
                // Si no es un error de bloqueo o ya agotamos los intentos, lanzar la excepción
                throw $e;
            }
        }
    }

    /**
     * Verifica si un error es debido a bloqueo de base de datos
     */
    protected function isDatabaseLockError(\Exception $e): bool
    {
        $message = strtolower($e->getMessage());
        return strpos($message, 'database is locked') !== false ||
               strpos($message, 'database locked') !== false ||
               strpos($message, 'sqlite busy') !== false;
    }

    /**
     * Crea la estructura completa de carpetas HR
     */
    protected function createHRStructure(): void
    {
        // Usar transacciones más pequeñas para evitar bloqueos largos
        
        // 1. Crear carpeta raíz HR
        $carpetaHR = DB::transaction(function() {
            return $this->directoryService->createDirectoryPath(
                'hr',
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Alto']->id,
                    'is_visible' => true,
                    'is_erasable' => false,
                    'description' => 'Carpeta raíz de Recursos Humanos'
                ],
                $this->systemUser,
                $this->systemUser
            );
        });

        // 2. Crear carpetas base (Empresas, Centros, Empleados)
        DB::transaction(function() use ($carpetaHR) {
            $this->createBaseFolders($carpetaHR);
        });

        // 3. Crear estructura de empleados (procesamiento individual)
        $this->createEmployeeStructureWithBatching($carpetaHR);

        // 4. Crear carpetas de centros
        DB::transaction(function() use ($carpetaHR) {
            $this->createCenterFolders($carpetaHR);
        });

        // 5. Crear carpetas de empresas
        DB::transaction(function() use ($carpetaHR) {
            $this->createCompanyFolders($carpetaHR);
        });
    }

    /**
     * Crea las carpetas base: Empresas, Centros, Empleados
     */
    protected function createBaseFolders(Folder $carpetaHR): void
    {
        $carpetasBase = ['Empresas', 'Centros', 'Empleados'];

        foreach ($carpetasBase as $nombreCarpeta) {
            $this->directoryService->createSubdirectory(
                $carpetaHR,
                $nombreCarpeta,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Alto']->id,
                    'is_visible' => true,
                    'is_erasable' => false,
                    'description' => "Subcarpeta de Recursos Humanos: {$nombreCarpeta}"
                ],
                $this->systemUser
            );
        }
    }

    /**
     * Crea la estructura completa de carpetas para empleados con procesamiento individual
     */
    protected function createEmployeeStructureWithBatching(Folder $carpetaHR): void
    {
        // Obtener la carpeta de empleados
        $carpetaEmpleados = Folder::where('path', 'hr/Empleados')->first();

        if (!$carpetaEmpleados) {
            Log::error('No se encontró la carpeta de Empleados');
            return;
        }

        // Obtener empleados (limitamos a 3 para el seeder)
        $empleados = Empleado::with('user')->take(3)->get();

        foreach ($empleados as $empleado) {
            // Procesar cada empleado en su propia transacción
            $this->executeWithRetry(function() use ($empleado, $carpetaEmpleados) {
                DB::transaction(function() use ($empleado, $carpetaEmpleados) {
                    $this->processIndividualEmployee($empleado, $carpetaEmpleados);
                });
            });
        }
    }

    /**
     * Procesa un empleado individual y crea toda su estructura
     */
    protected function processIndividualEmployee(Empleado $empleado, Folder $carpetaEmpleados): void
    {
        $user = $empleado->user;
        if (!$user) {
            Log::warning("Empleado {$empleado->nif} no tiene usuario asociado");
            return;
        }

        // Crear carpeta principal del empleado
        $carpetaEmpleado = $this->directoryService->createSubdirectory(
            $carpetaEmpleados,
            $empleado->nif,
            [
                'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                'is_visible' => true,
                'is_erasable' => true,
                'description' => "Carpeta del empleado {$empleado->nombre} {$empleado->primer_apellido}",
                'user_id' => $user->id
            ],
            $this->systemUser
        );

        // Crear subcarpetas principales
        $this->createEmployeeSubfolders($carpetaEmpleado, $user);
    }

    /**
     * Crea la estructura completa de carpetas para empleados (método original mantenido para compatibilidad)
     */
    protected function createEmployeeStructure(Folder $carpetaHR): void
    {
        // Redirigir al método con batching
        $this->createEmployeeStructureWithBatching($carpetaHR);
    }

    /**
     * Crea las subcarpetas para un empleado específico
     */
    protected function createEmployeeSubfolders(Folder $carpetaEmpleado, User $user): void
    {
        $subcarpetas = [
            'Personal' => ['nivel_seguridad' => 'L1', 'nivel_acceso' => 'Bajo'],
            'Trabajo' => ['nivel_seguridad' => 'L1', 'nivel_acceso' => 'Bajo'],
            'Seguridad' => ['nivel_seguridad' => 'L3', 'nivel_acceso' => 'Alto']
        ];

        foreach ($subcarpetas as $nombreSubcarpeta => $configuracion) {
            $subcarpeta = $this->directoryService->createSubdirectory(
                $carpetaEmpleado,
                $nombreSubcarpeta,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad[$configuracion['nivel_seguridad']]->id,
                    'nivel_acceso_id' => $this->nivelesAcceso[$configuracion['nivel_acceso']]->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Carpeta de {$nombreSubcarpeta}",
                    'user_id' => $user->id
                ],
                $this->systemUser
            );

            // Si es la carpeta de Trabajo, crear subcarpetas específicas
            if ($nombreSubcarpeta === 'Trabajo') {
                $this->createWorkSubfolders($subcarpeta, $user);
            }
        }
    }

    /**
     * Crea las subcarpetas específicas de trabajo
     */
    protected function createWorkSubfolders(Folder $carpetaTrabajo, User $user): void
    {
        $subcarpetasTrabajo = [
            'Nominas',
            'Certificados',
            'Permisos',
            'Justificantes y Bajas'
        ];

        foreach ($subcarpetasTrabajo as $nombreSubcarpeta) {
            $subcarpeta = $this->directoryService->createSubdirectory(
                $carpetaTrabajo,
                $nombreSubcarpeta,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Carpeta de {$nombreSubcarpeta}",
                    'user_id' => $user->id
                ],
                $this->systemUser
            );

            // Crear archivo de ejemplo en cada subcarpeta con extensión aleatoria
            $extensionesEjemplo = ['pdf', 'docx', 'xlsx', 'txt', 'jpg'];
            $extensionAleatoria = Arr::random($extensionesEjemplo);
            $this->createExampleFile($subcarpeta, $user, "documento_ejemplo.{$extensionAleatoria}");

            // Si es la carpeta de Nóminas, crear estructura de años
            if ($nombreSubcarpeta === 'Nominas') {
                $this->createPayrollYearStructure($subcarpeta, $user);
            }
        }
    }

    /**
     * Crea la estructura de años para las nóminas
     */
    protected function createPayrollYearStructure(Folder $carpetaNominas, User $user): void
    {
        $anios = ['2021', '2022', '2023', '2024'];

        foreach ($anios as $anio) {
            $carpetaAnio = $this->directoryService->createSubdirectory(
                $carpetaNominas,
                $anio,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Nóminas del año {$anio}",
                    'user_id' => $user->id
                ],
                $this->systemUser
            );

            // Solo para 2024, crear carpetas de meses
            if ($anio === '2024') {
                $this->createMonthStructure($carpetaAnio, $user);
            }
        }
    }

    /**
     * Crea la estructura de meses para el año 2024
     */
    protected function createMonthStructure(Folder $carpetaAnio, User $user): void
    {
        $meses = [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre'
        ];

        foreach ($meses as $mes) {
            $carpetaMes = $this->directoryService->createSubdirectory(
                $carpetaAnio,
                $mes,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Nóminas de {$mes} 2024",
                    'user_id' => $user->id
                ],
                $this->systemUser
            );

            // Crear archivo de nómina de ejemplo
            $nombreArchivo = "Nomina_{$mes}_2024.pdf";
            $this->createExampleFile($carpetaMes, $user, $nombreArchivo);
        }
    }

    /**
     * Crea carpetas para cada centro
     */
    protected function createCenterFolders(Folder $carpetaHR): void
    {
        $carpetaCentros = Folder::where('path', 'hr/Centros')->first();

        if (!$carpetaCentros) {
            Log::error('No se encontró la carpeta de Centros');
            return;
        }

        foreach (Centro::all() as $centro) {
            $this->directoryService->createSubdirectory(
                $carpetaCentros,
                $centro->nombre,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Carpeta del centro {$centro->nombre}"
                ],
                $this->systemUser
            );
        }
    }

    /**
     * Crea carpetas para cada empresa
     */
    protected function createCompanyFolders(Folder $carpetaHR): void
    {
        $carpetaEmpresas = Folder::where('path', 'hr/Empresas')->first();

        if (!$carpetaEmpresas) {
            Log::error('No se encontró la carpeta de Empresas');
            return;
        }

        foreach (Empresa::all() as $empresa) {
            $this->directoryService->createSubdirectory(
                $carpetaEmpresas,
                $empresa->siglas,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Carpeta de la empresa {$empresa->nombre}"
                ],
                $this->systemUser
            );
        }
    }

    /**
     * Crea un archivo de ejemplo completo (lógico + físico) en una carpeta
     */
    protected function createExampleFile(Folder $carpeta, User $user, string $nombreArchivo): void
    {
        try {
            // Crear archivo físico temporal basado en la extensión
            $tempFile = $this->generateSampleFile($nombreArchivo);

            if (!$tempFile) {
                Log::warning("No se pudo generar archivo temporal para: {$nombreArchivo}");
                return;
            }

            // Ejecutar creación de archivo con reintento
            $this->executeWithRetry(function() use ($carpeta, $tempFile, $nombreArchivo, $user) {
                // Usar FileUploadService para procesamiento completo (lógico + físico)
                $archivo = $this->fileUploadService->processLocalFile(
                    $carpeta,
                    $tempFile,
                    [
                        'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                        'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                        'is_visible' => true,
                        'is_erasable' => true,
                        'description' => "Archivo de ejemplo: {$nombreArchivo}",
                        'user_id' => $user->id,
                    ],
                    $this->systemUser,
                    false // no sobrescribir
                );

                Log::info("Archivo de ejemplo creado exitosamente: {$nombreArchivo}", [
                    'folder_id' => $carpeta->id,
                    'file_id' => $archivo->id,
                    'size' => $archivo->size
                ]);
            });

            // Limpiar archivo temporal
            @unlink($tempFile);

        } catch (\Exception $e) {
            Log::warning("No se pudo crear el archivo de ejemplo {$nombreArchivo}: " . $e->getMessage());
        }
    }

    /**
     * Genera un archivo de muestra temporal basado en la extensión del archivo
     */
    protected function generateSampleFile(string $nombreArchivo): ?string
    {
        $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));
        $tempDir = sys_get_temp_dir();
        $tempFile = $tempDir . DIRECTORY_SEPARATOR . uniqid('seed_') . '_' . $nombreArchivo;

        try {
            switch ($extension) {
                case 'txt':
                    return $this->generateTextFile($tempFile, $nombreArchivo);

                case 'pdf':
                    return $this->generateFakePDFFile($tempFile, $nombreArchivo);

                case 'doc':
                case 'docx':
                    return $this->generateFakeDocFile($tempFile, $nombreArchivo);

                case 'xls':
                case 'xlsx':
                    return $this->generateFakeExcelFile($tempFile, $nombreArchivo);

                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                    return $this->generateFakeImageFile($tempFile, $nombreArchivo);

                case 'csv':
                    return $this->generateCSVFile($tempFile, $nombreArchivo);

                case 'json':
                    return $this->generateJSONFile($tempFile, $nombreArchivo);

                case 'xml':
                    return $this->generateXMLFile($tempFile, $nombreArchivo);

                default:
                    // Archivo binario genérico
                    return $this->generateGenericBinaryFile($tempFile, $nombreArchivo);
            }
        } catch (\Exception $e) {
            Log::error("Error generando archivo de muestra: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Genera un archivo de texto con contenido fake
     */
    protected function generateTextFile(string $tempFile, string $nombreArchivo): string
    {
        $faker = \Faker\Factory::create('es_ES');

        $content = "Documento: {$nombreArchivo}\n";
        $content .= "Generado: " . now()->format('d/m/Y H:i:s') . "\n";
        $content .= "Departamento: " . $faker->company . "\n\n";

        $content .= "CONTENIDO DEL DOCUMENTO\n";
        $content .= str_repeat("=", 50) . "\n\n";

        // Generar párrafos con contenido empresarial
        for ($i = 0; $i < rand(3, 8); $i++) {
            $content .= $faker->paragraph(rand(4, 10)) . "\n\n";
        }

        $content .= "\n\nFirma: " . $faker->name;
        $content .= "\nFecha: " . $faker->date();

        File::put($tempFile, $content);
        return $tempFile;
    }

    /**
     * Genera un archivo que simula ser PDF (con headers básicos)
     */
    protected function generateFakePDFFile(string $tempFile, string $nombreArchivo): string
    {
        $faker = \Faker\Factory::create('es_ES');

        // Crear un archivo que simule estructura PDF básica
        $content = "%PDF-1.4\n";
        $content .= "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n";
        $content .= "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n";
        $content .= "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n";
        $content .= "% Documento: {$nombreArchivo}\n";
        $content .= "% Generado por Seeder el: " . now()->format('d/m/Y H:i:s') . "\n";
        $content .= "% Contenido: " . $faker->sentence . "\n";
        $content .= "xref\n0 4\n0000000000 65535 f\n";
        $content .= "trailer<</Size 4/Root 1 0 R>>startxref\n%%EOF\n";

        File::put($tempFile, $content);
        return $tempFile;
    }

    /**
     * Genera un archivo que simula ser un documento Word
     */
    protected function generateFakeDocFile(string $tempFile, string $nombreArchivo): string
    {
        $faker = \Faker\Factory::create('es_ES');

        // Simular estructura básica de archivo DOC (en realidad será texto con metadatos)
        $content = "Microsoft Office Document\n";
        $content .= "Document: {$nombreArchivo}\n";
        $content .= "Created: " . now()->toISOString() . "\n";
        $content .= "Author: " . $faker->name . "\n";
        $content .= "Company: " . $faker->company . "\n\n";

        $content .= "DOCUMENTO DE EJEMPLO\n";
        $content .= str_repeat("=", 30) . "\n\n";

        for ($i = 0; $i < rand(2, 5); $i++) {
            $content .= "Sección " . ($i + 1) . ": " . $faker->sentence . "\n";
            $content .= $faker->paragraph(rand(3, 7)) . "\n\n";
        }

        File::put($tempFile, $content);
        return $tempFile;
    }

    /**
     * Genera un archivo que simula ser Excel
     */
    protected function generateFakeExcelFile(string $tempFile, string $nombreArchivo): string
    {
        $faker = \Faker\Factory::create('es_ES');

        // Generar CSV que simule datos de Excel
        $content = "Documento,{$nombreArchivo}\n";
        $content .= "Fecha,{$faker->date()}\n";
        $content .= "Departamento,{$faker->department}\n\n";
        $content .= "ID,Nombre,Apellido,Email,Salario,Departamento\n";

        for ($i = 1; $i <= rand(10, 25); $i++) {
            $content .= "{$i},{$faker->firstName},{$faker->lastName},{$faker->email},{$faker->numberBetween(25000, 80000)},{$faker->department}\n";
        }

        File::put($tempFile, $content);
        return $tempFile;
    }

    /**
     * Genera una imagen de prueba usando TestFile de Laravel
     */
    protected function generateFakeImageFile(string $tempFile, string $nombreArchivo): string
    {
        $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));

        // Usar TestFile de Laravel para generar imagen fake
        $testFile = TestFile::image('test_image.' . $extension, rand(200, 800), rand(200, 600));

        // Copiar el contenido al archivo temporal
        File::copy($testFile->getPathname(), $tempFile);

        return $tempFile;
    }

    /**
     * Genera un archivo CSV con datos fake
     */
    protected function generateCSVFile(string $tempFile, string $nombreArchivo): string
    {
        $faker = \Faker\Factory::create('es_ES');

        $content = "ID,Nombre,Email,Telefono,Departamento,Fecha_Ingreso\n";

        for ($i = 1; $i <= rand(15, 40); $i++) {
            $content .= sprintf(
                "%d,%s,%s,%s,%s,%s\n",
                $i,
                $faker->name,
                $faker->email,
                $faker->phoneNumber,
                $faker->department,
                $faker->date('Y-m-d')
            );
        }

        File::put($tempFile, $content);
        return $tempFile;
    }

    /**
     * Genera un archivo JSON with fake data
     */
    protected function generateJSONFile(string $tempFile, string $nombreArchivo): string
    {
        $faker = \Faker\Factory::create('es_ES');

        $data = [
            'documento' => $nombreArchivo,
            'generado' => now()->toISOString(),
            'autor' => $faker->name,
            'empresa' => $faker->company,
            'empleados' => []
        ];

        for ($i = 0; $i < rand(5, 15); $i++) {
            $data['empleados'][] = [
                'id' => $i + 1,
                'nombre' => $faker->name,
                'email' => $faker->email,
                'cargo' => $faker->jobTitle,
                'salario' => $faker->numberBetween(25000, 90000),
                'fecha_ingreso' => $faker->date('Y-m-d')
            ];
        }

        File::put($tempFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $tempFile;
    }

    /**
     * Genera un archivo XML con datos fake
     */
    protected function generateXMLFile(string $tempFile, string $nombreArchivo): string
    {
        $faker = \Faker\Factory::create('es_ES');

        $content = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $content .= "<documento>\n";
        $content .= "  <metadata>\n";
        $content .= "    <nombre>{$nombreArchivo}</nombre>\n";
        $content .= "    <generado>" . now()->toISOString() . "</generado>\n";
        $content .= "    <autor>{$faker->name}</autor>\n";
        $content .= "  </metadata>\n";
        $content .= "  <empleados>\n";

        for ($i = 0; $i < rand(3, 8); $i++) {
            $content .= "    <empleado id=\"" . ($i + 1) . "\">\n";
            $content .= "      <nombre>{$faker->name}</nombre>\n";
            $content .= "      <email>{$faker->email}</email>\n";
            $content .= "      <cargo>{$faker->jobTitle}</cargo>\n";
            $content .= "    </empleado>\n";
        }

        $content .= "  </empleados>\n";
        $content .= "</documento>\n";

        File::put($tempFile, $content);
        return $tempFile;
    }

    /**
     * Genera un archivo binario genérico
     */
    protected function generateGenericBinaryFile(string $tempFile, string $nombreArchivo): string
    {
        $faker = \Faker\Factory::create();

        // Generar contenido binario simulado
        $header = "FILE: {$nombreArchivo}\n";
        $header .= "GENERATED: " . now()->format('Y-m-d H:i:s') . "\n";
        $header .= str_repeat("=", 50) . "\n";

        // Añadir datos binarios aleatorios
        $binaryData = $faker->randomBytes(rand(1024, 8192));

        File::put($tempFile, $header . $binaryData);
        return $tempFile;
    }

    /**
     * Limpia completamente la estructura HR existente
     * En una estructura plana, todas las carpetas son independientes
     */
    protected function cleanHRStructure(): void
    {
        Log::info('Iniciando limpieza de estructura HR...');

        try {
            // En estructura plana, buscar TODOS los elementos que empiecen por 'hr'
            $elementosHR = Folder::where('path', 'LIKE', 'hr%')
                ->orderBy('path', 'desc') // Empezar por los más profundos
                ->get();

            if ($elementosHR->count() > 0) {
                Log::info("Encontrados {$elementosHR->count()} elementos HR para eliminar");

                // Procesar elementos en lotes para evitar bloqueos largos
                $elementosHR->chunk(5)->each(function ($lote) {
                    $this->executeWithRetry(function() use ($lote) {
                        DB::transaction(function() use ($lote) {
                            foreach ($lote as $elemento) {
                                $this->deleteElementSafely($elemento);
                            }
                        });
                    });
                });

                Log::info('Elementos HR eliminados exitosamente');
            } else {
                Log::info('No se encontró estructura HR existente, continuando con la creación...');
            }

            // Verificación adicional por seguridad
            $this->verifyCleanup();

            // Reconstruir el árbol NestedSet para asegurar integridad
            $this->rebuildNestedSet();
        } catch (\Exception $e) {
            Log::error('Error durante la limpieza de estructura HR: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Elimina un elemento de forma segura con múltiples estrategias
     */
    protected function deleteElementSafely(Folder $elemento): void
    {
        try {
            Log::debug("Eliminando elemento: {$elemento->path} (tipo: " .
                ($elemento->esCarpeta() ? 'carpeta' : 'archivo') . ")");

            // Usar el método unificado del DirectoryManagementService
            $eliminado = $this->directoryService->deleteElement($elemento, true);

            if (!$eliminado) {
                // Si falla el servicio, eliminar directamente como fallback
                Log::debug("Servicio falló, eliminando directamente: {$elemento->path}");
                $elemento->forceDelete();
            }
        } catch (\Exception $e) {
            Log::warning("No se pudo eliminar elemento {$elemento->path}: " . $e->getMessage());
            // Intentar eliminación directa como última opción
            try {
                $elemento->forceDelete();
            } catch (\Exception $e2) {
                Log::error("Error crítico eliminando elemento {$elemento->path}: " . $e2->getMessage());
            }
        }
    }

    /**
     * Verifica que la limpieza fue completa
     */
    protected function verifyCleanup(): void
    {
        Log::info('Verificando que la limpieza fue completa...');

        try {
            $elementosRestantes = Folder::where('path', 'LIKE', 'hr%')->count();

            if ($elementosRestantes > 0) {
                Log::warning("Aún quedan {$elementosRestantes} elementos HR en la base de datos");

                // Intentar limpiar los restantes de forma más agresiva
                $nodosRestantes = Folder::where('path', 'LIKE', 'hr%')->get();
                foreach ($nodosRestantes as $nodo) {
                    try {
                        Log::debug("Limpieza agresiva: eliminando {$nodo->path}");
                        $nodo->forceDelete();
                    } catch (\Exception $e) {
                        Log::error("No se pudo eliminar nodo restante {$nodo->id}: " . $e->getMessage());
                    }
                }

                $elementosFinales = Folder::where('path', 'LIKE', 'hr%')->count();
                Log::info("Después de limpieza agresiva quedan {$elementosFinales} elementos");
            } else {
                Log::info('Limpieza verificada: no quedan elementos HR en la base de datos');
            }
        } catch (\Exception $e) {
            Log::error('Error verificando limpieza: ' . $e->getMessage());
            // No es crítico, continuar
        }
    }

    /**
     * Limpia nodos huérfanos relacionados con HR (método mantenido por compatibilidad)
     * NOTA: En estructura plana, cleanHRStructure() ya maneja toda la limpieza
     */
    protected function cleanOrphanedHRNodes(): void
    {
        Log::info('Verificando nodos huérfanos relacionados con HR...');

        try {
            // Verificar si quedaron nodos huérfanos después de la limpieza principal
            $nodosHuerfanos = Folder::where('path', 'LIKE', 'hr%')->get();

            if ($nodosHuerfanos->count() > 0) {
                Log::warning("Encontrados {$nodosHuerfanos->count()} nodos huérfanos después de la limpieza principal");

                foreach ($nodosHuerfanos as $nodo) {
                    try {
                        Log::debug("Eliminando nodo huérfano: {$nodo->path}");
                        $nodo->forceDelete();
                    } catch (\Exception $e) {
                        Log::error("No se pudo eliminar nodo huérfano {$nodo->id}: " . $e->getMessage());
                    }
                }

                Log::info('Nodos huérfanos eliminados exitosamente');
            } else {
                Log::info('No se encontraron nodos huérfanos relacionados con HR');
            }
        } catch (\Exception $e) {
            Log::error('Error limpiando nodos huérfanos: ' . $e->getMessage());
            // No lanzar excepción aquí, es una limpieza adicional
        }
    }

    /**
     * Reconstruye el árbol NestedSet para asegurar integridad
     */
    protected function rebuildNestedSet(): void
    {
        Log::info('Reconstruyendo árbol NestedSet...');

        try {
            // Si el modelo Folder tiene el trait NodeTrait de kalnoy/nestedset
            if (method_exists(Folder::class, 'rebuildTree')) {
                Folder::rebuildTree();
                Log::info('Árbol NestedSet reconstruido exitosamente');
            } else {
                Log::info('El modelo no soporta reconstrucción automática del árbol');
            }
        } catch (\Exception $e) {
            Log::warning('Error reconstruyendo árbol NestedSet: ' . $e->getMessage());
            // No es crítico, continuar
        }
    }
}

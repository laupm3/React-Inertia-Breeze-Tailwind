<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Centro;
use App\Models\Empresa;
use App\Models\Empleado;
use App\Models\NivelAcceso;
use App\Models\TipoFichero;
use Illuminate\Support\Str;
use App\Models\NivelSeguridad;
use Illuminate\Database\Seeder;
use App\Models\ExtensionFichero;
use App\Models\File;

class FileSeeder extends Seeder
{
    protected $storage;
    protected $tiposFicheros;
    protected $nivelesSeguridad;
    protected $nivelesAcceso;
    protected $extensionesFicheros;
    protected $systemUser;

    public function run(): void
    {
        $this->storage = app(\App\Services\Ficheros\FileStorageStrategy::class);

        $this->tiposFicheros = TipoFichero::all()->keyBy('nombre');
        $this->nivelesSeguridad = NivelSeguridad::all()->keyBy('nombre');
        $this->nivelesAcceso = NivelAcceso::all()->keyBy('nombre');
        $this->extensionesFicheros = ExtensionFichero::all()->keyBy('nombre');
        $this->systemUser = User::where('email', 'doomsday@gmail.com')->first();

        // 1. Crear estructura raíz
        $rootPath = 'hr';
        $carpetaRaiz = $this->createFolderIfNotExists($rootPath, null, [
            'nombre' => 'hr',
            'nivel_seguridad' => 'L1',
            'nivel_acceso' => 'Alto',
        ]);

        // 2. Crear carpetas base
        $carpetaEmpresas = $this->createFolderIfNotExists("$rootPath/Empresas", $carpetaRaiz->id, [
            'nombre' => 'Empresas',
            'nivel_seguridad' => 'L1',
            'nivel_acceso' => 'Alto',
        ]);
        $carpetaCentros = $this->createFolderIfNotExists("$rootPath/Centros", $carpetaRaiz->id, [
            'nombre' => 'Centros',
            'nivel_seguridad' => 'L1',
            'nivel_acceso' => 'Alto',
        ]);
        $carpetaEmpleados = $this->createFolderIfNotExists("$rootPath/Empleados", $carpetaRaiz->id, [
            'nombre' => 'Empleados',
            'nivel_seguridad' => 'L1',
            'nivel_acceso' => 'Alto',
        ]);

        // 3. Crear carpetas y archivos de empleados
        //$empleados = Empleado::with('user')->take(3)->get();
        $empleados = Empleado::with('user')->get();
        foreach ($empleados as $empleado) {
            $user = $empleado->user;
            if (!$user) continue;

            $carpetaEmpleado = $this->createFolderIfNotExists(
                "$carpetaEmpleados->path/{$empleado->nif}",
                $carpetaEmpleados->id,
                [
                    'nombre' => $empleado->nif,
                    'nivel_seguridad' => 'L1',
                    'nivel_acceso' => 'Bajo',
                    'user_id' => $user->id,
                ]
            );

            // Subcarpetas principales
            foreach (['Personal', 'Trabajo', 'Seguridad'] as $subcarpeta) {
                $nivelSeg = $subcarpeta === 'Seguridad' ? 'L3' : 'L1';
                $nivelAcc = $subcarpeta === 'Seguridad' ? 'Alto' : 'Bajo';

                $carpetaSub = $this->createFolderIfNotExists(
                    "{$carpetaEmpleado->path}/$subcarpeta",
                    $carpetaEmpleado->id,
                    [
                        'nombre' => $subcarpeta,
                        'nivel_seguridad' => $nivelSeg,
                        'nivel_acceso' => $nivelAcc,
                        'user_id' => $user->id,
                    ]
                );

                // Subcarpetas de Trabajo
                if ($subcarpeta === 'Trabajo') {
                    foreach (['Nominas', 'Certificados', 'Permisos', 'Justificantes y Bajas'] as $subcarpetaTrabajo) {
                        $carpetaTrabajo = $this->createFolderIfNotExists(
                            "{$carpetaSub->path}/$subcarpetaTrabajo",
                            $carpetaSub->id,
                            [
                                'nombre' => $subcarpetaTrabajo,
                                'nivel_seguridad' => 'L1',
                                'nivel_acceso' => 'Bajo',
                                'user_id' => $user->id,
                            ]
                        );

                        // Archivo de ejemplo
                        $this->createFileIfNotExists(
                            "{$carpetaTrabajo->path}/documento1.pdf",
                            $carpetaTrabajo->id,
                            [
                                'nombre' => 'documento1',
                                'extension' => 'pdf',
                                'user_id' => $user->id,
                            ],
                            'Contenido del archivo PDF'
                        );

                        // Subcarpetas de años en Nominas
                        if ($subcarpetaTrabajo === 'Nominas') {
                            foreach (['2021', '2022', '2023', '2024'] as $anio) {
                                $carpetaAnio = $this->createFolderIfNotExists(
                                    "{$carpetaTrabajo->path}/$anio",
                                    $carpetaTrabajo->id,
                                    [
                                        'nombre' => $anio,
                                        'nivel_seguridad' => 'L1',
                                        'nivel_acceso' => 'Bajo',
                                        'user_id' => $user->id,
                                    ]
                                );

                                // Meses solo para 2024
                                if ($anio === '2024') {
                                    $meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                    foreach ($meses as $mes) {
                                        $carpetaMes = $this->createFolderIfNotExists(
                                            "{$carpetaAnio->path}/$mes",
                                            $carpetaAnio->id,
                                            [
                                                'nombre' => $mes,
                                                'nivel_seguridad' => 'L1',
                                                'nivel_acceso' => 'Bajo',
                                                'user_id' => $user->id,
                                            ]
                                        );

                                        // Archivo de nómina de ejemplo
                                        $extension = $this->extensionesFicheros->random();
                                        $nombreArchivo = "Nomina_{$mes}_{$anio}_{$empleado->nombre}{$empleado->primer_apellido}{$empleado->segundo_apellido}";
                                        $this->createFileIfNotExists(
                                            "{$carpetaMes->path}/{$nombreArchivo}.{$extension->nombre}",
                                            $carpetaMes->id,
                                            [
                                                'nombre' => $nombreArchivo,
                                                'extension' => $extension->nombre,
                                                'user_id' => $user->id,
                                            ],
                                            'Contenido del archivo PDF'
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 4. Carpetas de centros
        foreach (Centro::all()->pluck('nombre') as $centro) {
            $this->createFolderIfNotExists(
                "{$carpetaCentros->path}/$centro",
                $carpetaCentros->id,
                [
                    'nombre' => $centro,
                    'nivel_seguridad' => 'L1',
                    'nivel_acceso' => 'Bajo',
                ]
            );
        }

        // 5. Carpetas de empresas
        foreach (Empresa::all()->pluck('siglas') as $empresa) {
            $this->createFolderIfNotExists(
                "{$carpetaEmpresas->path}/$empresa",
                $carpetaEmpresas->id,
                [
                    'nombre' => $empresa,
                    'nivel_seguridad' => 'L1',
                    'nivel_acceso' => 'Bajo',
                ]
            );
        }

        // 6. Actualizar qty_ficheros de todas las carpetas
        $this->updateAllFoldersQty();
    }

    /**
     * Crea una carpeta si no existe en BD y almacenamiento.
     */
    private function createFolderIfNotExists($path, $parentId = null, $opts = [])
    {
        $folder = File::where('path', $path)
            ->where('tipo_fichero_id', $this->tiposFicheros['Carpeta']->id)
            ->first();

        if (!$folder) {
            if (!$this->storage->exists($path)) {
                $this->storage->createDirectory($path);
            }
            $folder = File::create([
                'user_id' => $opts['user_id'] ?? $this->systemUser->id,
                'created_by' => $this->systemUser->id,
                'tipo_fichero_id' => $this->tiposFicheros['Carpeta']->id,
                'nivel_seguridad_id' => $this->nivelesSeguridad[$opts['nivel_seguridad'] ?? 'L1']->id,
                'nivel_acceso_id' => $this->nivelesAcceso[$opts['nivel_acceso'] ?? 'Bajo']->id,
                'parent_id' => $parentId,
                'nombre' => $opts['nombre'],
                'size' => 0,
                'path' => $path,
                'hash' => Str::uuid(),
            ]);
        }
        return $folder;
    }

    /**
     * Crea un archivo si no existe en BD y almacenamiento.
     */
    private function createFileIfNotExists($path, $parentId, $opts = [], $contenido = null)
    {
        $nombre = $opts['nombre'];
        $extension = $opts['extension'] ?? 'pdf';

        $file = File::where('path', $path)
            ->where('tipo_fichero_id', $this->tiposFicheros['Archivo']->id)
            ->first();

        if (!$file) {
            // Crear archivo en almacenamiento
            if (!$this->storage->exists($path)) {
                // Crear archivo temporal para simular un UploadedFile
                $tmpPath = tempnam(sys_get_temp_dir(), 'seed');
                file_put_contents($tmpPath, $contenido ?? 'Contenido de ejemplo');
                $uploadedFile = new \Illuminate\Http\UploadedFile(
                    $tmpPath,
                    "$nombre.$extension",
                    null,
                    null,
                    true
                );
                $this->storage->storeFile($uploadedFile, dirname($path));
                unlink($tmpPath);
            }

            $file = File::create([
                'user_id' => $opts['user_id'] ?? $this->systemUser->id,
                'created_by' => $this->systemUser->id,
                'tipo_fichero_id' => $this->tiposFicheros['Archivo']->id,
                'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                'parent_id' => $parentId,
                'extension_id' => $this->extensionesFicheros[$extension]->id ?? null,
                'hash' => Str::uuid(),
                'nombre' => $nombre,
                'size' => strlen($contenido ?? 'Contenido de ejemplo'),
                'path' => $path,
            ]);
        }
        return $file;
    }

    /**
     * Actualiza qty_ficheros de todas las carpetas.
     */
    private function updateAllFoldersQty()
    {
        $carpetas = File::where('tipo_fichero_id', $this->tiposFicheros['Carpeta']->id)->get();
        foreach ($carpetas as $carpeta) {
            $carpeta->qty_ficheros = File::where('parent_id', $carpeta->id)->count();
            $carpeta->save();
        }
    }
}

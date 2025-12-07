<?php

namespace App\Http\Controllers\Admin;

use App\Models\File;
use App\Models\Empleado;
use App\Models\NivelAcceso;
use App\Models\TipoFichero;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\NivelSeguridad;
use App\Models\ExtensionFichero;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SubidaNominasController extends Controller
{
    /**
     * Almacena uno o varios archivos PDF (nóminas).
     * Valida cada archivo y retorna, para cada uno, un objeto con:
     * - "name": nombre original
     * - "size": tamaño formateado (en MB)
     * - "error": mensaje descriptivo en caso de fallo
     *
     * Además, retorna un array "accepted" con la información de los archivos que se guardaron.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validar la entrada
            $request->validate([
                'files'   => 'required|array',
                'files.*' => 'file|mimes:pdf|max:204800', // Máximo 200 MB
            ]);

            // Recuperar configuraciones y relaciones necesarias
            $extension_pdf     = ExtensionFichero::where('nombre', 'pdf')->first();
            $tipos_ficheros    = TipoFichero::all();
            $niveles_seguridad = NivelSeguridad::all();
            $niveles_acceso    = NivelAcceso::all();

            /** @var \Illuminate\Http\UploadedFile[] $files */
            $files = $request->file('files');
            if (!is_array($files)) {
                $files = [$files];
            }

            $acceptedFilesData = [];
            $fileErrors = [];

            $employeeFolder = File::where('nombre', 'Empleados')
                // Significa que la carpeta de empleados es la raíz (hr)
                ->where('parent_id', 1)
                ->first();

            $nifsFolders = File::where('parent_id', $employeeFolder->id)
                ->where('tipo_fichero_id', $tipos_ficheros->where('nombre', 'Carpeta')->first()->id)
                ->get();

            $empleados = Empleado::with(['user'])
                ->get();

            foreach ($files as $archivoSubido) {
                $originalName = $archivoSubido->getClientOriginalName();
                $sizeMB = round($archivoSubido->getSize() / (1024 * 1024), 1) . ' MB';

                // Validar si hubo error en la subida
                if (!$archivoSubido->isValid()) {
                    $fileErrors[] = [
                        'name'  => $originalName,
                        'size'  => $sizeMB,
                        'error' => "El archivo {$originalName} presentó un error en la subida."
                    ];
                    continue;
                }

                // Validar extensión PDF
                if (strtolower($archivoSubido->getClientOriginalExtension()) !== 'pdf') {
                    $fileErrors[] = [
                        'name'  => $originalName,
                        'size'  => "({$sizeMB})",
                        'error' => "El archivo {$originalName} no es un PDF."
                    ];
                    continue;
                }

                $filename = pathinfo($originalName, PATHINFO_FILENAME);
                // Validar formato del nombre: NIF_Mes_Año(_DESCRIPCIÓN)
                if (!preg_match('/^[XYZ]?[0-9]{7,8}[A-Za-z]_[A-Za-z]+_[0-9]{4}(_[A-Za-z]+)?$/', $filename)) {
                    $fileErrors[] = [
                        'name'  => $originalName,
                        'size'  => "({$sizeMB})",
                        'error' => "El nombre del archivo {$originalName} no cumple con el formato requerido."
                    ];
                    continue;
                }

                // Extraer datos del nombre
                $parts   = explode('_', $filename);
                $nif_pdf = $parts[0];
                $mes_pdf = $parts[1];
                $year_pdf = $parts[2];

                $empleado = $empleados->where('nif', $nif_pdf)->first();
                if (!$empleado) {
                    $fileErrors[] = [
                        'name'  => $originalName,
                        'size'  => "({$sizeMB})",
                        'error' => "Empleado no encontrado. (NIF: $nif_pdf)"
                    ];
                    continue;
                }

                // Verificar existencia del empleado (carpeta base) en la DB
                $carpetaNIF = $nifsFolders->where('nombre', $nif_pdf)->first();
                if (!$carpetaNIF) {
                    $fileErrors[] = [
                        'name'  => $originalName,
                        'size'  => "({$sizeMB})",
                        'error' => "Carpeta de empleado no encontrada. (NIF: $nif_pdf)"
                    ];
                    continue;
                }

                // Verificar que el usuario tenga un empleado asociado
                $usuario_empleado = $empleado->user;
                $usuario_empleado = $empleado->user;
                $usuario_empleado = $empleado->user;
                $usuario_empleado = $empleado->user;
                if (!$usuario_empleado) {
                    $fileErrors[] = [
                        'name'  => $originalName,
                        'size'  => "({$sizeMB})",
                        'error' => "No se encontró usuario asociado al empleado (NIF {$nif_pdf})."
                    ];
                    continue;
                }

                // Definir rutas de destino
                $carpetaNominas = "/Empleados/{$nif_pdf}/Trabajo/Nominas";
                $carpetaYear    = "{$carpetaNominas}/{$year_pdf}";
                $carpetaMes     = "{$carpetaYear}/{$mes_pdf}";
                $destinoCompleto = "{$carpetaMes}/{$originalName}";

                /*
             * 1. Verificar y crear carpeta del año si no existe.
             *    Se registra en la base de datos con parent_id apuntando a la carpeta de nóminas.
             */
                $yearRecord = File::where('path', "{$carpetaYear}")->first();
                if (!$yearRecord) {
                    if (!Storage::disk(File::DISK)->exists($carpetaYear)) {
                        Storage::disk(File::DISK)->makeDirectory($carpetaYear);
                    }
                    $id_carpetaNominas = File::where('path', "{$carpetaNominas}")->value('id');
                    $yearRecord = File::create([
                        'user_id'            => $usuario_empleado->id,
                        'created_by'         => Auth::id(),
                        'tipo_fichero_id'    => $tipos_ficheros->where('nombre', 'Carpeta')->first()->id,
                        'nivel_seguridad_id' => $niveles_seguridad->where('nombre', 'L2')->first()->id,
                        'nivel_acceso_id'    => $niveles_acceso->where('nombre', 'Bajo')->first()->id,
                        'parent_id'          => $id_carpetaNominas,
                        'extension_id'       => null,
                        'hash'               => Str::uuid(),
                        'nombre'             => $year_pdf,
                        'size'               => 0,
                        'path'               => "{$carpetaYear}",
                    ]);
                }

                /*
             * 2. Verificar y crear carpeta del mes si no existe.
             *    Se registra en la base de datos con parent_id apuntando a la carpeta del año.
             */
                $monthRecord = File::where('path', "{$carpetaMes}")->first();
                if (!$monthRecord) {
                    if (!Storage::disk(File::DISK)->exists($carpetaMes)) {
                        Storage::disk(File::DISK)->makeDirectory($carpetaMes);
                    }
                    $monthRecord = File::create([
                        'user_id'            => $usuario_empleado->id,
                        'created_by'         => Auth::id(),
                        'tipo_fichero_id'    => $tipos_ficheros->where('nombre', 'Carpeta')->first()->id,
                        'nivel_seguridad_id' => $niveles_seguridad->where('nombre', 'L2')->first()->id,
                        'nivel_acceso_id'    => $niveles_acceso->where('nombre', 'Bajo')->first()->id,
                        'parent_id'          => $yearRecord->id,
                        'extension_id'       => null,
                        'hash'               => Str::uuid(),
                        'nombre'             => $mes_pdf,
                        'size'               => 0,
                        'path'               => "{$carpetaMes}",
                    ]);
                }

                // 3. Verificar si el archivo ya existe
                if (Storage::disk(File::DISK)->exists($destinoCompleto)) {
                    $fileErrors[] = [
                        'name'  => $originalName,
                        'size'  => "({$sizeMB})",
                        'error' => "El archivo {$originalName} ya existe en el sistema."
                    ];
                    continue;
                }

                // 4. Almacenar el archivo en el storage y registrar en la base de datos
                $storedPath = $archivoSubido->storeAs($carpetaMes, $originalName, File::DISK);
                $acceptedFilesData[] = [
                    'name' => $originalName,
                    'size' => $sizeMB,
                    'path' => $storedPath,
                ];

                File::create([
                    'user_id'            => $usuario_empleado->id,
                    'created_by'         => Auth::id(),
                    'tipo_fichero_id'    => $tipos_ficheros->where('nombre', 'Archivo')->first()->id,
                    'nivel_seguridad_id' => $niveles_seguridad->where('nombre', 'L2')->first()->id,
                    'nivel_acceso_id'    => $niveles_acceso->where('nombre', 'Bajo')->first()->id,
                    'parent_id'          => $monthRecord->id,
                    'extension_id'       => $extension_pdf->id,
                    'hash'               => Str::uuid(),
                    'nombre'             => $originalName,
                    'size'               => $archivoSubido->getSize(),
                    'path'               => "/{$storedPath}",
                ]);
            }

            // Determinar el código de estado HTTP y el mensaje según la operación
            if (count($acceptedFilesData) > 0 && count($fileErrors) > 0) {
                $status = 207; // Éxito parcial
                $message = "Algunos archivos se subieron correctamente, pero otros fallaron.";
            } elseif (count($acceptedFilesData) > 0) {
                $status = Response::HTTP_CREATED;
                $message = "Archivos subidos correctamente.";
            } else {
                $status = Response::HTTP_BAD_REQUEST;
                $message = "Ningún archivo se subió correctamente.";
            }

            return response()->json([
                'message'  => $message,
                'accepted' => $acceptedFilesData,
                'errors'   => $fileErrors,
            ], $status);
        } catch (Exception $e) {
            // Capturar cualquier excepción no controlada y responder con un error interno.
            return response()->json([
                'message' => "Ocurrió un error al subir los archivos: " . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

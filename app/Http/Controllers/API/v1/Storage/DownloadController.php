<?php

namespace App\Http\Controllers\API\v1\Storage;

use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use App\Services\Storage\DownloadService;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use App\Http\Requests\Storage\GenerateDownloadUrlRequest;

/**
 * Controlador para manejar descargas de archivos
 */
class DownloadController extends Controller
{
    protected DownloadService $downloadService;

    public function __construct(DownloadService $downloadService)
    {
        $this->downloadService = $downloadService;
    }

    /**
     * Descarga una carpeta o archivo directamente
     * 
     * @param Folder $folder
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
     * 
     * @throws \Illuminate\Auth\Access\AuthorizationException Si el usuario no tiene permisos para descargar
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException Si el archivo no existe
     * @throws \InvalidArgumentException Si el objeto no es un archivo válido
     * @throws \RuntimeException Si el archivo no existe en el sistema de archivos
     */
    public function download(Folder $folder)
    {
        if (!Gate::allows('download', $folder)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para descargar este archivo/carpeta.'
            ]);
        }

        try {
            return $this->downloadService->download($folder);
        } catch (\Exception $e) {
            return response()->json(status: Response::HTTP_INTERNAL_SERVER_ERROR, data: [
                'message' => 'Error al descargar el archivo.'
            ]);
        }
    }

    /**
     * Genera una URL firmada para descarga, con un tiempo de expiración opcional
     * 
     * @param Request $request
     * @param Folder $file Carpeta o archivo del que se generará la URL
     * @return JsonResponse
     */
    public function generateDownloadUrl(GenerateDownloadUrlRequest $request, Folder $file): JsonResponse
    {
        // Verificar permisos
        if (!Gate::allows('download', $file)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para descargar este directorio.'
            ]);
        }

        $expirationMinutes = $request->input('expiration_minutes', DownloadService::DEFAULT_EXPIRATION_MINUTES);
        $url = $this->downloadService->generateSignedDownloadUrl($file, $expirationMinutes);
        
        return response()->json([
            'url' => $url,
            'expires_in_minutes' => $expirationMinutes
        ]);
    }

    /**
     * Descarga usando URL firmada
     * 
     * @param Request $request
     * @param Folder $file Carpeta o archivo del que se descargará usando la URL firmada
     * @return StreamedResponse|BinaryFileResponse|JsonResponse Streamed response o binary file response con el archivo descargado, o un JSON con error si no se puede descargar
     * 
     * @throws \InvalidArgumentException
     * @throws \RuntimeException
     */
    public function downloadSigned(Request $request, Folder $folder): StreamedResponse|BinaryFileResponse|JsonResponse
    {
        if (!Gate::allows('download', $folder)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para descargar este directorio.'
            ]);
        }

        try {
            return $this->downloadService->download($folder);
        } catch (\InvalidArgumentException $e) {
            return response()->json(
                status: Response::HTTP_BAD_REQUEST,
                data: [
                    'message' => 'Archivo no válido: ' . $e->getMessage(),
                ]
            );
        } catch (\RuntimeException $e) {
            return response()->json(
                status: Response::HTTP_INTERNAL_SERVER_ERROR,
                data: [
                    'message' => 'Error al descargar el archivo: ' . $e->getMessage()
                ]
            );
        }
    }
}

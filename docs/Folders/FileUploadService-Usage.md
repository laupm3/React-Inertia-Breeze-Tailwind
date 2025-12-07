# Ejemplo de uso del FileUploadService refactorizado

## En el SolicitudPermisoController

```php
// En el método store()
try {
    // Procesar archivos adjuntos
    $uploadedFiles = $this->fileUploadService->handleUploadRequest(
        $request, 
        $destinationFolder,
        'files', // campo del formulario
        $request->user() // creator
    );

    // Asociar archivos a la solicitud de permiso
    foreach ($uploadedFiles as $file) {
        $solicitudPermiso->files()->save($file);
    }

    Log::info("Archivos procesados y asociados correctamente", [
        'solicitud_id' => $solicitudPermiso->id,
        'files_count' => $uploadedFiles->count()
    ]);

} catch (\App\Exceptions\NoFilesProvidedException $e) {
    // No hay archivos - continuar sin problemas (es opcional)
    Log::info("No se proporcionaron archivos para la solicitud", [
        'solicitud_id' => $solicitudPermiso->id,
        'message' => $e->getMessage()
    ]);
    
} catch (\App\Exceptions\FileProcessingException $e) {
    // Algunos archivos fallaron - decidir qué hacer
    Log::error("Error procesando archivos", [
        'solicitud_id' => $solicitudPermiso->id,
        'failed_files' => $e->getFailedFiles(),
        'successful_count' => $e->getSuccessfulCount(),
        'failed_count' => $e->getFailedCount()
    ]);
    
    // Asociar los archivos exitosos si los hay
    if ($e->hasSuccessfulFiles()) {
        foreach ($e->getSuccessfulFiles() as $file) {
            $solicitudPermiso->files()->save($file);
        }
    }
    
    // Opcional: decidir si continuar o fallar la operación completa
    // Para solicitudes de permiso, probablemente continuar es apropiado
    // pero podríamos agregar un warning en la respuesta
    
    // Si quieres que falle toda la operación:
    // throw $e;
}
```

## Comportamientos posibles

### 1. **No hay archivos** (NoFilesProvidedException)
- Se lanza cuando no se proporcionan archivos en el request
- El controlador puede manejar esto como normal si los archivos son opcionales

### 2. **Procesamiento exitoso**
- Devuelve Collection<Folder> con todos los archivos procesados
- Se pueden asociar directamente al modelo

### 3. **Fallos parciales** (FileProcessingException)
- Algunos archivos se procesaron exitosamente, otros no
- La excepción contiene tanto los exitosos como los errores
- El controlador puede decidir qué hacer con los exitosos

### 4. **Fallo total** (FileProcessingException con 0 exitosos)
- Ningún archivo se pudo procesar
- La excepción contiene todos los errores
- El controlador puede decidir si fallar toda la operación

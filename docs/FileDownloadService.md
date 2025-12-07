# Servicio de Descarga de Archivos - FileDownloadService

## Descripción

El `FileDownloadService` es un servicio reutilizable para gestionar la descarga de archivos en la aplicación. Proporciona una interfaz unified para:

- Descarga directa de archivos
- Generación de URLs firmadas temporales
- Descarga de múltiples archivos como ZIP
- Verificación de permisos de descarga

## Componentes

### 1. FileDownloadService

**Ubicación**: `app/Services/File/FileDownloadService.php`

Servicio principal que maneja todas las operaciones de descarga.

#### Métodos principales:

```php
// Descarga directa de un archivo
downloadFile(Folder $file, bool $inline = false): StreamedResponse|BinaryFileResponse|null

// Genera URL firmada temporal
generateSignedDownloadUrl(Folder $file, ?int $expirationMinutes = null, array $additionalParams = []): string

// Descarga desde URL firmada
downloadFromSignedUrl(string $hash, int $fileId): StreamedResponse|BinaryFileResponse|null

// Descarga múltiples archivos como ZIP
downloadAsZip(array $files, string $zipName = 'archivos.zip'): ?StreamedResponse

// Verifica permisos de descarga
canUserDownload(Folder $file, ?User $user = null): bool
```

### 2. FileDownloadController

**Ubicación**: `app/Http/Controllers/File/FileDownloadController.php`

Controlador que expone endpoints REST para descargas.

#### Endpoints disponibles:

```php
GET /download/file/{file} - Descarga directa
GET /download/file/{file}/url - Genera URL firmada
GET /download/signed - Descarga desde URL firmada
POST /download/multiple - Descarga múltiple como ZIP
```

### 3. HasDownloadableFiles Trait

**Ubicación**: `app/Traits/HasDownloadableFiles.php`

Trait reutilizable para modelos que tienen archivos asociados.

#### Métodos disponibles:

```php
// Obtiene archivos descargables
getDownloadableFiles(): Collection

// Genera URLs de descarga
getDownloadUrls(?int $expirationMinutes = null): array

// Verifica si tiene archivos
hasDownloadableFiles(): bool

// Información de archivos
getFilesInfo(): array

// URL para descarga como ZIP
getZipDownloadUrl(?string $zipName = null): ?string
```

### 4. SolicitudPermisoFileController

**Ubicación**: `app/Http/Controllers/User/SolicitudPermisoFileController.php`

Controlador especializado para descargas de archivos de solicitudes de permiso.

#### Endpoints específicos:

```php
GET /user/solicitudes/{solicitudPermiso}/files/download-urls
GET /user/solicitudes/{solicitudPermiso}/files/info
GET /user/solicitudes/{solicitudPermiso}/files/download-zip
GET /user/solicitudes/{solicitudPermiso}/files/{file}/download
```

## Implementación en SolicitudPermiso

### 1. Actualización del Modelo

```php
use App\Traits\HasDownloadableFiles;

class SolicitudPermiso extends Model
{
    use HasDownloadableFiles;
    // ... resto del código
}
```

### 2. Actualización del Resource

```php
// En SolicitudPermisoResource
'files_info' => $this->when(
    condition: $this->relationLoaded('files'),
    value: fn() => $this->getFilesInfo()
),
'download_urls' => $this->when(
    condition: $request->boolean('include_download_urls', false),
    value: fn() => $this->getDownloadUrls()
),
```

### 3. Actualización de Políticas

```php
// En SolicitudPermisoPolicy
public function downloadFiles(User $user, SolicitudPermiso $solicitudPermiso): bool
{
    return $this->view($user, $solicitudPermiso);
}
```

## Ejemplos de Uso

### 1. Descarga directa en controlador

```php
use App\Services\File\FileDownloadService;

class MiControlador extends Controller
{
    public function descargarArchivo(Folder $file, FileDownloadService $downloadService)
    {
        if (!$downloadService->canUserDownload($file)) {
            abort(403);
        }
        
        return $downloadService->downloadFile($file);
    }
}
```

### 2. Generar URLs firmadas

```php
// En tu controlador
$solicitud = SolicitudPermiso::with('files')->find(1);
$downloadUrls = $solicitud->getDownloadUrls(120); // 2 horas de expiración

return response()->json(['download_urls' => $downloadUrls]);
```

### 3. Información de archivos

```php
$solicitud = SolicitudPermiso::with('files')->find(1);

// Información básica
$info = $solicitud->getFilesInfo();
// Resultado:
// {
//   "total_files": 3,
//   "total_size": 1048576,
//   "total_size_human": "1 MB",
//   "extensions": ["pdf", "jpg", "docx"],
//   "has_files": true
// }

// URLs de descarga
$urls = $solicitud->getDownloadUrls();

// URL para ZIP
$zipUrl = $solicitud->getZipDownloadUrl();
```

### 4. Descarga como ZIP

```php
// Desde JavaScript (frontend)
fetch('/user/solicitudes/123/files/download-zip')
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'solicitud_123_archivos.zip';
        a.click();
    });
```

### 5. Uso del trait en otros modelos

```php
// Para cualquier modelo que tenga archivos
class MiModelo extends Model
{
    use HasDownloadableFiles;
    
    public function files(): MorphMany
    {
        return $this->morphMany(Folder::class, 'fileable');
    }
}

// Luego usar:
$modelo = MiModelo::with('files')->find(1);
$archivos = $modelo->getDownloadableFiles();
$urls = $modelo->getDownloadUrls();
```

## Rutas Disponibles

### Rutas Generales
```php
GET /download/file/{file} - files.download.direct
GET /download/file/{file}/url - files.download.url
GET /download/signed - files.download.signed
POST /download/multiple - files.download.multiple
```

### Rutas Específicas para SolicitudPermiso
```php
GET /user/solicitudes/{solicitudPermiso}/files/download-urls - user.solicitudes.files.download-urls
GET /user/solicitudes/{solicitudPermiso}/files/info - user.solicitudes.files.info
GET /user/solicitudes/{solicitudPermiso}/files/download-zip - user.solicitudes.files.download-zip
GET /user/solicitudes/{solicitudPermiso}/files/{file}/download - user.solicitudes.files.download
```

## Configuración

El servicio está registrado como singleton en `AppServiceProvider`:

```php
$this->app->singleton(FileDownloadService::class, function (Application $app) {
    return new FileDownloadService();
});
```

## Seguridad

- ✅ Verificación de permisos a través de Policies
- ✅ URLs firmadas con expiración automática
- ✅ Validación de archivos físicos antes de descarga
- ✅ Logging de todas las operaciones de descarga
- ✅ Verificación de propiedad de archivos

## Ventajas del Servicio

1. **Reutilizable**: Se puede usar en cualquier modelo con archivos
2. **Seguro**: Verificaciones de permisos integradas
3. **Flexible**: Múltiples métodos de descarga
4. **Eficiente**: URLs firmadas evitan procesamiento innecesario
5. **Extensible**: Fácil de expandir para nuevos tipos de descarga
6. **Mantenible**: Código centralizado y bien estructurado


# 🏗️ Arquitectura de Servicios - Sistema de Archivos

## 📋 Resumen

Sistema de gestión de archivos unificado que maneja almacenamiento, descarga, permisos y organización de archivos de forma escalable y mantenible.

## 🔧 Arquitectura Unificada Sin Transacciones Duplicadas

### Problema Resuelto
Se eliminó la duplicación de transacciones de base de datos que causaba overhead y problemas de rendimiento.

### Solución Implementada

#### FolderService (Servicio Puro)
```php
// app/Services/Folder/FolderService.php
class FolderService 
{
    /**
     * IMPORTANTE: Este método NO maneja transacciones. 
     * Las transacciones deben ser manejadas por el llamador.
     */
    public function createPath(string $path, ?Folder $parent = null): Folder
    {
        // Lógica pura, sin DB::transaction
        return $this->createPathLogic($path, $parent);
    }
    
    public function deleteFolder(Folder $folder, bool $forceDelete = false): bool
    {
        // Lógica pura, sin DB::transaction
        return $this->deleteFolderLogic($folder, $forceDelete);
    }
    
    public function moveFolder(Folder $folder, ?Folder $newParent): bool
    {
        // Lógica pura, sin DB::transaction
        return $this->moveFolderLogic($folder, $newParent);
    }
}
```

#### DirectoryManagementService (Orquestador)
```php
// app/Services/Directory/DirectoryManagementService.php
class DirectoryManagementService
{
    public function createDirectoryPath(string $path, ?Folder $parent = null): Folder
    {
        return DB::transaction(function () use ($path, $parent) {
            return $this->folderService->createPath($path, $parent);
        });
    }
    
    public function deleteDirectory(Folder $folder, bool $forceDelete = false): bool
    {
        return DB::transaction(function () use ($folder, $forceDelete) {
            return $this->folderService->deleteFolder($folder, $forceDelete);
        });
    }
}
```

### Beneficios de la Arquitectura
- ✅ **Una sola transacción** por operación completa
- ✅ **Sin overhead** de transacciones anidadas  
- ✅ **Flexibilidad máxima**: Uso directo o orquestado
- ✅ **Performance optimizada**: Sin duplicación de código

## 📁 Sistema de Descarga de Archivos

### FileDownloadService
```php
// app/Services/File/FileDownloadService.php
class FileDownloadService
{
    // Descarga directa de un archivo
    public function downloadFile(Folder $file, bool $inline = false): StreamedResponse|BinaryFileResponse|null
    
    // Genera URL firmada temporal
    public function generateSignedDownloadUrl(Folder $file, ?int $expirationMinutes = null): string
    
    // Descarga desde URL firmada
    public function downloadFromSignedUrl(string $hash, int $fileId): StreamedResponse|BinaryFileResponse|null
    
    // Descarga múltiples archivos como ZIP
    public function downloadAsZip(array $files, string $zipName = 'archivos.zip'): ?StreamedResponse
    
    // Verifica permisos de descarga
    public function canUserDownload(Folder $file, ?User $user = null): bool
}
```

### FileDownloadController
```php
// app/Http/Controllers/File/FileDownloadController.php
class FileDownloadController
{
    // Endpoints REST para descargas
    public function downloadFile(Folder $file)           // GET /download/file/{file}
    public function generateSignedUrl(Folder $file)      // GET /download/file/{file}/url  
    public function downloadFromSigned(Request $request) // GET /download/signed
    public function downloadMultiple(Request $request)   // POST /download/multiple
}
```

### HasDownloadableFiles Trait
```php
// app/Traits/HasDownloadableFiles.php
trait HasDownloadableFiles
{
    // Obtiene archivos descargables
    public function getDownloadableFiles(): Collection
    
    // Genera URLs de descarga
    public function getDownloadUrls(?int $expirationMinutes = null): array
    
    // Verifica si tiene archivos  
    public function hasDownloadableFiles(): bool
    
    // Información de archivos
    public function getFilesInfo(): array
    
    // URL para descarga como ZIP
    public function getZipDownloadUrl(?string $zipName = null): ?string
}
```

## 🎯 Generación de Archivos de Prueba

### FolderSeeder Optimizado
```php
// database/seeders/FolderSeeder.php
class FolderSeeder extends Seeder
{
    public function run()
    {
        // Integración con FileUploadService para crear archivos físicos reales
        $this->fileUploadService->processLocalFile($carpeta, $tempFile, $attributes);
    }
    
    // Genera archivos físicos de diferentes tipos
    protected function generateTextFile(string $tempFile, string $nombreArchivo): string
    protected function generateFakeImageFile(string $tempFile, string $nombreArchivo): string  
    protected function generateCSVFile(string $tempFile, string $nombreArchivo): string
    protected function generateFakePDFFile(string $tempFile, string $nombreArchivo): string
}
```

### Herramientas Utilizadas
```php
use Illuminate\Support\Facades\File;
use Illuminate\Http\Testing\File as TestFile;
use Faker\Factory as Faker;

// Escribir archivos físicos
File::put($tempFile, $content);

// Generar imágenes fake  
$testFile = TestFile::image('test.jpg', 800, 600);

// Contenido en español
$faker = Faker::create('es_ES');
$faker->name;        // Nombres en español
$faker->company;     // Empresas españolas
```

## 🔄 Flujo de Datos Completo

### Creación de Estructura de Carpetas
```
1. Controller recibe solicitud
2. DirectoryManagementService inicia transacción
3. FolderService ejecuta lógica pura
4. Se confirma transacción
5. Se retorna resultado
```

### Descarga de Archivos
```
1. Usuario solicita descarga
2. FileDownloadService verifica permisos
3. Se genera URL firmada o descarga directa
4. Se registra actividad
5. Se entrega archivo al usuario
```

### Generación de Archivos de Prueba
```
1. FolderSeeder ejecuta
2. Se crean carpetas lógicas
3. Se generan archivos físicos reales
4. Se vinculan registros con archivos
5. Sistema queda con datos consistentes
```

## 📊 Beneficios del Sistema

### Arquitectura Limpia
- **Separación de responsabilidades**: Servicios puros vs orquestadores
- **Reutilización**: Componentes independientes
- **Mantenibilidad**: Código fácil de entender y modificar

### Performance Optimizada
- **Transacciones únicas**: Sin overhead de anidación
- **Cache inteligente**: Reduce consultas repetidas
- **Consultas optimizadas**: JOINs en lugar de N+1

### Experiencia de Usuario
- **Descargas rápidas**: URLs firmadas y cache
- **Múltiples formatos**: Soporte para ZIP, PDF, imágenes
- **Feedback visual**: Estados de carga y progreso

### Mantenimiento
- **Tests automatizados**: Archivos de prueba realistas
- **Logs detallados**: Trazabilidad completa
- **Configuración flexible**: Fácil adaptación a necesidades

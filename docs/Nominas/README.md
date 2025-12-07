# Documentación del Sistema de Nóminas

## Índice de Documentos

1. [Notificaciones para Archivos de Nóminas](NotificacionesNominas.md) - Descripción general del sistema de notificaciones para archivos de nóminas.
2. [Implementación Técnica](ImplementacionTecnicaNominas.md) - Detalles técnicos sobre la implementación, desafíos y soluciones.

## Resumen

El sistema de nóminas incluye funcionalidades para:

- Detectar archivos de nóminas basados en su ubicación o nombre
- Disparar eventos cuando los archivos de nóminas son creados, actualizados o eliminados
- Enviar notificaciones a los usuarios correspondientes
- Facilitar consultas para obtener archivos de nóminas mediante un scope personalizado

## Estructura de Carpetas

```
app/
├── Events/Storage/Files/Nominas/
│   ├── NominaFileCreated.php
│   ├── NominaFileUpdated.php
│   └── NominaFileDeleted.php
├── Listeners/Storage/File/Nominas/
│   ├── NotificarNominaCreada.php
│   ├── NotificarNominaActualizada.php
│   └── NotificarNominaEliminada.php
├── Traits/
│   └── HandlesNominaFiles.php
└── Models/
    └── File.php (incluye el scope forNominas)
```

## Ejemplos de Uso

### Verificar si un archivo es una nómina

```php
use App\Traits\HandlesNominaFiles;

class MiClase
{
    use HandlesNominaFiles;
    
    public function procesarArchivo(File $file)
    {
        if ($this->isNominaFile($file)) {
            // Es un archivo de nómina
        }
    }
}
```

### Consultar archivos de nóminas

```php
// Obtener todas las nóminas
$nominas = File::forNominas()->get();

// Filtrar por empleado (DNI en la ruta)
$nominasEmpleado = File::forNominas()
    ->where('path', 'like', '%/12345678Z/%')
    ->get();
```

### Disparar eventos manualmente

```php
use App\Traits\HandlesNominaFiles;

class FileController
{
    use HandlesNominaFiles;
    
    public function store(Request $request)
    {
        // Crear archivo
        $file = File::create($request->validated());
        
        // Disparar evento si es nómina
        $this->dispatchNominaCreatedEvent($file);
        
        return response()->json($file);
    }
}
```

## Pruebas

Los tests para esta funcionalidad se encuentran en:

```
tests/Feature/NominaNotificationsTest.php
```

Para ejecutar específicamente estos tests:

```bash
php artisan test --filter=NominaNotificationsTest
```

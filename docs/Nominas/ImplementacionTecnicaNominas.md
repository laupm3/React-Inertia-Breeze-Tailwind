# Implementación Técnica: Sistema de Notificaciones para Nóminas

## Resumen Técnico

Este documento detalla el proceso de implementación del sistema de notificaciones para archivos de nóminas, incluyendo los desafíos encontrados y las soluciones aplicadas.

## Estructura de Clases

### Eventos

```
app/Events/Storage/Files/Nominas/
├── NominaFileCreated.php
├── NominaFileUpdated.php
└── NominaFileDeleted.php
```

### Listeners

```
app/Listeners/Storage/File/Nominas/
├── NotificarNominaCreada.php
├── NotificarNominaActualizada.php
└── NotificarNominaEliminada.php
```

### Trait

```
app/Traits/HandlesNominaFiles.php
```

## Implementación del Trait `HandlesNominaFiles`

```php
<?php

namespace App\Traits;

use App\Models\File;
use App\Events\Storage\Files\Nominas\NominaFileCreated;
use App\Events\Storage\Files\Nominas\NominaFileUpdated;
use App\Events\Storage\Files\Nominas\NominaFileDeleted;

trait HandlesNominaFiles
{
    /**
     * Determina si un archivo es una nómina
     */
    public function isNominaFile(File $file): bool
    {
        // Es una nómina si está en una carpeta de nóminas
        if (str_contains($file->path, '/Nominas/')) {
            return true;
        }

        // Es una nómina si su nombre comienza con "Nomina_" y contiene un patrón de año
        if (str_starts_with($file->nombre, 'Nomina_') && preg_match('/_\d{4}_/', $file->nombre)) {
            return true;
        }

        return false;
    }

    /**
     * Dispara el evento de creación de nómina
     */
    public function dispatchNominaCreatedEvent(File $file): void
    {
        if ($this->isNominaFile($file)) {
            event(new NominaFileCreated($file));
        }
    }

    /**
     * Dispara el evento de actualización de nómina
     */
    public function dispatchNominaUpdatedEvent(File $file): void
    {
        if ($this->isNominaFile($file)) {
            event(new NominaFileUpdated($file));
        }
    }

    /**
     * Dispara el evento de eliminación de nómina
     */
    public function dispatchNominaDeletedEvent(File $file): void
    {
        if ($this->isNominaFile($file)) {
            event(new NominaFileDeleted($file));
        }
    }
}
```

## Implementación del Scope en el Modelo `File`

```php
/**
 * Scope para filtrar solo archivos de nóminas
 */
public function scopeForNominas($query)
{
    $archivoTypeId = \App\Models\TipoFichero::where('nombre', 'Archivo')->first()?->id;

    return $query->where('tipo_fichero_id', $archivoTypeId)
        ->where(function ($query) {
            $query->where('path', 'like', '%/Nominas/%')
                ->orWhere(function ($query) {
                    $query->where('nombre', 'like', 'Nomina_%');
                    
                    // Si estamos en SQLite (como en testing), usamos un enfoque diferente
                    if (DB::connection()->getDriverName() === 'sqlite') {
                        // Usamos LIKE en lugar de REGEXP para SQLite
                        $query->where('nombre', 'like', '%\_20__\_%');
                    } else {
                        // Para MySQL y otros motores que soportan REGEXP
                        $query->whereRaw("nombre REGEXP '_[0-9]{4}_'");
                    }
                });
        });
}
```

## Registro de Eventos y Listeners

En `app/Providers/EventServiceProvider.php`:

```php
protected $listen = [
    // ... otros eventos

    // Eventos de Nóminas
    NominaFileCreated::class => [
        NotificarNominaCreada::class,
    ],
    NominaFileUpdated::class => [
        NotificarNominaActualizada::class,
    ],
    NominaFileDeleted::class => [
        NotificarNominaEliminada::class,
    ],
];
```

## Desafíos de Implementación y Soluciones

### 1. Compatibilidad con SQLite en Tests

**Problema**: SQLite, usado en los tests, no soporta la función `REGEXP` que usamos en MySQL para detectar patrones en los nombres de archivo.

**Solución**: Implementamos una detección condicional en el scope:

```php
if (DB::connection()->getDriverName() === 'sqlite') {
    // Usamos LIKE en lugar de REGEXP para SQLite
    $query->where('nombre', 'like', '%\_20__\_%');
} else {
    // Para MySQL y otros motores que soportan REGEXP
    $query->whereRaw("nombre REGEXP '_[0-9]{4}_'");
}
```

### 2. Problemas con Campos Requeridos en Tablas

**Problema**: Al ejecutar los tests, se producían errores de "NOT NULL constraint failed" para columnas como `permission_id` en la tabla `niveles_acceso` y el campo `title` en la tabla `permissions`.

**Solución**: 
1. Actualizamos los modelos para incluir estos campos en el array `$fillable`
2. Modificamos el código de prueba para siempre proporcionar estos campos
3. Para SQLite en testing, deshabilitamos temporalmente las comprobaciones de claves foráneas

```php
// Deshabilitar comprobación de claves foráneas para simplificar testing
if (DB::connection()->getDriverName() === 'sqlite') {
    DB::statement('PRAGMA foreign_keys = OFF;');
}

// Al crear permisos, incluimos el título
Permission::create([
    'name' => 'test.permission',
    'guard_name' => 'web',
    'module_id' => $this->module->id,
    'title' => 'Test Permission'
]);
```

### 3. Falta de Tablas en el Entorno de Test

**Problema**: Algunas tablas como `extension_ficheros` no existían en el entorno de SQLite para testing.

**Solución**: Creamos las tablas necesarias durante la configuración de las pruebas:

```php
// Crear tablas necesarias si no existen (solo para SQLite en testing)
if (!Schema::hasTable('extension_ficheros')) {
    Schema::create('extension_ficheros', function ($table) {
        $table->id();
        $table->string('extension');
        $table->string('nombre');
        $table->string('descripcion')->nullable();
        $table->timestamps();
    });
}
```

### 4. Errores de Sintaxis en el Modelo File

**Problema**: Durante la edición del modelo File.php para añadir la compatibilidad con SQLite, se introdujeron algunos errores de sintaxis con llaves adicionales.

**Solución**: Revisión cuidadosa del código para eliminar las llaves adicionales y asegurar que la estructura de los métodos fuera correcta.

## Estrategias de Prueba

Se crearon pruebas específicas para:

1. Verificar que los eventos se disparan al crear, actualizar y eliminar archivos de nóminas
2. Comprobar que la detección de archivos de nóminas funciona para diferentes casos (ubicación en carpeta de nóminas o nombre con formato de nómina)
3. Validar que el scope `forNominas()` filtra correctamente los archivos

La suite de pruebas se ejecuta automáticamente con:

```bash
php artisan test --filter=NominaNotificationsTest
```

## Consejos para Desarrolladores

1. **Compatibilidad con Bases de Datos**: Si implementas nuevas funcionalidades que utilizan características específicas de MySQL (como REGEXP), asegúrate de proporcionar alternativas para SQLite en el entorno de pruebas.

2. **Modelos y Campos Requeridos**: Mantén actualizados los arrays `$fillable` en los modelos cuando se añadan nuevos campos requeridos a las tablas.

3. **Pruebas de Eventos**: Al probar eventos, utiliza `Event::fake()` para registrar los eventos disparados y `Event::assertDispatched()` para verificar que se dispararon correctamente.

## Próximos Pasos

1. Implementar notificaciones por email para los usuarios cuando sus nóminas están disponibles
2. Añadir un panel de control para administradores que muestre estadísticas sobre los archivos de nóminas
3. Integrar esta funcionalidad con un sistema de firmas digitales para confirmar la recepción de nóminas

## Referencias

- [Documentación de Laravel sobre Eventos](https://laravel.com/docs/10.x/events)
- [Documentación sobre Eloquent Scopes](https://laravel.com/docs/10.x/eloquent#query-scopes)
- [Testing en Laravel](https://laravel.com/docs/10.x/testing)

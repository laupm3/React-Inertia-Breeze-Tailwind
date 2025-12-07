# Sistema de Notificaciones para Archivos de Nóminas

## Introducción

El sistema de notificaciones para archivos de nóminas permite detectar automáticamente cuando los archivos de nóminas son creados, actualizados o eliminados en el sistema, y disparar eventos correspondientes que pueden ser utilizados para enviar notificaciones a los usuarios, actualizar registros, o realizar cualquier otra acción necesaria.

## Componentes del Sistema

El sistema está compuesto por los siguientes componentes:

### 1. Eventos

Se han definido tres eventos principales:

- `NominaFileCreated`: Se dispara cuando se crea un nuevo archivo de nómina
- `NominaFileUpdated`: Se dispara cuando se actualiza un archivo de nómina existente
- `NominaFileDeleted`: Se dispara cuando se elimina un archivo de nómina

### 2. Listeners (Escuchadores)

Los listeners correspondientes a estos eventos son:

- `NotificarNominaCreada`: Maneja las acciones a realizar cuando se crea una nómina
- `NotificarNominaActualizada`: Maneja las acciones a realizar cuando se actualiza una nómina
- `NotificarNominaEliminada`: Maneja las acciones a realizar cuando se elimina una nómina

### 3. Trait `HandlesNominaFiles`

Este trait encapsula la lógica para:

- Detectar si un archivo es una nómina basado en su ruta o nombre
- Disparar los eventos correspondientes cuando se manipulan archivos de nóminas

### 4. Scope en el modelo `File`

Se ha añadido un scope personalizado `forNominas()` al modelo `File` que permite filtrar fácilmente los archivos que son nóminas, utilizando los siguientes criterios:

- Archivos que están dentro de carpetas cuya ruta contiene "/Nominas/"
- Archivos cuyo nombre comienza con "Nomina_" y contiene un patrón de año (`_YYYY_`)

## Cómo funciona

### Detección de Archivos de Nóminas

Un archivo se considera una nómina si cumple alguno de estos criterios:

1. El archivo está ubicado dentro de una carpeta de nóminas (la ruta contiene "/Nominas/")
2. El nombre del archivo comienza con "Nomina_" y contiene un patrón de año (por ejemplo: "Nomina_Junio_2024_12345678Z.pdf")

### Disparando Eventos

Los eventos se disparan automáticamente cuando:

1. **Creación**: Se detecta un nuevo archivo que cumple con los criterios de nómina
2. **Actualización**: Se actualiza un archivo existente que es una nómina
3. **Eliminación**: Se elimina un archivo que es una nómina

### Uso del Scope para Consultas

El scope `forNominas()` permite realizar consultas para obtener solo los archivos de nóminas:

```php
// Obtener todas las nóminas
$nominas = File::forNominas()->get();

// Contar las nóminas
$totalNominas = File::forNominas()->count();

// Combinar con otros criterios
$nominasJunio2024 = File::forNominas()
    ->where('nombre', 'like', '%Junio_2024%')
    ->get();
```

## Implementación Técnica

### Trait `HandlesNominaFiles`

Este trait contiene los métodos:

- `isNominaFile($file)`: Determina si un archivo es una nómina
- `dispatchNominaCreatedEvent($file)`: Dispara el evento de creación
- `dispatchNominaUpdatedEvent($file)`: Dispara el evento de actualización
- `dispatchNominaDeletedEvent($file)`: Dispara el evento de eliminación

### Compatibilidad con SQLite

La implementación del scope `forNominas()` ha sido adaptada para funcionar tanto con MySQL (usando REGEXP) como con SQLite (usando LIKE), permitiendo que los tests se ejecuten correctamente en ambos entornos.

## Pruebas

El sistema incluye pruebas exhaustivas que verifican:

1. Que los eventos se disparan correctamente al crear, actualizar y eliminar archivos de nóminas
2. Que la detección de archivos de nóminas funciona correctamente para diferentes casos
3. Que el scope `forNominas()` filtra correctamente los archivos

## Integración con el Resto del Sistema

Esta funcionalidad se integra con el sistema existente de archivos y notificaciones, manteniendo la coherencia con la arquitectura general de la aplicación. Las notificaciones de nóminas pueden ser utilizadas por:

- El panel de administración de RRHH
- El sistema de notificaciones para empleados
- Los registros de auditoría y logs del sistema

## Consideraciones para el Futuro

Posibles mejoras o extensiones de esta funcionalidad:

1. Agregar metadatos adicionales a los eventos para proporcionar más contexto
2. Crear notificaciones personalizadas basadas en el tipo de nómina o el empleado al que pertenece
3. Implementar un sistema de confirmación de lectura para las nóminas
4. Extender la funcionalidad para otros tipos de documentos importantes (contratos, evaluaciones, etc.)

## Conclusión

El sistema de notificaciones para archivos de nóminas proporciona una forma robusta y flexible de manejar eventos relacionados con estos documentos importantes, permitiendo a la aplicación reaccionar adecuadamente cuando son creados, actualizados o eliminados, mejorando así la experiencia del usuario y la funcionalidad general del sistema.

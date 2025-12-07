# Corrección del Sistema de Eventos Dinámico

## Problema Identificado

El método `dispatchModelEvent()` en `BaseImportService` no estaba disparando correctamente los eventos para el modelo `User` debido a un problema en la construcción del nombre del evento.

### Error Detectado

```log
[UsuariosImport] Evento no encontrado {"expected_event":"App\\Events\\User\\UserCreado","action":"created","model_class":"App\\Models\\User"}
```

### Causa del Error

El método estaba usando el nombre del modelo (`User`) directamente para construir el evento, pero debería usar el nombre mapeado (`Usuario`):

```php
// Incorrecto - Construía: App\Events\Usuario\UserCreado
$eventClass = "App\\Events\\{$eventFolder}\\{$modelName}{$eventSuffix}";

// Correcto - Construye: App\Events\Usuario\UsuarioCreado
$eventClass = "App\\Events\\{$eventFolder}\\{$eventModelName}{$eventSuffix}";
```

## Solución Implementada

### Cambio en BaseImportService.php

```php
// Antes
$eventFolder = $modelEventFolderMap[$modelName] ?? $modelName;
$modelActionMap = $actionEventMap[$modelName] ?? $actionEventMap['default'];
$eventSuffix = $modelActionMap[$action] ?? 'Creado';
$eventClass = "App\\Events\\{$eventFolder}\\{$modelName}{$eventSuffix}";

// Después
$eventFolder = $modelEventFolderMap[$modelName] ?? $modelName;
$eventModelName = $eventFolder; // Usar el nombre mapeado para el evento
$modelActionMap = $actionEventMap[$eventModelName] ?? $actionEventMap['default'];
$eventSuffix = $modelActionMap[$action] ?? 'Creado';
$eventClass = "App\\Events\\{$eventFolder}\\{$eventModelName}{$eventSuffix}";
```

### Resultado

Ahora el sistema construye correctamente los eventos:

#### Para el Modelo User:
- ✅ `App\Events\Usuario\UsuarioCreado` (antes: ❌ `App\Events\User\UserCreado`)
- ✅ `App\Events\Usuario\UsuarioActualizado` (antes: ❌ `App\Events\User\UserActualizado`)

#### Para otros modelos:
- ✅ `App\Events\Centro\CentroCreado`
- ✅ `App\Events\Empresa\EmpresaCreada`
- ✅ `App\Events\Empleado\EmpleadoCreado`

## Verificación

Los logs ahora muestran:
```log
[UsuariosImport] Evento disparado {"event":"App\\Events\\Usuario\\UsuarioCreado","action":"created","model_id":163,"model_class":"App\\Models\\User"}
[UsuariosImport] Evento disparado {"event":"App\\Events\\Usuario\\UsuarioActualizado","action":"updated","model_id":1,"model_class":"App\\Models\\User"}
```

## Impacto

- ✅ **Eventos de Usuario**: Ahora se disparan correctamente
- ✅ **Eventos de otras entidades**: Siguen funcionando correctamente
- ✅ **Compatibilidad**: No se rompe ningún evento existente
- ✅ **Consistencia**: Todos los eventos usan el patrón correcto

## Estructura de Eventos Soportada

El sistema ahora soporta correctamente la estructura:
```
app/Events/
├── Usuario/
│   ├── UsuarioCreado.php
│   ├── UsuarioActualizado.php
│   └── UsuarioEliminado.php
├── Centro/
│   ├── CentroCreado.php
│   ├── CentroActualizado.php
│   └── CentroEliminado.php
├── Empresa/
│   ├── EmpresaCreada.php
│   ├── EmpresaActualizada.php
│   └── EmpresaEliminada.php
└── ...
```

El problema ha sido completamente resuelto.

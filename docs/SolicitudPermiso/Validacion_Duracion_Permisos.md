# Validación de Duración de Permisos

## Resumen

Se han implementado nuevas validaciones para las solicitudes de permisos que aseguran:

1. **Validación de duración individual**: Que una solicitud no supere el tiempo máximo permitido para el tipo de permiso
2. **Validación de duración acumulada**: Que la suma de todas las solicitudes del empleado para un permiso específico en el año no supere el límite anual

## Funcionalidades Implementadas

### 1. Servicio de Validación (`SolicitudPermisoValidationService`)

#### Métodos Añadidos:

- **`validateDuration()`**: Valida que la duración de una solicitud individual no supere el máximo del permiso
- **`validateAnnualDuration()`**: Valida que la duración acumulada anual no supere el máximo
- **`getPermisoUsageStats()`**: Obtiene estadísticas detalladas de uso de un permiso
- **`formatDuration()`**: Formatea duraciones en milisegundos a formato legible

### 2. Request Classes Actualizadas

#### `SolicitudPermisoStoreRequest`
- Añadidas validaciones de duración individual y acumulada
- Integración con el servicio de validación

#### `SolicitudPermisoUpdateRequest`  
- Completado con todas las validaciones necesarias
- Exclusión de la solicitud actual en validaciones de conflictos
- Manejo correcto de fechas y horas

### 3. Controlador Actualizado

#### `SolicitudPermisoController`
- Método `estadisticasUso()` para consultar estadísticas de uso de permisos

### 4. Nueva Ruta API

```php
GET /api/v1/user/solicitudes/estadisticas/{permisoId}/{año?}
```

## Cómo Funciona

### Validación de Duración Individual

Cuando se crea o actualiza una solicitud:

1. Se obtiene el permiso por su ID
2. Si el permiso tiene una duración definida (campo `duracion` no nulo)
3. Se calcula la duración de la solicitud en milisegundos
4. Se valida que no supere la duración máxima del permiso

### Validación de Duración Acumulada

1. Se buscan todas las solicitudes APROBADAS del empleado para ese permiso en el año
2. Se calcula la duración total ya utilizada
3. Se suma la duración de la nueva solicitud
4. Se valida que el total no supere el límite del permiso

### Estadísticas de Uso

La API permite consultar:
- Duración máxima permitida
- Duración ya utilizada
- Duración restante
- Porcentaje utilizado
- Número de solicitudes aprobadas

## Ejemplos de Uso

### Consultar Estadísticas

```http
GET /api/v1/user/solicitudes/estadisticas/5/2024
```

Respuesta:
```json
{
  "estadisticas": {
    "permiso_nombre": "Vacaciones anuales",
    "duracion_maxima": 1296000000,
    "duracion_utilizada": 432000000,
    "duracion_restante": 864000000,
    "porcentaje_utilizado": 33.33,
    "solicitudes_aprobadas": 2,
    "año": 2024
  }
}
```

### Crear Solicitud con Validación

Al crear una solicitud que supere los límites, se recibirán errores específicos:

```json
{
  "errors": {
    "fecha_fin": [
      "La duración solicitada excede el máximo permitido para este tipo de permiso (15 día(s))."
    ]
  }
}
```

O para límites anuales:

```json
{
  "errors": {
    "fecha_fin": [
      "Esta solicitud excede el tiempo disponible para este permiso en el año 2024. Duración restante: 10 día(s) de 15 día(s) total."
    ]
  }
}
```

## Consideraciones Técnicas

### Formato de Duración

Las duraciones se almacenan en milisegundos en la base de datos y se formatean automáticamente para mostrar:
- Días y horas
- Solo horas y minutos
- Solo minutos
- Solo segundos

### Rendimiento

- Las consultas están optimizadas para obtener solo las solicitudes necesarias
- Se utilizan índices en `empleado_id`, `permiso_id`, `estado_id` y `fecha_inicio`
- Las validaciones se ejecutan solo cuando no hay errores previos

### Manejo de Errores

- Validaciones integradas en el ciclo de vida de Laravel
- Mensajes de error descriptivos y localizados
- Manejo de casos edge (permisos sin duración definida)

## Configuración de Base de Datos

Los permisos deben tener configurado el campo `duracion` en milisegundos:

| Duración | Milisegundos | Ejemplo |
|----------|--------------|---------|
| 1 día    | 86400000     | Permiso médico |
| 15 días  | 1296000000   | Vacaciones anuales |
| 16 semanas | 9676800000 | Baja por maternidad |

### Permisos Sin Límite

Si un permiso no tiene límite de duración, se debe establecer el campo `duracion` como `NULL` en la base de datos.

# Sistema de Errores Mejorado para Importaciones

## Resumen de Cambios

Se ha actualizado el sistema de importación para proporcionar **errores específicos por campo** que permiten al frontend resaltar las celdas problemáticas y mostrar mensajes de error detallados.

## Formato de Errores Estándar

Todos los servicios de importación ahora deben devolver errores en el siguiente formato:

```php
return [
    'data' => $processedData,
    'errors' => [
        'messages' => $errors,      // Array de mensajes de error
        'fields' => $fieldErrors    // Array de campos que tienen errores
    ]
];
```

## Servicios Actualizados

### ✅ BaseImportService
- **Método**: `processImportGeneric()`
- **Cambios**: Ya estaba preparado para el formato con `$processedResult['errors']['messages']`
- **Estado**: Funciona correctamente con el nuevo formato

### ✅ CentroImportService
- **Método**: `processRecord()`
- **Cambios**: 
  - Agregado array `$fieldErrors` para rastrear campos específicos
  - Cada validación que falla agrega el campo a `$fieldErrors`
  - Devuelve `array_unique($fieldErrors)` para eliminar duplicados
- **Ejemplo actualizado**: Usa empleados reales ("Cristina Delacrúz Ibáñez", "Verónica Barajas Camacho")

### ✅ EmpresaImportService
- **Método**: `processRecord()`
- **Cambios**: 
  - Agregado array `$fieldErrors` para rastrear campos específicos
  - Cada validación que falla agrega el campo a `$fieldErrors`
  - Devuelve `array_unique($fieldErrors)` para eliminar duplicados
- **Ejemplo actualizado**: Usa empleados reales ("Cristina Delacrúz Ibáñez", "Verónica Barajas Camacho")

## Cómo Implementar en Nuevos Servicios

### 1. Estructura del Método processRecord()

```php
protected function processRecord(array $data): array
{
    $errors = [];
    $fieldErrors = [];
    $processedData = [];

    try {
        // Validar cada campo
        $campo = $this->normalizeText($data['campo'] ?? null);
        if (empty($campo)) {
            $errors[] = 'El campo es obligatorio';
            $fieldErrors[] = 'campo';  // ← Agregar campo a la lista de errores
        } else {
            $processedData['campo'] = $campo;
        }

        // Más validaciones...

        return [
            'data' => $processedData,
            'errors' => [
                'messages' => $errors,
                'fields' => array_unique($fieldErrors) // Eliminar duplicados
            ]
        ];
        
    } catch (\Exception $e) {
        return [
            'data' => [],
            'errors' => [
                'messages' => ['Error inesperado: ' . $e->getMessage()],
                'fields' => []
            ]
        ];
    }
}
```

### 2. Patrones de Validación

#### Campo Obligatorio
```php
if (empty($valor)) {
    $errors[] = 'El campo es obligatorio';
    $fieldErrors[] = 'nombre_campo';
}
```

#### Validación con Búsqueda en BD
```php
try {
    $relacion = Modelo::where('campo', $valor)->first();
    if (!$relacion) {
        $errors[] = "No se encontró registro con '$valor'";
        $fieldErrors[] = 'nombre_campo';
    } else {
        $processedData['relacion_id'] = $relacion->id;
    }
} catch (\Exception $e) {
    $errors[] = "Error al buscar '$valor': " . $e->getMessage();
    $fieldErrors[] = 'nombre_campo';
}
```

## Beneficios del Sistema

### 1. **Errores Específicos por Campo**
- El frontend puede resaltar celdas específicas en rojo
- Los usuarios saben exactamente qué campos corregir

### 2. **Mensajes Detallados**
- Cada error incluye información específica sobre qué salió mal
- Nombres de empleados, CIFs, etc. se incluyen en los mensajes

### 3. **Consistencia**
- Todos los servicios usan el mismo formato
- Fácil mantenimiento y extensión

### 4. **Compatibilidad**
- El `BaseImportService` ya maneja el formato correctamente
- No se requieren cambios en el frontend (ya espera este formato)

## Próximos Pasos

### Servicios Pendientes de Actualización
- [ ] **DepartamentoImportService** - Actualizar formato de errores
- [ ] **ContratoImportService** - Actualizar formato de errores
- [ ] **AsignacionImportService** - Actualizar formato de errores
- [ ] **UsuarioImportService** - Actualizar formato de errores

### Patrón para Actualizaciones
1. Agregar `$fieldErrors = []` al inicio del método
2. En cada validación que falla, agregar `$fieldErrors[] = 'campo'`
3. Devolver `array_unique($fieldErrors)` en la respuesta
4. Actualizar ejemplos con datos reales de la BD

## Datos de Ejemplo Actualizados

### Empleados Reales Disponibles
- **Cristina Delacrúz Ibáñez** (ID: 1)
- **Verónica Barajas Camacho** (ID: 2)
- **Daniel Olivas Sáenz** (ID: 3)
- **Alexia Ledesma Manzanares** (ID: 4)

### Empresas Reales Disponibles
- **Empresa** (CIF: A12345678)
- **Empresa 2** (CIF: A13546782)

### Estados de Centro Disponibles
- **Activo** (ID: 1)
- **Cerrado temporalmente** (ID: 2)
- **Cerrado permanentemente** (ID: 3)

---

## Resultado Final

Con estos cambios, el sistema de importación ahora:
- ✅ Muestra errores específicos por campo
- ✅ Resalta las celdas problemáticas en rojo
- ✅ Proporciona mensajes de error detallados
- ✅ Usa datos de ejemplo reales
- ✅ Mantiene consistencia entre todos los servicios

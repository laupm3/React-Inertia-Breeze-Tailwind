# API de Creación Masiva de Horarios - Documentación Técnica

## Descripción General
Esta documentación describe la implementación de la funcionalidad de creación masiva de horarios (`bulk-store`) en el sistema, que permite crear múltiples horarios en una sola operación con validación avanzada de fechas y asignación automática a contratos y anexos.

## 🚀 Características Principales

### **1. Validación Avanzada de Fechas**
- **Contratos y Anexos**: Valida que las fechas del horario estén dentro del rango del contrato o sus anexos
- **Fecha Inicio Obligatoria**: Todos los contratos/anexos tienen `fecha_inicio` obligatorio
- **Fecha Fin Opcional**: `fecha_fin` null indica duración indefinida
- **Validación Inteligente**: Una sola query para validar múltiples contratos con sus anexos

### **2. Asignación Automática Contrato/Anexo**
- **Prioridad a Anexos**: Si las fechas coinciden con un anexo, se asigna al anexo
- **Fallback a Contrato**: Si no coincide con anexos, se asigna al contrato principal
- **Lógica Determinística**: Algoritmo claro para determinar la asignación correcta

### **3. Transacciones y Consistencia**
- **Operación Atómica**: Todos los horarios se crean en una transacción única
- **Rollback Automático**: Si falla la creación de cualquier horario, se revierte todo
- **Manejo de Errores**: Respuestas detalladas sobre errores específicos

### **4. Performance Optimizada**
- **Eager Loading**: Carga contratos con anexos en una sola query
- **Cache de Validación**: Datos validados se reutilizan sin queries adicionales
- **Bulk Operations**: Creación eficiente de múltiples registros

## 📋 Endpoints

### **POST** `/api/v1/admin/horarios/bulk-store`
Crea múltiples horarios en una sola operación transaccional con validación avanzada.

#### Request Body
```json
{
  "horarios": [
    {
      "contrato_id": 1,
      "modalidad_id": 2,
      "estado_horario_id": 1,
      "turno_id": 3,
      "horario_inicio": "2025-06-20 08:00:00",
      "horario_fin": "2025-06-20 16:00:00",
      "descanso_inicio": "2025-06-20 12:00:00",
      "descanso_fin": "2025-06-20 13:00:00",
      "observaciones": "Horario de mañana"
    },
    {
      "contrato_id": 1,
      "modalidad_id": 2,
      "estado_horario_id": 1,
      "turno_id": 4,
      "horario_inicio": "2025-06-21 16:00:00",
      "horario_fin": "2025-06-22 00:00:00",
      "observaciones": "Horario de tarde"
    }
  ]
}
```

#### Headers Requeridos
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Permisos Requeridos
- `createSchedule` (web guard)

## 📖 Campos del Request

### Campos Obligatorios por Horario
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `contrato_id` | integer | ID del contrato al que pertenece el horario |
| `modalidad_id` | integer | ID de la modalidad de trabajo |
| `estado_horario_id` | integer | ID del estado del horario (ej: pendiente, aprobado) |
| `turno_id` | integer | ID del turno de trabajo |
| `horario_inicio` | datetime | Fecha y hora de inicio del horario |
| `horario_fin` | datetime | Fecha y hora de fin del horario |

### Campos Opcionales por Horario
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `descanso_inicio` | datetime | Fecha y hora de inicio del descanso |
| `descanso_fin` | datetime | Fecha y hora de fin del descanso |
| `observaciones` | string(255) | Notas adicionales sobre el horario |

## 🔍 Validaciones Implementadas

### **1. Validaciones Básicas**
```php
// Estructura del array
'horarios' => 'required|array|min:1'

// Por cada horario
'horarios.*.contrato_id' => 'required|integer'
'horarios.*.modalidad_id' => 'required|integer|exists:modalidades,id'
'horarios.*.estado_horario_id' => 'required|integer|exists:estado_horarios,id'
'horarios.*.turno_id' => 'required|integer|exists:turnos,id'
'horarios.*.horario_inicio' => 'required|date'
'horarios.*.horario_fin' => 'required|date|after:horarios.*.horario_inicio'
```

### **2. Validaciones de Fechas Avanzadas**
```php
// Descansos dentro del horario de trabajo
'horarios.*.descanso_inicio' => 'nullable|date|after:horarios.*.horario_inicio|before:horarios.*.horario_fin'
'horarios.*.descanso_fin' => 'nullable|date|after:horarios.*.descanso_inicio|before:horarios.*.horario_fin'
```

### **3. Validaciones Customizadas**
- **Existencia de Contratos**: Verifica que todos los `contrato_id` existan
- **Fechas dentro del Rango**: Valida que el horario esté dentro del periodo del contrato o sus anexos
- **Consistency Check**: Asegura que las fechas de inicio y fin sean lógicas

## 🎯 Lógica de Asignación Contrato/Anexo

### **Algoritmo de Decisión**
```
1. ¿Las fechas del horario están dentro de algún anexo del contrato?
   → SÍ: Asignar al anexo (anexo_id = anexo.id)
   → NO: Continuar

2. ¿Las fechas del horario están dentro del contrato principal?
   → SÍ: Asignar al contrato (anexo_id = null)
   → NO: Error (no debería pasar por validación previa)
```

### **Reglas de Validación de Fechas**
```php
// Para contratos y anexos
$entityInicio = Carbon::parse($entity->fecha_inicio); // Obligatorio
$entityFin = $entity->fecha_fin ? Carbon::parse($entity->fecha_fin) : null; // Opcional

// Validación
$startValid = $horarioInicio->gte($entityInicio);
$endValid = !$entityFin || $horarioFin->lte($entityFin);
$isValid = $startValid && $endValid;
```

## 📤 Respuestas de la API

### **✅ Respuesta Exitosa (201 Created)**
```json
{
  "horarios": [
    {
      "id": 123,
      "contrato_id": 1,
      "anexo_id": null,
      "modalidad": {
        "id": 2,
        "nombre": "Presencial"
      },
      "estadoHorario": {
        "id": 1,
        "nombre": "Pendiente"
      },
      "turno": {
        "id": 3,
        "nombre": "Mañana"
      },
      "horario_inicio": "2025-06-20T08:00:00.000000Z",
      "horario_fin": "2025-06-20T16:00:00.000000Z",
      "descanso_inicio": "2025-06-20T12:00:00.000000Z",
      "descanso_fin": "2025-06-20T13:00:00.000000Z",
      "observaciones": "Horario de mañana",
      "created_at": "2025-06-18T10:30:00.000000Z",
      "updated_at": "2025-06-18T10:30:00.000000Z"
    },
    {
      "id": 124,
      "contrato_id": 1,
      "anexo_id": 5,
      "modalidad": {
        "id": 2,
        "nombre": "Presencial"
      },
      "estadoHorario": {
        "id": 1,
        "nombre": "Pendiente"
      },
      "turno": {
        "id": 4,
        "nombre": "Tarde"
      },
      "horario_inicio": "2025-06-21T16:00:00.000000Z",
      "horario_fin": "2025-06-22T00:00:00.000000Z",
      "descanso_inicio": null,
      "descanso_fin": null,
      "observaciones": "Horario de tarde",
      "created_at": "2025-06-18T10:30:00.000000Z",
      "updated_at": "2025-06-18T10:30:00.000000Z"
    }
  ],
  "message": "Horarios creados correctamente.",
  "created_count": 2
}
```

### **❌ Error de Validación (422 Unprocessable Entity)**
```json
{
  "message": "Las fechas del horario deben estar dentro del periodo de duración del contrato o alguno de sus anexos. (and 1 more error)",
  "errors": {
    "horarios.0.contrato_id": [
      "El contrato especificado no existe."
    ],
    "horarios.1.horario_inicio": [
      "Las fechas del horario deben estar dentro del periodo de duración del contrato o alguno de sus anexos."
    ],
    "horarios.1.horario_fin": [
      "La hora de fin debe ser posterior a la hora de inicio."
    ]
  }
}
```

### **❌ Error de Autenticación (401 Unauthorized)**
```json
{
  "message": "Unauthenticated."
}
```

### **❌ Error de Permisos (403 Forbidden)**
```json
{
  "message": "This action is unauthorized."
}
```

## 🧪 Casos de Uso de Ejemplo

### **Caso 1: Horarios en Contrato Principal**
```json
{
  "horarios": [
    {
      "contrato_id": 1,
      "modalidad_id": 1,
      "estado_horario_id": 1,
      "turno_id": 1,
      "horario_inicio": "2025-07-01 09:00:00",
      "horario_fin": "2025-07-01 17:00:00"
    }
  ]
}
```
**Resultado**: Se asigna al contrato principal (`anexo_id: null`)

### **Caso 2: Horarios en Anexo Específico**
```json
{
  "horarios": [
    {
      "contrato_id": 1,
      "modalidad_id": 2,
      "estado_horario_id": 1,
      "turno_id": 2,
      "horario_inicio": "2025-08-15 14:00:00",
      "horario_fin": "2025-08-15 22:00:00"
    }
  ]
}
```
**Condición**: El contrato tiene un anexo vigente del 2025-08-01 al 2025-08-31
**Resultado**: Se asigna al anexo (`anexo_id: 5`)

### **Caso 3: Error de Fechas Fuera de Rango**
```json
{
  "horarios": [
    {
      "contrato_id": 1,
      "modalidad_id": 1,
      "estado_horario_id": 1,
      "turno_id": 1,
      "horario_inicio": "2030-01-01 09:00:00",
      "horario_fin": "2030-01-01 17:00:00"
    }
  ]
}
```
**Resultado**: Error 422 - Fechas fuera del rango del contrato y anexos

## ⚡ Optimizaciones de Performance

### **1. Queries Optimizadas**
```php
// Una sola query para todos los contratos con anexos
$contratos = Contrato::with('anexos')
    ->whereIn('id', $contratoIds)
    ->get()
    ->keyBy('id');
```

### **2. Cache de Validación**
```php
// Los contratos validados se cachean para reutilización
private $validatedContratos = null;

public function getValidatedContratos() {
    return $this->validatedContratos; // Sin queries adicionales
}
```

### **3. Transacciones Eficientes**
```php
return DB::transaction(function () use ($request) {
    // Toda la lógica dentro de una transacción
    // Rollback automático si cualquier operación falla
});
```

## 🔧 Consideraciones Técnicas

### **Middleware de Seguridad**
- `auth:sanctum` - Autenticación requerida
- `check.banned` - Usuario no puede estar baneado
- `jetstream.auth_session` - Sesión válida
- `verified` - Email verificado

### **Límites y Restricciones**
- **Array mínimo**: 1 horario por request
- **Observaciones**: Máximo 255 caracteres
- **Fechas**: Formato ISO 8601 (Y-m-d H:i:s)
- **Transacción**: Operación todo-o-nada

### **Manejo de Errores**
- **Validación**: Errores específicos por campo y índice
- **Base de Datos**: Rollback automático en transacciones
- **Autorización**: Respuestas claras de permisos
- **Consistencia**: Verificación de integridad de datos

## 📚 Referencias Relacionadas

- [API de Actualización Masiva de Horarios](./API_HorarioUpdate_Optimized.md)
- [API de Eliminación Masiva de Horarios](./API_HorarioDelete_Optimized.md)
- [Documentación de Contratos y Anexos](../Contratos/)
- [Sistema de Permisos](../Auth/Permissions.md)

---

**Versión**: 1.0  
**Fecha**: Junio 2025  
**Autor**: Sistema de Gestión de Horarios

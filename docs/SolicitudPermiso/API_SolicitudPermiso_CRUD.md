# API de Solicitudes de Permisos - Documentación Técnica

## 📋 **Descripción General**

Esta API proporciona endpoints para gestionar solicitudes de permisos laborales con sistema de aprobaciones múltiples, manejo de archivos polimórficos y estados automáticos.

## 🚀 **Características Principales**

### **Sistema de Aprobaciones**
- ✅ **3 Tipos de Aprobación**: Manager, HR, Direction
- ✅ **Sin Jerarquía**: Todas las aprobaciones son requeridas
- ✅ **Permisos Específicos**: Cada tipo requiere permiso diferente
- ✅ **Estados Automáticos**: Cambios basados en aprobaciones

### **Archivos Adjuntos**
- ✅ **Relación Polimórfica**: Archivos asociados a solicitudes
- ✅ **Validación Robusta**: Tipos, tamaños y cantidad limitados
- ✅ **FileSystemService**: Integración con servicio de archivos existente

### **Optimizaciones**
- ✅ **DB::Transaction**: Consistencia en operaciones complejas
- ✅ **Eager Loading**: Relaciones cargadas eficientemente
- ✅ **Request Validation**: Validación centralizada y robusta

---

## 📋 **Endpoints Disponibles**

### **CRUD Principal**
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| GET | `/api/v1/admin/solicitud-permisos` | Listar solicitudes | `viewWorkPermits` |
| POST | `/api/v1/admin/solicitud-permisos` | Crear solicitud | `createWorkPermits` |
| GET | `/api/v1/admin/solicitud-permisos/{id}` | Mostrar solicitud | `viewWorkPermits` |
| PUT | `/api/v1/admin/solicitud-permisos/{id}` | Actualizar solicitud | `editWorkPermits` |
| DELETE | `/api/v1/admin/solicitud-permisos/{id}` | Eliminar solicitud | `deleteWorkPermits` |

### **Endpoints de Aprobación**
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/api/v1/admin/solicitud-permisos/{id}/process-approval` | Procesar aprobación/rechazo | Según tipo* |
| GET | `/api/v1/admin/solicitud-permisos/{id}/approval-status` | Estado de aprobaciones | `viewWorkPermits` |

**Permisos por tipo de aprobación:**
- `manager`: `canManageManagerWorkPermitRequests`
- `hr`: `canManageHrWorkPermitRequests`
- `direction`: `canManageDirectionWorkPermitRequests`

---

## 📤 **Documentación de Endpoints**

### **1. Listar Solicitudes**

#### **GET** `/api/v1/admin/solicitud-permisos`

**Query Parameters:**
```
?estado_id=1&empleado_id=5&per_page=20&page=1
```

**Response (200 OK):**
```json
{
  "solicitudes": [
    {
      "id": 1,
      "empleado": {
        "id": 5,
        "nombre_completo": "Juan Pérez",
        "email": "juan.perez@empresa.com"
      },
      "permiso": {
        "id": 2,
        "nombre": "Vacaciones",
        "descripcion": "Días de vacaciones anuales"
      },
      "estado": {
        "id": 1,
        "nombre": "Pendiente",
        "color": "#FFA500"
      },
      "fecha_inicio": "2025-07-01",
      "fecha_fin": "2025-07-05",
      "motivo": "Vacaciones familiares",
      "observaciones": null,
      "aprobaciones": [],
      "files": [],
      "metadata": {
        "can_be_edited": true,
        "is_fully_approved": false,
        "has_rejections": false
      },
      "created_at": "2025-06-18T10:00:00.000000Z",
      "updated_at": "2025-06-18T10:00:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 45,
    "per_page": 15
  }
}
```

---

### **2. Crear Solicitud**

#### **POST** `/api/v1/admin/solicitud-permisos`

**Request Body:**
```json
{
  "empleado_id": 5,
  "permiso_id": 2,
  "fecha_inicio": "2025-07-01",
  "fecha_fin": "2025-07-05",
  "motivo": "Vacaciones familiares",
  "observaciones": "Vacaciones previamente planificadas",
  "files": ["file1.pdf", "file2.jpg"]
}
```

**Response (201 Created):**
```json
{
  "solicitud": {
    "id": 1,
    "empleado": {
      "id": 5,
      "nombre_completo": "Juan Pérez",
      "email": "juan.perez@empresa.com"
    },
    "permiso": {
      "id": 2,
      "nombre": "Vacaciones",
      "descripcion": "Días de vacaciones anuales"
    },
    "estado": {
      "id": 1,
      "nombre": "Pendiente",
      "color": "#FFA500"
    },
    "fecha_inicio": "2025-07-01",
    "fecha_fin": "2025-07-05",
    "motivo": "Vacaciones familiares",
    "observaciones": "Vacaciones previamente planificadas",
    "aprobaciones": [],
    "files": [
      {
        "id": 1,
        "nombre": "file1.pdf",
        "extension": "pdf",
        "size": 1024000,
        "url": "/storage/files/solicitud-permisos/1/file1.pdf"
      }
    ],
    "metadata": {
      "can_be_edited": true,
      "is_fully_approved": false,
      "has_rejections": false
    },
    "created_at": "2025-06-18T10:00:00.000000Z",
    "updated_at": "2025-06-18T10:00:00.000000Z"
  },
  "message": "Solicitud de permiso creada correctamente."
}
```

**Errores de Validación (422 Unprocessable Entity):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "empleado_id": ["El empleado especificado no existe."],
    "fecha_fin": ["La fecha de fin debe ser posterior o igual a la fecha de inicio."],
    "files.0": ["Solo se permiten archivos PDF, DOC, DOCX, JPG, JPEG, PNG."],
    "files": ["No puede adjuntar más de 10 archivos."]
  }
}
```

---

### **3. Mostrar Solicitud**

#### **GET** `/api/v1/admin/solicitud-permisos/{id}`

**Response (200 OK):**
```json
{
  "solicitud": {
    "id": 1,
    "empleado": {
      "id": 5,
      "nombre_completo": "Juan Pérez",
      "email": "juan.perez@empresa.com"
    },
    "permiso": {
      "id": 2,
      "nombre": "Vacaciones",
      "descripcion": "Días de vacaciones anuales"
    },
    "estado": {
      "id": 2,
      "nombre": "En Revisión",
      "color": "#3B82F6"
    },
    "fecha_inicio": "2025-07-01",
    "fecha_fin": "2025-07-05",
    "motivo": "Vacaciones familiares",
    "observaciones": "Vacaciones previamente planificadas",
    "aprobaciones": [
      {
        "id": 1,
        "tipo_aprobacion": "manager",
        "aprobado": true,
        "observacion": "Aprobado por manager",
        "approved_by": {
          "id": 10,
          "nombre_completo": "María García",
          "email": "maria.garcia@empresa.com"
        },
        "created_at": "2025-06-18T11:00:00.000000Z"
      }
    ],
    "files": [
      {
        "id": 1,
        "nombre": "documentos-vacaciones.pdf",
        "extension": "pdf",
        "size": 1024000,
        "url": "/storage/files/solicitud-permisos/1/documentos-vacaciones.pdf"
      }
    ],
    "metadata": {
      "can_be_edited": false,
      "is_fully_approved": false,
      "has_rejections": false
    },
    "created_at": "2025-06-18T10:00:00.000000Z",
    "updated_at": "2025-06-18T11:00:00.000000Z"
  },
  "can_edit": false,
  "user_approval_types": ["hr", "direction"]
}
```

---

### **4. Actualizar Solicitud**

#### **PUT** `/api/v1/admin/solicitud-permisos/{id}`

**Request Body:**
```json
{
  "fecha_inicio": "2025-07-02",
  "fecha_fin": "2025-07-06",
  "motivo": "Vacaciones familiares - fechas actualizadas",
  "observaciones": "Cambio de fechas por disponibilidad familiar",
  "files": ["nuevo-archivo.pdf"],
  "files_to_delete": [1]
}
```

**Response (200 OK):**
```json
{
  "solicitud": {
    "id": 1,
    "fecha_inicio": "2025-07-02",
    "fecha_fin": "2025-07-06",
    "motivo": "Vacaciones familiares - fechas actualizadas",
    "observaciones": "Cambio de fechas por disponibilidad familiar",
    "files": [
      {
        "id": 2,
        "nombre": "nuevo-archivo.pdf",
        "extension": "pdf",
        "size": 2048000,
        "url": "/storage/files/solicitud-permisos/1/nuevo-archivo.pdf"
      }
    ]
  },
  "message": "Solicitud de permiso actualizada correctamente."
}
```

**Error - No se puede editar (403 Forbidden):**
```json
{
  "message": "Esta solicitud ya no puede ser editada."
}
```

---

### **5. Eliminar Solicitud**

#### **DELETE** `/api/v1/admin/solicitud-permisos/{id}`

**Response (200 OK):**
```json
{
  "message": "Solicitud de permiso eliminada correctamente."
}
```

---

### **6. Procesar Aprobación**

#### **POST** `/api/v1/admin/solicitud-permisos/{id}/process-approval`

**Request Body:**
```json
{
  "tipo_aprobacion": "hr",
  "aprobado": true,
  "observacion": "Documentación correcta, aprobado por HR"
}
```

**Response (200 OK) - Aprobación:**
```json
{
  "solicitud": {
    "id": 1,
    "estado": {
      "id": 2,
      "nombre": "En Revisión",
      "color": "#3B82F6"
    },
    "aprobaciones": [
      {
        "id": 1,
        "tipo_aprobacion": "manager",
        "aprobado": true,
        "observacion": "Aprobado por manager",
        "approved_by": {
          "id": 10,
          "nombre_completo": "María García"
        }
      },
      {
        "id": 2,
        "tipo_aprobacion": "hr",
        "aprobado": true,
        "observacion": "Documentación correcta, aprobado por HR",
        "approved_by": {
          "id": 15,
          "nombre_completo": "Carlos López"
        }
      }
    ]
  },
  "approval": {
    "id": 2,
    "tipo_aprobacion": "hr",
    "aprobado": true,
    "observacion": "Documentación correcta, aprobado por HR"
  },
  "message": "Solicitud aprobada correctamente."
}
```

**Request Body - Rechazo:**
```json
{
  "tipo_aprobacion": "direction",
  "aprobado": false,
  "observacion": "Período solicitado coincide con cierre de proyecto crítico"
}
```

**Response (200 OK) - Rechazo:**
```json
{
  "solicitud": {
    "id": 1,
    "estado": {
      "id": 4,
      "nombre": "Rechazado",
      "color": "#EF4444"
    },
    "aprobaciones": [
      {
        "id": 3,
        "tipo_aprobacion": "direction",
        "aprobado": false,
        "observacion": "Período solicitado coincide con cierre de proyecto crítico"
      }
    ]
  },
  "message": "Solicitud rechazada."
}
```

**Errores de Validación (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "tipo_aprobacion": ["Ya existe una aprobación de este tipo para esta solicitud."],
    "observacion": ["La observación no puede exceder 1000 caracteres."]
  }
}
```

**Error de Permisos (403):**
```json
{
  "message": "No tiene permisos para aprobar con este tipo de aprobación."
}
```

---

### **7. Estado de Aprobaciones**

#### **GET** `/api/v1/admin/solicitud-permisos/{id}/approval-status`

**Response (200 OK):**
```json
{
  "is_fully_approved": false,
  "has_rejections": false,
  "can_be_edited": false,
  "user_approval_types": ["hr", "direction"],
  "existing_approvals": ["manager"],
  "pending_approvals": ["hr", "direction"],
  "approval_summary": {
    "total_required": 3,
    "completed": 1,
    "pending": 2,
    "percentage": 33.33
  }
}
```

---

## 🔒 **Autenticación y Autorización**

### **Headers Requeridos**
```http
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### **Middleware Aplicado**
- `auth:sanctum` - Autenticación requerida
- `check.banned` - Usuario no baneado
- `jetstream.auth_session` - Sesión válida
- `verified` - Email verificado

### **Permisos por Endpoint**

| Acción | Permiso Base | Permisos Adicionales |
|--------|--------------|---------------------|
| Listar | `viewSolicitudPermiso` | - |
| Crear | `createSolicitudPermiso` | - |
| Mostrar | `viewSolicitudPermiso` | - |
| Actualizar | `editSolicitudPermiso` | Solo creador o admin |
| Eliminar | `deleteSolicitudPermiso` | Solo creador o admin |
| Aprobar Manager | - | `canManageManagerWorkPermitRequests` |
| Aprobar HR | - | `canManageHrWorkPermitRequests` |
| Aprobar Direction | - | `canManageDirectionWorkPermitRequests` |

---

## 📁 **Manejo de Archivos**

### **Upload de Archivos**

**Validaciones:**
- **Tipos permitidos**: `pdf`, `doc`, `docx`, `jpg`, `jpeg`, `png`
- **Tamaño máximo**: 10MB por archivo
- **Cantidad máxima**: 10 archivos por solicitud
- **Tamaño total**: 100MB por solicitud

**Procesamiento:**
```json
{
  "files": [
    {
      "original_name": "documento.pdf",
      "mime_type": "application/pdf",
      "size": 1024000
    }
  ]
}
```

**Storage:**
- **Ruta**: `/storage/files/solicitud-permisos/{solicitud_id}/`
- **Nomenclatura**: `{timestamp}_{random}_{original_name}`
- **Servicio**: `FileSystemService`

### **Eliminación de Archivos**

**En actualización:**
```json
{
  "files_to_delete": [1, 2, 3]
}
```

**En eliminación de solicitud:**
- Automática al eliminar solicitud
- Cascada por relación polimórfica

---

## ⚠️ **Códigos de Error**

### **400 Bad Request**
```json
{
  "message": "Solicitud malformada",
  "error": "JSON inválido o estructura incorrecta"
}
```

### **401 Unauthorized**
```json
{
  "message": "Unauthenticated."
}
```

### **403 Forbidden**
```json
{
  "message": "No tiene permisos para realizar esta acción."
}
```

### **404 Not Found**
```json
{
  "message": "Solicitud de permiso no encontrada."
}
```

### **422 Unprocessable Entity**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "campo": ["Mensaje de error específico"]
  }
}
```

### **500 Internal Server Error**
```json
{
  "message": "Error interno del servidor.",
  "error": "Descripción del error (solo en modo debug)"
}
```

---

## 🔄 **Estados de Transición**

### **Flujo Normal**
```
PENDIENTE → EN_REVISION → APROBADO
```

### **Flujo con Rechazo**
```
PENDIENTE → RECHAZADO
EN_REVISION → RECHAZADO
```

### **Transiciones Válidas**

| Estado Actual | Estados Posibles | Trigger |
|---------------|------------------|---------|
| PENDIENTE | EN_REVISION, RECHAZADO | Primera aprobación/rechazo |
| EN_REVISION | APROBADO, RECHAZADO | Completar aprobaciones/rechazo |
| APROBADO | - | Estado final |
| RECHAZADO | - | Estado final |

---

## 📊 **Ejemplos de Uso**

### **Caso 1: Flujo Completo de Aprobación**

```bash
# 1. Crear solicitud
POST /api/v1/admin/solicitud-permisos
{
  "empleado_id": 5,
  "permiso_id": 2,
  "fecha_inicio": "2025-07-01",
  "fecha_fin": "2025-07-05",
  "motivo": "Vacaciones familiares"
}

# 2. Aprobación Manager
POST /api/v1/admin/solicitud-permisos/1/process-approval
{
  "tipo_aprobacion": "manager",
  "aprobado": true,
  "observacion": "Aprobado por manager"
}

# 3. Aprobación HR
POST /api/v1/admin/solicitud-permisos/1/process-approval
{
  "tipo_aprobacion": "hr",
  "aprobado": true,
  "observacion": "Documentación correcta"
}

# 4. Aprobación Direction
POST /api/v1/admin/solicitud-permisos/1/process-approval
{
  "tipo_aprobacion": "direction",
  "aprobado": true,
  "observacion": "Aprobado por dirección"
}

# Estado final: APROBADO
```

### **Caso 2: Flujo con Rechazo**

```bash
# 1. Crear solicitud
POST /api/v1/admin/solicitud-permisos
# ... datos ...

# 2. Rechazo inmediato
POST /api/v1/admin/solicitud-permisos/1/process-approval
{
  "tipo_aprobacion": "hr",
  "aprobado": false,
  "observacion": "Documentación insuficiente"
}

# Estado final: RECHAZADO
```

---

## 📚 **Referencias Relacionadas**

- [Plan de Desarrollo](./Development_Plan.md)
- [Reglas de Negocio](./Business_Rules.md)
- [Documentación FileSystemService](../Storage/FileSystemService.md)
- [Sistema de Permisos Spatie](../Auth/Permissions.md)

---

**Versión**: 1.0  
**Fecha**: Junio 2025  
**Autor**: Sistema de Gestión de Solicitudes de Permisos

# Reglas de Negocio: Sistema de Solicitudes de Permisos

## 📋 **Resumen del Sistema**

El sistema de solicitudes de permisos permite a los empleados solicitar permisos laborales que requieren aprobaciones múltiples antes de ser concedidos. El sistema implementa un flujo de aprobaciones sin jerarquía donde todas las aprobaciones son requeridas.

---

## 🎯 **Actores del Sistema**

### **Empleado Solicitante**
- **Puede**: Crear, editar (limitado), ver sus solicitudes
- **No puede**: Aprobar sus propias solicitudes, ver solicitudes de otros

### **Manager** 
- **Permiso**: `canManageManagerWorkPermitRequests`
- **Puede**: Aprobar/rechazar con tipo "manager"
- **Tipo de aprobación**: `manager`

### **HR (Recursos Humanos)**
- **Permiso**: `canManageHrWorkPermitRequests`  
- **Puede**: Aprobar/rechazar con tipo "hr"
- **Tipo de aprobación**: `hr`

### **Dirección**
- **Permiso**: `canManageDirectionWorkPermitRequests`
- **Puede**: Aprobar/rechazar con tipo "direction"  
- **Tipo de aprobación**: `direction`

### **Administrador/SuperUser**
- **Permisos**: Todos los permisos de aprobación + CRUD completo
- **Puede**: Realizar cualquier acción en el sistema

---

## 🔄 **Estados de la Solicitud**

### **PENDIENTE** (Estado inicial)
- **Condición**: Solicitud creada sin aprobaciones
- **Acciones permitidas**: 
  - ✅ Editar solicitud
  - ✅ Eliminar solicitud
  - ✅ Aprobar/rechazar (usuarios con permisos)

### **EN_REVISION** (Aprobaciones parciales)
- **Condición**: Al menos una aprobación, pero no todas
- **Acciones permitidas**:
  - ❌ Editar solicitud (bloqueada)
  - ❌ Eliminar solicitud (bloqueada)
  - ✅ Aprobar/rechazar tipos faltantes

### **APROBADO** (Aprobación completa)
- **Condición**: Todas las aprobaciones requeridas (manager + hr + direction)
- **Acciones permitidas**:
  - ❌ Editar solicitud (bloqueada)
  - ❌ Eliminar solicitud (bloqueada)
  - ❌ Nuevas aprobaciones (bloqueada)

### **RECHAZADO** (Al menos un rechazo)
- **Condición**: Cualquier aprobación marcada como rechazada
- **Acciones permitidas**:
  - ❌ Editar solicitud (bloqueada)
  - ❌ Eliminar solicitud (bloqueada)
  - ❌ Nuevas aprobaciones (bloqueada)

---

## ⚖️ **Reglas de Aprobación**

### **R1: Unicidad por Tipo**
- **Regla**: Solo puede existir **UNA** aprobación por tipo por solicitud
- **Validación**: Al intentar crear aprobación, verificar que no existe otra del mismo tipo
- **Error**: "Ya existe una aprobación de este tipo para esta solicitud"

### **R2: Aprobaciones Requeridas**
- **Regla**: Se requieren **TODAS** las aprobaciones para estado APROBADO
- **Tipos requeridos**: `manager`, `hr`, `direction`
- **Sin jerarquía**: No importa el orden de aprobación

### **R3: Efecto del Rechazo**
- **Regla**: **UN SOLO** rechazo cambia estado a RECHAZADO
- **Comportamiento**: Inmediato al crear aprobación con `aprobado = false`
- **Irreversible**: No se puede cambiar después del rechazo

### **R4: Permisos de Aprobación**
- **Regla**: Usuario debe tener permiso específico para tipo de aprobación
- **Validación**: Verificar permiso antes de crear aprobación
- **Múltiples permisos**: Usuario puede tener varios tipos de aprobación

### **R5: Auto-aprobación Prohibida**
- **Regla**: Empleado NO puede aprobar su propia solicitud
- **Validación**: `empleado_id` de solicitud ≠ `user_id` del aprobador
- **Error**: "No puede aprobar su propia solicitud"

---

## 📄 **Reglas de Archivos**

### **F1: Límites de Upload**
- **Cantidad máxima**: 10 archivos por solicitud
- **Tamaño máximo**: 10MB por archivo
- **Tamaño total**: 100MB por solicitud

### **F2: Tipos Permitidos**
- **Documentos**: PDF, DOC, DOCX
- **Imágenes**: JPG, JPEG, PNG
- **Validación**: Verificar MIME type y extensión

### **F3: Nombres Únicos**
- **Regla**: Generar nombres únicos para evitar conflictos
- **Patrón**: `{timestamp}_{random}_{original_name}`
- **Preservar**: Extensión original

### **F4: Relación Polimórfica**
- **Implementación**: Usar `fileable_type` y `fileable_id`
- **Eliminación**: Cascada al eliminar solicitud
- **Storage**: Usar FileSystemService para operaciones

---

## ✏️ **Reglas de Edición**

### **E1: Ventana de Edición**
- **Permitida en**: Estados PENDIENTE únicamente
- **Bloqueada en**: EN_REVISION, APROBADO, RECHAZADO
- **Razón**: Mantener integridad de aprobaciones

### **E2: Campos Editables**
- **Siempre editables**: motivo, observaciones, archivos
- **Condicionalmente editables**: fechas (si no hay conflictos)
- **No editables**: empleado_id, created_at

### **E3: Validación de Fechas**
- **fecha_fin**: Debe ser >= fecha_inicio
- **fecha_inicio**: Debe ser >= today (para nuevas solicitudes)
- **Consistencia**: No crear conflictos con días ya aprobados

---

## 🔔 **Reglas de Notificación**

### **N1: Cambios de Estado**
- **Trigger**: Al cambiar estado de solicitud
- **Destinatarios**: Empleado solicitante + aprobadores relevantes
- **Contenido**: Estado nuevo, fecha, próximos pasos

### **N2: Aprobaciones**
- **Trigger**: Al crear nueva aprobación
- **Destinatarios**: Empleado + otros aprobadores pendientes
- **Contenido**: Tipo de aprobación, usuario aprobador, observaciones

### **N3: Recordatorios**
- **Trigger**: Solicitudes pendientes > 3 días
- **Destinatarios**: Aprobadores con permisos faltantes
- **Frecuencia**: Diaria hasta resolución

---

## 🔐 **Reglas de Seguridad**

### **S1: Autorización por Recurso**
- **Regla**: Verificar permisos específicos para cada acción
- **Implementación**: Usar policies y middleware
- **Granularidad**: Por método del controlador

### **S2: Validación de Entrada**
- **Regla**: Validar TODOS los inputs en Requests
- **XSS**: Escapar contenido HTML
- **SQL Injection**: Usar Eloquent ORM exclusivamente

### **S3: Auditoría**
- **Regla**: Registrar todas las acciones críticas
- **Incluir**: Usuario, acción, timestamp, IP, user-agent
- **Almacenar**: En logs estructurados para análisis

---

## 📊 **Reglas de Rendimiento**

### **P1: Consultas Optimizadas**
- **Eager Loading**: Cargar relaciones necesarias en una query
- **Paginación**: Limitar resultados en listados
- **Índices**: En campos de búsqueda frecuente

### **P2: Cache de Estados**
- **Implementar**: Cache de estados calculados
- **TTL**: 5 minutos para estados dinámicos
- **Invalidación**: Al cambiar aprobaciones

### **P3: Transacciones**
- **Regla**: Usar DB::transaction para operaciones complejas
- **Rollback**: Automático en caso de error
- **Consistencia**: Mantener integridad de datos

---

## 🧪 **Reglas de Testing**

### **T1: Cobertura Mínima**
- **Controladores**: 90% de cobertura
- **Servicios**: 95% de cobertura
- **Requests**: 100% de cobertura

### **T2: Casos de Prueba**
- **Happy Path**: Flujos normales de usuario
- **Edge Cases**: Límites y casos extremos
- **Error Handling**: Manejo de errores y excepciones

### **T3: Tests de Integración**
- **End-to-End**: Flujo completo de solicitud
- **API**: Validar responses y status codes
- **Database**: Verificar persistencia y consistencia

---

## 📈 **Métricas y Monitoreo**

### **M1: KPIs del Sistema**
- **Tiempo promedio de aprobación**: Por tipo y total
- **Tasa de aprobación**: Porcentaje aprobado vs rechazado
- **Volumen de solicitudes**: Por período y empleado

### **M2: Alertas**
- **Solicitudes estancadas**: > 7 días sin movimiento
- **Errores de sistema**: Fallos en upload o procesamiento
- **Uso anómalo**: Patrones inusuales de uso

### **M3: Reportes**
- **Dashboard ejecutivo**: Métricas clave en tiempo real
- **Reporte mensual**: Análisis de tendencias
- **Auditoría**: Registro completo de acciones por usuario

---

## 🔄 **Flujo de Estados - Diagrama**

```
    [CREAR SOLICITUD]
           ↓
      [PENDIENTE]
     ↙    ↓    ↘
[EDITAR] [APROBAR/RECHAZAR] [ELIMINAR]
         ↓
    [¿ES RECHAZO?]
    ↙YES     NO↘
[RECHAZADO]  [¿TODAS LAS APROBACIONES?]
             ↙YES        NO↘
        [APROBADO]    [EN_REVISION]
                           ↓
                    [APROBAR/RECHAZAR]
                           ↓
                      [¿ES RECHAZO?]
                      ↙YES     NO↘
                 [RECHAZADO]  [¿TODAS LAS APROBACIONES?]
                              ↙YES        NO↘
                         [APROBADO]    [EN_REVISION]
```

---

## ✅ **Validaciones Críticas**

### **Al Crear Solicitud**
1. ✅ Usuario autenticado
2. ✅ Permiso `createSolicitudPermiso`
3. ✅ Empleado existe y está activo
4. ✅ Tipo de permiso existe
5. ✅ Fechas válidas (fin >= inicio)
6. ✅ Archivos dentro de límites

### **Al Aprobar/Rechazar**
1. ✅ Usuario autenticado
2. ✅ Permiso específico para tipo de aprobación
3. ✅ No es auto-aprobación
4. ✅ No existe aprobación previa del mismo tipo
5. ✅ Solicitud en estado válido (PENDIENTE o EN_REVISION)

### **Al Editar**
1. ✅ Usuario autenticado
2. ✅ Permiso `editSolicitudPermiso` o es el creador
3. ✅ Estado permite edición (PENDIENTE únicamente)
4. ✅ No hay aprobaciones existentes
5. ✅ Nuevos datos válidos

### **Al Eliminar**
1. ✅ Usuario autenticado  
2. ✅ Permiso `deleteSolicitudPermiso` o es el creador
3. ✅ Estado permite eliminación (PENDIENTE únicamente)
4. ✅ Eliminar archivos asociados

---

Esta documentación sirve como referencia completa para implementar y mantener el sistema de solicitudes de permisos. Cada regla está numerada para fácil referencia en código y tests.

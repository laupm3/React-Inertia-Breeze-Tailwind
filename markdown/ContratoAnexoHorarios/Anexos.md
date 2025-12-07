# Documentación General: Gestión de Anexos de Contratos

Esta documentación describe la funcionalidad, propósito y uso de la gestión de anexos vinculados a contratos en el sistema. Incluye detalles técnicos para backend y frontend, así como recomendaciones de integración y seguridad.

---

## Propósito

Permitir la administración de documentos anexos asociados a contratos laborales, facilitando su alta, consulta, edición y eliminación, con control de vigencia y almacenamiento seguro.

---

## Funcionalidad General

- **CRUD de Anexos:** Crear, listar, ver, editar y eliminar anexos de contratos.
- **Relación:** Cada anexo pertenece a un contrato.
- **Gestión de archivos:** Soporte para subida, almacenamiento y eliminación de archivos físicos.
- **Control de vigencia:** Determina si un anexo está vigente según fechas.
- **Eventos:** Se disparan eventos en cada acción CRUD para auditoría o lógica adicional.
- **Validación:** Validación robusta de datos y archivos.
- **Manejo de errores:** Respuestas claras y códigos HTTP apropiados.
- **Documentación API:** Endpoints documentados con OpenAPI/Swagger.

---

## Endpoints Disponibles

Todos los endpoints requieren autenticación y el ID del contrato.

| Acción                | Método | Endpoint                                                        | Body/FormData                |
|-----------------------|--------|-----------------------------------------------------------------|------------------------------|
| Listar anexos         | GET    | `/api/v1/admin/contratos/{contrato}/anexos`                     | -                            |
| Ver un anexo          | GET    | `/api/v1/admin/contratos/{contrato}/anexos/{anexoId}`           | -                            |
| Crear anexo           | POST   | `/api/v1/admin/contratos/{contrato}/anexos`                     | FormData (ver abajo)         |
| Editar anexo          | PUT    | `/api/v1/admin/contratos/{contrato}/anexos/{anexoId}`           | FormData (ver abajo)         |
| Eliminar anexo        | DELETE | `/api/v1/admin/contratos/{contrato}/anexos/{anexoId}`           | -                            |

---

## Estructura esperada de un Anexo

```typescript
interface Anexo {
  id: number;
  contrato_id: number;
  titulo: string;
  descripcion?: string;
  ruta_archivo: string;
  fecha_inicio: string;
  fecha_fin?: string;
  is_vigente: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## Ejemplo de Servicio API (React + Axios)

```typescript
import axios from 'axios';

export const AnexoService = {
  listar: (contratoId: number) =>
    axios.get(`/api/v1/admin/contratos/${contratoId}/anexos`),

  ver: (contratoId: number, anexoId: number) =>
    axios.get(`/api/v1/admin/contratos/${contratoId}/anexos/${anexoId}`),

  crear: (contratoId: number, data: FormData) =>
    axios.post(`/api/v1/admin/contratos/${contratoId}/anexos`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  editar: (contratoId: number, anexoId: number, data: FormData) =>
    axios.put(`/api/v1/admin/contratos/${contratoId}/anexos/${anexoId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  eliminar: (contratoId: number, anexoId: number) =>
    axios.delete(`/api/v1/admin/contratos/${contratoId}/anexos/${anexoId}`)
};
```

---

## Ejemplo de FormData para Crear/Editar

```typescript
const formData = new FormData();
formData.append('titulo', values.titulo);
formData.append('descripcion', values.descripcion);
formData.append('archivo', archivo); // archivo: File
formData.append('fecha_inicio', values.fecha_inicio); // formato YYYY-MM-DD
if (values.fecha_fin) formData.append('fecha_fin', values.fecha_fin);
```

---

## Validaciones y Manejo de Errores

- **Campos requeridos:** `titulo`, `archivo`, `fecha_inicio`
- **Archivo:** Máximo 10MB, tipo válido
- **Fechas:** `fecha_fin` debe ser posterior a `fecha_inicio` si se indica
- **Respuestas:** Mensajes claros y códigos HTTP (`201`, `200`, `422`, `500`)
- **Errores:** El backend responde con detalles en caso de error de validación o sistema

---

## Eventos CRUD

- **AnexoCreado:** Se dispara al crear un anexo
- **AnexoActualizado:** Se dispara al editar un anexo
- **AnexoEliminado:** Se dispara al eliminar un anexo

Estos eventos permiten auditoría, notificaciones o lógica adicional en el backend.

---

## Seguridad

- **Autenticación:** Todos los endpoints requieren usuario autenticado
- **Autorización:** El backend valida la relación contrato-anexo
- **SoftDeletes:** Los anexos se eliminan lógicamente, permitiendo recuperación si es necesario

---

## Recomendaciones de UI

- Mostrar listado de anexos con opción de descargar/ver archivo
- Permitir carga y edición de archivos con validación de tamaño y tipo
- Mostrar estado de vigencia (`is_vigente`) visualmente
- Confirmar antes de eliminar un anexo

---

## Documentación Técnica

- Los endpoints están documentados con anotaciones OpenAPI en el backend
- Puede generarse documentación Swagger automáticamente si se requiere

---

## Flujo de Trabajo

1. **Listar anexos:** Mostrar todos los anexos de un contrato
2. **Ver anexo:** Mostrar detalles y archivo de un anexo específico
3. **Crear anexo:** Subir archivo y datos, validar y guardar
4. **Editar anexo:** Modificar datos y/o archivo, validar y guardar
5. **Eliminar anexo:** Confirmar y eliminar (soft delete)

---

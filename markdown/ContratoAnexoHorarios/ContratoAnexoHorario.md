# Contratos y Anexos: Gestión de Horarios

La propuesta consiste en eliminar la dependencia obligatoria de los anexos para crear horarios y permitir que los horarios puedan asociarse directamente a un contrato principal o a un anexo, según el caso. Este enfoque reconoce que no todos los contratos requieren modificaciones adicionales (anexos) para definir horarios y ofrece una mayor flexibilidad. A continuación, detallo cómo implementar esta solución y su impacto en el modelo de datos, las consultas, y la lógica del negocio.

## Modelo de Datos Modificado

### 1. Tablas principales

#### Tabla: **contratos**
Esta tabla sigue representando los acuerdos principales de los empleados, pero ahora puede ser suficiente por sí misma para gestionar horarios.

| Campo                   | Tipo         | Descripción                                                       |
|-------------------------|--------------|-------------------------------------------------------------------|
| id                      | INT (PK)     | Identificador único del contrato                                  |
| empleado_id             | INT (FK)     | Referencia al empleado asociado                                  |
| centro_departamento_id  | INT (FK)     | Departamento o centro donde trabaja el empleado                  |
| asignacion_id           | INT (FK)     | Referencia a la asignación de funciones                          |
| tipo_contrato_id        | INT (FK)     | Tipo de contrato (indefinido, temporal, etc.)                    |
| empresa_id              | INT (FK)     | Referencia a la empresa                                           |
| fecha_inicio            | DATETIME     | Fecha de inicio del contrato                                     |
| fecha_fin               | DATETIME     | Fecha de fin del contrato (si aplica)                            |
| created_at              | DATETIME     | Fecha de creación                                                |
| updated_at              | DATETIME     | Última actualización                                              |
| deleted_at              | DATETIME     | Eliminación lógica (opcional)                                    |

---

#### Tabla: **anexos**
Se mantiene la tabla de anexos para representar modificaciones, ampliaciones o extensiones de los contratos.

| Campo                   | Tipo         | Descripción                                                       |
|-------------------------|--------------|-------------------------------------------------------------------|
| id                      | INT (PK)     | Identificador único del anexo                                     |
| contrato_id             | INT (FK)     | Referencia al contrato principal                                  |
| fecha_inicio            | DATETIME     | Fecha de inicio del anexo                                         |
| fecha_fin               | DATETIME     | Fecha de fin del anexo (si aplica)                                |
| jornada_id              | INT (FK)     | Jornada específica asociada al anexo                              |
| created_at              | DATETIME     | Fecha de creación                                                |
| updated_at              | DATETIME     | Última actualización                                              |
| deleted_at              | DATETIME     | Eliminación lógica (opcional)                                    |

---

#### Tabla: **horarios**
La clave del cambio está aquí: esta tabla ahora permite asociar un horario a un contrato principal o a un anexo.

| Campo                   | Tipo         | Descripción                                                       |
|-------------------------|--------------|-------------------------------------------------------------------|
| id                      | INT (PK)     | Identificador único del horario                                   |
| contrato_id             | INT (FK)     | Referencia al contrato principal (nullable si es un anexo)        |
| anexo_id                | INT (FK)     | Referencia al anexo (nullable si es el contrato principal)        |
| jornada_id              | INT (FK)     | Jornada asociada al horario                                       |
| fecha_inicio            | DATETIME     | Fecha de inicio del horario                                       |
| fecha_fin               | DATETIME     | Fecha de fin del horario (opcional)                               |
| estado                  | ENUM         | Estado del horario (Pendiente, Completo, Justificado, etc.)       |
| created_at              | DATETIME     | Fecha de creación                                                |
| updated_at              | DATETIME     | Última actualización                                              |

### Relaciones
- **Un contrato** puede tener **múltiples horarios** asociados directamente si no requiere anexos.
- **Un anexo** puede tener **múltiples horarios** asociados si modifica condiciones laborales (como la jornada o el turno).
- **Un horario** debe estar asociado **exclusivamente** a un contrato principal o a un anexo (validación a nivel de aplicación o base de datos).

---

## Reglas y Validaciones

### Restricción de asociación (Contrato vs. Anexo):
Se debe garantizar que un horario esté asociado a **un contrato o un anexo, pero no a ambos**. Esto se puede implementar con una **restricción lógica** en la aplicación o mediante un **`CHECK`** en la base de datos:
```sql
CHECK (
  (contrato_id IS NOT NULL AND anexo_id IS NULL) OR
  (contrato_id IS NULL AND anexo_id IS NOT NULL)
)
```

### Estados de horarios:
- Los horarios deben respetar las fechas de inicio y fin del contrato o anexo al que están asociados.
- Si el contrato o el anexo finalizan, los horarios asociados deben ser automáticamente invalidados (o finalizados).

### Flexibilidad para escenarios comunes:
- Si un contrato tiene horarios estándar y no requiere modificaciones, se asocian directamente al contrato.
- Si un contrato tiene modificaciones específicas (jornada, turnos), se gestionan mediante los anexos, y los horarios se asocian al anexo correspondiente.

---

## Ventajas del Enfoque

### Eliminación de Dependencias Forzadas:
- No es necesario crear un anexo en cada contrato, lo que simplifica el proceso de inicio de los contratos.

### Flexibilidad:
- Permite gestionar horarios directamente para contratos estándar, pero también cubre los casos en que existen modificaciones a través de anexos.

### Eficiencia en Consultas:
Los horarios pueden ser consultados fácilmente según su asociación (contrato o anexo) sin necesidad de relaciones complejas:
```sql
SELECT * 
FROM horarios 
WHERE contrato_id = 123 
   OR anexo_id IN (SELECT id FROM anexos WHERE contrato_id = 123);
```

### Claridad en la Lógica de Negocio:
- Los horarios representan la realidad laboral del empleado, ya sea desde el contrato base o a través de anexos.

### Evolución del Modelo:
- Se puede extender fácilmente en el futuro sin romper la lógica actual. Por ejemplo, se pueden agregar tipos específicos de horarios (turnos, permisos) sin cambiar la estructura.

---

## Consideraciones

### Complejidad en la Lógica de Validación:
- La implementación requiere asegurarse de que un horario no pueda estar asociado a ambos (contrato y anexo), lo que puede aumentar la complejidad inicial.

### Integridad Referencial:
- Es importante garantizar que los horarios asociados a anexos se invaliden automáticamente si el anexo es eliminado o expirado.

### Trazabilidad:
- Deben existir mecanismos claros para identificar si un horario pertenece al contrato principal o a un anexo para evitar confusiones.

---

## Conclusión
Este enfoque elimina la rigidez de depender de anexos para crear horarios, manteniendo flexibilidad y claridad. Es particularmente adecuado para sistemas donde la mayoría de los contratos no necesitan modificaciones frecuentes. La clave del éxito está en implementar validaciones consistentes que aseguren la integridad de los datos y respeten las relaciones jerárquicas entre contratos, anexos y horarios.

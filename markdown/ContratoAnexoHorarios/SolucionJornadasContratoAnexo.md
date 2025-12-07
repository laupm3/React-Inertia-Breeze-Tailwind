# Modelo de Datos Actualizado

## Cambios Requeridos

- **Tabla contratos:**
  - El campo jornada_id debe ser obligatorio (NOT NULL) para garantizar que cada contrato tenga una jornada asociada.

- **Tabla anexos:**
  - El campo jornada_id sigue siendo opcional (NULLABLE), ya que un anexo puede heredar la jornada del contrato.

- **Relación entre horarios y jornadas:**
  - Los horarios seguirán dependiendo del anexo o del contrato, pero la jornada utilizada puede ser tomada del contrato si el anexo no tiene una.

## Tablas Modificadas

```sql
-- Tabla contratos
CREATE TABLE contratos (
    id INT PRIMARY KEY,
    empleado_id INT NOT NULL,
    jornada_id INT NOT NULL, -- Jornada siempre obligatoria
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    deleted_at DATETIME NULL,
    FOREIGN KEY (jornada_id) REFERENCES jornadas(id)
);

-- Tabla anexos
CREATE TABLE anexos (
    id INT PRIMARY KEY,
    contrato_id INT NOT NULL,
    jornada_id INT NULL, -- Jornada opcional
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    deleted_at DATETIME NULL,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id),
    FOREIGN KEY (jornada_id) REFERENCES jornadas(id)
);
```

## Lógica de Negocio

### Reglas

1. **Los contratos siempre deben tener una jornada asociada:**
   - Garantiza que cualquier empleado bajo un contrato estándar tenga un horario basado en una jornada predefinida.

2. **Los anexos pueden no tener jornada:**
   - Si un anexo no tiene una jornada asociada, la jornada del contrato padre se utilizará como plantilla.

3. **Creación de horarios:**
   - Si el horario pertenece a un anexo con jornada_id: Se utiliza esa jornada.
   - Si el horario pertenece a un anexo sin jornada_id: Se utiliza la jornada asociada al contrato padre.
   - Si el horario pertenece directamente a un contrato: Se utiliza la jornada del contrato.

### Consulta SQL para Generar Horarios

```sql
SELECT 
    h.id AS horario_id,
    c.empleado_id,
    COALESCE(a.jornada_id, c.jornada_id) AS jornada_id,
    h.fecha_inicio,
    h.fecha_fin,
    h.estado
FROM horarios h
LEFT JOIN anexos a
    ON h.anexo_id = a.id
LEFT JOIN contratos c
    ON h.contrato_id = c.id
ORDER BY c.empleado_id, h.fecha_inicio;
```

### Lógica en Laravel

```php
function generarHorarios($contratoId) {
    $contrato = Contrato::with(['anexos', 'jornada'])->findOrFail($contratoId);

    $horarios = collect();

    // Generar horarios para el contrato
    foreach ($contrato->jornada->plantillaHorarios as $plantilla) {
        $horarios->push([
            'contrato_id' => $contrato->id,
            'anexo_id' => null,
            'jornada_id' => $contrato->jornada_id,
            'fecha_inicio' => $plantilla->fecha_inicio,
            'fecha_fin' => $plantilla->fecha_fin,
            'estado' => 'activo'
        ]);
    }

    // Generar horarios para los anexos
    foreach ($contrato->anexos as $anexo) {
        $jornadaId = $anexo->jornada_id ?? $contrato->jornada_id; // Herencia
        foreach ($jornadaId->plantillaHorarios as $plantilla) {
            $horarios->push([
                'contrato_id' => $contrato->id,
                'anexo_id' => $anexo->id,
                'jornada_id' => $jornadaId,
                'fecha_inicio' => $plantilla->fecha_inicio,
                'fecha_fin' => $plantilla->fecha_fin,
                'estado' => 'activo'
            ]);
        }
    }

    return $horarios;
}
```

## Ventajas de la Solución

- **Consistencia:** Siempre hay una jornada asociada, ya sea directa o heredada.
- **Flexibilidad:** Permite personalizar jornadas en anexos sin forzar la creación de nuevas jornadas en contratos básicos.
- **Escalabilidad:** Funciona para contratos complejos con múltiples anexos o contratos simples sin anexos.

## Próximos Pasos

1. **Validaciones:**
   - Asegúrate de validar que todos los contratos tengan una jornada asociada al momento de la creación.

2. **Pruebas:**
   - Realiza pruebas de la herencia de jornadas con diferentes combinaciones de contratos y anexos.

3. **Optimización:**
   - Revisa índices en las claves foráneas para mejorar el rendimiento de las consultas.
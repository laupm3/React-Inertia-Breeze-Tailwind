# Agrupación de Horarios por empleado_id

Para obtener los horarios agrupados por `empleado_id`, primero necesitamos resolver la relación implícita entre los horarios, los contratos y los anexos. Esto se logra uniendo las tablas adecuadamente para identificar a qué empleado pertenece cada horario.

A continuación, presento una solución paso a paso:

## 1. Descripción del Problema

### Tablas involucradas:
- **`horarios`** contiene los horarios, con referencias a `contrato_id` o `anexo_id`.
- **`contratos`** contiene la información de los contratos, con una referencia a `empleado_id`.
- **`anexos`** contiene modificaciones al contrato, con una referencia a `contrato_id`.

### Condición especial:
Un horario está asociado **exclusivamente** a un `contrato_id` o a un `anexo_id`, pero nunca a ambos al mismo tiempo.

---

## 2. Solución General
Podemos utilizar una consulta SQL para unir las tablas `horarios`, `contratos` y `anexos`, resolviendo la relación de los horarios con los empleados. Para agrupar por `empleado_id`, usaremos una combinación de `LEFT JOIN` y `CASE` para distinguir si el horario está asociado a un contrato o a un anexo.

---

## 3. Consulta SQL

```sql
SELECT
    c.empleado_id,
    h.id AS horario_id,
    CASE
        WHEN h.contrato_id IS NOT NULL THEN h.contrato_id
        ELSE a.contrato_id
    END AS contrato_id,
    h.anexo_id,
    h.jornada_id,
    h.fecha_inicio,
    h.fecha_fin,
    h.estado
FROM horarios h
LEFT JOIN contratos c
    ON h.contrato_id = c.id
LEFT JOIN anexos a
    ON h.anexo_id = a.id
GROUP BY c.empleado_id, h.id
ORDER BY c.empleado_id, h.fecha_inicio;
```

---

## Explicación

1. **Unión de tablas:**
   - Se usa `LEFT JOIN` para enlazar `horarios` con `contratos` directamente mediante `contrato_id`.
   - Otro `LEFT JOIN` enlaza `horarios` con `anexos` mediante `anexo_id`.

2. **Identificación del contrato:**
   - Con el campo `CASE`, identificamos el contrato relacionado con el horario:
     - Si `horarios.contrato_id` no es `NULL`, usamos ese valor directamente.
     - Si es `NULL`, usamos el `contrato_id` obtenido de la tabla `anexos`.

3. **Agrupación por empleado:**
   - Agrupamos los resultados por `empleado_id`, que se obtiene de la tabla `contratos`.

4. **Ordenación:**
   - Los resultados se ordenan por `empleado_id` y por la fecha de inicio del horario (`h.fecha_inicio`) para mantener un orden cronológico.

---

## 4. Resultado

La consulta devuelve una lista de horarios con los siguientes campos clave:

- **`empleado_id`:** Identifica al empleado.
- **`horario_id`:** Identifica el horario específico.
- **`contrato_id`:** El contrato al que está asociado el horario.
- **`anexo_id`:** Si el horario está vinculado a un anexo, se muestra aquí.
- **`fecha_inicio` y `fecha_fin`:** Período del horario.
- **`estado`:** Estado actual del horario.

---

## 5. Consulta para Agrupar Todos los Horarios por Empleado

Si lo que necesitas es devolver horarios **agrupados directamente** por `empleado_id`, podemos usar `JSON_AGG` (en PostgreSQL) o funciones de agregación similares:

### Ejemplo con PostgreSQL:

```sql
SELECT
    c.empleado_id,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'horario_id', h.id,
            'contrato_id', CASE
                            WHEN h.contrato_id IS NOT NULL THEN h.contrato_id
                            ELSE a.contrato_id
                          END,
            'anexo_id', h.anexo_id,
            'jornada_id', h.jornada_id,
            'fecha_inicio', h.fecha_inicio,
            'fecha_fin', h.fecha_fin,
            'estado', h.estado
        )
    ) AS horarios
FROM horarios h
LEFT JOIN contratos c
    ON h.contrato_id = c.id
LEFT JOIN anexos a
    ON h.anexo_id = a.id
GROUP BY c.empleado_id
ORDER BY c.empleado_id;
```

### Resultado:
- Devuelve los horarios como un arreglo JSON agrupado por empleado.

---

## Ventajas de la Solución

1. **Flexibilidad:**
   - Permite listar horarios tanto para contratos principales como para anexos sin duplicar lógica.
2. **Escalabilidad:**
   - Funciona incluso si los horarios o anexos crecen en cantidad.
3. **Agrupación directa:**
   - Si se usa JSON, permite devolver todos los datos agrupados en una sola fila por empleado.


# Módulo de Anexos - Síntesis

## Propósito
El módulo de Anexos permite gestionar documentos complementarios a contratos, con fechas de inicio/fin definidas y asociaciones opcionales a jornadas laborales.

## Modelo de Datos

```php
class Anexo extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'contrato_id', 'jornada_id', 'fecha_inicio', 'fecha_fin'
    ];
    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];
}
```

## Endpoints API

- **Crear:** `POST /api/v1/admin/contratos/{contrato}/anexos`
- **Actualizar:** `PUT /api/v1/admin/contratos/{contrato}/anexos/{anexo}`
- **Eliminar:** `DELETE /api/v1/admin/contratos/{contrato}/anexos/{anexo}`

Las fechas deben ir en formato ISO 8601 con milisegundos y zona Z (`Y-m-d\TH:i:s.v\Z`).

## Validación

- `fecha_inicio`: requerida, formato correcto, anterior a `fecha_fin`
- `fecha_fin`: requerida, formato correcto, posterior a `fecha_inicio`
- `jornada_id`: opcional, debe existir si se envía

## Ejemplo de Payload

```json
{
  "jornada_id": 1,
  "fecha_inicio": "2025-06-01T00:00:00.000Z",
  "fecha_fin": "2025-07-01T00:00:00.000Z"
}
```

## Interfaces TypeScript

```typescript
interface Anexo {
  id: number;
  contrato_id: number;
  jornada_id: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
interface AnexoRequest {
  jornada_id?: number;
  fecha_inicio: string;
  fecha_fin: string;
}
```

## Manejo de Fechas en Frontend

```typescript
const fechaInicio = new Date().toISOString();
const fechaFin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
```

## Manejo de Errores

- Error de formato: "The fecha inicio field must match the format Y-m-d\\TH:i:s.v\\Z."
- Error de lógica: "The fecha fin must be a date after fecha inicio."

## Seguridad y Buenas Prácticas

- Todas las operaciones requieren autenticación y permisos adecuados
- Validar siempre los datos en backend y frontend
- Usar transacciones para operaciones críticas
- Eliminar lógicamente (soft delete) para mantener historial

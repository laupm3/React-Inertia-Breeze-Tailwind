# Endpoint: Contratos Disponibles por Empleado

## Descripción
Endpoint optimizado para consultar los contratos disponibles para empleados específicos en rangos de fechas determinados.

## Optimizaciones Implementadas
- **Validación Única**: Una sola query para validar existencia de todos los empleados
- **DB::Transaction**: Patrón consistente con el resto de la aplicación
- **Cache de Validación**: Empleados validados se cachean para evitar queries duplicadas
- **Eager Loading**: Anexos filtrados por rango de fechas
- **Límites de Seguridad**: Máximo 10 empleados, 31 fechas por empleado

## Endpoint
```
POST /api/v1/admin/empleados/available-contracts
```

## Request Example
```json
{
  "empleados": [
    {
      "empleado_id": 1,
      "fechas": ["2025-06-20", "2025-06-21", "2025-06-22"]
    },
    {
      "empleado_id": 2,
      "fechas": ["2025-06-20", "2025-06-23"]
    }
  ]
}
```

## Response Example
```json
{
  "disponibilidad": {
    "1": {
      "2025-06-20": [
        {
          "id": 15,
          "numero_contrato": "CT-2025-001",
          "fecha_inicio": "2025-01-01",
          "fecha_fin": "2025-12-31",
          "empleado_id": 1,
          "anexos": [
            {
              "id": 3,
              "numero_anexo": "AN-2025-001",
              "fecha_inicio": "2025-06-15",
              "fecha_fin": "2025-07-15"
            }
          ]
        }
      ],
      "2025-06-21": [],
      "2025-06-22": []
    },
    "2": {
      "2025-06-20": [],
      "2025-06-23": []
    }
  },
  "total_empleados": 2,
  "total_fechas_unicas": 4,
  "message": "Consulta de contratos disponibles realizada correctamente."
}
```

## Validaciones Optimizadas
- **Existencia de Empleados**: Una sola query para validar todos los empleado_id
- **Límites de Request**: Máximo 10 empleados, 31 fechas por empleado
- **Fechas**: Formato válido y deben ser hoy o futuras
- **Cache**: Empleados validados se reutilizan sin queries adicionales

## Performance
- **1 Query**: Para validar empleados (vs N queries con exists rule)
- **1 Query**: Para obtener contratos con anexos filtrados
- **DB::Transaction**: Consistencia y manejo de errores automático
- **ContratoResource**: Respuestas consistentes con el resto de la API

## Permisos Requeridos
- `viewContracts` (web guard)

## Manejo de Errores
- **422**: Validación de datos (empleados inexistentes, límites excedidos)
- **401**: No autenticado
- **403**: Sin permisos
- **500**: Error interno (con rollback automático)

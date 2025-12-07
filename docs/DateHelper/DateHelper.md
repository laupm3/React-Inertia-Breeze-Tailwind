# DateHelper - Síntesis Técnica

## Propósito
El `DateHelper` es una utilidad que estandariza el formato de fechas en toda la aplicación, especialmente para comunicaciones API, asegurando consistencia entre frontend y backend.

## Formato Estándar ISO 8601
```
Y-m-d\TH:i:s.v\Z
```
Ejemplo: `2025-06-23T14:30:45.123Z`

Componentes:
- **Y-m-d**: Fecha (año-mes-día)
- **T**: Separador literal entre fecha y hora
- **H:i:s**: Hora (hora:minuto:segundo en formato 24h)
- **v**: Milisegundos
- **Z**: Zona horaria UTC

## Implementación

```php
class DateHelper
{
    public const API_DATE_FORMAT = 'Y-m-d\TH:i:s.v\Z';
    
    public static function toApiFormat($date = null): string
    {
        if (is_null($date)) {
            $date = Carbon::now();
        } elseif (!($date instanceof Carbon)) {
            $date = Carbon::parse($date);
        }
        return $date->format(self::API_DATE_FORMAT);
    }
    
    public static function fromApiFormat(string $dateString): Carbon
    {
        return Carbon::createFromFormat(self::API_DATE_FORMAT, $dateString);
    }
    
    public static function isValidApiFormat(string $dateString): bool
    {
        try {
            self::fromApiFormat($dateString);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
```

## Uso en Backend (Laravel)

### En Controladores
```php
// Convertir a formato API
$apiDate = DateHelper::toApiFormat($model->fecha);

// Responder con fecha en formato estándar
return response()->json([
    'fecha_inicio' => DateHelper::toApiFormat($model->fecha_inicio)
]);
```

### En Requests (Validación)
```php
public function rules()
{
    return [
        'fecha_inicio' => [
            'required', 
            'date_format:'.DateHelper::API_DATE_FORMAT,
            'before:fecha_fin'
        ]
    ];
}
```

### En Modelos
```php
protected $casts = [
    'fecha_inicio' => 'datetime',
    'fecha_fin' => 'datetime',
];

public function toArray()
{
    return [
        // Siempre convertir a formato API para respuestas
        'fecha_inicio' => DateHelper::toApiFormat($this->fecha_inicio)
    ];
}
```

## Uso en Frontend (JavaScript/TypeScript)

### Generar Fechas en Formato API
```javascript
// Fecha actual en formato compatible
const fechaActual = new Date().toISOString(); // '2025-06-23T14:30:45.123Z'

// Crear fecha futura (un mes después)
const fechaFin = new Date();
fechaFin.setMonth(fechaFin.getMonth() + 1);
const fechaFinStr = fechaFin.toISOString();
```

### Interfaces TypeScript
```typescript
interface ObjetoConFechas {
    fecha_inicio: string; // formato ISO 8601: '2025-06-23T14:30:45.123Z'
    fecha_fin: string;    // formato ISO 8601: '2025-06-23T14:30:45.123Z'
}
```

## Problemas Comunes y Soluciones

### 1. Error de Formato
**Problema**: Fechas rechazadas por formato incorrecto
**Solución**: Usar siempre `DateHelper::toApiFormat()` o `toISOString()`

### 2. Problemas de Zona Horaria
**Problema**: Fechas con horas incorrectas
**Solución**: Asegurar el uso de UTC en backend y solo convertir a local para visualización

### 3. Comparación de Fechas
**Problema**: Fallas en tests por diferencias en milisegundos
**Solución**: Comparar solo componentes relevantes de la fecha

## Mejores Prácticas

1. **Siempre usar el helper**: No crear fechas manualmente en ningún lado
2. **Validar formatos**: En requests y antes de procesar
3. **Frontend**: Usar `toISOString()` para enviar, `toLocaleDateString()` para mostrar
4. **Testing**: Generar fechas de prueba con el helper para asegurar consistencia

## Beneficios del Uso Consistente

- Eliminación de errores de validación por formato
- Manejo coherente de zonas horarias
- Facilita pruebas automatizadas
- Simplifica la depuración
- Mejora la interoperabilidad entre sistemas

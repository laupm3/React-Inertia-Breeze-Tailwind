# StoragePathService - Servicio de Rutas de Almacenamiento

## Descripción

El `StoragePathService` centraliza la lógica de generación de rutas para el almacenamiento de archivos en el sistema. Proporciona métodos especializados para diferentes tipos de entidades y garantiza que los nombres de archivo sean seguros para el sistema de archivos.

## Características

- ✅ **Rutas consistentes**: Todas las rutas siguen un patrón predecible
- ✅ **Sanitización automática**: Los caracteres problemáticos se reemplazan automáticamente
- ✅ **Reutilizable**: Métodos para diferentes tipos de documentos
- ✅ **Testeable**: Lógica aislada y fácil de testear

## Métodos disponibles

### `getSolicitudPermisoStoragePath(SolicitudPermiso $solicitudPermiso): string`

Genera la ruta específica para archivos de una solicitud de permiso.

**Formato**: `hr/Empleados/{nif}/Trabajo/Permisos/{permiso_sanitizado}/{solicitud_id}`

**Ejemplo**:
```php
$storagePathService = new StoragePathService();
$ruta = $storagePathService->getSolicitudPermisoStoragePath($solicitudPermiso);
// Resultado: "hr/Empleados/12345678A/Trabajo/Permisos/Permiso_de_Paternidad/123"
```

### `getEmpleadoBasePath(Empleado $empleado): string`

Genera la ruta base para todos los documentos de un empleado.

**Formato**: `hr/Empleados/{nif_sanitizado}`

**Ejemplo**:
```php
$ruta = $storagePathService->getEmpleadoBasePath($empleado);
// Resultado: "hr/Empleados/12345678A"
```

### `getEmpleadoDocumentPath(Empleado $empleado, string $subcategory): string`

Genera la ruta para una subcategoría específica de documentos del empleado.

**Formato**: `hr/Empleados/{nif_sanitizado}/Trabajo/{subcategoria_sanitizada}`

**Ejemplo**:
```php
$ruta = $storagePathService->getEmpleadoDocumentPath($empleado, 'Contratos');
// Resultado: "hr/Empleados/12345678A/Trabajo/Contratos"
```

## Sanitización

El servicio sanitiza automáticamente los nombres para evitar problemas en el sistema de archivos:

- **Caracteres permitidos**: Letras, números, guiones (`-`), guiones bajos (`_`) y puntos (`.`)
- **Caracteres problemáticos**: Se reemplazan por guiones bajos (`_`)
- **Limpieza adicional**: Se eliminan guiones bajos múltiples y al inicio/final

### Ejemplos de sanitización

| Entrada | Salida |
|---------|--------|
| `Permiso / Licencia (Especial)` | `Permiso_Licencia_Especial` |
| `Nóminas & Liquidaciones` | `Nominas_Liquidaciones` |
| `12345678-A` | `12345678-A` (se mantiene) |

## Uso en controladores

```php
class SolicitudPermisoController extends Controller
{
    public function __construct(
        private StoragePathService $storagePathService,
        // ...otros servicios
    ) {}

    public function store(SolicitudPermisoStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $solicitudPermiso = SolicitudPermiso::create($validated);
            
            // Generar ruta usando el servicio especializado
            $nombreCarpeta = $this->storagePathService->getSolicitudPermisoStoragePath($solicitudPermiso);
            
            $destinationFolder = $this->directoryManagementService->createDirectoryPath($nombreCarpeta);
            
            // ...resto de la lógica
        });
    }
}
```

## Ventajas

1. **Separación de responsabilidades**: El controlador no se preocupa por la lógica de rutas
2. **Reutilización**: Puede usarse en múltiples partes del sistema
3. **Mantenibilidad**: Cambios en la estructura de carpetas en un solo lugar
4. **Testeable**: Lógica aislada con tests unitarios
5. **Seguridad**: Sanitización automática previene problemas de seguridad
6. **Consistencia**: Todas las rutas siguen el mismo patrón

## Testing

El servicio incluye tests unitarios que verifican:
- Generación correcta de rutas
- Sanitización de caracteres especiales
- Diferentes tipos de documentos
- Casos edge con caracteres problemáticos

```bash
php artisan test tests/Unit/Services/Storage/StoragePathServiceTest.php
```

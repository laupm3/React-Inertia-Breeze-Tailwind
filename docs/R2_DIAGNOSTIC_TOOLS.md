# Herramientas de Diagnóstico R2 Cloudflare

Este conjunto de herramientas permite diagnosticar problemas con R2 Cloudflare, especialmente problemas de eliminación en producción.

## Comandos Disponibles

### 1. `r2:diagnostic` - Diagnóstico Completo

Ejecuta un diagnóstico exhaustivo de R2 Cloudflare.

```bash
# Diagnóstico completo
php artisan r2:diagnostic

# Diagnóstico rápido (solo pruebas básicas)
php artisan r2:diagnostic --quick

# Guardar resultados en log
php artisan r2:diagnostic --save-log

# Probar con un folder específico
php artisan r2:diagnostic --test-folder-id=123

# Eliminación forzada de una ruta específica (¡PELIGROSO!)
php artisan r2:diagnostic --force-delete="files/abc123.txt"
```

### 2. `r2:permissions` - Verificación de Permisos

Verifica específicamente los permisos de R2.

```bash
# Verificación básica de permisos
php artisan r2:permissions

# Verificación detallada
php artisan r2:permissions --detailed

# Incluir prueba de eliminación
php artisan r2:permissions --test-delete
```

### 3. `r2:test-folder` - Prueba con Folder Real

Prueba operaciones con un registro real de la base de datos.

```bash
# Solo verificar (no eliminar)
php artisan r2:test-folder 123 --dry-run

# Probar eliminación con confirmación
php artisan r2:test-folder 123

# Forzar eliminación sin confirmación (¡PELIGROSO!)
php artisan r2:test-folder 123 --force
```

## Uso Recomendado en Producción

### Paso 1: Verificación Inicial
```bash
php artisan r2:permissions --detailed
```

### Paso 2: Diagnóstico Completo
```bash
php artisan r2:diagnostic --save-log
```

### Paso 3: Probar con Registro Real (modo seguro)
```bash
php artisan r2:test-folder [ID] --dry-run
```

### Paso 4: Si hay problemas, probar eliminación controlada
```bash
php artisan r2:permissions --test-delete
```

## Interpretación de Resultados

### ✅ Verde: Operación exitosa
- La funcionalidad está trabajando correctamente

### ❌ Rojo: Error/Problema detectado
- Indica un problema que necesita atención
- Puede ser un problema de permisos, conectividad o configuración

### ⚠️ Amarillo: Advertencia
- Comportamiento inesperado pero no necesariamente un error
- Puede requerir investigación adicional

### 🧹 Azul: Operación de limpieza
- Archivos temporales eliminados después de las pruebas

## Problemas Comunes y Soluciones

### 1. Error de Conectividad
**Síntoma**: ❌ Error de conectividad
**Posibles causas**:
- Credenciales AWS incorrectas
- Endpoint mal configurado
- Problemas de red/firewall

**Verificar**:
```bash
# Revisar variables de entorno
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_ENDPOINT
echo $AWS_BUCKET
```

### 2. Permisos Denegados
**Síntoma**: ❌ ACCESO DENEGADO (AccessDenied)
**Solución**: Verificar que las credenciales tienen los permisos necesarios en R2:
- `s3:ListBucket`
- `s3:GetObject`
- `s3:PutObject`
- `s3:DeleteObject`

### 3. Delete Devuelve True pero Archivo Persiste
**Síntoma**: ✅ delete() devuelve true pero ❌ archivo aún existe
**Posibles causas**:
- Propagación lenta en R2
- Problemas de cache
- Permisos parciales

**Solución**: Usar cliente S3 directo o esperar más tiempo para propagación.

### 4. Estructura de Rutas Incorrecta
**Síntoma**: Archivos no encontrados con la estructura esperada
**Verificar**: Que las rutas sigan el patrón:
- Archivos: `files/{hash}.{extension}`
- Carpetas: `folders/{hash}.directory`
- Papelera archivos: `trash/files/{hash}.{extension}`
- Papelera carpetas: `trash/folders/{hash}.directory`

## Archivos de Log

Los resultados se guardan en `storage/logs/r2-diagnostic-YYYY-MM-DD-HH-MM-SS.log`

## Precauciones de Seguridad

### ⚠️ COMANDOS DESTRUCTIVOS

Los siguientes comandos pueden eliminar datos permanentemente:

```bash
# ¡PELIGROSO! Elimina archivos reales
php artisan r2:diagnostic --force-delete="ruta/archivo"
php artisan r2:test-folder 123 --force
```

### ✅ COMANDOS SEGUROS

Estos comandos solo leen y crean archivos temporales:

```bash
php artisan r2:permissions
php artisan r2:diagnostic --quick
php artisan r2:test-folder 123 --dry-run
```

## Estructura del Sistema

### Archivos Creados

1. **`app/Services/Storage/R2DiagnosticService.php`**
   - Servicio principal de diagnóstico
   - Contiene toda la lógica de pruebas

2. **`app/Console/Commands/R2DiagnosticCommand.php`**
   - Comando principal para diagnósticos completos

3. **`app/Console/Commands/R2PermissionsCheck.php`**
   - Comando específico para verificar permisos

4. **`app/Console/Commands/R2TestRealFolder.php`**
   - Comando para probar con registros reales de BD

### Dependencias

Utiliza las librerías existentes:
- `aws/aws-sdk-php` (ya instalado)
- `illuminate/filesystem`
- `illuminate/console`

## Monitoreo en Producción

Para usar en producción de forma regular:

1. **Agregar al cron** (opcional):
```bash
# Diagnóstico diario
0 2 * * * cd /path/to/app && php artisan r2:permissions --detailed >> /var/log/r2-daily-check.log 2>&1
```

2. **Crear alertas** basadas en la salida de los comandos

3. **Revisar logs** regularmente para detectar patrones

## Solución de Problemas Específicos

### Si `delete()` no funciona en producción:

1. Ejecutar diagnóstico completo:
```bash
php artisan r2:diagnostic --save-log
```

2. Verificar permisos específicos:
```bash
php artisan r2:permissions --test-delete
```

3. Probar con archivo real (modo seguro):
```bash
php artisan r2:test-folder [ID] --dry-run
```

4. Si todo se ve bien, probar eliminación controlada:
```bash
php artisan r2:test-folder [ID]
```

5. Revisar logs de aplicación y R2 para más detalles.

# Guía Rápida: Solución de Problemas R2 en Producción

## Problema: Los archivos no se eliminan en producción

### Paso 1: Verificación Rápida (2 minutos)
```bash
php artisan r2:permissions
```

**Resultado esperado:**
```
✅ CREATE (PUT): OK
✅ READ (GET): OK  
✅ EXISTS: OK
✅ DELETE: OK
```

**Si hay errores:**
- ❌ ACCESS DENIED → Problema de permisos en R2
- ❌ Error de conectividad → Problema de red/configuración
- ❌ DELETE: FALLO → Problema específico de eliminación

### Paso 2: Diagnóstico Completo (5 minutos)
```bash
php artisan r2:diagnostic --save-log
```

Esto creará un archivo de log detallado en `storage/logs/r2-diagnostic-*.log`

### Paso 3: Probar con Archivo Real (modo seguro)
```bash
# Reemplazar 123 con el ID real de un folder que sabes que existe
php artisan r2:test-folder 123 --dry-run
```

**Esto mostrará:**
- ✅ Si el archivo existe en R2
- ✅ Si las rutas son correctas
- ❌ Si hay discrepancias entre BD y R2

### Paso 4: Prueba de Eliminación Controlada
```bash
# Solo si los pasos anteriores son exitosos
php artisan r2:permissions --test-delete
```

**Esto identifica si:**
- ✅ La eliminación funciona correctamente
- ❌ PROBLEMA: El archivo aún existe después del delete() → Problema de permisos
- ❌ delete() devuelve false → Problema de configuración

## Soluciones Comunes

### 1. Problema de Permisos
Si ves: `❌ DELETE: ACCESO DENEGADO`

**Solución:** Verificar que las credenciales R2 tienen estos permisos:
```
s3:DeleteObject
s3:ListBucket
s3:GetObject
s3:PutObject
```

### 2. Problema de Configuración
Si ves: `❌ Error de conectividad`

**Verificar variables de entorno:**
```bash
# En tu servidor de producción
env | grep AWS
```

Debe mostrar:
```
AWS_ACCESS_KEY_ID=tu_key
AWS_SECRET_ACCESS_KEY=tu_secret
AWS_DEFAULT_REGION=auto
AWS_BUCKET=tu_bucket
AWS_ENDPOINT=https://tu-account-id.r2.cloudflarestorage.com
```

### 3. Problema de Propagación
Si ves: `✅ delete() devuelve true` pero `❌ archivo aún existe`

**Solución:** Usar cliente S3 directo o implementar retry logic:

```php
// En tu código de producción
$maxRetries = 3;
$retryDelay = 2; // segundos

for ($i = 0; $i < $maxRetries; $i++) {
    $result = $disk->delete($path);
    
    if ($result) {
        // Esperar y verificar
        sleep($retryDelay);
        if (!$disk->exists($path)) {
            break; // Éxito
        }
    }
    
    if ($i === $maxRetries - 1) {
        // Usar cliente S3 directo como fallback
        $s3Client->deleteObject([
            'Bucket' => $bucket,
            'Key' => $path
        ]);
    }
}
```

## Comando de Emergencia

Si necesitas eliminar un archivo específico inmediatamente:

```bash
# ¡PELIGROSO! Solo usar en emergencias
php artisan r2:test-folder [ID] --force
```

## Monitoreo Continuo

Para evitar problemas futuros, ejecutar semanalmente:

```bash
php artisan r2:diagnostic --quick --save-log
```

Y revisar los logs en `storage/logs/r2-diagnostic-*.log`

## Contacto/Escalación

Si los problemas persisten después de seguir esta guía:

1. **Revisar logs de Laravel:** `storage/logs/laravel.log`
2. **Revisar logs de R2:** Panel de Cloudflare → R2 → Logs
3. **Comprobar limites de R2:** Panel de Cloudflare → R2 → Metrics

## Estructura de Archivos Creada

```
app/
├── Console/Commands/
│   ├── R2DiagnosticCommand.php
│   ├── R2PermissionsCheck.php
│   └── R2TestRealFolder.php
├── Services/Storage/
│   └── R2DiagnosticService.php
docs/
├── R2_DIAGNOSTIC_TOOLS.md
└── R2_QUICK_TROUBLESHOOTING.md
```

Todos los archivos están listos para usar en producción sin modificaciones adicionales.

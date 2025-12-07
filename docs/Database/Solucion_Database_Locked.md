# 🔧 Solución al Error "Database is Locked" en FolderSeeder

## 🎯 Problema Original
El error `SQLSTATE[HY000]: General error: 5 database is locked` aparecía durante la ejecución del `FolderSeeder`, especialmente en la inserción de carpetas con el comando `php artisan hr:seed-structure --force`.

## 🚀 Soluciones Implementadas

### 1. **Configuración Optimizada de SQLite**
```php
// En config/database.php
'sqlite' => [
    'driver' => 'sqlite',
    'busy_timeout' => 30000, // 30 segundos timeout
    'journal_mode' => 'WAL', // Modo WAL para mejor concurrencia
    'synchronous' => 'NORMAL', // Mejor rendimiento
    'options' => [
        PDO::ATTR_PERSISTENT => false,
        PDO::ATTR_TIMEOUT => 30,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ],
],
```

### 2. **Configuración Runtime de SQLite**
```php
protected function configureSQLite(): void
{
    DB::unprepared('PRAGMA busy_timeout = 30000;'); // 30 segundos timeout
    DB::unprepared('PRAGMA journal_mode = WAL;'); // Modo WAL para mejor concurrencia
    DB::unprepared('PRAGMA synchronous = NORMAL;'); // Mejor rendimiento
    DB::unprepared('PRAGMA cache_size = 10000;'); // Aumentar cache
    DB::unprepared('PRAGMA temp_store = MEMORY;'); // Almacenar temporales en memoria
}
```

### 3. **Sistema de Reintentos Automáticos**
```php
protected function executeWithRetry(callable $operation, int $maxRetries = 3): void
{
    $attempt = 0;
    
    while ($attempt < $maxRetries) {
        try {
            $operation();
            return;
        } catch (\Exception $e) {
            $attempt++;
            
            if ($this->isDatabaseLockError($e) && $attempt < $maxRetries) {
                Log::warning("Intento {$attempt} falló por bloqueo de base de datos, reintentando...");
                sleep(pow(2, $attempt - 1)); // Backoff exponencial
                continue;
            }
            
            throw $e;
        }
    }
}
```

### 4. **Transacciones Más Pequeñas**
```php
protected function createHRStructure(): void
{
    // Separar operaciones en transacciones independientes
    
    // 1. Crear carpeta raíz HR
    $carpetaHR = DB::transaction(function() {
        return $this->directoryService->createDirectoryPath(...);
    });

    // 2. Crear carpetas base
    DB::transaction(function() use ($carpetaHR) {
        $this->createBaseFolders($carpetaHR);
    });

    // 3. Procesar empleados individualmente
    $this->createEmployeeStructureWithBatching($carpetaHR);
}
```

### 5. **Procesamiento por Lotes**
```php
protected function cleanHRStructure(): void
{
    $elementosHR = Folder::where('path', 'LIKE', 'hr%')
        ->orderBy('path', 'desc')
        ->get();

    // Procesar elementos en lotes de 5
    $elementosHR->chunk(5)->each(function ($lote) {
        $this->executeWithRetry(function() use ($lote) {
            DB::transaction(function() use ($lote) {
                foreach ($lote as $elemento) {
                    $this->deleteElementSafely($elemento);
                }
            });
        });
    });
}
```

### 6. **Migración de Optimización**
Se creó una migración que optimiza automáticamente la configuración de SQLite:
```bash
php artisan migrate
```

### 7. **Comando Mejorado con Validaciones**
```php
// Verificación de prerrequisitos
protected function checkPrerequisites(): bool
{
    // Verificar usuario Super Admin
    // Verificar niveles de seguridad
    // Verificar niveles de acceso
    // Verificar empleados
}
```

## 📋 Cómo Usar

### Ejecución Normal
```bash
# Ejecutar migración de optimización (una sola vez)
php artisan migrate

# Ejecutar seeder con mejoras
php artisan hr:seed-structure --force
```

### Resolución de Problemas
```bash
# Si persiste el error, verificar prerrequisitos
php artisan hr:seed-structure

# Limpiar procesos Laravel
php artisan queue:restart

# Verificar base de datos
php artisan tinker
>>> DB::connection()->getPdo()->exec("PRAGMA journal_mode;");
```

## 🎯 Beneficios de las Mejoras

1. **Mejor Concurrencia**: Modo WAL permite múltiples lectores
2. **Timeouts Configurables**: 30 segundos para operaciones complejas
3. **Reintentos Automáticos**: Sistema robusto ante bloqueos temporales
4. **Transacciones Optimizadas**: Operaciones más pequeñas y eficientes
5. **Procesamiento por Lotes**: Evita bloqueos prolongados
6. **Mejor Rendimiento**: Cache aumentado y optimizaciones de SQLite
7. **Manejo de Errores**: Logging detallado y recuperación automática

## 📊 Configuraciones Aplicadas

| Configuración | Valor Anterior | Valor Nuevo | Beneficio |
|---------------|----------------|-------------|-----------|
| `busy_timeout` | `null` | `30000` | Espera 30s ante bloqueos |
| `journal_mode` | `null` | `WAL` | Mejor concurrencia |
| `synchronous` | `null` | `NORMAL` | Mejor rendimiento |
| `cache_size` | `2000` | `10000` | Más memoria cache |
| `temp_store` | `DEFAULT` | `MEMORY` | Temporales en RAM |

## 🔍 Monitoreo y Logs

Los logs incluyen información detallada sobre:
- Configuración de SQLite aplicada
- Reintentos por bloqueo de base de datos
- Tiempo de ejecución por operación
- Estadísticas de elementos procesados
- Errores específicos y contexto

## ⚠️ Consideraciones

1. **Modo WAL**: Genera archivos .wal y .shm adicionales
2. **Memoria**: Configuración usa más RAM para mejor rendimiento
3. **Concurrencia**: Mejor para múltiples lectores, limitada para escritores
4. **Persistencia**: Configuración se aplica por conexión
5. **Backoff**: Reintentos con espera exponencial (1s, 2s, 4s...)

## 🎉 Resultado

Con estas mejoras, el `FolderSeeder` debería ejecutarse sin errores de bloqueo de base de datos, proporcionando una experiencia más robusta y confiable.

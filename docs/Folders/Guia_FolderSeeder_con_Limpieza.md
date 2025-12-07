# 🏗️ Guía de Uso: FolderSeeder con Limpieza Automática

## Resumen

El `FolderSeeder` ha sido mejorado para incluir **limpieza automática** y **recreación completa** de la estructura de carpetas HR. Ahora elimina toda la estructura existente antes de recrearla desde cero.

## 🔧 Nuevas Funcionalidades

### ✅ Limpieza Automática
- **Eliminación completa** de toda la estructura `hr/` existente
- **Limpieza de nodos huérfanos** que pudieran quedar en la base de datos
- **Reconstrucción del árbol NestedSet** para mantener integridad
- **Eliminación forzada** (bypass de soft deletes)

### ✅ Recreación Robusta
- **Creación desde cero** de toda la estructura
- **Manejo de errores** mejorado con logging detallado
- **Validaciones** en cada paso del proceso
- **Transacciones automáticas** para operaciones atómicas

## 🚀 Formas de Ejecutar el Seeder

### 1. Comando Artisan Tradicional
```bash
php artisan db:seed --class=FolderSeeder
```

### 2. Comando Personalizado (Recomendado)
```bash
# Con confirmación interactiva
php artisan hr:seed-structure

# Forzar ejecución sin confirmación
php artisan hr:seed-structure --force
```

### 3. Desde el DatabaseSeeder
```bash
php artisan db:seed
```
(Incluye FolderSeeder si está en la lista)

## 📋 Proceso de Ejecución

### Fase 1: Limpieza 🧹
1. **Busca la carpeta raíz `hr/`**
2. **Elimina toda la estructura** usando `DirectoryManagementService`
3. **Limpia nodos huérfanos** que pudieran quedar
4. **Reconstruye el árbol NestedSet** para integridad

### Fase 2: Recreación 🏗️
1. **Crea carpeta raíz** `hr/`
2. **Crea carpetas base**: `Empresas/`, `Centros/`, `Empleados/`
3. **Genera estructura de empleados** con sus subcarpetas
4. **Crea archivos de ejemplo** en ubicaciones relevantes

## 🗂️ Estructura Generada

```
hr/
├── Empresas/
│   └── [siglas_empresa]/
│       └── info_[siglas].pdf
├── Centros/
│   └── [nombre_centro]/
│       └── info_[centro].pdf
└── Empleados/
    └── [NIF_empleado]/
        ├── Personal/
        │   └── ejemplo_Personal.pdf
        ├── Trabajo/
        │   ├── ejemplo_Trabajo.pdf
        │   ├── Nominas/
        │   │   ├── 2021/
        │   │   │   └── nomina_2021_resumen.pdf
        │   │   ├── 2022/
        │   │   │   └── nomina_2022_resumen.pdf
        │   │   ├── 2023/
        │   │   │   └── nomina_2023_resumen.pdf
        │   │   └── 2024/
        │   │       ├── 01_Enero/
        │   │       │   └── nomina_Enero_2024.pdf
        │   │       ├── 02_Febrero/
        │   │       │   └── nomina_Febrero_2024.pdf
        │   │       └── ... (todos los meses)
        │   ├── Certificados/
        │   │   └── ejemplo_Certificados.pdf
        │   ├── Permisos/
        │   │   └── ejemplo_Permisos.pdf
        │   └── Justificantes y Bajas/
        │       └── ejemplo_Justificantes y Bajas.pdf
        └── Seguridad/
            └── ejemplo_Seguridad.pdf
```

## 🔍 Características Técnicas

### Limpieza Robusta
- **Eliminación por servicios**: Usa `DirectoryManagementService` para operaciones seguras
- **Fallback manual**: Si fallan los servicios, elimina directamente de BD
- **Limpieza de huérfanos**: Busca y elimina nodos residuales con `LIKE 'hr%'`
- **Reconstrucción NestedSet**: Ejecuta `rebuildTree()` si está disponible

### Logging Detallado
- **Información de progreso** en cada fase
- **Errores detallados** con stack traces
- **Warnings para problemas** no críticos
- **Estadísticas finales** de elementos creados

### Manejo de Errores
- **Try/catch granular** en cada operación
- **Continuación inteligente** ante errores no críticos
- **Logs estructurados** para debugging
- **Transacciones automáticas** para atomicidad

## ⚠️ Consideraciones Importantes

### 🚨 ADVERTENCIAS
- **ELIMINA TODA LA ESTRUCTURA HR EXISTENTE**
- **NO hay recuperación automática** de datos eliminados
- **Ejecutar solo en desarrollo** o con backup completo
- **Verificar permisos** del usuario del sistema

### 📋 Prerequisitos
1. **Usuario Super Admin** debe existir en el sistema
2. **Modelos base** deben estar populados:
   - `NivelSeguridad` (L1, L2, L3)
   - `NivelAcceso` (Alto, Medio, Bajo)
   - `ExtensionFichero` (pdf, doc, etc.)
   - `TipoFichero` (Carpeta, Archivo)
3. **Empleados con usuarios** asociados
4. **Centros y empresas** existentes

### 🔧 Configuración Recomendada
```bash
# Verificar prerequisitos
php artisan tinker
>>> \App\Models\User::role('Super Admin')->count()
>>> \App\Models\NivelSeguridad::count()
>>> \App\Models\NivelAcceso::count()

# Ejecutar con logging detallado
php artisan hr:seed-structure --force
```

## 📊 Verificación Post-Ejecución

### Comando Personalizado
El comando `php artisan hr:seed-structure` incluye estadísticas automáticas:
- Total de carpetas creadas
- Total de archivos generados
- Número de empleados procesados
- Elementos totales en la estructura

### Verificación Manual
```sql
-- Contar elementos HR
SELECT 
    COUNT(*) as total_elementos,
    SUM(CASE WHEN tipo_fichero_id = 1 THEN 1 ELSE 0 END) as carpetas,
    SUM(CASE WHEN tipo_fichero_id = 2 THEN 1 ELSE 0 END) as archivos
FROM folders 
WHERE path LIKE 'hr%';

-- Verificar estructura NestedSet
SELECT id, name, path, lft, rgt, depth 
FROM folders 
WHERE path LIKE 'hr%' 
ORDER BY lft;
```

## 🔄 Casos de Uso

### 1. Desarrollo Inicial
```bash
php artisan hr:seed-structure --force
```

### 2. Reset Completo
```bash
# En caso de corrupción o cambios estructurales
php artisan hr:seed-structure
```

### 3. Testing Automatizado
```bash
# En tests, usar directamente el seeder
$this->seed(FolderSeeder::class);
```

### 4. Migración de Estructura
```bash
# Después de cambios en el modelo
php artisan hr:seed-structure --force
```

## 🐛 Troubleshooting

### Error: "No se encontró usuario Super Admin"
```bash
# Crear usuario Super Admin
php artisan tinker
>>> $user = \App\Models\User::factory()->create(['email' => 'admin@test.com']);
>>> $user->assignRole('Super Admin');
```

### Error: "Niveles no encontrados"
```bash
# Ejecutar seeders de prerequisitos
php artisan db:seed --class=NivelSeguridadSeeder
php artisan db:seed --class=NivelAccesoSeeder
php artisan db:seed --class=TipoFicheroSeeder
```

### Estructura corrupta
```bash
# Limpiar manualmente y recrear
php artisan tinker
>>> \App\Models\Folder::where('path', 'like', 'hr%')->forceDelete();
>>> php artisan hr:seed-structure --force
```

## 📈 Futuras Mejoras

- [ ] **Backup automático** antes de limpiar
- [ ] **Restauración selectiva** de elementos
- [ ] **Configuración personalizable** de estructura
- [ ] **Importación desde archivos** de configuración
- [ ] **Validación de integridad** post-creación

---

**✅ El FolderSeeder está ahora completamente listo para uso en producción con limpieza automática y recreación robusta.**

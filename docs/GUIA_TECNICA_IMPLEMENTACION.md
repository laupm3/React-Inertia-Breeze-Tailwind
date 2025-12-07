# 🔧 Guía Técnica de Implementación - Sistema de Importación

## 📋 Arquitectura de Servicios

### Backend - Servicios de Importación

#### BaseImportService (Servicio Base)
```php
// app/Services/Import/BaseImportService.php
class BaseImportService 
{
    // Método principal genérico
    public function processImportGeneric(array $data, string $entity): array
    
    // Validación de duplicados automática
    protected function checkDuplicatesInDB(array $data, string $entity): array
    
    // Mapeo dinámico de campos
    protected function getFieldMapping(string $entity): array
    
    // Eventos dinámicos (ej: UsuarioCreado, EmpresaActualizada)
    protected function dispatchModelEvent(string $eventType, $model, string $entity): void
}
```

#### Servicios Específicos por Entidad
```php
// Ejemplo: app/Services/Import/UsuarioImportService.php
class UsuarioImportService extends BaseImportService
{
    // Procesamiento específico de usuarios
    protected function processRecord(array $data): array
    
    // Validaciones personalizadas
    protected function validateUserData(array $data): array
    
    // Lógica de negocio específica
    protected function createUser(array $validatedData): User
}
```

### Frontend - Componentes React

#### GenericImportDialog (Componente Universal)
```jsx
// resources/js/Components/Import/GenericImportDialog.jsx
export default function GenericImportDialog({
    entity,                    // Nombre de la entidad
    entityDisplayName,         // Nombre para mostrar
    isOpen,                   // Estado del modal
    onOpenChange,             // Función para cambiar estado
    onImportSuccess,          // Callback de éxito
    canImport,                // Permisos de importación
    canExport                 // Permisos de exportación
})
```

**Características principales:**
- **Estado limpio**: useEffect que limpia estado al cerrar modal
- **Cache de esquemas**: Evita llamadas HTTP repetidas
- **Validación dual**: Frontend + Backend
- **Memoización**: Funciones optimizadas con useCallback

#### ImportExportDropdown (Integración con DataTables)
```jsx
// resources/js/Components/App/DataTable/Components/Toolbar/ImportExportDropdown.jsx
export default function ImportExportDropdown({ entity }) {
    const { onDataRefresh } = useDataTable(); // Hook del contexto
    
    // Callback que refresca datos automáticamente
    const handleImportSuccess = () => {
        if (onDataRefresh) {
            onDataRefresh(); // Refresca la datatable
        }
    };
}
```

## 🔄 Flujo de Datos Completo

### 1. Carga de Esquema
```
Frontend → GET /api/v1/admin/import/{entity}/schema → Backend
Backend → Lee configuración de entidad → Responde JSON con campos
Frontend → Cachea esquema → Genera formulario dinámico
```

### 2. Descarga de Plantilla
```
Frontend → GET /api/v1/admin/import/{entity}/template → Backend
Backend → Genera Excel con campos + ejemplos → Responde archivo
Frontend → Descarga automática del archivo
```

### 3. Procesamiento de Importación
```
Frontend → POST /api/v1/admin/import/{entity} → Backend
Backend → Valida archivo → Procesa datos → Valida BD → Responde resultado
Frontend → Muestra errores O éxito → Auto-refresh datatable
```

## 🎯 Sistema de Validación

### Validación Frontend (GenericImportDialog.jsx)
```javascript
const validateDataWithSchema = useCallback((data) => {
    // Validaciones de formato
    if (field.type === 'email' && !isValidEmail(value)) {
        rowErrors.push('Email inválido');
    }
    
    // Validaciones de campos requeridos
    if (field.required && (!value || value.toString().trim() === '')) {
        rowErrors.push(`${field.label} es obligatorio`);
    }
    
    // Validaciones de select/opciones
    if (field.type === 'select' && field.options) {
        const normalizedValue = value?.toString().trim();
        const normalizedOptions = field.options.map(opt => opt?.toString().trim());
        if (!normalizedOptions.includes(normalizedValue)) {
            rowErrors.push(`Valor no válido para ${field.label}`);
        }
    }
}, [schema, entity]);
```

### Validación Backend (Servicios)
```php
protected function processRecord(array $data): array
{
    $errors = [];
    $fieldErrors = [];
    
    // Validación de campos obligatorios
    if (empty($data['email'])) {
        $errors[] = 'Email es obligatorio';
        $fieldErrors[] = 'email';
    }
    
    // Validación de formato
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Email inválido';
        $fieldErrors[] = 'email';
    }
    
    // Validación de unicidad
    if (User::where('email', $data['email'])->exists()) {
        $errors[] = 'Ya existe un usuario con este email';
        $fieldErrors[] = 'email';
    }
    
    return [
        'errors' => $errors,
        'fields' => array_unique($fieldErrors)
    ];
}
```

## 🔐 Sistema de Permisos

### Hook de Permisos (usePermissions.js)
```javascript
export const usePermissions = (entity) => {
    const [permissions, setPermissions] = useState({
        canImport: false,
        canExport: false,
        loading: true
    });
    
    useEffect(() => {
        if (!entity) return;
        
        // Una sola solicitud HTTP para ambos permisos
        axios.get(`/api/v1/user/permissions/${entity}`)
            .then(response => {
                setPermissions({
                    canImport: response.data.canImport,
                    canExport: response.data.canExport,
                    loading: false
                });
            });
    }, [entity]);
    
    return permissions;
};
```

### Controlador de Permisos (PermissionController.php)
```php
public function getEntityPermissions(Request $request, string $entity): JsonResponse
{
    $user = $request->user();
    
    // Mapeo dinámico desde permissions.json
    $mapping = $this->getPermissionMapping();
    $entityConfig = $mapping[$entity] ?? null;
    
    if (!$entityConfig) {
        return response()->json(['error' => 'Entidad no encontrada'], 404);
    }
    
    return response()->json([
        'canImport' => $user->can($entityConfig['import_permission']),
        'canExport' => $user->can($entityConfig['export_permission'])
    ]);
}
```

## 🚀 Optimizaciones de Rendimiento

### 1. Memoización de Funciones
```javascript
// Funciones críticas memoizadas
const handleFileUpload = useCallback(async (file) => {
    // Lógica de procesamiento de archivos
}, [entity, schema, validateDataWithSchema]);

const renderCellContent = useCallback(({ row, column, getValue }) => {
    // Renderizado optimizado de celdas
}, [errores, duplicados, schema, getFieldSuggestion]);
```

### 2. Cache de Esquemas
```javascript
const [schemaCache, setSchemaCache] = useState({});

const fetchSchema = useCallback(async () => {
    // Si ya tenemos el schema en cache, usarlo
    if (schemaCache[entity]) {
        setSchema(schemaCache[entity]);
        return;
    }
    
    // Solo hacer llamada HTTP si no está en cache
    const response = await axios.get(`/api/v1/admin/import/${entity}/schema`);
    const schemaData = response.data;
    
    // Guardar en cache para futuras consultas
    setSchemaCache(prev => ({
        ...prev,
        [entity]: schemaData
    }));
    
    setSchema(schemaData);
}, [entity, schemaCache]);
```

### 3. Limpieza de Estado
```javascript
// Limpiar estado cuando se cierra el modal
useEffect(() => {
    if (!isOpen) {
        // Limpiar todos los estados cuando se cierra el modal
        setPreviewData([]);
        setErrores([]);
        setDuplicados([]);
        setErroresBD([]);
        setFieldErrors([]);
        setIsLoading(false);
        setCurrentStep(0);
        setIsErrorDialogOpen(false);
        setIsGuideDialogOpen(false);
        setIsFormatDialogOpen(false);
        // No limpiamos el schema ni el cache para evitar recargas innecesarias
    }
}, [isOpen]);
```

## 📊 Integración con DataTables

### DataTableContext (Contexto de Datos)
```jsx
export const DataTableContextProvider = ({ 
    children, 
    onDataRefresh = null  // Función para refrescar datos
}) => {
    const contextValue = {
        // ...otros valores del contexto
        onDataRefresh  // Disponible para todos los componentes hijos
    };
    
    return (
        <DataTableContext.Provider value={contextValue}>
            {children}
        </DataTableContext.Provider>
    );
};
```

### Implementación en DataTablePortal
```jsx
export default function DataTablePortal() {
    const { fetchData } = useDataHandler(); // Hook específico de cada entidad
    
    return (
        <DataTableContextProvider onDataRefresh={fetchData}>
            <DataTable>
                <Toolbar>
                    <ImportExportDropdown entity="usuarios" />
                </Toolbar>
            </DataTable>
        </DataTableContextProvider>
    );
}
```

## 🎨 Manejo de Errores UX

### Mensajes Duales (Corto vs Completo)
```javascript
// Función para acortar mensajes en celdas
const shortenErrorMessage = (message, columnId) => {
    // Para Tipo Contrato específicamente
    if (columnId === 'Tipo Contrato (*)' || columnId === 'tipo_contrato_nombre') {
        if (message.includes('No se encontró un tipo de contrato con la clave') ||
            message.includes('Claves disponibles:')) {
            return 'Clave de tipo de contrato inválida';
        }
    }
    
    // Para campos con muchas opciones
    if (message.includes('debe ser uno de:') && message.length > 100) {
        const fieldName = columnId.replace(' (*)', '').toLowerCase();
        return `Valor no válido para ${fieldName}`;
    }
    
    // Para mensajes largos genéricos
    if (message.length > 80) {
        const words = message.split(' ');
        let shortMessage = '';
        for (let i = 0; i < words.length; i++) {
            if ((shortMessage + words[i]).length > 77) break;
            shortMessage += words[i] + ' ';
        }
        return shortMessage.trim() + '...';
    }
    
    return message;
};

// Uso: Mensaje corto en celda, completo en modal
const getCellError = (rowIdx, columnId) => {
    const fullError = getFullCellError(rowIdx, columnId);
    return fullError ? shortenErrorMessage(fullError, columnId) : null;
};
```

### Estados Visuales
```javascript
// Determinación de colores según tipo de error
let fieldColorClass = 'text-gray-700 dark:text-gray-300';
let backgroundColorClass = '';

if (serverFieldError) {
    // Error del servidor - amarillo
    fieldColorClass = 'text-amber-800 dark:text-amber-200';
    backgroundColorClass = 'bg-amber-50 dark:bg-amber-900/20';
} else if (cellError || hasFormatError) {
    // Error de validación - rojo
    fieldColorClass = 'text-red-700 dark:text-red-300';
    backgroundColorClass = 'bg-red-50 dark:bg-red-900/20';
} else if (isDuplicatedValue) {
    // Duplicado - naranja
    fieldColorClass = 'text-orange-700 dark:text-orange-300';
    backgroundColorClass = 'bg-orange-50 dark:bg-orange-900/20';
}
```

## 🔄 Sistema de Eventos

### Eventos Dinámicos (BaseImportService.php)
```php
protected function dispatchModelEvent(string $eventType, $model, string $entity): void
{
    $eventModelName = $this->getEventModelName($entity);
    $eventClass = "App\\Events\\{$eventModelName}\\{$eventModelName}{$eventType}";
    
    if (class_exists($eventClass)) {
        event(new $eventClass($model));
    }
}

private function getEventModelName(string $entity): string
{
    $mapping = [
        'users' => 'Usuario',      // User → Usuario (español)
        'empleados' => 'Empleado',
        'empresas' => 'Empresa',
        'centros' => 'Centro',
        // ...más mapeos
    ];
    
    return $mapping[$entity] ?? ucfirst(rtrim($entity, 's'));
}
```

Este sistema asegura que:
- Los eventos se disparen correctamente en español
- Sea fácil agregar nuevas entidades
- Mantenga consistencia en el naming

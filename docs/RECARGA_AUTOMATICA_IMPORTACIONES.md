# Implementación de Recarga Automática de Datos Después de Importaciones

## Problema Resuelto

Cuando se importaban datos exitosamente, la datatable no se actualizaba automáticamente y era necesario recargar la página para ver los nuevos registros.

## Solución Implementada

Se implementó un sistema de recarga automática que conecta el sistema de importación con el contexto de datos de cada entidad.

### Cambios Realizados

#### 1. **DataTableContext.jsx** - Añadir soporte para recarga de datos

```jsx
export const DataTableContextProvider = ({
    children,
    columnsDef,
    data: records = [],
    initialState = {},
    config = {},
    debug = false,
    viewContext = null,
    customToolbar = null,
    entity = 'empleados',
    onDataRefresh = null, // ← NUEVA PROP para refrescar datos
}) => {
    // ...resto del código...
    
    return (
        <DataTableContext.Provider value={{
            data,
            columns: columnsDef,
            table,
            pageSizeOptions,
            debug,
            filterColumns,
            totalRows,
            setGlobalFilter: table.setGlobalFilter,
            viewContext,
            customToolbar,
            entity,
            onDataRefresh, // ← NUEVO: Pasamos la función al contexto
        }}>
            {children}
        </DataTableContext.Provider>
    );
};
```

#### 2. **ImportExportDropdown.jsx** - Usar la función de recarga

```jsx
export default function ImportExportDropdown({ entity = 'empleados' }) {
  const { table, onDataRefresh } = useDataTable(); // ← Obtener onDataRefresh del contexto
  
  // ...resto del código...
  
  <GenericImportDialog
    // ...otras props...
    onImportSuccess={(result) => {
      // Refrescar los datos desde el contexto padre si está disponible
      if (onDataRefresh && typeof onDataRefresh === 'function') {
        onDataRefresh(); // ← NUEVO: Llamar a la función de recarga
      }
      
      // Resetear la tabla para limpiar filtros y selecciones
      if (table && typeof table.reset === 'function') {
        table.reset();
      }
      
      toast.success(`${getEntityDisplayName(entity)} importados correctamente`);
    }}
    // ...resto de props...
  />
}
```

#### 3. **DataTablePortal.jsx** (Ejemplo para Asignaciones) - Pasar la función de recarga

```jsx
export default function DataTablePortal({ }) {
    const {
        data,
        loading,
        fetchData // ← Obtener fetchData del contexto de datos
    } = useDataHandler();

    // ...resto del código...

    return (
        <DataTableContextProvider
            key={dataId}
            data={data}
            columnsDef={columns}
            debug={false}
            entity="asignaciones"
            onDataRefresh={fetchData} // ← NUEVO: Pasar fetchData como onDataRefresh
            config={{
                getRowId: (row) => row.id,
            }}
            initialState={{}}
            viewContext={viewContext}
        >
            <BlockCard title={'Asignaciones Administración'}>
                <DataTable />
            </BlockCard>
        </DataTableContextProvider>
    )
}
```

## Implementación para Otras Entidades

### Para implementar en cualquier entidad, sigue estos pasos:

#### 1. **Verificar que existe un contexto de datos**

Cada entidad debe tener un contexto similar a `DataHandlerContext` con:
- `data`: Array de registros
- `fetchData`: Función para cargar datos desde el servidor
- `loading`: Estado de carga

#### 2. **Actualizar el DataTablePortal de la entidad**

```jsx
// Ejemplo para Centros, Empleados, etc.
export default function DataTablePortal({ }) {
    const {
        data,
        loading,
        fetchData  // ← Asegúrate de obtener fetchData
    } = useDataHandler(); // o el contexto específico de la entidad

    return (
        <DataTableContextProvider
            // ...otras props...
            onDataRefresh={fetchData} // ← Agregar esta línea
        >
            <DataTable />
        </DataTableContextProvider>
    )
}
```

#### 3. **Si la entidad NO tiene contexto de datos**

Si la entidad usa datos directamente desde Inertia/props, crear una función de recarga:

```jsx
// Para entidades que usan router.reload()
import { router } from '@inertiajs/react';

export default function DataTablePortal({ data }) {
    const refreshData = () => {
        router.reload({ only: ['data'] }); // Solo recargar los datos
    };

    return (
        <DataTableContextProvider
            data={data}
            onDataRefresh={refreshData} // ← Función para recargar con Inertia
            // ...otras props...
        >
            <DataTable />
        </DataTableContextProvider>
    )
}
```

## Beneficios de la Implementación

### ✅ **Experiencia de Usuario Mejorada**
- Los datos se actualizan automáticamente después de importar
- No es necesario recargar la página manualmente
- Feedback visual inmediato del éxito de la importación

### ✅ **Consistencia**
- Todas las entidades funcionan de la misma manera
- El patrón es reutilizable y escalable

### ✅ **Flexibilidad**
- Compatible con diferentes tipos de contextos de datos
- Funciona tanto con contextos custom como con Inertia.js

## Entidades a Actualizar

- [ ] **Centros** - Verificar contexto y agregar `onDataRefresh`
- [ ] **Empleados** - Verificar contexto y agregar `onDataRefresh`
- [ ] **Empresas** - Verificar contexto y agregar `onDataRefresh`
- [ ] **Departamentos** - Verificar contexto y agregar `onDataRefresh`
- [ ] **Contratos** - Verificar contexto y agregar `onDataRefresh`
- [ ] **Usuarios** - Verificar contexto y agregar `onDataRefresh`
- [ ] **Horarios** - Verificar contexto y agregar `onDataRefresh`
- [ ] **Turnos** - Verificar contexto y agregar `onDataRefresh`
- [ ] **Roles** - Verificar contexto y agregar `onDataRefresh`
- [x] **Asignaciones** - ✅ Ya implementado como ejemplo

## Testing

Para probar que funciona correctamente:

1. Ir a cualquier entidad (ej: Asignaciones)
2. Hacer clic en "Importar" desde el dropdown
3. Subir un archivo Excel con datos válidos
4. Verificar que la importación sea exitosa
5. **Verificar que los nuevos datos aparezcan inmediatamente en la tabla sin recargar la página**

El sistema ahora recarga automáticamente los datos después de cada importación exitosa.

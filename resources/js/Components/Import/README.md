# Componentes de Importación

Esta carpeta contiene todos los componentes relacionados con la funcionalidad de importación de datos.

## Estructura de archivos

### `GenericImportDialog.jsx`
Componente principal para el proceso completo de importación. Incluye:
- Descarga de plantillas
- Carga de archivos (drag & drop)
- Procesamiento de importación
- Manejo de errores
- Vista previa de datos (solo lectura)

**Props:**
- `entity`: Nombre de la entidad (ej: 'empleados', 'usuarios')
- `entityDisplayName`: Nombre para mostrar (ej: 'Empleados', 'Usuarios')
- `isOpen`: Estado del modal
- `onOpenChange`: Función para cambiar el estado
- `onImportSuccess`: Callback cuando la importación es exitosa
- `onImportError`: Callback cuando hay errores (opcional)
- `templateRoute`: Ruta personalizada para descargar plantillas (opcional)
- `validationOptions`: Opciones de validación específicas (opcional)

### `GenerarPlantillaImport.jsx`
Componente específico para descargar plantillas de importación. Se usa cuando solo necesitas un botón de descarga sin el modal completo.

**Props:**
- `entity`: Nombre de la entidad
- `displayName`: Nombre para mostrar
- `format`: Formato del archivo ('xlsx' o 'csv')
- `className`: Clases CSS adicionales
- `showIcon`: Mostrar icono de descarga
- `showText`: Mostrar texto del botón
- `variant`: Variante del botón

## Uso en ImportExportDropdown

El `ImportExportDropdown` ahora usa `GenericImportDialog` para el botón de "Importar". El flujo es:

1. Usuario hace clic en "Importar" en el dropdown
2. Se abre `GenericImportDialog` con la entidad correspondiente
3. Usuario puede descargar plantilla o cargar archivo
4. Se procesa la importación
5. Se muestran resultados/errores
6. Se recarga la tabla si la importación fue exitosa

## Rutas del backend

El sistema usa rutas dinámicas basadas en la entidad:
- `GET /admin/{entity}/import/template` - Descargar plantilla
- `POST /admin/{entity}/import/process` - Procesar importación
- `GET /admin/{entity}/import/schema` - Obtener esquema de validación

## Utilidades

### `@/utils/importErrorUtils.js`
Contiene funciones para manejar errores de importación:
- `handleImportResponse`: Maneja respuestas exitosas y con errores
- `handleImportError`: Maneja errores de catch
- `processValidationErrors`: Procesa errores de validación
- `showImportErrorsInToast`: Muestra errores en toast

## Migración

### De ImportEmpleados a GenericImportDialog

El componente `ImportEmpleados` específico ha sido reemplazado por `GenericImportDialog` genérico. Los cambios principales:

1. **Eliminado**: `ImportEmpleados.jsx` (ya no se usa)
2. **Actualizado**: `ImportExportDropdown.jsx` para usar `GenericImportDialog`
3. **Mantenido**: `GenerarPlantillaImport.jsx` para casos de solo descarga

### Archivos afectados

- `resources/js/Components/App/DataTable/Components/Toolbar/ImportExportDropdown.jsx`
- `resources/js/Components/Import/GenericImportDialog.jsx`
- `resources/js/utils/importErrorUtils.js` (corregido casing)

## Consideraciones

- Todos los componentes de importación ahora están en `@/Components/Import`
- Las utilidades están en `@/utils/importErrorUtils.js` (con minúsculas)
- El sistema es completamente dinámico y funciona con cualquier entidad
- Los errores se manejan de forma consistente en toda la aplicación 
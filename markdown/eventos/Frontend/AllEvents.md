# Componente AllEvents (Todos los Eventos)

## Descripción General
Interfaz principal para la visualización y gestión de eventos del sistema. Permite a los usuarios ver, filtrar, crear, editar y eliminar eventos según sus permisos.

## Características Principales
- Visualización de eventos en formato calendario
- Lista completa de eventos con filtros
- Creación de nuevos eventos
- Visualización detallada de eventos existentes
- Edición y eliminación de eventos
- Filtrado por tipo de evento y búsqueda por nombre

## Componentes del Sistema

### Componentes Principales
- `AllEvents.jsx`: Componente principal que integra todas las funcionalidades
  - Estados:
    - `events`: Almacena todos los eventos del usuario
    - `eventTypes`: Tipos de eventos disponibles
    - `selectedDate`: Fecha seleccionada en el calendario
    - `dynamicColorMap`: Mapa de colores para los tipos de eventos
    - `selectedEvent`: Evento seleccionado para ver/editar
    - `searchTerm`: Término de búsqueda para filtrar eventos
    - `selectedEventType`: Filtro por tipo de evento

### Componentes Auxiliares
- `Calendario`: Visualización de eventos en formato de calendario mensual
- `CreateUpdateDialog`: Modal para creación y edición de eventos
- `ViewEventDialog`: Modal para visualizar detalles del evento
- `FilterEventType`: Selector de filtro por tipo de evento
- `SearchEvents`: Buscador de eventos por nombre

## Flujo de Datos

### Carga de Datos
1. Al montar el componente (`useEffect`):
   - Se cargan todos los eventos del usuario (`fetchEvents`)
   - Se cargan los tipos de eventos disponibles (`fetchEventTypes`)
   - Se generan dinámicamente los estilos para cada tipo de evento (`generateColorMap`)

### Interacción con Eventos
1. **Visualización**:
   - Los eventos se muestran en el calendario y en la lista lateral
   - Al hacer clic en un evento se abre `ViewEventDialog` con los detalles
   
2. **Creación**:
   - Doble clic en una fecha del calendario abre `CreateUpdateDialog` con la fecha preseleccionada
   - Se completan los datos y se envían mediante `handleCreateEvent`
   - Se actualiza automáticamente la lista de eventos

3. **Edición**:
   - Desde la vista detallada se puede acceder a la edición
   - Se utiliza el mismo diálogo de creación pero con datos precargados
   - Se actualizan los datos mediante `handleUpdateEvent`

4. **Eliminación**:
   - Desde la vista detallada se puede eliminar el evento
   - Se actualiza la lista de eventos mediante `handleDeleteEvent`

## Filtrado de Eventos
- La función `filteredEvents` (useMemo) filtra los eventos basándose en:
  - Tipo de evento seleccionado
  - Término de búsqueda en el nombre

## Estructura Visual
1. **Layout Principal**: Diseño responsive que adapta la visualización según el tamaño de pantalla
   - Vista móvil: Componentes apilados verticalmente
   - Vista escritorio: Calendario a la izquierda (40%) y lista a la derecha (60%)

2. **Calendario**:
   - Muestra el mes actual con los eventos marcados con el color de su tipo
   - Permite navegar entre meses y seleccionar fechas

3. **Lista de Eventos**:
   - Buscador en la parte superior
   - Filtros por tipo de evento
   - Listado de eventos con:
     - Indicador de color según tipo
     - Título y descripción truncada
     - Fecha y hora del evento

## Integración con la API
| Endpoint | Método | Ruta | Acción |
|----------|--------|------|--------|
| Obtener eventos | GET | api.v1.user.eventos.index | Cargar todos los eventos del usuario |
| Obtener tipos | GET | api.v1.user.eventos.tipos | Cargar tipos de eventos disponibles |
| Crear evento | POST | user.eventos.store | Crear un nuevo evento |
| Actualizar evento | PUT | user.eventos.update | Actualizar un evento existente |

## Funciones de Utilidad

### `generateColorMap`
- Genera clases CSS dinámicas para cada tipo de evento
- Crea estilos para: fondo, texto, bordes y puntos indicadores
- Utiliza el color hexadecimal definido en cada tipo de evento

### `extractTextFromDescription`
- Procesa la descripción del evento que puede estar en diferentes formatos
- Extrae texto plano de datos en formato JSON (editor de texto enriquecido)
- Trunca la descripción para la vista previa

## Consideraciones Técnicas
1. Uso de `useMemo` para optimizar el filtrado de eventos
2. Inyección dinámica de estilos CSS para los colores de eventos
3. Manejo de estado local para datos y UI
4. Comunicación con API mediante Axios
5. Responsive design con Tailwind CSS
6. Integración con AuthenticatedLayout

## Estado de Implementación
- ✓ Visualización de calendario con eventos
- ✓ Lista de eventos con filtrado
- ✓ Creación y edición de eventos
- ✓ Vista detallada de eventos
- ✓ Eliminación de eventos
- ✓ Estilos dinámicos por tipo de evento

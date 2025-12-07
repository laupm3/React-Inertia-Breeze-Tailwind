# Componente Events (Gestión de Eventos)

## Descripción General
Este componente proporciona una interfaz de calendario interactiva que permite a los usuarios visualizar, crear, editar y eliminar eventos. Integra funcionamiento en tiempo real para actualizaciones instantáneas de eventos.

## Características Principales
- Calendario interactivo con visualización mensual
- Creación de eventos con selección de fecha mediante doble clic
- Visualización detallada de eventos existentes
- Edición y eliminación de eventos según permisos
- Asociación de eventos a diferentes entidades (Equipos, Empresas, Departamentos)
- Integración con notificaciones en tiempo real
- Editor de texto enriquecido para descripciones de eventos (Yoopta)

## Estructura de Componentes

### Componente Principal
- `Events.jsx`: Coordina toda la funcionalidad de gestión de eventos
  - Estados principales:
    - `events`: Lista de eventos cargados desde el servidor
    - `selectedEvent`: Evento actualmente seleccionado
    - `selectedDate`: Fecha seleccionada en el calendario
    - `eventTypes`: Tipos de eventos disponibles en el sistema

### Componentes Secundarios
- `CreateUpdateDialog`: Modal para creación/edición de eventos
  - Permite configurar todos los detalles del evento
  - Reutilizable para creación y edición
  
- `ViewEventDialog`: Modal para visualización detallada de eventos
  - Muestra toda la información del evento
  - Proporciona opciones de edición/eliminación

- `SwitcherEventType`: Selector de tipos de eventos
  - Muestra visualmente los diferentes tipos disponibles
  - Genera estilos dinámicos basados en los colores de cada tipo

- `UserEventSelector`: Selector de participantes para eventos
  - Permite añadir/eliminar usuarios como participantes

- `EntitySelector`: Selector de entidades relacionadas
  - Permite asociar el evento a equipos, empresas o departamentos

## Flujo de Funcionamiento

### Carga Inicial
1. Al montar el componente:
   - Se cargan todos los eventos del usuario mediante API
   - Se obtienen los tipos de eventos disponibles
   - Se configura la escucha de eventos en tiempo real

### Creación de Eventos
1. Usuario hace doble clic en una fecha del calendario
2. Se abre `CreateUpdateDialog` con la fecha preseleccionada
3. Se completan los campos requeridos:
   - Título del evento
   - Hora de inicio
   - Tipo de evento
   - Descripción (con editor enriquecido)
   - Selección de participantes
   - Entidad relacionada (opcional, según tipo)
4. Al enviar, se crea el evento y se actualiza el calendario

### Visualización de Eventos
1. Al hacer clic en un evento del calendario o de la lista:
   - Se abre `ViewEventDialog` con los detalles completos
   - Se muestra información sobre creador y participantes
   - Se renderizan descripciones enriquecidas con `Viewer`

### Edición de Eventos
1. Desde la vista de detalles, usuarios con permisos pueden editar
2. Se abre el mismo diálogo usado para creación, pero con datos precargados
3. Los cambios se guardan y actualizan en tiempo real

### Eliminación de Eventos
1. Disponible desde la vista detallada para usuarios con permisos
2. Incluye estado de confirmación para prevenir eliminaciones accidentales
3. La lista se actualiza automáticamente tras la eliminación

## Integración con Tiempo Real
- Uso de `useNotifications` para recibir eventos en tiempo real
- Actualización automática cuando otros usuarios crean/modifican eventos
- Sistema de notificaciones tipo toast para nuevos eventos

## Manejo de Datos

### Estructura de un Evento
```javascript
{
  id: number,
  nombre: string,
  descripcion: string | object, // Puede ser JSON para editor enriquecido
  fecha_inicio: string,
  hora_inicio: string,
  tipo_evento: {
    id: number,
    nombre: string,
    color: string
  },
  creador: {
    id: number,
    name: string
  },
  users: array, // Participantes
  can_manage: boolean, // Permiso para editar/eliminar
  entity/team/empresa/departamento: object // Entidad relacionada
}
```

### Parseo de Descripciones
- Las descripciones utilizan un formato JSON para el editor enriquecido
- El sistema maneja automáticamente la conversión entre formatos
- Renderiza correctamente tanto en la vista de calendario como en detalles

## Integración con APIs

| Endpoint | Método | Ruta | Descripción |
|----------|--------|------|-------------|
| Obtener eventos | GET | api.v1.user.eventos.index | Lista todos los eventos del usuario |
| Obtener tipos | GET | api.v1.user.eventos.tipos | Obtiene los tipos de eventos disponibles |
| Crear evento | POST | user.eventos.store | Crea un nuevo evento |
| Actualizar evento | PUT | user.eventos.update | Actualiza un evento existente |
| Eliminar evento | DELETE | user.eventos.destroy | Elimina un evento |
| Obtener equipos | GET | api.v1.user.eventos.teams | Lista equipos para asociar |
| Obtener empresas | GET | api.v1.user.eventos.empresas | Lista empresas para asociar |
| Obtener departamentos | GET | api.v1.user.eventos.departamentos | Lista departamentos para asociar |

## Características de Accesibilidad
- Eventos visualmente distintos por color según su tipo
- Gestión de permisos para editar/eliminar según el rol del usuario
- Interfaz adaptable a modo claro/oscuro
- Soporte para descripción de eventos con formato enriquecido

## Componente de Notificaciones
- `NotificationEvent.jsx`: Gestiona notificaciones para eventos de calendario
  - Muestra toast notifications cuando llegan nuevos eventos
  - Formatea correctamente fecha, hora y descripción del evento
  - Proporciona navegación directa al calendario desde la notificación

## Desafíos Técnicos Resueltos
1. **Gestión de estado compleja**:
   - Coordinación entre múltiples modales y selecciones
   - Sincronización entre vista de calendario y lista de eventos

2. **Parseo bidireccional de descripciones**:
   - Conversión entre texto plano y formato JSON del editor
   - Manejo de fallbacks para formatos incorrectos

3. **Sincronización en tiempo real**:
   - Integración con WebSockets para actualizaciones instantáneas
   - Fusión coherente de datos locales con actualizaciones remotas

4. **Gestión de entidades relacionadas**:
   - Selector dinámico según el tipo de evento
   - Validación de relaciones antes de envío

## Estado de Implementación
- ✓ Calendario interactivo funcional
- ✓ CRUD completo de eventos
- ✓ Editor de texto enriquecido
- ✓ Selección de participantes
- ✓ Asociación con entidades
- ✓ Notificaciones en tiempo real
- ✓ Gestión de permisos por evento

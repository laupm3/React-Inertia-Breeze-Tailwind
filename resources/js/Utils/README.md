# Utilidades de Ordenamiento de Eventos

Este módulo proporciona funciones utilitarias para ordenar y procesar eventos en la aplicación. Estas funciones están diseñadas para ser reutilizadas en diferentes páginas y componentes.

## Importación

```javascript
// Importar todas las utilidades
import { 
  ordenarEventos, 
  TIPOS_ORDENAMIENTO, 
  obtenerEventosPorFecha,
  procesarEventos,
  separarEventosPorFecha,
  ordenarEventosAscendente,
  ordenarEventosDescendente
} from '@/utils/eventSorting';

// O importar desde el índice
import { ordenarEventos, TIPOS_ORDENAMIENTO } from '@/utils';
```

## Funciones Principales

### `procesarEventos(eventos, opciones)`

Función principal que separa y ordena eventos en futuros y pasados.

```javascript
const eventosOriginales = [
  { id: 1, nombre: 'Evento 1', fecha: '25/12/2024', hora: '10:00' },
  { id: 2, nombre: 'Evento 2', fecha: '20/11/2024', hora: '15:00' },
  // ... más eventos
];

const { futuros, pasados } = procesarEventos(eventosOriginales, {
  campoFecha: 'fecha',
  campoHora: 'hora',
  ordenarFuturosAsc: true,
  ordenarPasadosDesc: true
});

console.log('Eventos futuros ordenados:', futuros);
console.log('Eventos pasados ordenados:', pasados);
```

### `ordenarEventos(eventos, tipo, campos)`

Función genérica para ordenar eventos según diferentes criterios.

```javascript
// Ordenar por fecha ascendente
const eventosOrdenados = ordenarEventos(eventos, TIPOS_ORDENAMIENTO.FECHA_ASC);

// Ordenar por fecha y hora descendente
const eventosOrdenados = ordenarEventos(
  eventos, 
  TIPOS_ORDENAMIENTO.FECHA_HORA_DESC,
  { fecha: 'fecha_inicio', hora: 'hora_inicio' }
);
```

### `obtenerEventosPorFecha(eventos, fecha, campoFecha, campoHora)`

Filtra eventos para una fecha específica y los ordena por hora.

```javascript
const fechaSeleccionada = new Date('2024-12-25');
const eventosDelDia = obtenerEventosPorFecha(
  eventos, 
  fechaSeleccionada,
  'fecha_inicio',
  'hora_inicio'
);
```

## Tipos de Ordenamiento Disponibles

```javascript
TIPOS_ORDENAMIENTO = {
  FECHA_ASC: 'fecha_asc',        // Fecha ascendente (más antiguos primero)
  FECHA_DESC: 'fecha_desc',      // Fecha descendente (más recientes primero)
  FECHA_HORA_ASC: 'fecha_hora_asc',   // Fecha y hora ascendente
  FECHA_HORA_DESC: 'fecha_hora_desc'  // Fecha y hora descendente
}
```

## Ejemplos de Uso en Componentes React

### En una página de eventos (AllEvents.jsx)

```javascript
import { useState, useMemo } from 'react';
import { procesarEventos, ordenarEventos, TIPOS_ORDENAMIENTO } from '@/utils';

function AllEvents() {
  const { events } = useEvents();
  const [tipoOrdenamiento, setTipoOrdenamiento] = useState(TIPOS_ORDENAMIENTO.FECHA_ASC);

  // Procesar eventos automáticamente
  const eventosProcessados = useMemo(() => {
    return procesarEventos(events, {
      campoFecha: 'fecha_inicio',
      campoHora: 'hora_inicio'
    });
  }, [events]);

  // O usar ordenamiento personalizado
  const eventosOrdenados = useMemo(() => {
    return ordenarEventos(events, tipoOrdenamiento, {
      fecha: 'fecha_inicio',
      hora: 'hora_inicio'
    });
  }, [events, tipoOrdenamiento]);

  return (
    <div>
      {/* Selector de ordenamiento */}
      <select 
        value={tipoOrdenamiento} 
        onChange={(e) => setTipoOrdenamiento(e.target.value)}
      >
        <option value={TIPOS_ORDENAMIENTO.FECHA_ASC}>Fecha Ascendente</option>
        <option value={TIPOS_ORDENAMIENTO.FECHA_DESC}>Fecha Descendente</option>
        <option value={TIPOS_ORDENAMIENTO.FECHA_HORA_ASC}>Fecha y Hora Ascendente</option>
      </select>

      {/* Mostrar eventos futuros */}
      <h2>Eventos Próximos</h2>
      {eventosProcessados.futuros.map(evento => (
        <EventCard key={evento.id} event={evento} />
      ))}

      {/* Mostrar eventos pasados */}
      <h2>Eventos Pasados</h2>
      {eventosProcessados.pasados.map(evento => (
        <EventCard key={evento.id} event={evento} />
      ))}
    </div>
  );
}
```

### En un componente de calendario

```javascript
import { obtenerEventosPorFecha } from '@/utils';

function Calendario({ eventos }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const eventosDelDia = useMemo(() => {
    return obtenerEventosPorFecha(
      eventos, 
      fechaSeleccionada,
      'fecha_inicio',
      'hora_inicio'
    );
  }, [eventos, fechaSeleccionada]);

  return (
    <div>
      {/* Calendario aquí */}
      
      {/* Lista de eventos del día seleccionado */}
      <div>
        <h3>Eventos del {fechaSeleccionada.toLocaleDateString()}</h3>
        {eventosDelDia.map(evento => (
          <div key={evento.id}>
            {evento.nombre} - {evento.hora_inicio}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Formatos de Fecha Soportados

Las utilidades pueden manejar diferentes formatos de fecha:

- **DD/MM/YYYY**: Formato español típico (25/12/2024)
- **YYYY-MM-DD**: Formato ISO estándar (2024-12-25)

## Campos Personalizables

Puedes especificar diferentes nombres de campos según tu estructura de datos:

```javascript
// Si tus eventos usan campos diferentes
const opciones = {
  campoFecha: 'date_start',
  campoHora: 'time_start'
};

const resultado = procesarEventos(eventos, opciones);
```

## Casos de Uso Recomendados

1. **Páginas de eventos**: Para mostrar eventos futuros y pasados ordenados
2. **Calendarios**: Para obtener eventos de un día específico
3. **Listados**: Para ordenar eventos según diferentes criterios
4. **Dashboards**: Para mostrar próximos eventos ordenados por prioridad
5. **Búsquedas**: Para ordenar resultados de búsqueda de eventos

## Beneficios

- ✅ **Reutilizable**: Una sola implementación para toda la aplicación
- ✅ **Consistente**: Comportamiento uniforme de ordenamiento
- ✅ **Flexible**: Configuración de campos y tipos de ordenamiento
- ✅ **Performante**: Uso de spread operator para no mutar arrays originales
- ✅ **Documentado**: Funciones bien documentadas con JSDoc

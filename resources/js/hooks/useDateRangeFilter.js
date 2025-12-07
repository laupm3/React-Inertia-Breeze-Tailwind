import { isWithinInterval, parseISO, isValid, startOfDay, endOfDay, isSameDay, isAfter, isBefore } from "date-fns";
import { useState, useMemo } from "react";

// Constantes para los tipos de filtro
const DATE_FILTER_TYPES = {
  BETWEEN: 'between',
  AFTER: 'after', 
  BEFORE: 'before',
  EXACT: 'exact'
};

/**
 * Función para filtrar eventos por rango de fechas
 * @param {Array} events - Array de eventos
 * @param {Object} dateRange - Objeto con from, to y filterType para el rango de fechas
 * @returns {Array} - Array de eventos filtrados
 */
export const filterEventsByDateRange = (events, dateRange) => {
  if (!dateRange?.from || !Array.isArray(events)) {
    return events;
  }

  return events.filter(event => {
    // Intentar obtener la fecha del evento
    let eventDate = null;
    
    // Verificar diferentes formatos de fecha que puede tener el evento
    if (event.fecha_inicio) {
      if (typeof event.fecha_inicio === 'string') {
        eventDate = parseISO(event.fecha_inicio);
      } else if (event.fecha_inicio instanceof Date) {
        eventDate = event.fecha_inicio;
      }
    }

    // Si no pudimos obtener una fecha válida, excluir el evento
    if (!eventDate || !isValid(eventDate)) {
      return false;
    }

    // Normalizar las fechas al inicio del día para comparación
    const eventDateStart = startOfDay(eventDate);
    const fromDateStart = startOfDay(dateRange.from);

    // Determinar el tipo de filtro
    const filterType = dateRange.filterType || DATE_FILTER_TYPES.BETWEEN;

    try {
      switch (filterType) {
        case DATE_FILTER_TYPES.EXACT:
          // Fecha exacta: el evento debe ser del mismo día
          return isSameDay(eventDateStart, fromDateStart);

        case DATE_FILTER_TYPES.AFTER:
          // Después de: el evento debe ser después o igual a la fecha (incluida)
          return eventDateStart >= fromDateStart;

        case DATE_FILTER_TYPES.BEFORE:
          // Antes de: el evento debe ser antes de la fecha (no incluida)
          return eventDateStart < fromDateStart;

        case DATE_FILTER_TYPES.BETWEEN:
        default:
          // Entre fechas: si solo hay 'from', actúa como 'después de'
          if (!dateRange.to) {
            return eventDateStart >= fromDateStart;
          }
          
          // Si hay ambas fechas, verificar que esté dentro del rango (inclusivo)
          const toDateEnd = endOfDay(dateRange.to);
          return isWithinInterval(eventDateStart, {
            start: fromDateStart,
            end: toDateEnd
          });
      }
    } catch (error) {
      console.error('Error al filtrar por fecha:', error);
      return false;
    }
  });
};

/**
 * Hook personalizado para manejar el filtro de fechas
 * @param {Array} events - Array de eventos original
 * @returns {Object} - Objeto con eventos filtrados y funciones para manejar el filtro
 */
export const useDateRangeFilter = (events) => {
  const [dateRange, setDateRange] = useState(null);

  const filteredEvents = useMemo(() => {
    return filterEventsByDateRange(events, dateRange);
  }, [events, dateRange]);

  const clearDateFilter = () => {
    setDateRange(null);
  };

  return {
    dateRange,
    setDateRange,
    filteredEvents,
    clearDateFilter,
    hasDateFilter: !!dateRange?.from
  };
};

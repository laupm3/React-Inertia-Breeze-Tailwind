import { useMemo } from 'react';
import { 
    getEventsForDay, 
    filterEventsByDate, 
    sortEvents, 
    processEvents,
    separateEventsByDate,
    SORT_TYPES,
    formatDateDMY,
    formatDateSpanish,
    getDayOfWeekSpanish,
    isSameDay
} from '@/utils/eventDateUtils';

/**
 * Hook personalizado para utilidades de eventos
 * Centraliza la lógica común de manejo de eventos
 * @param {Array} events - Array de eventos
 * @param {Object} options - Opciones de configuración
 */
export const useEventUtils = (events = [], options = {}) => {
    const {
        dateField = 'fecha_inicio',
        timeField = 'hora_inicio',
        futureSortType = SORT_TYPES.DATETIME_ASC,
        pastSortType = SORT_TYPES.DATETIME_DESC
    } = options;

    // Procesamiento de eventos separados por fecha
    const processedEvents = useMemo(() => {
        return processEvents(events, {
            dateField,
            timeField,
            futureSortType,
            pastSortType
        });
    }, [events, dateField, timeField, futureSortType, pastSortType]);

    // Función para obtener eventos de un día específico
    const getEventsForSelectedDate = useMemo(() => {
        return (selectedDate) => {
            return getEventsForDay(events, selectedDate, dateField, timeField);
        };
    }, [events, dateField, timeField]);

    // Función para filtrar eventos por rango de fechas
    const filterEventsByDateRange = useMemo(() => {
        return (dateRange) => {
            if (!dateRange?.from) return events;
            
            return events.filter(event => {
                const eventDate = new Date(event[dateField]);
                const fromDate = new Date(dateRange.from);
                const toDate = dateRange.to ? new Date(dateRange.to) : fromDate;
                
                return eventDate >= fromDate && eventDate <= toDate;
            });
        };
    }, [events, dateField]);

    // Función para buscar eventos por texto
    const searchEvents = useMemo(() => {
        return (searchTerm, searchFields = ['nombre', 'descripcion']) => {
            if (!searchTerm) return events;
            
            const term = searchTerm.toLowerCase();
            return events.filter(event => {
                return searchFields.some(field => {
                    const value = event[field];
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(term);
                    }
                    if (typeof value === 'object' && value !== null) {
                        return JSON.stringify(value).toLowerCase().includes(term);
                    }
                    return false;
                });
            });
        };
    }, [events]);

    // Función para obtener estadísticas de eventos
    const getEventStats = useMemo(() => {
        return () => {
            const stats = {
                total: events.length,
                future: processedEvents.future.length,
                past: processedEvents.past.length,
                today: filterEventsByDate(events, new Date(), dateField).length
            };
            
            // Estadísticas por tipo de evento
            const byType = {};
            events.forEach(event => {
                const typeId = event.tipo_evento_id || event.tipo_evento?.id;
                if (typeId) {
                    byType[typeId] = (byType[typeId] || 0) + 1;
                }
            });
            
            stats.byType = byType;
            return stats;
        };
    }, [events, processedEvents, dateField]);

    return {
        // Eventos procesados
        allEvents: events,
        futureEvents: processedEvents.future,
        pastEvents: processedEvents.past,
        
        // Funciones de utilidad
        getEventsForSelectedDate,
        filterEventsByDateRange,
        searchEvents,
        getEventStats,
        
        // Funciones de formateo (re-exportadas para conveniencia)
        formatDate: formatDateDMY,
        formatDateSpanish,
        getDayOfWeek: getDayOfWeekSpanish,
        isSameDay,
        
        // Tipos y constantes
        SORT_TYPES,
        
        // Funciones de ordenamiento
        sortEvents: (sortType, fields) => sortEvents(events, sortType, fields),
    };
};

export default useEventUtils;

/**
 * Utilidades para manejo de fechas y eventos
 * Funciones reutilizables para ordenar, filtrar y formatear fechas en componentes de eventos
 */

/**
 * Parsea una fecha que puede venir en diferentes formatos
 * @param {string|Date} dateInput - Fecha en formato string o Date object
 * @returns {Date} - Objeto Date parseado
 */
export const parseDate = (dateInput) => {
    if (!dateInput) return new Date();
    
    if (dateInput instanceof Date) {
        return dateInput;
    }
    
    // Si contiene '/', asumimos formato DD/MM/YYYY
    if (typeof dateInput === 'string' && dateInput.includes('/')) {
        const [day, month, year] = dateInput.split('/');
        return new Date(year, month - 1, day);
    }
    
    // Para otros formatos, usar el constructor Date normal
    return new Date(dateInput);
};

/**
 * Verifica si una fecha es válida
 * @param {Date} date - Fecha a verificar
 * @returns {boolean} - True si la fecha es válida
 */
export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Formatea una fecha al formato DD/MM/YYYY
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDateDMY = (date) => {
    if (!date) return '';
    const d = parseDate(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha al formato YYYY-MM-DD
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDateYMD = (date) => {
    if (!date) return '';
    const d = parseDate(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha al formato español localizado
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} - Fecha formateada (ej: "12 oct 2025")
 */
export const formatDateSpanish = (dateString) => {
    if (!dateString) return "";
    const date = parseDate(dateString);
    return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
};

/**
 * Obtiene el nombre del día de la semana en español
 * @param {string|Date} dateString - Fecha
 * @returns {string} - Nombre del día capitalizado (ej: "Domingo")
 */
export const getDayOfWeekSpanish = (dateString) => {
    if (!dateString) return "";
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return ""; 
    let day = date.toLocaleDateString('es-ES', { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
};

/**
 * Compara si dos fechas son el mismo día
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha
 * @returns {boolean} - True si son el mismo día
 */
export const isSameDay = (date1, date2) => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

/**
 * Filtra eventos por fecha específica
 * @param {Array} events - Array de eventos
 * @param {string|Date} targetDate - Fecha objetivo
 * @param {string} dateField - Campo de fecha en el evento (default: 'fecha_inicio')
 * @returns {Array} - Eventos filtrados
 */
export const filterEventsByDate = (events, targetDate, dateField = 'fecha_inicio') => {
    if (!events || !Array.isArray(events)) return [];
    
    return events.filter(event => {
        const eventDate = event[dateField];
        return isSameDay(eventDate, targetDate);
    });
};

/**
 * Ordena eventos por fecha
 * @param {Array} events - Array de eventos
 * @param {string} dateField - Campo de fecha por el cual ordenar (default: 'fecha_inicio')
 * @param {string} order - Orden: 'asc' o 'desc' (default: 'asc')
 * @returns {Array} - Eventos ordenados
 */
export const sortEventsByDate = (events, dateField = 'fecha_inicio', order = 'asc') => {
    if (!events || !Array.isArray(events)) return [];
    
    return [...events].sort((a, b) => {
        const dateA = parseDate(a[dateField]);
        const dateB = parseDate(b[dateField]);
        
        if (order === 'desc') {
            return dateB - dateA;
        }
        return dateA - dateB;
    });
};

/**
 * Ordena eventos por fecha y hora
 * @param {Array} events - Array de eventos
 * @param {string} dateField - Campo de fecha (default: 'fecha_inicio')
 * @param {string} timeField - Campo de hora (default: 'hora_inicio')
 * @param {string} order - Orden: 'asc' o 'desc' (default: 'asc')
 * @returns {Array} - Eventos ordenados
 */
export const sortEventsByDateTime = (events, dateField = 'fecha_inicio', timeField = 'hora_inicio', order = 'asc') => {
    if (!events || !Array.isArray(events)) return [];
    
    return [...events].sort((a, b) => {
        // Combinar fecha y hora para comparación
        const dateTimeA = new Date(a[dateField] + ' ' + (a[timeField] || '00:00'));
        const dateTimeB = new Date(b[dateField] + ' ' + (b[timeField] || '00:00'));
        
        if (order === 'desc') {
            return dateTimeB - dateTimeA;
        }
        return dateTimeA - dateTimeB;
    });
};

/**
 * Obtiene eventos de un día específico y los ordena por fecha/hora
 * @param {Array} events - Array de eventos
 * @param {string|Date} selectedDate - Fecha seleccionada
 * @param {string} dateField - Campo de fecha (default: 'fecha_inicio')
 * @param {string} timeField - Campo de hora (default: 'hora_inicio')
 * @returns {Array} - Eventos del día ordenados
 */
export const getEventsForDay = (events, selectedDate, dateField = 'fecha_inicio', timeField = 'hora_inicio') => {
    const filteredEvents = filterEventsByDate(events, selectedDate, dateField);
    return sortEventsByDateTime(filteredEvents, dateField, timeField);
};

/**
 * Separa eventos en futuros y pasados basándose en la fecha actual
 * @param {Array} events - Array de eventos
 * @param {string} dateField - Nombre del campo que contiene la fecha (default: 'fecha_inicio')
 * @returns {Object} - Objeto con eventos futuros y pasados
 */
export const separateEventsByDate = (events, dateField = 'fecha_inicio') => {
    if (!events || !Array.isArray(events)) return { future: [], past: [] };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureEvents = [];
    const pastEvents = [];

    events.forEach(event => {
        const eventDate = parseDate(event[dateField]);
        
        if (eventDate >= today) {
            futureEvents.push(event);
        } else {
            pastEvents.push(event);
        }
    });

    return {
        future: futureEvents,
        past: pastEvents
    };
};

/**
 * Tipos de ordenamiento disponibles
 */
export const SORT_TYPES = {
    DATE_ASC: 'date_asc',
    DATE_DESC: 'date_desc',
    DATETIME_ASC: 'datetime_asc',
    DATETIME_DESC: 'datetime_desc'
};

/**
 * Función genérica para ordenar eventos según el tipo especificado
 * @param {Array} events - Array de eventos a ordenar
 * @param {string} sortType - Tipo de ordenamiento (usar SORT_TYPES)
 * @param {Object} fields - Campos personalizados { date, time }
 * @returns {Array} - Array de eventos ordenados
 */
export const sortEvents = (events, sortType = SORT_TYPES.DATE_ASC, fields = {}) => {
    if (!events || !Array.isArray(events)) return [];
    
    const { date = 'fecha_inicio', time = 'hora_inicio' } = fields;

    switch (sortType) {
        case SORT_TYPES.DATE_ASC:
            return sortEventsByDate(events, date, 'asc');
        
        case SORT_TYPES.DATE_DESC:
            return sortEventsByDate(events, date, 'desc');
        
        case SORT_TYPES.DATETIME_ASC:
            return sortEventsByDateTime(events, date, time, 'asc');
        
        case SORT_TYPES.DATETIME_DESC:
            return sortEventsByDateTime(events, date, time, 'desc');
        
        default:
            return events;
    }
};

/**
 * Función principal que procesa eventos separándolos y ordenándolos
 * @param {Array} events - Array de eventos sin procesar
 * @param {Object} options - Opciones de configuración
 * @param {string} options.dateField - Campo de fecha (default: 'fecha_inicio')
 * @param {string} options.timeField - Campo de hora (default: 'hora_inicio')
 * @param {string} options.futureSortType - Tipo de orden para eventos futuros
 * @param {string} options.pastSortType - Tipo de orden para eventos pasados
 * @returns {Object} - Objeto con eventos futuros y pasados procesados
 */
export const processEvents = (events, options = {}) => {
    if (!events || !Array.isArray(events)) return { future: [], past: [], all: [] };
    
    const {
        dateField = 'fecha_inicio',
        timeField = 'hora_inicio',
        futureSortType = SORT_TYPES.DATETIME_ASC,
        pastSortType = SORT_TYPES.DATETIME_DESC
    } = options;

    const { future, past } = separateEventsByDate(events, dateField);
    const fields = { date: dateField, time: timeField };    return {
        future: sortEvents(future, futureSortType, fields),
        past: sortEvents(past, pastSortType, fields),
        all: events
    };
};
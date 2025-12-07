import {
    isAfter,
    isBefore,
    isSameDay,
    isWithinInterval,
    parseISO,
    startOfDay,
    endOfDay,
    isValid
} from 'date-fns';

/**
 * Función de filtrado personalizada para columnas de fecha en TanStack Table
 * 
 * Esta función maneja diferentes tipos de filtros de fecha:
 * - between: Filtrar fechas dentro de un rango específico (inclusivo)
 * - after: Filtrar fechas posteriores a una fecha específica (exclusivo)
 * - before: Filtrar fechas anteriores a una fecha específica (exclusivo)
 * - exact: Filtrar fechas que coincidan exactamente con un día específico
 * 
 * @param {Object} row - Objeto de fila de TanStack Table
 * @param {string} columnId - ID de la columna que se está filtrando
 * @param {Object|null} filterValue - Objeto de configuración del filtro
 * @param {'between'|'after'|'before'|'exact'} filterValue.type - Tipo de filtro
 * @param {string} [filterValue.startDate] - Fecha de inicio en formato ISO (YYYY-MM-DD)
 * @param {string} [filterValue.endDate] - Fecha de fin en formato ISO (YYYY-MM-DD)
 * 
 * @returns {boolean} true si la fila debe mostrarse, false si debe ocultarse
 * 
 * @example
 * // Filtro entre fechas
 * createDateFilterFn(row, 'fechaInicio', {
 *   type: 'between',
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * });
 * 
 * @example
 * // Filtro después de una fecha
 * createDateFilterFn(row, 'fechaInicio', {
 *   type: 'after',
 *   startDate: '2024-06-15'
 * });
 */
export const createDateFilterFn = (row, columnId, filterValue) => {
    // Si no hay filtro aplicado, mostrar todas las filas
    if (!filterValue) return true;

    // Obtener el valor de la fecha directamente de la fila
    const dateValue = row.getValue(columnId);

    // Si la fecha es null, undefined o string vacío, ocultar cuando hay filtros activos
    if (!dateValue) return false;

    // Parsear y validar la fecha de la fila
    const rowDate = parseISO(dateValue);
    if (!isValid(rowDate)) {
        return false;
    }

    // Cache para fechas del filtro parseadas (evita re-parsing)
    const parsedFilterDates = {};

    /**
     * Helper para parsear y cachear fechas del filtro
     * @param {string} dateString - Fecha en formato ISO
     * @param {string} key - Clave para el cache
     * @returns {Date|null} Fecha parseada o null si es inválida
     */
    const parseAndCacheFilterDate = (dateString, key) => {
        if (!dateString) return null;

        if (!parsedFilterDates[key]) {
            const parsed = parseISO(dateString);
            parsedFilterDates[key] = isValid(parsed) ? parsed : null;

            if (!parsedFilterDates[key]) {
                console.warn(`[DateFilter] Fecha del filtro inválida: ${dateString}`);
            }
        }

        return parsedFilterDates[key];
    };

    // Procesar según el tipo de filtro
    switch (filterValue.type) {
        case "between": {
            const startDate = parseAndCacheFilterDate(filterValue.startDate, 'start');
            const endDate = parseAndCacheFilterDate(filterValue.endDate, 'end');

            // Ambas fechas deben ser válidas para el filtro "between"
            if (!startDate || !endDate) return false;

            // Verificar si la fecha está dentro del rango (inclusivo)
            return isWithinInterval(rowDate, {
                start: startOfDay(startDate),
                end: endOfDay(endDate)
            });
        }

        case "after": {
            const limitDate = parseAndCacheFilterDate(filterValue.startDate, 'start');

            if (!limitDate) return false;

            // Después del final del día especificado (exclusivo)
            return isAfter(rowDate, endOfDay(limitDate));
        }

        case "before": {
            const limitDate = parseAndCacheFilterDate(filterValue.endDate, 'end');

            if (!limitDate) return false;

            // Antes del inicio del día especificado (exclusivo)
            return isBefore(rowDate, startOfDay(limitDate));
        }

        case "exact": {
            const exactDate = parseAndCacheFilterDate(filterValue.startDate, 'start');

            if (!exactDate) return false;

            // Coincidencia exacta del día (ignora horas)
            return isSameDay(rowDate, exactDate);
        }

        default:
            console.warn(`[DateFilter] Tipo de filtro no reconocido: ${filterValue.type}`);
            return true;
    }
};

// Constantes para los tipos de filtro (opcional, para mejor DX)
export const DATE_FILTER_TYPES = {
    BETWEEN: 'between',
    AFTER: 'after',
    BEFORE: 'before',
    EXACT: 'exact'
}

/**
 * Type guard para verificar si un valor es un tipo de filtro válido
 * @param {string} type - Tipo a verificar
 * @returns {boolean} true si es un tipo válido
 */
export const isValidDateFilterType = (type) => {
    return Object.values(DATE_FILTER_TYPES).includes(type);
};
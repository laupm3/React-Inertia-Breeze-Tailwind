/**
 * Convierte una fecha local a formato UTC para enviar al backend
 * @param {Date|string} date - Fecha a convertir
 * @returns {string|null} - Fecha en formato ISO UTC o null
 */
export const convertToUTC = (date) => {
    if (!date) return null;

    // Si ya es una cadena en formato ISO, devolverla tal como está
    if (typeof date === 'string' && date.includes('Z')) {
        return date;
    }

    // Si es una fecha del date picker (sin zona horaria)
    if (typeof date === 'string') {
        // Interpretar como fecha local y convertir a UTC
        const localDate = new Date(date);
        return localDate.toISOString();
    }

    // Si es un objeto Date
    if (date instanceof Date) {
        return date.toISOString();
    }

    return null;
};

/**
 * Convierte un objeto Date a string UTC para enviar al backend
 * @param {Date|string|null} date - Fecha a convertir
 * @returns {string|null} - Fecha en formato ISO UTC o null
 */
export const convertDateToUTC = (date) => {
    if (!date) return null;

    if (date instanceof Date) {
        return date.toISOString();
    }

    if (typeof date === 'string') {
        // Si ya es una cadena UTC, devolverla tal como está
        if (date.endsWith('Z')) {
            return date;
        }
        // Si no, convertir a Date y luego a UTC
        const dateObj = new Date(date);
        return dateObj.toISOString();
    }

    return null;
};

/**
 * Convierte una fecha UTC del backend a fecha local para mostrar
 * @param {string} utcDate - Fecha UTC del backend
 * @returns {Date|null} - Fecha local o null
 */
export const convertFromUTC = (utcDate) => {
    if (!utcDate) return null;

    const date = new Date(utcDate);
    if (isNaN(date.getTime())) return null;

    return date;
};

/**
 * Obtiene la fecha actual en formato UTC
 * @returns {string} - Fecha actual en formato ISO UTC
 */
export const getCurrentUTC = () => {
    return new Date().toISOString();
};

/**
 * Obtiene la zona horaria del usuario
 * @returns {string} - Zona horaria (ej: "Europe/Madrid")
 */
export const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convierte una fecha JavaScript a formato ISO UTC para el backend
 * Maneja específicamente el formato JavaScript que causa problemas
 * @param {Date|string} date - Fecha JavaScript o string
 * @returns {string|null} - Fecha en formato ISO UTC o null
 */
export const convertJavaScriptDateToUTC = (date) => {
    if (!date) return null;

    try {
        // Si es un objeto Date, convertir directamente
        if (date instanceof Date) {
            return date.toISOString();
        }

        // Si es un string, verificar el formato
        if (typeof date === 'string') {
            // Si ya es ISO UTC, devolver tal como está
            if (date.includes('T') && date.endsWith('Z')) {
                return date;
            }

            // Si es formato JavaScript (contiene GMT o timezone), convertir
            if (date.includes('GMT') || date.includes('UTC')) {
                const dateObj = new Date(date);
                if (!isNaN(dateObj.getTime())) {
                    return dateObj.toISOString();
                }
            }

            // Para otros formatos de string, intentar parsear
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toISOString();
            }
        }

        return null;
    } catch (error) {
        console.error('Error converting date to UTC:', error, date);
        return null;
    }
};

/**
 * Valida si una fecha está en formato ISO UTC
 * @param {string} date - Fecha a validar
 * @returns {boolean} - True si es formato ISO UTC válido
 */
export const isValidISODate = (date) => {
    if (!date || typeof date !== 'string') return false;
    
    // Verificar formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    return isoRegex.test(date);
};
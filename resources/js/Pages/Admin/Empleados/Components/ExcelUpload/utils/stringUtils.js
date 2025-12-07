/**
 * Normaliza una cadena de texto eliminando acentos y caracteres especiales
 * 
 * @param {string} str - Cadena a normalizar
 * @returns {string} Cadena normalizada
 */
export function normalize(str) {
    return (str || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
}

/**
 * Limpia mensajes de error técnicos para presentarlos al usuario de forma más amigable
 * 
 * @param {string} error - Mensaje de error a limpiar
 * @returns {string} Mensaje de error limpio
 */
export function limpiarMensajeError(error) {
    if (
        typeof error === 'string' &&
        error.includes('no column named')
    ) {
        return 'El archivo contiene columnas que no existen en la tabla de empleados. Por favor, revisa la plantilla o contacta con soporte.';
    }
    return error;
} 
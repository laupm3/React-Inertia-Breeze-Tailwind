/**
 * Accede a un valor anidado en un objeto usando una ruta con notación de punto
 * @param {Object} obj - El objeto base
 * @param {String} path - Ruta con notación de punto (ej: "empleado.empresas.0.nombre")
 * @param {*} defaultValue - Valor predeterminado si la ruta no existe
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
    if (obj == null || !path) return defaultValue;

    try {
        return path.split('.').reduce((prev, curr) => {
            return prev != null && prev[curr] !== undefined ? prev[curr] : defaultValue;
        }, obj);
    } catch (error) {
        return defaultValue;
    }
}
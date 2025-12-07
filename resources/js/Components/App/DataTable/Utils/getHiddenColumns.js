/**
 * Genera un objeto que representa las columnas ocultas de una tabla.
 * 
 * @param {Array} columns - Columns definition. La columna debe tener la propiedad isHidden e id.
 * @returns {Object} Un objeto donde cada clave es el id de una columna oculta y cada valor es false.
 * 
 * @example
 * // Columnas de ejemplo
 * const columns = [
 *   { accessorKey: 'id', isHidden: true },
 *   { accessorKey: 'name', isHidden: false },
 *   { accessorKey: 'email', isHidden: true }
 * ];
 * 
 * // Resultado:
 * // { id: false, email: false }
 * const hidden = getHiddenColumns(columns);
 */
export const getHiddenColumns = (columns = []) => {
    if (!Array.isArray(columns)) {
        throw new Error("Column definition must be an array of objects. 🚩🚩🚩");
    }

    return columns.filter(column => typeof column === 'object' && (column.isHidden))
        .reduce((acc, column) => {
            acc[column.id] = false;
            return acc;
        }, {});
}
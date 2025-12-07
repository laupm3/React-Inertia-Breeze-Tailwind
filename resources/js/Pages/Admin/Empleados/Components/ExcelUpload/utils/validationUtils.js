import { COLUMN_MAPPING } from '../validaciones'; 

/**
 * Función auxiliar para detectar error de BD en una celda
 * 
 * @param {number} rowIndex - Índice de la fila
 * @param {string} columnId - ID de la columna
 * @param {any} value - Valor de la celda
 * @param {Array} erroresBD - Array de errores de BD
 * @returns {Object|null} Objeto de error si existe, null en caso contrario
 */
export function getErrorBD(rowIndex, columnId, value, erroresBD) {
    return erroresBD.find(
        err => err.row - 1 === rowIndex && err.field === columnId && err.value === value
    );
}

/**
 * Verifica si una celda tiene un error según el esquema de validación
 * 
 * @param {Object} row - Fila de datos
 * @param {string} columnId - ID de la columna
 * @param {Object} catalogos - Catálogos de valores permitidos
 * @returns {boolean} Verdadero si la celda tiene un error
 */
export function hasError(row, columnId, catalogos) {
    const schema = getValidationSchema(catalogos)[columnId];
    if (!schema) return false;

    const value = row[columnId];
    
    // Validar campo requerido
    if (schema.required && (!value || value.toString().trim() === '')) {
        return true;
    }

    if (value && value.toString().trim() !== '') {
        // Validar formato de fecha
        if (schema.tipo === 'fecha') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return true;
            }
            const fecha = new Date(value);
            if (isNaN(fecha.getTime())) {
                return true;
            }
        }

        // Validar formato de email
        if (schema.tipo === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return true;
            }
        }

        // Validar formato de teléfono
        if (schema.tipo === 'telefono') {
            if (!/^\+\d{9,15}$/.test(value)) {
                return true;
            }
        }

        // Validar valores permitidos
        if (schema.valores && !schema.valores.includes(value)) {
            return true;
        }

        // Validar expresión regular personalizada
        if (schema.regex && !schema.regex.test(value)) {
            return true;
        }
    }

    return false;
}

/**
 * Obtiene un tooltip para una columna específica basado en un esquema
 * 
 * @param {string} columnId - ID de la columna
 * @param {Object} schema - Esquema de validación
 * @returns {string} Texto del tooltip
 */
export function getColumnTooltip(columnId, schema) {
    if (!schema) return '';

    let tooltip = [];
    
    if (schema.required) {
        tooltip.push('Campo requerido');
    }
    if (schema.unico) {
        tooltip.push('Valor único');
    }
    if (schema.mensaje) {
        tooltip.push(schema.mensaje);
    }
    if (schema.valores) {
        tooltip.push(`Valores permitidos: ${schema.valores.join(', ')}`);
    }

    return tooltip.join(' | ');
}

/**
 * Obtiene un esquema de validación para los campos usando catálogos dinámicos
 * 
 * @param {Object} catalogos - Catálogos de valores permitidos
 * @returns {Object} Esquema de validación
 */
export function getValidationSchema(catalogos) {
    if (!catalogos) return {};
    
    return {
        'Tipo de Documento (*)': {
            required: true,
            valores: catalogos.tiposDocumento?.map(t => t.nombre) || [],
            mensaje: 'El tipo de documento debe ser uno de los permitidos'
        },
        'Género (*)': {
            required: true,
            valores: catalogos.generos?.map(g => g.nombre) || [],
            mensaje: 'El género debe ser uno de los permitidos'
        },
        'Tipo Empleado (*)': {
            required: true,
            valores: catalogos.tiposEmpleado?.map(t => t.nombre) || [],
            mensaje: 'El tipo de empleado debe ser uno de los permitidos'
        },
        'Estado Empleado (*)': {
            required: true,
            valores: catalogos.estadosEmpleado?.map(e => e.nombre) || [],
            mensaje: 'El estado debe ser uno de los permitidos'
        },
        'Teléfono Personal Móvil': {
            tipo: 'telefono',
            required: false,
            mensaje: 'Debe ser un número de teléfono válido con prefijo internacional (+).'
        },
        'Teléfono Personal Fijo': {
            tipo: 'telefono',
            required: false,
            mensaje: 'Debe ser un número de teléfono válido con prefijo internacional (+).'
        },
        'Extensión Centrex': {
            tipo: 'texto',
            required: false,
            mensaje: 'Debe ser una extensión válida.'
        }
    };
} 
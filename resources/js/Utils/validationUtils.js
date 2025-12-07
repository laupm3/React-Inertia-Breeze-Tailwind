/**
 * Utilidades de validación para el sistema de importación
 * Funciones optimizadas y reutilizables para validación de datos
 */

// Expresiones regulares compiladas (más eficientes)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{9,15}$/;
const DATE_YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_DD_MM_YYYY_REGEX = /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/;
const DD_MM_YYYY_VALIDATION_REGEX = /^([0-3]?\d)[\/\-]([0-1]?\d)[\/\-](\d{4})$/;

/**
 * Valida formato de email
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
    return EMAIL_REGEX.test(email);
};

/**
 * Valida formato de teléfono
 * @param {string} phone 
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
    return PHONE_REGEX.test(phone);
};

/**
 * Valida formato de fecha
 * @param {string} dateString 
 * @returns {boolean}
 */
export const validateDate = (dateString) => {
    // Si es vacío, guiones, o solo espacios, es válido (no requerido)
    if (
        !dateString ||
        /^-+\s*-*$/.test(dateString)
    ) return true;

    const str = typeof dateString === 'string' ? dateString.trim() : dateString;
    console.log('Validando fecha:', JSON.stringify(str));

    // Verificar formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const date = new Date(str);
        return date instanceof Date && !isNaN(date);
    }

    // Verificar formato DD/MM/YYYY o DD-MM-YYYY
    if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(str)) {
        return true; // Será normalizada después
    }

    // Verificar formato DD/MM/YY o DD-MM-YY (año 2 dígitos)
    if (/^\d{2}[\/\-]\d{2}[\/\-]\d{2}$/.test(str)) {
        return true; // Será normalizada después
    }

    return false;
};

/**
 * Valida formato DD/MM/YYYY específicamente
 * @param {string} fecha 
 * @returns {boolean}
 */
export const validateDDMMYYYY = (fecha) => {
    const match = fecha.match(DD_MM_YYYY_VALIDATION_REGEX);
    if (!match) return false;
    
    const d = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    
    return true;
};

/**
 * Normaliza fecha de DD/MM/YYYY a YYYY-MM-DD
 * @param {string} fecha 
 * @returns {string}
 */
export const normalizeDate = (fecha) => {
    if (!fecha) return '';

    const str = fecha.toString().trim();

    // Si es string vacío, guiones, o "-  -", tratar como vacío
    if (!str || str === '-  -' || str === '--' || str === '  -  ') return '';

    // Si ya está en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // dd/mm/yy o dd-mm-yy (año 2 dígitos)
    let match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{2})$/);
    if (match) {
        let dd = parseInt(match[1], 10);
        let mm = parseInt(match[2], 10);
        let yy = parseInt(match[3], 10);
        let yyyy = yy < 70 ? 2000 + yy : 1900 + yy;
        if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
            return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
    }

    // dd/mm/yyyy o dd-mm-yyyy
    match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    // mm/dd/yyyy o mm-dd-yyyy
    match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
    if (match) {
        return `${match[3]}-${match[1]}-${match[2]}`;
    }

    return str;
};

/**
 * Formatea valor de celda para mostrar
 * @param {*} value 
 * @returns {string}
 */
export const formatCellValue = (value) => {
    if (value instanceof Date) {
        return value.toISOString().split('T')[0];
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
    }
    return value != null ? value.toString() : '—';
};

/**
 * Procesa datos de Excel a JSON
 * @param {Object} workbook 
 * @param {string} fileType 
 * @returns {Array}
 */
export const processExcelData = (workbook, fileType) => {
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) {
        throw new Error('El archivo debe tener al menos encabezados y una fila de datos');
    }

    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);

    return dataRows
        .filter(row => row.some(cell => cell && cell.toString().trim() !== ''))
        .map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
};

/**
 * Cache para mapeos de campos por entidad
 */
const fieldMappingCache = new Map();

/**
 * Obtiene el mapeo dinámico de campos con cache
 * @param {Object} schema 
 * @param {string} entity 
 * @returns {Object}
 */
export const getDynamicFieldMapping = (schema, entity) => {
    // Verificar cache primero
    const cacheKey = `${entity}_${schema?.version || 'default'}`;
    if (fieldMappingCache.has(cacheKey)) {
        return fieldMappingCache.get(cacheKey);
    }

    if (!schema || !schema.fields) {
        return {};
    }

    const mapping = {};
    schema.fields.forEach(field => {
        const label = field.label;
        const name = field.name;

        // Crear mapeo bidireccional: label -> name
        mapping[label] = name;
        mapping[label.toLowerCase()] = name;
        mapping[label.replace(/\s*\(\*\)\s*$/, '').toLowerCase().trim()] = name;
    });

    // Guardar en cache
    fieldMappingCache.set(cacheKey, mapping);
    return mapping;
};

/**
 * Limpia el cache de mapeos de campos
 */
export const clearFieldMappingCache = () => {
    fieldMappingCache.clear();
};

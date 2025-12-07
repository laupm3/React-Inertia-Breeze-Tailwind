/**
 * Normaliza una fecha en varios formatos a formato YYYY-MM-DD
 * 
 * @param {string|number} valor - Fecha en formato string, número (Excel serial) o Date
 * @returns {string} Fecha normalizada en formato YYYY-MM-DD o mensaje de error
 */
export function normalizaFecha(valor) {
    if (!valor) return '';

    // Si es número (Excel serial date)
    if (typeof valor === 'number' && !isNaN(valor)) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + valor * 86400000);
        return date.toISOString().slice(0, 10);
    }

    // Si es objeto Date
    if (Object.prototype.toString.call(valor) === '[object Date]' && !isNaN(valor)) {
        return valor.toISOString().slice(0, 10);
    }

    let str = valor.toString().trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Si es un valor que representa vacío
    if (!str || /^-+\s*-*$/.test(str)) {
        return '';
    }

    // Si es string ISO (YYYY-MM-DDTHH:mm:ss(.sss)?(Z|±hh:mm)?)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[\+\-]\d{2}:\d{2})?$/.test(str)) {
        return str.slice(0, 10);
    }

    // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
    }

    // dd/mm/yyyy o dd-mm-yyyy
    let match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
    if (match) {
        let dd = parseInt(match[1], 10);
        let mm = parseInt(match[2], 10);
        let yyyy = parseInt(match[3], 10);
        if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
            return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
    }

    // dd/mm/yy o dd-mm-yy (año 2 dígitos)
    match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{2})$/);
    if (match) {
        let dd = parseInt(match[1], 10);
        let mm = parseInt(match[2], 10);
        let yy = parseInt(match[3], 10);
        let yyyy = yy < 70 ? 2000 + yy : 1900 + yy;
        if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
            return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
    }

    // mm/dd/yyyy o mm-dd-yyyy
    match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
    if (match) {
        let mm = parseInt(match[1], 10);
        let dd = parseInt(match[2], 10);
        let yyyy = parseInt(match[3], 10);
        if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
            return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
    }

    // mm/dd/yy o mm-dd-yy (año 2 dígitos)
    match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{2})$/);
    if (match) {
        let mm = parseInt(match[1], 10);
        let dd = parseInt(match[2], 10);
        let yy = parseInt(match[3], 10);
        let yyyy = yy < 70 ? 2000 + yy : 1900 + yy;
        if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
            return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
    }

    // Si nada coincide:
    return 'FECHA INVÁLIDA';
}

/**
 * Valida que la fecha exista en el calendario
 * 
 * @param {string} fechaStr - Fecha en formato YYYY-MM-DD
 * @returns {boolean} Verdadero si la fecha es válida
 */
export function isFechaReal(fechaStr) {
    // fechaStr en formato YYYY-MM-DD
    const [yyyy, mm, dd] = fechaStr.split('-').map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    return (
        date.getFullYear() === yyyy &&
        date.getMonth() === mm - 1 &&
        date.getDate() === dd
    );
}

/**
 * Función para mostrar la fecha en formato dd/mm/yyyy en la tabla
 * 
 * @param {string} valor - Fecha en formato yyyy-mm-dd
 * @param {string} original - Valor original de la fecha (por si la conversión falla)
 * @returns {string} Fecha formateada como dd/mm/yyyy
 */
export function mostrarFechaParaTabla(valor, original) {
    // Si la fecha es válida (yyyy-mm-dd), muéstrala como dd/mm/yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        const [y, m, d] = valor.split('-');
        return `${d}/${m}/${y}`;
    }
    // Si no es válida, muestra el original
    return original || valor || '';
} 
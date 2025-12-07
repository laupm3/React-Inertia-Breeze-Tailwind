import * as XLSX from 'xlsx';
import { normalize } from './stringUtils';
import { normalizaFecha } from './datesUtils';

// Variable global para almacenar los catálogos
const COLUMN_MAPPING = {
    'name': 'Nombre (*)',
    'first_surname': 'Primer Apellido (*)',
    'second_surname': 'Segundo Apellido',
    'birth_date': 'Fecha Nacimiento (*)',
    'gender': 'Género (*)',
    'document_type': 'Tipo de Documento (*)',
    'document_number': 'Nº Documento (*)',
    'niss': 'NISS (*)',
    'email': 'Email (*)',
    'secondary_email': 'Email Secundario',
    'phone': 'Teléfono (*)',
    'secondary_phone': 'Teléfono Secundario',
    'address': 'Dirección (*)',
    'employee_type': 'Tipo Empleado (*)',
    'employee_status': 'Estado Empleado (*)',
    'emergency_contact': 'Contacto Emergencia (*)',
    'emergency_phone': 'Teléfono de Emergencia (*)',
    'tel_movil': 'Teléfono Personal Móvil',
    'tel_fijo': 'Teléfono Personal Fijo',
    'ext_centrex': 'Extensión Centrex'
};

/**
 * Procesa los datos del archivo Excel
 * 
 * @param {Object} workbook - Libro de Excel cargado
 * @param {string} fileType - Tipo de archivo ('xlsx' o 'csv')
 * @returns {Array} Datos procesados del Excel
 */
export function processExcelData(workbook, fileType = 'xlsx') {
    try {
        let jsonData = [];
        if (fileType === 'csv') {
            // Leer la hoja como array de arrays
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csvData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            // Buscar la fila de encabezados robustamente
            const requiredHeaders = [
                'Generar Usuario',
                'Nombre (*)',
                'Nº Documento (*)',
                'Tipo de Documento (*)',
                'Dirección (*)',
                'Teléfono (*)',
                'Género (*)'
            ];
            const headerRowIndex = csvData.findIndex(row => {
                const filteredRow = row.filter(cell => cell && cell.toString().trim() !== '');
                const normalizedRow = filteredRow.map(cell =>
                    typeof cell === 'string'
                        ? cell.replace(/['"\s\uFEFF]/g, '').toLowerCase()
                        : ''
                );
                const matches = requiredHeaders.filter(header =>
                    normalizedRow.some(cell =>
                        cell.includes(header.replace(/['"\s\uFEFF]/g, '').toLowerCase())
                    )
                );
                return matches.length >= 3;
            });
            if (headerRowIndex === -1) throw new Error('No se encontró la fila de encabezados');

            // 1. Guarda los encabezados originales y los normalizados
            const rawHeaders = csvData[headerRowIndex];
            const normalizedHeaders = rawHeaders.map(h =>
                typeof h === 'string'
                    ? h.replace(/['"\\s\\uFEFF]/g, '').toLowerCase()
                    : ''
            );

            // 2. Crea un mapa de normalizado -> original
            const headerMap = {};
            normalizedHeaders.forEach((norm, i) => {
                headerMap[norm] = rawHeaders[i];
            });

            // 3. Filtra solo las filas de datos reales (después de los encabezados)
            const dataRows = csvData.slice(headerRowIndex + 1).filter(row =>
                row.some(cell => cell && cell.toString().trim() !== '')
            );

            // 4. Mapea los datos usando los nombres originales
            jsonData = dataRows.map(row => {
                const obj = {};
                normalizedHeaders.forEach((norm, i) => {
                    obj[headerMap[norm]] = row[i];
                });
                return obj;
            });
        } else {
            // Excel normal
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet, {
                raw: false,
                defval: '',
                blankrows: false
            });
        }

        if (!jsonData || jsonData.length === 0) {
            throw new Error('No se encontraron datos en el archivo');
        }

        // Mapeo robusto de encabezados
        const expectedHeaders = Object.values(COLUMN_MAPPING);
        const normalizedExpected = expectedHeaders.map(normalize);
        const actualHeaders = Object.keys(jsonData[0]);
        const headerMap = {};
        actualHeaders.forEach((header) => {
            const idx = normalizedExpected.indexOf(normalize(header));
            if (idx !== -1) {
                headerMap[header] = expectedHeaders[idx];
            }
        });

        // Procesa los datos usando el headerMap y normaliza la fecha
        const mappedData = jsonData.map(row => {
            const newRow = {};
            Object.entries(row).forEach(([key, value]) => {
                let mappedKey = headerMap[key] || key; // Declarar solo una vez
                // Normalizar para campos opcionales sin asterisco
                const norm = normalize(key);
                if (['telefonosecundario','telefonosecundario*'].includes(norm)) mappedKey = 'Teléfono Secundario';
                if (['telefonoemergencia','telefonoemergencia*'].includes(norm)) mappedKey = 'Teléfono de Emergencia';
                if (['contactoemergencia','contactoemergencia*'].includes(norm)) mappedKey = 'Contacto Emergencia';
                if (mappedKey === 'Fecha Nacimiento (*)') {
                    newRow['fechaNacimientoOriginal'] = value; // SIEMPRE guarda el original
                    const normalizada = normalizaFecha(value);
                    newRow[mappedKey] = normalizada === 'FECHA INVÁLIDA' ? '' : normalizada;
                } else {
                    newRow[mappedKey] = value;
                }
            });
            return newRow;
        });

        // Devuelve los datos mapeados y normalizados
        return mappedData;
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        throw error;
    }
}

/**
 * Genera un archivo Excel con datos de ejemplo para usar como plantilla
 * 
 * @returns {Blob} Archivo Excel generado
 */
export function generateExcelTemplate() {
    // Datos de ejemplo más realistas
    const exampleData = [
        {
            'Nombre (*)': 'María',
            'Primer Apellido (*)': 'García',
            'Segundo Apellido': 'López',
            'Fecha Nacimiento (*)': '1990-05-15',
            'Género (*)': 'Femenino',
            'Tipo de Documento (*)': 'DNI',
            'Nº Documento (*)': '12345678A',
            'NISS (*)': '281234567840',
            'Email (*)': 'maria.garcia@ejemplo.com',
            'Email Secundario': 'maria.personal@ejemplo.com',
            'Teléfono (*)': '+34612345678',
            'Teléfono Personal Móvil': '+34611111111',
            'Teléfono Personal Fijo': '',
            'Extensión Centrex': '',
            'Dirección (*)': 'Calle Mayor 123, Madrid',
            'Tipo Empleado (*)': 'Empleado',
            'Estado Empleado (*)': 'Activo',
            'Contacto Emergencia (*)': 'Juan García',
            'Teléfono de Emergencia (*)': '+34634567890',
            'Generar Usuario': true
        },
        {
            'Nombre (*)': 'Carlos',
            'Primer Apellido (*)': 'Martínez',
            'Segundo Apellido': 'Sánchez',
            'Fecha Nacimiento (*)': '1988-10-20',
            'Género (*)': 'Masculino',
            'Tipo de Documento (*)': 'NIE',
            'Nº Documento (*)': 'X1234567B',
            'NISS (*)': '281234567841',
            'Email (*)': 'carlos.martinez@ejemplo.com',
            'Email Secundario': '',
            'Teléfono (*)': '+34645678901',
            'Teléfono Personal Móvil': '',
            'Teléfono Personal Fijo': '+34911111111',
            'Extensión Centrex': '1234',
            'Dirección (*)': 'Avenida Principal 45, Barcelona',
            'Tipo Empleado (*)': 'Manager',
            'Estado Empleado (*)': 'Activo',
            'Contacto Emergencia (*)': 'Ana Martínez',
            'Teléfono de Emergencia (*)': '+34656789012',
            'Generar Usuario': false
        },
        {
            'Nombre (*)': 'Laura',
            'Primer Apellido (*)': 'Fernández',
            'Segundo Apellido': 'Ruiz',
            'Fecha Nacimiento (*)': '1995-03-25',
            'Género (*)': 'Femenino',
            'Tipo de Documento (*)': 'DNI',
            'Nº Documento (*)': '87654321C',
            'NISS (*)': '281234567842',
            'Email (*)': 'laura.fernandez@ejemplo.com',
            'Email Secundario': 'laura.personal@ejemplo.com',
            'Teléfono (*)': '+34667890123',
            'Teléfono Personal Móvil': '',
            'Teléfono Personal Fijo': '',
            'Extensión Centrex': '',
            'Dirección (*)': 'Plaza Mayor 7, Valencia',
            'Tipo Empleado (*)': 'Directivo',
            'Estado Empleado (*)': 'Activo',
            'Contacto Emergencia (*)': 'Pedro Fernández',
            'Teléfono de Emergencia (*)': '+34689012345',
            'Generar Usuario': true
        }
    ];

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();
    
    // Convertir los datos a una hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(exampleData, {
        header: Object.keys(exampleData[0])
    });

    // Ajustar el ancho de las columnas
    const columnWidths = {};
    Object.keys(exampleData[0]).forEach(key => {
        columnWidths[key] = { wch: Math.max(key.length, 15) };
    });
    ws['!cols'] = Object.values(columnWidths);

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Empleados");

    // Devolver el archivo
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    return new Blob([wbout], { type: 'application/octet-stream' });
} 
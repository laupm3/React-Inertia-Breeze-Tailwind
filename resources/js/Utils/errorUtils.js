import { toast } from "sonner";

/**
 * Extrae todos los mensajes de error de una respuesta de importación
 * @param {Object} errorResponse - La respuesta de error de la API
 * @returns {Array} Array de mensajes de error
 */
export const extractAllErrorMessages = (errorResponse) => {
    const messages = [];
    
    // Si hay invalidRows en la respuesta
    if (errorResponse?.data?.data?.invalidRows) {
        const invalidRows = errorResponse.data.data.invalidRows;
        invalidRows.forEach((invalidRow) => {
            const rowNumber = invalidRow.row;
            let rowErrors = [];
            
            if (invalidRow.type === 'duplicate' && invalidRow.errors?.messages) {
                rowErrors = invalidRow.errors.messages;
            } else if (Array.isArray(invalidRow.errors)) {
                rowErrors = invalidRow.errors;
            } else if (typeof invalidRow.errors === 'string') {
                rowErrors = [invalidRow.errors];
            } else if (typeof invalidRow.errors === 'object' && invalidRow.errors.messages) {
                rowErrors = Array.isArray(invalidRow.errors.messages) 
                    ? invalidRow.errors.messages 
                    : [invalidRow.errors.messages];
            }
            
            rowErrors.forEach(error => {
                messages.push(`Fila ${rowNumber}: ${error}`);
            });
        });
    }
    
    // Si hay invalidRows directamente en data (estructura alternativa)
    if (errorResponse?.data?.invalidRows) {
        const invalidRows = errorResponse.data.invalidRows;
        invalidRows.forEach((invalidRow) => {
            const rowNumber = invalidRow.row;
            let rowErrors = [];
            
            if (invalidRow.type === 'duplicate' && invalidRow.errors?.messages) {
                rowErrors = invalidRow.errors.messages;
            } else if (Array.isArray(invalidRow.errors)) {
                rowErrors = invalidRow.errors;
            } else if (typeof invalidRow.errors === 'string') {
                rowErrors = [invalidRow.errors];
            } else if (typeof invalidRow.errors === 'object' && invalidRow.errors.messages) {
                rowErrors = Array.isArray(invalidRow.errors.messages) 
                    ? invalidRow.errors.messages 
                    : [invalidRow.errors.messages];
            }
            
            rowErrors.forEach(error => {
                messages.push(`Fila ${rowNumber}: ${error}`);
            });
        });
    }
    
    // Si hay mensaje general en la respuesta
    if (errorResponse?.data?.message) {
        messages.push(errorResponse.data.message);
    }
    
    // Si hay mensaje en error
    if (errorResponse?.data?.error) {
        messages.push(errorResponse.data.error);
    }
    
    return messages;
};

/**
 * Muestra todos los errores de importación en toast
 * @param {Array} invalidRows - Array de filas con errores
 * @param {Object} options - Opciones para personalizar el toast
 */
export const showImportErrorsInToast = (invalidRows, options = {}) => {
    const {
        maxErrors = 3,
        duration = 8000,
        title = 'Errores encontrados:',
        style = {}
    } = options;

    const allErrorMessages = [];
    
    invalidRows.forEach((invalidRow) => {
        const rowNumber = invalidRow.row;
        let rowErrors = [];
        
        if (invalidRow.type === 'duplicate' && invalidRow.errors?.messages) {
            // Para duplicados, mostrar todos los mensajes
            rowErrors = invalidRow.errors.messages;
        } else if (Array.isArray(invalidRow.errors)) {
            // Para errores de validación como array
            rowErrors = invalidRow.errors;
        } else if (typeof invalidRow.errors === 'string') {
            // Para errores como string
            rowErrors = [invalidRow.errors];
        } else if (typeof invalidRow.errors === 'object' && invalidRow.errors.messages) {
            // Para otros tipos de errores con estructura de mensajes
            rowErrors = Array.isArray(invalidRow.errors.messages) 
                ? invalidRow.errors.messages 
                : [invalidRow.errors.messages];
        }
        
        // Agregar todos los errores de esta fila a la lista general
        rowErrors.forEach(error => {
            allErrorMessages.push(`Fila ${rowNumber}: ${error}`);
        });
    });
    
    // Mostrar todos los errores en un toast
    if (allErrorMessages.length > 0) {
        const errorText = allErrorMessages.length > maxErrors 
            ? `${allErrorMessages.slice(0, maxErrors).join('\n')}... y ${allErrorMessages.length - maxErrors} errores más`
            : allErrorMessages.join('\n');
        
        toast.error(`${title}\n${errorText}`, {
            duration,
            style: {
                whiteSpace: 'pre-line',
                maxWidth: '500px',
                ...style
            }
        });
    }
};

/**
 * Maneja la respuesta de una importación y muestra los toasts apropiados
 * @param {Object} response - La respuesta de la API
 * @param {Function} onSuccess - Callback para cuando la importación es exitosa
 * @param {Function} onError - Callback para cuando hay errores
 * @param {Object} options - Opciones adicionales
 */
export const handleImportResponse = (response, onSuccess, onError, options = {}) => {
    const {
        successMessage = 'Datos importados correctamente',
        entityName = 'registros'
    } = options;

    if (response.data.success) {
        toast.success(successMessage);
        if (typeof onSuccess === 'function') {
            onSuccess(response.data);
        }
    } else {
        if (response.data.data || response.data.invalidRows) {
            const dataResponse = response.data.data || response.data;
            const { imported, validRows, invalidRows } = dataResponse;
            
            if (imported > 0 && invalidRows && invalidRows.length > 0) {
                toast.success(`${imported} ${entityName} importados correctamente. ${invalidRows.length} filas contienen errores y necesitan corrección.`);
                // Mostrar todos los errores específicos en un toast separado
                showImportErrorsInToast(invalidRows);
            } else if (imported > 0) {
                toast.success(`Se importaron ${imported} ${entityName} correctamente.`);
            } else if (invalidRows && invalidRows.length > 0) {
                // No se importó nada, solo errores
                toast.error(`No se pudo importar ningún registro. Se encontraron ${invalidRows.length} errores.`);
                showImportErrorsInToast(invalidRows);
            }

            if (typeof onError === 'function') {
                onError(dataResponse);
            }
        } else {
            // Si no hay estructura de datos, pero hay un mensaje de error general
            const errorMessage = response.data.message || 'Error desconocido en la importación';
            toast.error(`Error en la importación: ${errorMessage}`);
            
            if (typeof onError === 'function') {
                onError({ message: errorMessage });
            }
        }
    }
};

/**
 * Maneja errores de catch en importaciones
 * @param {Error} error - El error capturado
 * @param {Function} onError - Callback para cuando hay errores
 * @param {Object} options - Opciones adicionales
 */
export const handleImportError = (error, onError, options = {}) => {
    const {
        entityName = 'datos'
    } = options;

    console.error('Error al importar:', error);
    
    if (error.response?.data?.data?.invalidRows || error.response?.data?.invalidRows) {
        const invalidRows = error.response.data.data?.invalidRows || error.response.data.invalidRows;
        
        // Mostrar todos los errores en toast
        const allErrorMessages = extractAllErrorMessages(error.response);
        if (allErrorMessages.length > 0) {
            const errorText = allErrorMessages.length > 3 
                ? `${allErrorMessages.slice(0, 3).join('\n')}... y ${allErrorMessages.length - 3} errores más`
                : allErrorMessages.join('\n');
            
            toast.error(`Errores de importación:\n${errorText}`, {
                duration: 8000,
                style: {
                    whiteSpace: 'pre-line',
                    maxWidth: '500px'
                }
            });
        } else {
            toast.error('Se encontraron errores en algunos registros. Por favor, revise y corrija los datos marcados.');
        }

        if (typeof onError === 'function') {
            onError({ invalidRows });
        }
    } else {
        // Error de red u otro tipo de error
        const allErrorMessages = extractAllErrorMessages(error.response);
        const errorMessage = allErrorMessages.length > 0 
            ? allErrorMessages.join('\n')
            : error.response?.data?.message || error.message || `Error al importar los ${entityName}`;
        
        toast.error(`Error en la importación:\n${errorMessage}`, {
            duration: 6000,
            style: {
                whiteSpace: 'pre-line',
                maxWidth: '500px'
            }
        });

        if (typeof onError === 'function') {
            onError({ message: errorMessage });
        }
    }
};

/**
 * Procesa errores de validación para mostrar en la interfaz
 * @param {Array} invalidRows - Array de filas con errores
 * @returns {Object} Objeto con errores, duplicados y erroresBD procesados
 */
export const processValidationErrors = (invalidRows) => {
    const newErrors = [];
    const newDuplicates = {};
    const newErroresBD = [];

    invalidRows.forEach((invalidRow) => {
        if (invalidRow.type === 'duplicate') {
            const duplicateErrors = invalidRow.errors;
            if (duplicateErrors.messages && duplicateErrors.fields) {
                duplicateErrors.fields.forEach((field, index) => {
                    if (!newDuplicates[field]) {
                        newDuplicates[field] = [];
                    }
                    newDuplicates[field].push(invalidRow.data[field]);
                    newErroresBD.push({
                        row: invalidRow.row,
                        data: invalidRow.data,
                        field,
                        value: invalidRow.data[field],
                        message: duplicateErrors.messages[index]
                    });
                    newErrors.push({
                        row: invalidRow.row,
                        data: invalidRow.data,
                        errors: [duplicateErrors.messages[index]]
                    });
                });
            }
        } else {
            newErrors.push({
                row: invalidRow.row,
                data: invalidRow.data,
                errors: Array.isArray(invalidRow.errors) ? invalidRow.errors : [invalidRow.errors]
            });
        }
    });

    return {
        errors: newErrors,
        duplicates: newDuplicates,
        errorsBD: newErroresBD
    };
};

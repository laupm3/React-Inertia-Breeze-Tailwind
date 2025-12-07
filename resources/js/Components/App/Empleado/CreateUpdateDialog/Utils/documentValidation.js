import axios from 'axios';

/**
 * Cache para los tipos de documentos obtenidos de la API
 */
let documentTypesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene los tipos de documentos desde la API
 * @returns {Promise<Object>} - Tipos de documentos con patrones de validación
 */
export const fetchDocumentTypes = async () => {
  try {
    // Verificar si tenemos cache válido
    if (documentTypesCache && cacheTimestamp && 
        Date.now() - cacheTimestamp < CACHE_DURATION) {
      return documentTypesCache;
    }

    const response = await axios.get(route('api.v1.admin.empleados.type-documents'));
    
    if (response.data && response.data.tipoDocumentos) {
      // Transformar la respuesta de la API al formato esperado
      const documentTypes = {};
      
      response.data.tipoDocumentos.forEach((tipo) => {
        // Crear el regex desde el string de la base de datos
        let regexPattern = null;
        if (tipo.regex) {
          try {
            // Remover las barras del regex si las tiene
            const cleanRegex = tipo.regex.replace(/^\/|\/[gimuy]*$/g, '');
            regexPattern = new RegExp(cleanRegex, 'i'); // case insensitive
          } catch (error) {
            console.warn(`Error creando regex para tipo ${tipo.nombre}:`, error);
            regexPattern = null;
          }
        }

        documentTypes[tipo.id] = {
          regex: regexPattern,
          message: tipo.regex_description 
            ? `El ${tipo.nombre} debe tener el formato: ${tipo.regex_description}` 
            : `Formato inválido para ${tipo.nombre}`,
          name: tipo.nombre,
          description: tipo.descripcion
        };
      });

      // Actualizar cache
      documentTypesCache = documentTypes;
      cacheTimestamp = Date.now();
      
      return documentTypes;
    }
    
    throw new Error('Formato de respuesta inválido');
  } catch (error) {
    console.warn('Error al obtener tipos de documentos de la API:', error);
    // Si hay error, retornar objeto vacío
    return {};
  }
};

/**
 * Versión síncrona que usa cache (sin debounce para validación inmediata)
 * @param {number|string} tipoDocumentoId - ID del tipo de documento
 * @param {string} documentNumber - Número de documento a validar
 * @returns {Object} - { isValid: boolean, message: string, documentType: string }
 */
export const validateDocumentNumberSync = (tipoDocumentoId, documentNumber) => {
  // Si no hay datos, no validar
  if (!documentNumber || !tipoDocumentoId) {
    return { isValid: true, message: '', documentType: '' };
  }

  // Usar cache si está disponible
  const documentTypes = documentTypesCache || {};
  const pattern = documentTypes[tipoDocumentoId];

  // Si no hay patrón definido, no validar
  if (!pattern || !pattern.regex) {
    return { isValid: true, message: '', documentType: pattern?.name || 'Tipo no definido' };
  }

  const cleanDocumentNumber = documentNumber.trim().toUpperCase();
  const isValid = pattern.regex.test(cleanDocumentNumber);

  return {
    isValid,
    message: isValid ? '' : pattern.message,
    documentType: pattern.name
  };
};

/**
 * Sistema de validación con estado persistente para evitar parpadeo
 */
class DocumentValidationManager {
  constructor() {
    this.validationStates = new Map();
    this.timeouts = new Map();
    this.defaultDelay = 800;
  }

  /**
   * Valida un documento con estado persistente
   * @param {string} key - Clave única para el estado
   * @param {number|string} tipoDocumentoId - ID del tipo de documento
   * @param {string} documentNumber - Número de documento
   * @param {number} delay - Delay en ms
   * @returns {Promise<Object>} - Estado de validación
   */
  async validateWithState(key, tipoDocumentoId, documentNumber, delay = this.defaultDelay) {
    // Limpiar timeout anterior si existe
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Si no hay datos, retornar estado válido
    if (!documentNumber || !tipoDocumentoId) {
      this.validationStates.set(key, { isValid: true, message: '', documentType: '' });
      return this.validationStates.get(key);
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(async () => {
        try {
          const validation = validateDocumentNumberSync(tipoDocumentoId, documentNumber);
          this.validationStates.set(key, validation);
          resolve(validation);
        } catch (error) {
          console.error('Error en validación con estado:', error);
          const fallbackState = { isValid: true, message: '', documentType: 'Error de validación' };
          this.validationStates.set(key, fallbackState);
          resolve(fallbackState);
        }
      }, delay);

      this.timeouts.set(key, timeout);
    });
  }

  /**
   * Limpia todos los estados
   */
  clearAllStates() {
    this.validationStates.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

// Instancia global del manager
export const documentValidationManager = new DocumentValidationManager();

/**
 * Valida que la fecha de caducidad del documento sea válida (no caducado)
 * @param {Date|string} expirationDate - Fecha de caducidad del documento
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateDocumentExpiration = (expirationDate) => {
  if (!expirationDate) {
    return { isValid: false, message: 'La fecha de caducidad es obligatoria' };
  }

  try {
    const expDate = expirationDate instanceof Date ? expirationDate : new Date(expirationDate);
    const today = new Date();
    
    // Resetear horas para comparar solo fechas
    today.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);

    if (expDate <= today) {
      return { 
        isValid: false, 
        message: 'El documento está caducado. Debe tener una fecha de caducidad posterior a hoy.' 
      };
    }

    return { isValid: true, message: '' };
  } catch (error) {
    return { isValid: false, message: 'Fecha de caducidad inválida' };
  }
};

/**
 * Versión síncrona de validación separada
 * @param {number|string} tipoDocumentoId - ID del tipo de documento
 * @param {string} documentNumber - Número de documento a validar
 * @param {Date|string} expirationDate - Fecha de caducidad del documento
 * @returns {Object} - { formatValid: boolean, formatMessage: string, expirationValid: boolean, expirationMessage: string, documentType: string }
 */
export const validateCompleteDocumentSeparatedSync = (tipoDocumentoId, documentNumber, expirationDate) => {
  const results = {
    formatValid: true,
    formatMessage: '',
    expirationValid: true,
    expirationMessage: '',
    documentType: ''
  };

  // Validar formato del documento
  if (documentNumber && tipoDocumentoId) {
    const formatValidation = validateDocumentNumberSync(tipoDocumentoId, documentNumber);
    results.formatValid = formatValidation.isValid;
    results.formatMessage = formatValidation.message;
    results.documentType = formatValidation.documentType;
  }

  // Validar fecha de caducidad
  if (expirationDate) {
    const expirationValidation = validateDocumentExpiration(expirationDate);
    results.expirationValid = expirationValidation.isValid;
    results.expirationMessage = expirationValidation.message;
  }

  return results;
}; 
/**
 * Utilidades para ordenar eventos en la aplicación
 * NOTA: Muchas de estas funciones han sido movidas a eventDateUtils.js
 * Este archivo mantiene aliases para compatibilidad con código existente
 */

import { 
    parseDate, 
    separateEventsByDate, 
    sortEventsByDate, 
    sortEventsByDateTime,
    SORT_TYPES 
} from './eventDateUtils';

/**
 * Alias para mantener compatibilidad con código existente
 */
export const parseFechaEvento = parseDate;

/**
 * Alias para mantener compatibilidad con código existente
 */
export const separarEventosPorFecha = (eventos, campoFecha = 'fecha') => {
    const result = separateEventsByDate(eventos, campoFecha);
    return {
        futuros: result.future,
        pasados: result.past
    };
};

/**
 * Alias para mantener compatibilidad con código existente
 */
export const ordenarEventosAscendente = (eventos, campoFecha = 'fecha') => {
    return sortEventsByDate(eventos, campoFecha, 'asc');
};

/**
 * Alias para mantener compatibilidad con código existente
 */
export const ordenarEventosDescendente = (eventos, campoFecha = 'fecha') => {
    return sortEventsByDate(eventos, campoFecha, 'desc');
};

/**
 * Alias para mantener compatibilidad con código existente
 */
export const ordenarEventosPorFechaYHora = (eventos, campoFecha = 'fecha_inicio', campoHora = 'hora_inicio') => {
    return sortEventsByDateTime(eventos, campoFecha, campoHora, 'asc');
};

/**
 * Alias para mantener compatibilidad con código existente
 */
export const obtenerEventosPorFecha = (eventos, fecha, campoFecha = 'fecha_inicio', campoHora = 'hora_inicio') => {
    return eventos
        .filter(evento => {
            const fechaEvento = parseDate(evento[campoFecha]);
            return fechaEvento.getFullYear() === fecha.getFullYear() &&
                   fechaEvento.getMonth() === fecha.getMonth() &&
                   fechaEvento.getDate() === fecha.getDate();
        })
        .sort((a, b) => {
            const fechaHoraA = new Date(a[campoFecha] + ' ' + (a[campoHora] || '00:00'));
            const fechaHoraB = new Date(b[campoFecha] + ' ' + (b[campoHora] || '00:00'));
            return fechaHoraA - fechaHoraB;
        });
};

/**
 * Alias para mantener compatibilidad con código existente
 */
export const procesarEventos = (eventos, opciones = {}) => {
    const {
        campoFecha = 'fecha',
        campoHora = 'hora',
        ordenarFuturosAsc = true,
        ordenarPasadosDesc = true
    } = opciones;

    const { futuros, pasados } = separarEventosPorFecha(eventos, campoFecha);

    return {
        futuros: ordenarFuturosAsc ? ordenarEventosAscendente(futuros, campoFecha) : futuros,
        pasados: ordenarPasadosDesc ? ordenarEventosDescendente(pasados, campoFecha) : pasados,
        todos: eventos
    };
};

/**
 * Tipos de ordenamiento disponibles (alias para compatibilidad)
 */
export const TIPOS_ORDENAMIENTO = {
  FECHA_ASC: SORT_TYPES.DATE_ASC,
  FECHA_DESC: SORT_TYPES.DATE_DESC,
  FECHA_HORA_ASC: SORT_TYPES.DATETIME_ASC,
  FECHA_HORA_DESC: SORT_TYPES.DATETIME_DESC
};

/**
 * Función genérica para ordenar eventos según el tipo especificado (alias para compatibilidad)
 * @param {Array} eventos - Array de eventos a ordenar
 * @param {string} tipo - Tipo de ordenamiento (usar TIPOS_ORDENAMIENTO)
 * @param {Object} campos - Campos personalizados { fecha, hora }
 * @returns {Array} - Array de eventos ordenados
 */
export const ordenarEventos = (eventos, tipo = TIPOS_ORDENAMIENTO.FECHA_ASC, campos = {}) => {
  const { fecha = 'fecha', hora = 'hora' } = campos;

  switch (tipo) {
    case TIPOS_ORDENAMIENTO.FECHA_ASC:
      return ordenarEventosAscendente(eventos, fecha);
    
    case TIPOS_ORDENAMIENTO.FECHA_DESC:
      return ordenarEventosDescendente(eventos, fecha);
    
    case TIPOS_ORDENAMIENTO.FECHA_HORA_ASC:
      return ordenarEventosPorFechaYHora(eventos, fecha, hora);
    
    case TIPOS_ORDENAMIENTO.FECHA_HORA_DESC:
      return sortEventsByDateTime(eventos, fecha, hora, 'desc');
    
    default:
      return eventos;
  }
};

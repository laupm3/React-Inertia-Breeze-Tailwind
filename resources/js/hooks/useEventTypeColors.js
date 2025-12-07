import { useMemo } from 'react';

/**
 * Convierte un color hexadecimal a RGB
 * @param {string} hex - Color hexadecimal (ej: #ff6900)
 * @returns {object} - Objeto con valores r, g, b
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Hook personalizado para generar un mapa de colores dinámico para tipos de eventos
 * @param {Array} eventTypes - Array de tipos de eventos
 * @returns {Object} - Mapa de colores con utilidades para usar en componentes
 */
const useEventTypeColors = (eventTypes) => {
  const colorMap = useMemo(() => {
    if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
      return {};
    }

    const map = {};
    eventTypes.forEach(eventType => {
      const hex = eventType.color || '#cccccc';
      const rgb = hexToRgb(hex);
        if (rgb) {
        map[eventType.nombre] = {
          hex: hex,
          point: { backgroundColor: hex },
          bg: { backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` },
          text: { color: hex },
          border: { borderColor: hex }
        };
      } else {
        // Fallback si no se puede convertir el hex
        map[eventType.nombre] = {
          hex: hex,
          point: { backgroundColor: hex },
          bg: { backgroundColor: `${hex}33` }, // 33 es aproximadamente 20% de opacidad
          text: { color: hex },
          border: { borderColor: hex }
        };
      }});
    
    return map;
  }, [eventTypes]);
  // Función para obtener el color de un tipo de evento específico
  const getEventTypeColor = (eventTypeName) => {
    return colorMap[eventTypeName] || {
      hex: '#cccccc',
      point: { backgroundColor: '#cccccc' },
      bg: { backgroundColor: 'rgba(204, 204, 204, 0.3)' },
      text: { color: '#cccccc' },
      border: { borderColor: '#cccccc' }
    };
  };

  // Función para obtener el color por ID de tipo de evento
  const getEventTypeColorById = (eventTypeId) => {
    const eventType = eventTypes.find(type => type.id === eventTypeId);
    return eventType ? getEventTypeColor(eventType.nombre) : getEventTypeColor(null);
  };

  return {
    colorMap,
    getEventTypeColor,
    getEventTypeColorById
  };
};

export default useEventTypeColors;

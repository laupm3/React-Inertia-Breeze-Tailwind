/**
 * Hook para extraer texto de descripciones de eventos
 * @returns {Function} - Función para extraer texto de descripción
 */
const useEventDescription = () => {
  
  /**
   * Extrae el texto de la descripción de un evento
   * @param {string|object} description - Descripción del evento
   * @returns {string} - Texto extraído de la descripción
   */
  const extractTextFromDescription = (description) => {
    if (!description) return '';
    
    try {
      // Verifica si la descripción es un string JSON
      if (typeof description === 'string' && (description.startsWith('{') || description.startsWith('['))) {
        const parsedDesc = JSON.parse(description);
        
        // Si es un objeto con IDs como claves
        if (typeof parsedDesc === 'object' && !Array.isArray(parsedDesc)) {
          return Object.values(parsedDesc)
            .map(block => {
              if (block.value && Array.isArray(block.value)) {
                return block.value.map(item => 
                  item.children?.map(child => child.text).join(' ')
                ).join(' ');
              }
              return '';
            })
            .join(' ')
            .substring(0, 100) + (Object.values(parsedDesc).join(' ').length > 100 ? '...' : '');
        }
        
        // Si es un array directo
        if (Array.isArray(parsedDesc)) {
          const fullText = parsedDesc.map(block => 
            block.children?.map(child => child.text).join(' ')
          ).join(' ');
          return fullText.substring(0, 100) + (fullText.length > 100 ? '...' : '');
        }
      }
      
      // Si no es JSON o no se pudo parsear, devuelve los primeros 100 caracteres
      return typeof description === 'string' 
        ? description.substring(0, 100) + (description.length > 100 ? '...' : '')
        : '';
        
    } catch (error) {
      // Si hay error al parsear, devuelve el string original truncado
      return typeof description === 'string'
        ? description.substring(0, 100) + (description.length > 100 ? '...' : '')
        : '';
    }
  };

  return { extractTextFromDescription };
};

export default useEventDescription;

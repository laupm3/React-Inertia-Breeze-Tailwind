import { useState, useCallback } from 'react';

// Este es un hook personalizado de ejemplo para manejar diferentes "vistas" o "paneles" en tu aplicación.

export const useView = () => {
  const [currentView, setCurrentView] = useState(null);
  const [viewData, setViewData] = useState(null);

  /**
   * Función para "mostrar" o "activar" una vista específica.
   * @param {string} viewName - El nombre o identificador de la vista a mostrar.
   * @param {object} [data=null] - Datos opcionales para pasar a la vista.
   */
  const handleSheetView = useCallback((viewName, data = null) => {
    console.log(`Mostrando vista: ${viewName}`, data);
    setCurrentView(viewName);
    setViewData(data);
  }, []);

  /**
   * Función para cerrar o desactivar la vista actual.
   */
  const closeView = useCallback(() => {
    console.log(`Cerrando vista: ${currentView}`);
    setCurrentView(null);
    setViewData(null);
  }, [currentView]);

  // Retorna las funciones y el estado que los componentes pueden necesitar.
  return {
    currentView,
    viewData,
    handleSheetView,
    closeView,
  };
}
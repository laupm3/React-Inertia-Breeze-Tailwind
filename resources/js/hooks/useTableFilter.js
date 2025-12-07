import { useMemo, useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar los filtros de tabla
 * @param {Object} table - Instancia de la tabla de TanStack
 * @param {string} columnKey - Clave de la columna a filtrar
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.getLabelValue - Función para obtener el label/value personalizado
 * @returns {Array} Array de opciones formateadas para MultiSelect
 */
export function useTableFilter(table, columnKey, options = {}) {
  return useMemo(() => {
    const column = table.getColumn(columnKey);
    if (!column) return [];

    const rows = table.getRowModel().rows;
    const optionsMap = new Map();

    console.log('Soy un teletubie 😍')

    // Función para procesar un item y añadirlo al Map
    const processItem = (item) => {
      if (!item) return;

      // Si hay una función personalizada para obtener label/value, usarla
      if (options.getLabelValue) {
        const { value, label } = options.getLabelValue(item);
        if (value) optionsMap.set(value, { value, label });
        return;
      }

      // Procesamiento por defecto
      if (item.id && (item.nombre || item.name)) {
        optionsMap.set(item.id, {
          value: item.id,
          label: item.nombre || item.name
        });
      }
    };

    // Procesar cada fila
    rows.forEach(row => {
      const value = row.original[columnKey];
      
      if (Array.isArray(value)) {
        // Si es un array (como empresas, departamentos)
        value.forEach(processItem);
      } else {
        // Si es un objeto simple (como tipoDocumento)
        processItem(value);
      }
    });

    return Array.from(optionsMap.values());
  }, [table, columnKey, options.getLabelValue]);
}

/**
 * Hook para manejar el estado y la lógica del filtro
 * @param {Object} table - Instancia de la tabla de TanStack
 * @param {string} columnKey - Clave de la columna a filtrar
 * @param {Array} initialValue - Valor inicial del filtro
 * @returns {Object} Estado y funciones del filtro
 */
export function useFilterState(table, columnKey, initialValue = []) {
  const [selectedValues, setSelectedValues] = useState(initialValue);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Memorizar el manejador de cambios
  const handleValueChange = useCallback((values) => {
    setSelectedValues(values);
    setHasInteracted(true);
  }, []);

  // Efecto para aplicar el filtro
  useEffect(() => {
    if (hasInteracted) {
      table.getColumn(columnKey)?.setFilterValue(
        selectedValues.length > 0 ? selectedValues : undefined
      );
    }
  }, [selectedValues, hasInteracted, table, columnKey]);

  // Función para resetear el filtro
  const resetFilter = useCallback(() => {
    setSelectedValues([]);
    setHasInteracted(true);
    table.getColumn(columnKey)?.setFilterValue(undefined);
  }, [table, columnKey]);

  return {
    selectedValues,
    handleValueChange,
    hasInteracted,
    resetFilter
  };
} 
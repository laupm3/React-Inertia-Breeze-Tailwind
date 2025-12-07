import { useCallback, useContext, useEffect, createContext, useState } from "react";

/**
 * Contexto para manejar el estado global
 * @type {React.Context}
 */
const DataHandlerContext = createContext(null);

/**
 * Hook personalizado para acceder al contexto
 * @throws {Error} Si se usa fuera del DataHandlerContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
function useDataHandler() {
  const context = useContext(DataHandlerContext);
  if (!context) {
    throw new Error('useDataHandler debe usarse dentro de DataHandlerContextProvider');
  }
  return context;
}

/**
 * Proveedor del contexto:
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @returns {JSX.Element} Proveedor del contexto con sus valores
 */
const DataHandlerContextProvider = ({ children, data: initialData }) => {

  const [data, setData] = useState(initialData);

  const [loading, setLoading] = useState(false);

  /**
   * Actualiza la data en el estado global buscando el item actualizado por su id, 
   * de lo contrario agrega el nuevo item al principio
   */
  const updateData = useCallback((newItem) => {
    setData((prevData) => {
      // Filtra el elemento existente (si existe) y coloca el nuevo al principio
      const exists = prevData.some((item) => item.id === newItem?.id);
      return exists
        ? [
          newItem,
          ...prevData.filter((item) => item.id !== newItem.id)
        ]
        : [newItem, ...prevData];
    });
  }, []);

  /**
   * Elimina un item de la data global filtrando por su id
   */
  const deleteItem = useCallback((id) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  }, []);

  return (
    <DataHandlerContext.Provider value={{
      data,
      setData,
      loading,
      updateData,
      deleteItem
    }}>
      {children}
    </DataHandlerContext.Provider>
  );
};

export { DataHandlerContextProvider, useDataHandler };
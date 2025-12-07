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
const DataHandlerContextProvider = ({ children }) => {

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // Establecer loading a true al iniciar la petición
    setLoading(true);

    try {
      const response = await axios.get(route('api.v1.admin.turnos.index'));

      if (response.status === 200) {
        setData(response.data.turnos);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log('error :>> ', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading]);

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

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataHandlerContext.Provider value={{
      data,
      setData,
      fetchData,
      loading,
      updateData,
      deleteItem
    }}>
      {children}
    </DataHandlerContext.Provider>
  );
};

export { DataHandlerContextProvider, useDataHandler };
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";

/**
 * Contexto para manejar el estado global
 * @type {React.Context}
 */
const DataHandlerContext = createContext();

/**
 * Hook personalizado para acceder al contexto
 * @throws {Error} Si se usa fuera del DataHandlerContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
export const useDataHandler = () => {
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
export const DataHandlerContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canViewHealthObservations, setCanViewHealthObservations] = useState(false);
  const { auth } = usePage().props;

  const fetchData = useCallback(async () => {
    // Establecer loading a true al iniciar la petición
    setLoading(true);

    try {
      const response = await axios.get(route('api.v1.admin.empleados.index'));

      if (response.status === 200) {
        setData(response.data.empleados);
        setCanViewHealthObservations(response.data.canViewHealthObservations || false);
      } else {
        setData([]);
        setCanViewHealthObservations(false);
      }
    } catch (error) {
      console.error('error :>> ', error);
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
      deleteItem,
      canViewHealthObservations
    }}>
      {children}
    </DataHandlerContext.Provider>
  );
};
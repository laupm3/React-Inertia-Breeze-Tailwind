import { useCallback, useContext, useEffect, createContext, useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfToday,
  startOfMonth,
  endOfMonth
} from 'date-fns';

/**
 * Contexto para manejar el estado global de los horarios
 * @type {React.Context}
 */
const DataHandlerContext = createContext(null);

/**
 * Hook personalizado para acceder al contexto de horarios
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
 * Proveedor de contexto para la sección de horarios:
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @returns {JSX.Element} Proveedor del contexto con sus valores
 */
const DataHandlerContextProvider = ({ children }) => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [originalHorarios, setOriginalHorarios] = useState([]);
  const [showingAllEmployees, setShowingAllEmployees] = useState(false);

  const [horarios, setHorarios] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);

  const activeSelection = selectedShifts.length == 0;
  const [blockSelection, setBlockSelection] = useState(false);

  const toggleShowAllEmployees = useCallback(async () => {
    if (showingAllEmployees) {
      // Volver al estado original
      setHorarios(originalHorarios);
      setShowingAllEmployees(false);
      return;
    }

    let empleadosParaUsar = allEmployees;

    // Si aún no hemos cargado todos los empleados
    if (allEmployees.length === 0) {
      try {
        const response = await axios.get(route('api.v1.admin.empleados.index'));

        if (response.status === 200) {
          empleadosParaUsar = response.data.empleados;
          setAllEmployees(empleadosParaUsar); // guardamos para próximas veces
        } else {
          console.warn('No se pudieron cargar los empleados.');
          return;
        }
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        return;
      }
    }

    // Fusionamos empleados sin horarios
    const existingEmployeeIds = new Set(horarios.map(emp => emp.empleado.id));

    const empleadosFaltantes = empleadosParaUsar
      .filter(emp => !existingEmployeeIds.has(emp.id))
      .map(emp => ({
        empleado: emp,
        horarios: {}
      }));

    // Este paso es clave: asegurar que se actualice la tabla con un nuevo array
    setHorarios([...horarios, ...empleadosFaltantes]);
    setShowingAllEmployees(true);
  }, [showingAllEmployees, horarios, originalHorarios, allEmployees]);

  // Valores iniciales para los estados de selección
  const [monthSelected, setMonthSelected] = useState(startOfMonth(startOfToday()));

  // El valor inicial para el rango de fechas es el de la semana actual, empezando por el Lunes a Domingo
  const defaultSelectedRange = {
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  }

  const [selectedRange, setSelectedRange] = useState(defaultSelectedRange);

  const [loading, setLoading] = useState(true);

  /**
   * Update the selected range when the month changes, setting the new month as the selected range from and to
   * @param {Date} newMonth The new month selected
   */
  const manageMonthChange = (newMonth) => {
    setMonthSelected(newMonth);

    setSelectedRange({
      from: newMonth,
      to: endOfMonth(newMonth),
    })
  };

  /**
     * Group the schedules by employee
     * 
     * @param {Array} horarios The array of schedules
     * @returns 
     */
  const transformSchedules = useCallback((horarios) => {
    const copyHorarios = [...horarios];
    return Object.values(copyHorarios.reduce((acc, horario) => {

      const { empleado, horario_inicio } = horario;
      const date = format(horario_inicio, 'yyyy-MM-dd');

      // Verificamos si el empleado ya está en el acumulador
      if (!acc[empleado.id]) {

        acc[empleado.id] = {
          ...horario,
          horarios: {},
        };
      }

      if (!acc[empleado.id].horarios[date]) {
        acc[empleado.id].horarios[date] = [];
      }

      acc[empleado.id].horarios[date].push(horario);

      return acc;
    }, []));
  }, []);

  const fetchHorarios = useCallback(async () => {
    // Establecer loading a true al iniciar la petición
    setLoading(true);

    try {
      const response = await axios.get(route('api.v1.admin.horarios.index', {
        from: format(selectedRange.from, 'yyyy-MM-dd'),
        to: format(selectedRange.to, 'yyyy-MM-dd'),
      }));

      if (response.status === 200) {
        const transformados = transformSchedules(response.data.horarios);
        setHorarios(transformados);
        setOriginalHorarios(transformados);
      } else {
        setHorarios([]);
        setOriginalHorarios([]);
      }
    } catch (error) {
      console.error('error :>> ', error);
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRange, transformSchedules, setHorarios, setLoading]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  return (
    <DataHandlerContext.Provider value={{
      horarios,
      setHorarios,
      toggleShowAllEmployees,
      showingAllEmployees,
      monthSelected,
      setMonthSelected,
      manageMonthChange,
      selectedRange,
      setSelectedRange,
      activeSelection,
      blockSelection,
      setBlockSelection,
      transformSchedules,
      fetchHorarios,
      selectedShifts,
      setSelectedShifts,
      loading
    }}>
      {children}
    </DataHandlerContext.Provider>
  );
};

export { DataHandlerContextProvider, useDataHandler };
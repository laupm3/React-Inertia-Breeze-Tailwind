import { useCallback, useContext, useEffect, createContext, useState, useRef } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from 'date-fns';

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
  const [viewType, setViewType] = useState('week'); // 'week' or 'month'
  
  // Referencias para controlar los intervalos de actualización
  const realTimeIntervalRef = useRef(null);
  const lastUpdateRef = useRef(null);

  // El valor inicial para el rango de fechas es la semana actual
  const today = new Date();
  const defaultSelectedRange = {
    from: startOfWeek(today, { weekStartsOn: 1 }), // Lunes de la semana actual
    to: endOfWeek(today, { weekStartsOn: 1 }),     // Domingo de la semana actual
  }

  const [selectedRange, setSelectedRange] = useState(defaultSelectedRange);
  const [monthSelected, setMonthSelected] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const manageMonthChange = (date) => {
    setMonthSelected({
      month: date.getMonth(),
      year: date.getFullYear(),
    });
  };

  const fetchData = useCallback(async () => {
    // Establecer loading a true al iniciar la petición
    setLoading(true);

    let fromDate, toDate;

    if (viewType === 'month') {
        const monthStart = startOfMonth(new Date(monthSelected.year, monthSelected.month));
        const monthEnd = endOfMonth(new Date(monthSelected.year, monthSelected.month));
        fromDate = monthStart;
        toDate = monthEnd;
    } else {
        fromDate = selectedRange.from;
        toDate = selectedRange.to;
    }

    const fromFormatted = format(fromDate, 'yyyy-MM-dd');
    const toFormatted = format(toDate, 'yyyy-MM-dd');

    try {
      const url = route('api.v1.user.fichajes.index', {
        from: fromFormatted,
        to: toFormatted,
      });

      const response = await axios.get(url);

      if (response.status === 200) {
        const horarios = response.data.horarios || [];
        
        // Filtrar los registros que realmente están en el rango solicitado
        const horariosFiltered = horarios.filter(horario => {
            if (!horario.fecha_inicio) return false;
            const fechaHorario = new Date(horario.fecha_inicio);
            const fechaInicio = new Date(fromFormatted);
            const fechaFin = new Date(toFormatted);
            return fechaHorario >= fechaInicio && fechaHorario <= fechaFin;
        }).map(horario => {
            // Detectar descanso real (adicional) si existe
            const breaks = Array.isArray(horario.descansosAdicionales) ? horario.descansosAdicionales : [];

            // Función para formatear a HH:MM
            const toHHMM = (dateStr) => {
                if (!dateStr) return null;
                const d = new Date(dateStr);
                if (isNaN(d)) return dateStr.slice(11,16);
                return d.toISOString().slice(11,16);
            };

            let descansoInicio = horario.descansoInicio || horario.descanso_inicio || null;
            let descansoFin    = horario.descansoFin    || horario.descanso_fin    || null;

            // Procesar descansos adicionales para la visualización
            let descansos = [];
            if (breaks.length > 0) {
                // Ordenar por inicio y convertir a formato HH:MM
                const ordenados = breaks
                    .filter(b => b.descanso_inicio)
                    .sort((a,b) => new Date(a.descanso_inicio) - new Date(b.descanso_inicio))
                    .map(breakItem => ({
                        inicio: toHHMM(breakItem.descanso_inicio),
                        fin: breakItem.descanso_fin ? toHHMM(breakItem.descanso_fin) : null
                    }))
                    .filter(b => b.inicio); // Solo incluir los que tienen inicio válido

                descansos = ordenados;

                // Mantener compatibilidad con el código existente
                if (ordenados.length) {
                    descansoInicio = ordenados[0].inicio;

                    // Break en curso?
                    const enCurso = ordenados.find(b => !b.fin);
                    if (enCurso) {
                        descansoFin = null; // en curso
                    } else {
                        const last = ordenados[ordenados.length-1];
                        descansoFin = last.fin;
                    }
                }
            }

            const result = {
                ...horario,
                descansoInicio,
                descansoFin,
                descansos // Añadir el array completo de descansos
            };
            

            return result;
        });

        const toMinutes = (hhmm) => {
            if (!hhmm) return null;
            const [h, m] = hhmm.split(':').map(Number);
            return h * 60 + m;
        };

        const gruposPorFecha = {};
        horariosFiltered.forEach(item => {
            const key = item.fecha_inicio;
            if (!gruposPorFecha[key]) gruposPorFecha[key] = [];
            gruposPorFecha[key].push(item);
        });

        Object.values(gruposPorFecha).forEach(turnosDelDia => {
            const bucketsEntrada = {};
            const bucketsSalida  = {};
            
            turnosDelDia.forEach(t => {
                if (t.fichajeEntrada) {
                    if (!bucketsEntrada[t.fichajeEntrada]) bucketsEntrada[t.fichajeEntrada] = [];
                    bucketsEntrada[t.fichajeEntrada].push(t);
                }
                if (t.fichajeSalida) {
                    if (!bucketsSalida[t.fichajeSalida]) bucketsSalida[t.fichajeSalida] = [];
                    bucketsSalida[t.fichajeSalida].push(t);
                }
            });

            const resolverBucket = (bucket, esEntrada = true) => {
                Object.entries(bucket).forEach(([hora, turnos]) => {
                    if (turnos.length <= 1) return;
                    
                    let mejorTurno = null;
                    let mejorDiff = Infinity;
                    
                    turnos.forEach(t => {
                        const planificada = esEntrada ? t.horarioInicio : t.horarioFin;
                        if (!planificada) return;
                        const diff = Math.abs(toMinutes(planificada) - toMinutes(hora));
                        if (diff < mejorDiff) {
                            mejorDiff = diff;
                            mejorTurno = t;
                        }
                    });

                    turnos.forEach(t => {
                        if (t !== mejorTurno) {
                            if (esEntrada) t.fichajeEntrada = null;
                            else t.fichajeSalida = null;
                        }
                    });
                });
            };

            resolverBucket(bucketsEntrada, true);
            resolverBucket(bucketsSalida, false);
        });
        
        setData(horariosFiltered);
      } else {
        setData([]);
      }
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRange, viewType, monthSelected]);

  // Función para verificar si hay descansos activos en los datos actuales
  const hasActiveBreaks = useCallback(() => {
    // Verificar si hay descansos activos en los datos
    const hasActiveBreaksInData = data.some(horario => {
      // Verificar descansos adicionales activos
      if (horario.descansosAdicionales && Array.isArray(horario.descansosAdicionales)) {
        return horario.descansosAdicionales.some(descanso => 
          descanso.descanso_inicio && !descanso.descanso_fin
        );
      }
      // Verificar descanso principal activo
      return horario.descansoInicio && !horario.descansoFin;
    });

    // También verificar si hay algún horario en estado de pausa
    const hasPausedHorarios = data.some(horario => 
      horario.estado_fichaje === 'en_pausa' || horario.estado_fichaje === 'descanso_obligatorio'
    );

    return hasActiveBreaksInData || hasPausedHorarios;
  }, [data]);

  // Función para iniciar la actualización en tiempo real
  const startRealTimeUpdates = useCallback(() => {
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current);
    }
    
    realTimeIntervalRef.current = setInterval(() => {
      const now = new Date();
      // Solo actualizar si han pasado al menos 15 segundos desde la última actualización
      if (!lastUpdateRef.current || (now - lastUpdateRef.current) >= 15000) {
        lastUpdateRef.current = now;
        fetchData();
      }
    }, 30000); // Verificar cada 30 segundos cuando hay descansos activos
  }, [fetchData]);

  // Función para detener la actualización en tiempo real
  const stopRealTimeUpdates = useCallback(() => {
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current);
      realTimeIntervalRef.current = null;
    }
  }, []);

  // Función para forzar actualización inmediata (para usar desde otros componentes)
  const forceRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Efecto para cargar datos iniciales y cuando cambie selectedRange
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Efecto para manejar actualizaciones en tiempo real
  useEffect(() => {
    const hasActive = hasActiveBreaks();
    
    if (hasActive) {
      startRealTimeUpdates();
    } else {
      stopRealTimeUpdates();
    }

    // Cleanup al desmontar
    return () => {
      stopRealTimeUpdates();
    };
  }, [hasActiveBreaks, startRealTimeUpdates, stopRealTimeUpdates]);

  // Cleanup adicional al desmontar el componente
  useEffect(() => {
    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
        realTimeIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <DataHandlerContext.Provider value={{
      data,
      setData,
      fetchData,
      loading,
      selectedRange,
      setSelectedRange,
      monthSelected,
      manageMonthChange,
      viewType,
      setViewType,
      hasActiveBreaks,
      startRealTimeUpdates,
      stopRealTimeUpdates,
      forceRefresh,
    }}>
      {children}
    </DataHandlerContext.Provider>
  );
};

export { DataHandlerContextProvider, useDataHandler };
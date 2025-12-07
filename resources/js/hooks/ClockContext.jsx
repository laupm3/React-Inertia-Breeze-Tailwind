import React, { useState, createContext, useContext, useEffect, useCallback, useReducer, useMemo } from 'react';
import { useForm } from "@inertiajs/react";
import DecisionModal from '@/Components/App/Modals/DecisionModal';
import Icon from '@/imports/LucideIcon';

const ClockContext = createContext();

// Reducer para manejar estados relacionados
const clockReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_FICHAJES':
      return { ...state, fichajes: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
};

const initialState = {
  fichajeSelected: null,
  fichajes: [],
  error: false,
  errorMessage: '',
  loading: true,
  isClockingIn: false,
  isPaused: false,
  openModal: false,
  updated: false,
};

export function ClockProvider({ children }) {
  const [state, dispatch] = useReducer(clockReducer, initialState);

  useEffect(() => {
    if (state.fichajeSelected) {
      switch (state.fichajeSelected.estado_fichaje) {
        case 'en_curso':
          dispatch({ type: 'SET_STATE', payload: { isClockingIn: true, isPaused: false } });
          break;
        case 'en_pausa':
        case 'descanso_obligatorio':
          dispatch({ type: 'SET_STATE', payload: { isClockingIn: true, isPaused: true } });
          break;
        case 'finalizado' || 'sin_iniciar' || undefined || null:
          dispatch({ type: 'SET_STATE', payload: { isClockingIn: false, isPaused: false, openModal: false } });
          break;
        default:
          dispatch({ type: 'SET_STATE', payload: { isClockingIn: false, isPaused: false, openModal: false } });
          break;
      }
    } else {
      dispatch({ type: 'SET_STATE', payload: { isClockingIn: false, isPaused: false, openModal: false } });
    }
  }, [state.fichajeSelected]);

  const form = useForm({
    accion: '',
    horario_id: '',
    horario_siguiente_id: '',
    coordenadas: {
      latitud: '',
      longitud: '',
      ip_address: '',
      user_agent: ''
    }
  });

  const fetchFichaje = useCallback(async () => {
    try {
      const response = await axios.get(route('api.v1.user.fichaje.estado'));
      const { horarios } = response.data.datos;

      const horariosNoFinalizados = horarios
        .filter(item => item?.estado_fichaje !== 'finalizado');
      
      const timeToSeconds = (time) => {
        const [hours, minutes] = time.split(":");
        return parseInt(hours) * 3600 + parseInt(minutes) * 60;
      };

      const updateData = {
        loading: false,
        error: false,
        fichajes: horarios
      };

      if (horariosNoFinalizados.length === 0) {
        updateData.fichajeSelected = null;
        updateData.isClockingIn = false;
        updateData.isPaused = false;
      } else if (horarios.length === 1) {
        updateData.fichajeSelected = horarios[0];
        updateData.isClockingIn = horarios[0].estado_fichaje !== 'en_curso'
        updateData.isPaused = horarios[0].estado_fichaje !== 'en_pausa' || horarios[0].estado_fichaje !== 'descanso_obligatorio';
      } else if (horarios.length > 1) {
        const actualEntry = horarios.find(item => item.estado_fichaje === 'en_curso' || item.estado_fichaje === 'en_pausa' || item.estado_fichaje === 'descanso_obligatorio');

        if (actualEntry) {
          updateData.fichajeSelected = actualEntry;
          updateData.isClockingIn = true;
          updateData.isPaused = actualEntry.estado_fichaje === 'en_pausa' || actualEntry.estado_fichaje === 'descanso_obligatorio';
        } else {
          const now = timeToSeconds(new Date().toLocaleTimeString('es-AR', { hour12: false }));

          updateData.fichajeSelected = horariosNoFinalizados.find(
            (item) =>
              timeToSeconds(item.hora_entrada) <= now &&
              now <= timeToSeconds(item.hora_salida)
          ) || horariosNoFinalizados.reduce((earliest, item) =>
            timeToSeconds(item.hora_entrada) < timeToSeconds(earliest.hora_entrada) ? item : earliest, horariosNoFinalizados[0]);
        }
      }

      dispatch({ type: 'SET_STATE', payload: updateData });
    } catch (error) {
      console.error('Fetch error:', error);
      dispatch({ type: 'SET_STATE', payload: { loading: false } });
    }
  }, []);

  useEffect(() => {
    fetchFichaje();
  }, []);

  const handleUpdate = useCallback(() => {
    axios.post(route('api.v1.user.fichaje.accion'), form.data)
      .then(response => {
        const fichajeActivo = response.data.datos.horarios.find(horario => horario.estado_fichaje === 'en_curso' || horario.estado_fichaje === 'en_pausa' || horario.estado_fichaje === 'descanso_obligatorio');
        dispatch({ type: 'SET_STATE', payload: { fichajeSelected: fichajeActivo } });
      })
      .catch(error => {
        console.error('Update error:', error);
        dispatch({ type: 'SET_STATE', payload: { error: true, errorMessage: error?.response?.data?.message || error?.response?.data?.error?.mensaje } });
      });
  }, [form.data]);

  useEffect(() => {
    if (state.updated) {
      handleUpdate();
      dispatch({ type: 'SET_STATE', payload: { updated: false } });
    }
  }, [state.updated, handleUpdate]);

  const getLocation = useCallback(async (type) => {
    try {
      const location = await getGeolocation();
      const ip = await getUserIP();

      form.setData(prevData => ({
        ...prevData,
        accion: type,
        horario_id: state.fichajeSelected?.horario_id,
        coordenadas: {
          ...prevData.coordenadas,
          latitud: location.latitude,
          longitud: location.longitude,
          ip_address: ip,
          user_agent: navigator.userAgent
        }
      }));

      dispatch({ type: 'SET_STATE', payload: { updated: true } });
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }, [form, state.fichajeSelected]);

  const getUserIP = useCallback(async () => {
    try {
      const response = await fetch('https://api.ipify.org/?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error al obtener la IP:", error);
      return null;
    }
  }, []);

  const getGeolocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      const requestGeolocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              source: 'navigator'
            }),
            async (error) => {
              console.error('Geolocation error:', error);
              reject(new Error('No se pudo obtener la ubicación'));
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
          );
        } else {
          reject(new Error('Geolocation no soportado'));
        }
      };

      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: 'geolocation' })
          .then(result => {
            if (result.state === 'granted' || result.state === 'prompt') {
              requestGeolocation();
            } else {
              alert('Habilita los permisos de ubicación');
              reject(new Error('Permiso denegado'));
            }
          })
          .catch(() => requestGeolocation());
      } else {
        requestGeolocation();
      }
    });
  }, []);

  const handleClockIn = useCallback(async () => {
    try {
      await getLocation('iniciar');
      // dispatch({ type: 'SET_STATE', payload: { isClockingIn: true, isPaused: false } });
    } catch (error) {
      console.error('Clock in error:', error);
    }
  }, [getLocation]);

  const handlePause = useCallback(() => {
    const actionType = state.isPaused ? 'reanudar' : 'descanso_adicional';
    getLocation(actionType);
    // dispatch({ type: 'SET_STATE', payload: { isPaused: !state.isPaused } });
  }, [state.isPaused, getLocation]);

  const handleMealBreak = useCallback(() => {
    const actionType = state.isPaused ? 'reanudar' : 'descanso_obligatorio';
    getLocation(actionType);
    // dispatch({ type: 'SET_STATE', payload: { isPaused: !state.isPaused } });
  }, [state.isPaused, getLocation]);

  const handleFinalize = useCallback(() => {
    dispatch({ type: 'SET_STATE', payload: { openModal: true } });
  }, []);

  const confirmHandleFinalize = useCallback(() => {
    getLocation('finalizar');
    /* dispatch({
      type: 'SET_STATE', payload: {
        isClockingIn: false,
        isPaused: false,
        openModal: false
      }
    }); */
  }, [getLocation]);

  const formatTime = useCallback((seconds) => {
    if (seconds < 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }, []);

  const contextValue = useMemo(() => ({
    recharge: fetchFichaje,
    fichaje: state.fichajeSelected,
    fichajes: state.fichajes,
    loading: state.loading,
    setFichajeSelected: (payload) => dispatch({ type: 'SET_STATE', payload: { fichajeSelected: payload } }),
    isClockingIn: state.isClockingIn,
    isPaused: state.isPaused,
    tiempoRestante: state.fichajeSelected?.tiempo_restante,
    tiempoTranscurrido: state.fichajeSelected?.tiempo_total - state.fichajeSelected?.tiempo_restante,
    disabled: state.fichajeSelected?.estado_fichaje === 'finalizado',
    handleClockIn,
    handlePause,
    handleMealBreak,
    handleFinalize,
    confirmHandleFinalize,
    formatTime
  }), [state, handleClockIn, handlePause, handleFinalize, confirmHandleFinalize, formatTime]);

  return (
    <ClockContext.Provider value={contextValue}>
      {children}
      <DecisionModal
        title='¿Estás seguro de que quieres finalizar el fichaje?'
        content='Finalizarás el fichaje de tu turno, ¿estás seguro de continuar?'
        open={state.openModal}
        onOpenChange={(open) => dispatch({ type: 'SET_STATE', payload: { openModal: !state.openModal } })}
        action={confirmHandleFinalize}
        variant="confirm"
        icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
      />

      <DecisionModal
        title='Error'
        content={state.errorMessage}
        open={state.error}
        onOpenChange={(open) => dispatch({ type: 'SET_STATE', payload: { error: false, errorMessage: '' } })}
        action={() => dispatch({ type: 'SET_STATE', payload: { error: false, errorMessage: '' } })}
        variant="error"
        icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
      />
    </ClockContext.Provider>
  );
}

export function useClock() {
  return useContext(ClockContext);
}

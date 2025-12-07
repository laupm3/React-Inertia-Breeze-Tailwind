import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Hook personalizado para manejar eventos y tipos de eventos
 * @returns {Object} - Objeto con estados y funciones para manejar eventos
 */
const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Api Eventos
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(route('api.v1.user.eventos.index'));
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setEvents(response.data);
        } else if (response.data.eventos && Array.isArray(response.data.eventos)) {
          setEvents(response.data.eventos);
        } else if (Array.isArray(Object.values(response.data)) && Object.values(response.data).length > 0) {
          setEvents(Object.values(response.data));
        } else {
          console.error("No se encontró un array de eventos en la respuesta:", response.data);
          setEvents([]);
        }
      } else {
        console.error("La respuesta no contiene datos:", response.data);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Api Tipos de Eventos
  const fetchEventTypes = async () => {
    try {
      const response = await axios.get(route('api.v1.user.eventos.tipos'));
      if (response.data) {
        let tiposEventoArray = [];
        if (response.data.tiposEvento && Array.isArray(response.data.tiposEvento)) {
          tiposEventoArray = response.data.tiposEvento;
        } else if (Array.isArray(response.data)) {
          tiposEventoArray = response.data;
        } else if (typeof response.data === 'object') {
          const possibleArray = Object.values(response.data);
          if (possibleArray.length > 0 && typeof possibleArray[0] === 'object') {
            tiposEventoArray = possibleArray;
          }
        }
        setEventTypes(tiposEventoArray);
      } else {
        setEventTypes([]);
      }
    } catch (error) {
      console.error("Error al obtener tipos de eventos:", error);
      setEventTypes([]);
    }
  };  // Función para crear un nuevo evento
  const createEvent = async (eventData) => {
    try {
      // Preparar los datos del evento con validaciones
      const eventPayload = {
        nombre: eventData.titulo,
        descripcion: eventData.descripcion || '',
        fecha_inicio: eventData.fecha_inicio,  
        hora_inicio: eventData.hora_inicio || '00:00',
        tipo_evento_id: eventData.tipo_evento_id,
        users: Array.isArray(eventData.users) && eventData.users.length > 0 
          ? (typeof eventData.users[0] === 'object' 
              ? eventData.users.map(user => user.id)
              : eventData.users)
          : [],
        team_id: eventData.team_id || null,
        empresa_id: eventData.empresa_id || null,
        departamento_id: eventData.departamento_id || null
      };
      
      const response = await axios.post(route('user.eventos.store'), eventPayload);
      
      if (response.data) {
        await fetchEvents();
        return { success: true };
      }
    } catch (error) {
      console.error("Error al crear el evento:", error);
      return { success: false, error };
    }
  };
  // Función para actualizar un evento
  const updateEvent = async (eventData) => {
    try {
      // Preparar los datos del evento con validaciones
      const eventPayload = {
        nombre: eventData.titulo,
        descripcion: eventData.descripcion || '',
        fecha_inicio: eventData.fecha_inicio,  
        hora_inicio: eventData.hora_inicio || '00:00',
        tipo_evento_id: eventData.tipo_evento_id,
        users: Array.isArray(eventData.users) && eventData.users.length > 0 
          ? (typeof eventData.users[0] === 'object' 
              ? eventData.users.map(user => user.id)
              : eventData.users)
          : [],
        team_id: eventData.team_id || null,
        empresa_id: eventData.empresa_id || null,
        departamento_id: eventData.departamento_id || null
      };      const response = await axios.put(route('user.eventos.update', { evento: eventData.id }), eventPayload);
      
      if (response.data) {
        await fetchEvents();
        return { success: true };
      }
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
      return { success: false, error };
    }
  };

  // Función para eliminar un evento
  const deleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchEvents();
    fetchEventTypes();
  }, []);

  return {
    events,
    eventTypes,
    isLoading,
    fetchEvents,
    fetchEventTypes,
    createEvent,
    updateEvent,
    deleteEvent
  };
};

export default useEvents;

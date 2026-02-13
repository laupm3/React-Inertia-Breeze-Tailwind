import Calendario from "@/Components/OwnUi/Calendario";
import BlockCard from "@/Components/OwnUi/BlockCard";
import CreateUpdateDialog from "@/Blocks/Events/Partials/CreateUpdateDialog/CreateUpdateDialog";
import ViewEventDialog from "@/Blocks/Events/Partials/ViewEventDialog/ViewEventDialog";
import { useNotifications } from "@/hooks/useNotifications";
import { getEventColor } from "@/Utils/eventUtils";
import { router } from "@inertiajs/react";

import axios from "axios";
import { useState, useEffect } from "react";

import Icon from "@/imports/LucideIcon";
import { Button } from "@/Components/App/Buttons/Button";


function Events() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);

    // Usar el hook de notificaciones para escuchar eventos en tiempo real
    const { calendarEvents } = useNotifications();

    // Efecto para sincronizar los eventos de WebSocket con los eventos locales
    useEffect(() => {
        if (calendarEvents && calendarEvents.length > 0) {
            // Integrar nuevos eventos del WebSocket con los existentes
            setEvents(prevEvents => {
                // Crear una copia de los eventos actuales
                const updatedEvents = [...prevEvents];

                // Procesar cada evento recibido por WebSocket
                calendarEvents.forEach(wsEvent => {
                    // Verificar si el evento ya existe en nuestra lista
                    const existingEventIndex = updatedEvents.findIndex(e => e.id === wsEvent.id);

                    if (existingEventIndex !== -1) {
                        // Actualizar el evento existente
                        updatedEvents[existingEventIndex] = {
                            ...updatedEvents[existingEventIndex],
                            ...wsEvent
                        };
                    } else {
                        // Formato para el nuevo evento para que coincida con la estructura esperada
                        const formattedEvent = {
                            id: wsEvent.id,
                            nombre: wsEvent.title,
                            descripcion: wsEvent.descripcion,
                            fecha_inicio: wsEvent.start,
                            hora_inicio: getTimeFromDate(wsEvent.start),
                            tipo_evento: {
                                color: wsEvent.color || '#FF5733',
                                id: wsEvent.tipo || 1,
                                nombre: wsEvent.tipo || 'Evento'
                            },
                            users: wsEvent.participantes || []
                        };

                        // Añadir el nuevo evento
                        updatedEvents.push(formattedEvent);
                    }
                });

                return updatedEvents;
            });
        }
    }, [calendarEvents]);

    // Función auxiliar para obtener la hora de una fecha ISO
    const getTimeFromDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            console.error('Error parsing date:', e);
            return '';
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await axios.get(route('api.v1.user.eventos.index'));

            if (response.data && Array.isArray(response.data.eventos)) {

                const formattedEvents = response.data.eventos.map(event => ({
                    ...event,

                }));
                setEvents(formattedEvents);
            } else {
                console.error("La respuesta no contiene un array de eventos:", response.data);
                setEvents([]);
            }
        } catch (error) {
            console.error("Error al obtener eventos:", error);
            setEvents([]);
        }
    };

    useEffect(() => {
        fetchEvents();

        const fetchEventTypes = async () => {
            try {
                const response = await axios.get(route('api.v1.user.eventos.tipos'));
                if (response.data && response.data.tiposEvento) {
                    setEventTypes(response.data.tiposEvento);
                } else {
                    setEventTypes([]);
                }
            } catch (error) {
                console.error("Error al obtener tipos de eventos:", error);
                setEventTypes([]);
            }
        };

        fetchEventTypes();
    }, []);

    const handleCreateEvent = async (eventData) => {
        try {
            const response = await axios.post(route('user.eventos.store'), {
                nombre: eventData.titulo,
                descripcion: eventData.descripcion,
                fecha_inicio: eventData.fecha_inicio,
                hora_inicio: eventData.hora_inicio,
                tipo_evento_id: eventData.tipo_evento_id,
                users: Array.isArray(eventData.users) && eventData.users.length > 0
                    ? (typeof eventData.users[0] === 'object'
                        ? eventData.users.map(user => user.id)  // Si son objetos, extraer IDs
                        : eventData.users)  // Si ya son IDs, usar directamente
                    : [],
                team_id: eventData.team_id,
                empresa_id: eventData.empresa_id,
                departamento_id: eventData.departamento_id
            });

            if (response.data) {
                // Refrescar eventos después de crear uno nuevo
                fetchEvents();
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            console.error("Error al crear el evento:", error);
        }
    };

    const handleUpdateEvent = async (eventData) => {
        try {
            const response = await axios.put(route('user.eventos.update', { evento: eventData.id }), {
                nombre: eventData.titulo,
                descripcion: eventData.descripcion,
                fecha_inicio: eventData.fecha_inicio,
                hora_inicio: eventData.hora_inicio,
                tipo_evento_id: eventData.tipo_evento_id,
                users: Array.isArray(eventData.users) && eventData.users.length > 0
                    ? (typeof eventData.users[0] === 'object'
                        ? eventData.users.map(user => user.id)  // Si son objetos, extraer IDs
                        : eventData.users)  // Si ya son IDs, usar directamente
                    : [],
                team_id: eventData.team_id,
                empresa_id: eventData.empresa_id,
                departamento_id: eventData.departamento_id
            });

            if (response.data) {
                // Refrescar eventos después de actualizar
                fetchEvents();
                setIsCreateModalOpen(false);
                setSelectedEvent(null);
            }
        } catch (error) {
            console.error("Error al actualizar el evento:", error);
        }
    };

    const handleDeleteEvent = (eventId) => {
        setEvents(events.filter(event => event.id !== eventId));
    };

    const handleOpenEventDetails = (event) => {
        setSelectedEvent(event);
        setIsViewModalOpen(true);
    };

    const handleEditEvent = (event) => {
        setSelectedEvent(event);
        setSelectedDate(new Date(event.fecha_inicio));
        setIsCreateModalOpen(true);
    };

    const handleViewAllEvents = () => {
        router.visit(route('user.eventos.index'));
    };

    return (
        <BlockCard className="border-none bg-custom-gray-default dark:bg-custom-blackSemi p-3 sm:p-4 lg:p-6">
            {/* Calendario */}
            <div className="w-full">
                <Calendario
                    onDateSelect={setSelectedDate}
                    onDateDoubleClick={(date) => {
                        setSelectedDate(date);
                        setSelectedEvent(null);
                        setIsCreateModalOpen(true);
                    }}
                    onEventClick={handleOpenEventDetails}
                    events={events || []}
                />
            </div>

            <div className="border-b-2 border-custom-gray-light dark:border-custom-blackLight rounded-sm my-4" />

            {/* Lista de eventos */}
            <div className="space-y-2 sm:space-y-2">{(() => {
                const eventsForDate = getEventsForDay(events, selectedDate);
                const limitedEvents = eventsForDate.slice(0, 3); // Solo mostrar los primeros 3

                return (
                    <>
                        {limitedEvents.length > 0 ? (
                            <>
                                {limitedEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between w-full p-2 sm:p-3 bg-custom-white dark:bg-custom-blackLight rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 hover:bg-custom-gray-light dark:hover:bg-custom-blackSemi hover:shadow-sm"
                                        onClick={() => handleOpenEventDetails(event)}
                                    >
                                        {/* Contenido principal del evento */}
                                        <div className="flex items-center flex-1 min-w-0">
                                            {/* Distintivo (círculo) de color del evento */}
                                            <div
                                                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: event.tipo_evento.color }}
                                            />

                                            {/* Nombre del evento */}
                                            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                                                <h4 className="text-sm sm:text-base font-medium text-custom-blackLight dark:text-custom-white truncate">
                                                    {event.nombre}
                                                </h4>
                                                {/* Mostrar fecha/hora en móvil */}
                                                <div className="flex flex-wrap items-center gap-2 mt-0.5 sm:hidden">
                                                    <div className="flex items-center text-xs text-custom-gray-dark dark:text-custom-gray-light">
                                                        <Icon name="Calendar" className="w-3 h-3 mr-1 text-custom-gray-semiDark" />
                                                        {event.fecha_inicio ?
                                                            (event.fecha_inicio.includes('/') ?
                                                                event.fecha_inicio :
                                                                new Date(event.fecha_inicio).toLocaleDateString('es-ES', {
                                                                    day: '2-digit',
                                                                    month: '2-digit'
                                                                })
                                                            ) : 'Sin fecha'}
                                                    </div>
                                                    <div className="flex items-center text-xs text-custom-gray-dark dark:text-custom-gray-light">
                                                        <Icon name="Clock" className="w-3 h-3 mr-1 text-custom-gray-semiDark" />
                                                        {event.hora_inicio || 'Sin hora'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fecha y hora del evento - Solo en desktop */}
                                        <div className="hidden sm:flex flex-col items-start text-xs text-custom-gray-dark dark:text-custom-gray-light gap-1">
                                            <div className="flex items-center">
                                                <Icon name="Calendar" className="w-4 h-4 mr-1 text-custom-gray-semiDark" />
                                                {event.fecha_inicio ?
                                                    (event.fecha_inicio.includes('/') ?
                                                        event.fecha_inicio :
                                                        new Date(event.fecha_inicio).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })
                                                    ) : 'No hay fecha de inicio'}
                                            </div>
                                            <div className="flex items-center">
                                                <Icon name="Clock" className="w-4 h-4 mr-1 text-custom-gray-semiDark" />
                                                {event.hora_inicio || 'No hay hora de inicio'}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Botón Ver más si hay más de 3 eventos */}
                                {eventsForDate.length > 3 && (
                                    <div className="mt-3 sm:mt-4 flex justify-center">
                                        <Button
                                            variant="secondary"
                                            onClick={handleViewAllEvents}
                                            size="sm"
                                        >
                                            <span>Ver más eventos ({eventsForDate.length - 3} más)</span>
                                            <Icon name="ArrowRight" className="ml-1 w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6 sm:py-8">
                                <div className="mb-3">
                                    <Icon name="Calendar" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-custom-gray-light dark:text-custom-gray-dark" />
                                </div>
                                <p className="text-custom-gray-dark dark:text-custom-gray-light text-sm mb-2">
                                    No hay eventos para esta fecha
                                </p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleViewAllEvents}
                                >
                                    <span>Ver todos los eventos</span>
                                    <Icon name="ArrowRight" className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                );
            })()}
            </div>
            {/* Crear/Ediar Dialog */}
            <CreateUpdateDialog
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedEvent(null);
                }}
                onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
                selectedDate={selectedDate}
                eventTypes={eventTypes}
                selectedEvent={selectedEvent}
            />
            {/* Ver Dialog */}
            <ViewEventDialog
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                eventData={selectedEvent}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
            />
        </BlockCard>
    );
}

export default Events;
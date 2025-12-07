import EventCard from '@/Pages/AllEvents/Partials/EventCard';

import useEventTypeColors from "@/hooks/useEventTypeColors";
import useEvents from "@/hooks/useEvents";

function EventList({ filteredEvents, handleOpenEventDetails, extractTextFromDescription }) {
  const {
    eventTypes,
  } = useEvents();

  const { getEventTypeColorById } = useEventTypeColors(eventTypes);

  // Función para verificar si un evento ya pasó
  const isEventPast = (eventDate) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    today.setHours(0, 0, 0, 0);
    eventDateObj.setHours(0, 0, 0, 0);
    return eventDateObj < today;
  };

  return (
    <div className="overflow-y-auto overflow-x-hidden max-h-[540px] p-4">
      {filteredEvents.length > 0 ? (
        filteredEvents.map(event => {
          // Intentar obtener el ID del tipo de evento de diferentes formas
          let tipoEventoId = event.tipo_evento_id;
          if (!tipoEventoId && event.tipo_evento) {
            tipoEventoId = event.tipo_evento.id;
          }

          const eventTypeColor = getEventTypeColorById(tipoEventoId);

          return (
            <EventCard
              key={event.id}
              event={event}
              eventTypeColor={eventTypeColor}
              onClick={handleOpenEventDetails}
              extractTextFromDescription={extractTextFromDescription}
              isPast={isEventPast(event.fecha_inicio)}
            />
          );
        })
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay eventos disponibles.
        </p>
      )}
    </div>
  )
}

export default EventList
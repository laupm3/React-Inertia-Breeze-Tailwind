import { useState, useEffect } from 'react'
import { Calendar } from '@/Components/ui/calendar'
import { useNotifications } from '@/hooks/useNotifications'

// Función cn interna para combinar clases
const cn = (...classes) => classes.filter(Boolean).join(' ');

function Calendario({ events = [], onDateSelect = () => {}, onDateDoubleClick = () => {}, onEventClick = () => {} }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lastClickTime, setLastClickTime] = useState(0);
  const { calendarEvents } = useNotifications();
  
  // Estado combinado para eventos (props + websocket)
  const [allEvents, setAllEvents] = useState([]);
  
  // Combinar eventos de props con eventos recibidos por websocket
  useEffect(() => {
    // Convertir los eventos de websocket al formato esperado por el calendario
    const formattedWebsocketEvents = calendarEvents.map(event => ({
      id: event.id,
      nombre: event.title,
      descripcion: event.descripcion,
      fecha_inicio: event.start,
      fecha_fin: event.end,
      tipo_evento: {
        nombre: event.tipo,
        color: event.color
      },
      participantes: event.participantes
    }));
    
    // Combinar eventos evitando duplicados (por id)
    const existingIds = new Set(events.map(event => event.id));
    const uniqueWebsocketEvents = formattedWebsocketEvents.filter(
      event => !existingIds.has(event.id)
    );
    
    setAllEvents([...events, ...uniqueWebsocketEvents]);
  }, [events, calendarEvents]);

  useEffect(() => {
    // Llamar a onDateSelect con la fecha actual cuando el componente se monta
    onDateSelect(selectedDate);
  }, []);

  const handleDateClick = (date) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;

    if (timeDiff < 300) { // 300ms es el umbral para considerar un doble clic
      onDateDoubleClick(date);
    } else {
      setSelectedDate(date);
      onDateSelect(date);
    }

    setLastClickTime(currentTime);
  };

  /* manejo de eventos */
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // Crear un mapa de fechas de eventos con sus colores
  const eventDatesMap = new Map();
  allEvents.forEach(event => {
    const dateKey = formatDate(event.fecha_inicio);
    if (!eventDatesMap.has(dateKey)) {
      eventDatesMap.set(dateKey, event.tipo_evento?.color || '#3b82f6'); // Color por defecto si no hay tipo
    }
  });

  // Componente personalizado para el día del calendario
  const DayContent = ({ date }) => {
    const dateKey = formatDate(date);
    const eventColor = eventDatesMap.get(dateKey);
    
    return (
      <div className="relative flex flex-col items-center justify-center h-full w-full">
        <span>{date.getDate()}</span>
        {eventColor && (
          <div 
            className="absolute bottom-1 h-1 w-1 rounded-full "
            style={{ backgroundColor: eventColor }}
          />
        )}
      </div>
    );
  };

  return (
    <div className='w-full'>
      <Calendar 
        mode="single"
        selected={selectedDate}
        modifiers={{
          hasEvent: (date) => eventDatesMap.has(formatDate(date))
        }}
        modifiersClassNames={{
          hasEvent: "has-event"
        }}
        onDayClick={handleDateClick}
        defaultMonth={selectedDate}
        weekStartsOn={1}
        components={{
          DayContent
        }}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 text-zinc-800 dark:text-zinc-200 sm:space-y-0 w-full ",
          month: "space-y-4 w-full ",
          table: "w-full",
          head_row: "flex w-full",
          head_cell: "text-muted-foreground w-full opacity-70",
          row: "flex w-full mt-2",
          cell: "text-center p-0 relative flex-1",
          day: cn(
            "h-9 xl:w-9 w-full p-0 font-normal rounded-full justify-center text-custom-gray-darker dark:text-custom-white dark:focus:text-custom-gray-darker",
            "hover:bg-custom-gray-light dark:hover:bg-custom-white dark:hover:text-custom-gray-darker",
            "relative"          ),
          day_selected: "bg-custom-gray-light dark:bg-custom-white dark:!text-custom-gray-darker rounded-full",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          day_today: "bg-custom-orange/40 focus:bg-custom-orange/80 dark:bg-custom-orange/40 dark:focus:bg-custom-orange/80 text-custom-white rounded-full dark:text-custom-white dark:focus:!text-custom-white",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 p-0",
          nav_button_previous: "absolute left-3 text-custom-gray-darker dark:text-custom-white",
          nav_button_next: "absolute right-3 text-custom-gray-darker dark:text-custom-white",
          caption: "flex justify-center pt-1 relative items-center bg-custom-white dark:bg-custom-blackLight px-4 py-1 rounded-full text-custom-gray-darker dark:text-custom-white",
          caption_label: "text-lg font-medium",
        }}
      />
    </div>
  )
}

export default Calendario
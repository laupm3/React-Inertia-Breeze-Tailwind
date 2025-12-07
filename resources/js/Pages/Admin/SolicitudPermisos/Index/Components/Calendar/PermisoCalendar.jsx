import React, { useState, useMemo, useRef, useCallback } from 'react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { SolicitudPermisosEvent } from './INITIAL_PERMISOS';
import { InfoCalendarDialog } from './InfoButtonCalendar';
import { EventClickDialog } from './EventClickDialog';
import { useView } from '@/hooks/useView';

import '@/Components/FullCalendar/styles.css';

// Función para obtener la fecha actual en el formato "dd-mm-yyyy"
const getCurrentDateForButton = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

// Componente para el tooltip de hover
const HoverTooltip = ({ children, tooltipText, tooltipClassName }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      {isHovering && tooltipText && (
        <div
          className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 min-w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg z-[1000] text-sm text-gray-700 dark:text-gray-200 ${tooltipClassName || ''}`}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default function PermisoCalendar({ initialView = 'dayGridMonth', solicitudesApi = [], permisosTiposApi = [], filteredEmployeeIds = [], filteredStatuses = [] }) {
  const [calendarApi, setCalendarApi] = useState(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showEventClickDialog, setShowEventClickDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);

  // Función para renderizar el evento en el calendario
  const renderEventContent = useCallback((eventInfo) => {
    const avatarElement = eventInfo.event.extendedProps.description;
    const empleadoNombre = eventInfo.event.extendedProps.empleadoNombre;
    const eventTitle = eventInfo.event.title;
    const estadoSolicitud = eventInfo.event.extendedProps.estadoSolicitud;

    return (
      <div className={`p-1 m-1 rounded-full text-custom-black cursor-pointer ${eventInfo.event.backgroundColor} transition-transform duration-300 ease-in-out hover:scale-95`}>
        <div className="flex items-center">
          {avatarElement && (
            <HoverTooltip tooltipText={`${empleadoNombre} - Estado: ${estadoSolicitud}`}>
              {React.isValidElement(avatarElement) ? React.cloneElement(avatarElement) : avatarElement}
            </HoverTooltip>
          )}
          <div className="flex-1 min-w-0">
            <HoverTooltip tooltipText={eventTitle}>
              <p className='ml-1 text-xs text-current font-bold truncate text-custom-black dark:text-custom-white'>
                {eventTitle}
              </p>
            </HoverTooltip>
          </div>
        </div>
      </div>
    );
  }, []);

  // Callback cuando el calendario se ha montado
  const handleCalendarMount = useCallback((info) => {
    setCalendarApi(info.view.calendar);
  }, []);

  // Función que se llamará cuando se haga clic en el botón de información
  const handleInfoButtonClick = useCallback(() => {
    setShowInfoDialog(true);
  }, []);

  // Función que se llamará cuando se haga clic en un evento
  const handleEventClick = useCallback((clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowEventClickDialog(true);
  }, []);

  const eventosTransformados = useMemo(() => {
    let filteredEvents = SolicitudPermisosEvent(solicitudesApi);

    // Filtrar por empleados
    if (filteredEmployeeIds && filteredEmployeeIds.length > 0) {
      filteredEvents = filteredEvents.filter(event =>
        event.extendedProps.permisoCompleto?.empleado?.id &&
        filteredEmployeeIds.includes(String(event.extendedProps.permisoCompleto.empleado.id))
      );
    }

    // Filtrar por estados
    if (filteredStatuses && filteredStatuses.length > 0) {
      filteredEvents = filteredEvents.filter(event =>
        event.extendedProps.estadoSolicitud &&
        filteredStatuses.includes(event.extendedProps.estadoSolicitud)
      );
    }

    return filteredEvents;
  }, [solicitudesApi, filteredEmployeeIds, filteredStatuses]);

  const permisosUnicosParaLeyenda = useMemo(() => {
    if (!permisosTiposApi || permisosTiposApi.length === 0) {
      // Si permisosTiposApi está vacío, intenta derivarlos de solicitudesApi
      const tiposDePermisosMap = new Map();
      solicitudesApi.forEach(solicitud => {
        if (solicitud.permiso && !tiposDePermisosMap.has(solicitud.permiso.id)) {
          tiposDePermisosMap.set(solicitud.permiso.id, solicitud.permiso);
        }
      });
      return Array.from(tiposDePermisosMap.values());
    }
    return permisosTiposApi;
  }, [solicitudesApi, permisosTiposApi]);

  const calendarButtonText = useMemo(() => ({
    today: getCurrentDateForButton(),
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Lista'
  }), []);

  return (
    <>
      <div className='w-full h-auto md:h-full overflow-x-auto'>
        <FullCalendar
          ref={calendarRef}
          locale="es"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev today next ',
            center: 'title',
            right: 'leyendaButton'
          }}
          customButtons={{
            leyendaButton: {
              text: 'Información de permisos',
              click: handleInfoButtonClick,
            }
          }}
          initialView={initialView}
          editable={false}
          selectable={false}
          selectMirror={true}
          dayMaxEvents={true}
          events={eventosTransformados}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          buttonText={calendarButtonText}
          firstDay={1}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          height="auto"
          contentHeight="auto"
          handleWindowResize={true}
          windowResizeDelay={100}
          viewDidMount={handleCalendarMount}
          datesSet={(dateInfo) => {

          }}

          allDaySlot={false}
          eventOverlap={false}
          slotEventOverlap={false}
          forceEventDuration={true}
          displayEventTime={true}
          views={{

            dayGridMonth: {
              eventDisplay: 'block'
            },
            timeGridWeek: {
              displayEventTime: false,
              allDaySlot: false,

            }
          }}

        />
      </div>
      <InfoCalendarDialog
        isOpen={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        permisosData={permisosUnicosParaLeyenda}
      />
      <EventClickDialog
        isOpen={showEventClickDialog}
        onClose={() => setShowEventClickDialog(false)}
        eventData={selectedEvent}
      />
    </>
  );
}
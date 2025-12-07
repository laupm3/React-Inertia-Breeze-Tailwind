import { useRef, useEffect } from 'react';
import './styles.css';
import { useSidebar } from "@/Components/ui/sidebar";

import Icon from '@/imports/LucideIcon';
import GetModalidadIcon from '@/Components/App/Horarios/Utils/GetModalidadIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SkeletonHorario from '@/Pages/User/Horarios/SkeletonHorario';

export default function Calendar({ range, horarios, fetchHorarios, loading }) {
  const {
    isMobile
  } = useSidebar();

  const calendarRef = useRef(null);

  useEffect(() => {
    if (!calendarRef.current) return;

    queueMicrotask(() => {
      const calendarApi = calendarRef.current.getApi();
      const desiredView = isMobile ? 'listWeek' : 'timeGridWeek';

      if (calendarApi.view.type !== desiredView) {
        calendarApi.changeView(desiredView);
      }
    });
  }, [isMobile]);


  // 1. Transformación segura
  const horariosTransformados = (Array.isArray(horarios) ? horarios : [])
    .filter(h => h.horario_inicio && h.horario_fin)
    .map(horario => ({
      id: horario.id,
      title: horario.turno.nombre,
      start: horario.horario_inicio,
      end: horario.horario_fin,
      backgroundColor: horario.turno.color,
      extendedProps: {
        hora_inicion: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        turnoDescription: horario.turno.descripcion,
        modalidadDescription: horario.modalidad.description,
        type: horario.modalidad.name ?? 'N/A',
        center: horario.centro.nombre ?? 'N/A',
        centroEmail: horario.centro.email ?? 'N/A',
        description: horario.descripcion ?? 'Sin descripción',
      },
    }));

  // 2. Calcular horas mínimas y máximas, con fallback
  const minMaxHours = horariosTransformados.length > 0
    ? horariosTransformados.reduce((acc, h) => {
      const dateStart = new Date(h.start);
      const dateEnd = new Date(h.end);
      const start = dateStart.getHours() * 3600 + dateStart.getMinutes() * 60;
      const end = dateEnd.getHours() * 3600 + dateEnd.getMinutes() * 60;
      return {
        start: acc.start === undefined ? start : Math.min(acc.start, start),
        end: acc.end === undefined ? end : Math.max(acc.end, end),
      };
    }, {})
    : { start: 21600, end: 79200 };

  // 3. Utilidades
  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    return `${h}:00:00`;
  };

  const handleDatesSet = (arg) => {
    const from = arg.startStr.split('T')[0];
    const to = arg.endStr.split('T')[0];

    const adjustedToDate = new Date(to);
    adjustedToDate.setDate(adjustedToDate.getDate() - 1);
    const toDateString = adjustedToDate.toISOString().split('T')[0];

    fetchHorarios(from, toDateString);
  };

  const renderEventContent = (eventInfo) => {
    const isWeekView = eventInfo.view.type === 'timeGridWeek';
    const isMonthView = eventInfo.view.type === 'dayGridMonth';
    const isListWeekView = eventInfo.view.type === 'listWeek';

    return (
      <div className="w-full h-full rounded-2xl p-2 bg-custom-gray-default dark:bg-custom-gray-darker text-custom-black dark:text-custom-white shadow-md shadow-custom-black/15 dark:shadow-custom-black/80 flex flex-col justify-between"
        style={{ border: `4px solid ${eventInfo.event.backgroundColor}` }}>
        <div className="w-fit max-w-full py-0.5 px-2 rounded-xl text-custom-black font-medium mb-1"
          style={{ backgroundColor: eventInfo.event.backgroundColor }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-xs font-bold text-wrap">{eventInfo.event.title}</p>
              </TooltipTrigger>
              <TooltipContent>
                {isMonthView ? (
                  <div className="text-xs space-y-2">
                    <p>{eventInfo.event.extendedProps.center}</p>
                    <p>{eventInfo.event.extendedProps.modalidadDescription}</p>
                    <p>{eventInfo.event.extendedProps.turnoDescription}</p>
                    <p>{eventInfo.event.extendedProps.hora_inicion} - {eventInfo.event.extendedProps.hora_fin}</p>
                  </div>
                ) : (
                  <p className="text-xs">{eventInfo.event.extendedProps.turnoDescription}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {eventInfo.event.extendedProps.type === 'vacations' ? (
          <div className="w-fit p-2 rounded-full text-custom-black"
            style={{ backgroundColor: eventInfo.event.backgroundColor }}>
            <Icon name='TreePalm' size='14' />
          </div>
        ) : (
          <div>
            {/* Semana */}
            {isWeekView && (
              <>
                <div className="flex items-center text-xs text-nowrap overflow-hidden italic mb-2">
                  <div className='min-w-4 w-4 mr-1'>
                    <GetModalidadIcon modalidad={eventInfo.event.extendedProps.type} />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="text-xs font-bold">{eventInfo.event.extendedProps.center}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className='flex flex-col gap-2'>
                          <p className="text-xs font-bold">{eventInfo.event.extendedProps.center}</p>
                          <p className="text-xs">{eventInfo.event.extendedProps.modalidadDescription}</p>
                          <p className="text-xs mt-2">{eventInfo.event.extendedProps.centroEmail}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center text-xs italic">
                  {eventInfo.timeText || 'N/A'}
                </div>
              </>
            )}
            {/* Mes o Movil */}
            {(isMonthView || isMobile) && (
              <div className="flex flex-col text-xs text-nowrap overflow-hidden italic">
                <p className="text-xs">{eventInfo.event.extendedProps.hora_inicion} - {eventInfo.event.extendedProps.hora_fin}</p>
                <div className='flex flex-row'>
                  <div className='min-w-4 w-4 mr-1'>
                    <GetModalidadIcon modalidad={eventInfo.event.extendedProps.type} />
                  </div>
                  <p className="text-xs font-bold">{eventInfo.event.extendedProps.center}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 4. Render con overlay de loading si aplica
  return (
    <>
      {loading && (
        <SkeletonHorario />
      )}

      <section className={`${loading && 'hidden'}`}>
        <FullCalendar
          ref={calendarRef}
          locale="es"
          scrollTime="00:00:00"
          datesSet={handleDatesSet}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: 'prev today next',
            center: '',
            right: isMobile ? '' : 'timeGridWeek,dayGridMonth',
          }}
          initialView={isMobile ? 'listWeek' : 'timeGridWeek'}
          editable={false}
          selectable={false}
          selectMirror={true}
          dayMaxEvents={false}
          events={horariosTransformados}
          allDaySlot={false}
          eventContent={renderEventContent}
          buttonText={{
            today: `${range.from} - ${range.to}`,
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            list: 'Lista'
          }}
          firstDay={1}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          slotMinTime={formatTime(minMaxHours.start)}
          slotMaxTime="24:00:00"
        />
      </section>
    </>
  );
}

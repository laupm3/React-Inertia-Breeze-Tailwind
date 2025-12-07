import { useRef, useEffect, useState } from 'react';
import { useSidebar } from "@/Components/ui/sidebar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import './styles.css'

import Icon from '@/imports/LucideIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/Components/ui/dialog";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SkeletonHorario from './SkeletonHorario';

function EventCalendar({ type, events = null }) {
  const {
    isMobile
  } = useSidebar();

  const calendarRef = useRef(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [visibleRange, setVisibleRange] = useState({ from: '', to: '' });

  const handleDatesSet = (arg) => {
    const from = arg.startStr.split('T')[0];
    const to = new Date(arg.endStr.split('T')[0]);
    to.setDate(to.getDate() - 1);
    const toFormatted = to.toISOString().split('T')[0];

    setVisibleRange({ from, to: toFormatted });
  };

  useEffect(() => {
    if (!calendarRef.current || !type) return;

    queueMicrotask(() => {
      const calendarApi = calendarRef.current.getApi();
      const viewMap = {
        day: 'timeGridDay',
        week: 'timeGridWeek',
        month: 'dayGridMonth',
      };

      const desiredView = isMobile ? 'listWeek' : (viewMap[type] ?? 'timeGridWeek');

      if (calendarApi.view.type !== desiredView) {
        calendarApi.changeView(desiredView);
      }
    });
  }, [isMobile, type]);

  // 1. Transformación segura
  const transformarEventos = (lista) => (
    Array.isArray(lista) ? lista : []
  ).filter(e => e.fecha_inicio && e.hora_inicio)
    .map(evento => {
      const start = `${evento.fecha_inicio}T${evento.hora_inicio}`;
      const [h, m] = evento.hora_inicio.split(':');
      const endDate = new Date(evento.fecha_inicio);
      endDate.setHours(+h + 1, +m); // Añade 1 hora

      return {
        id: evento.id,
        title: evento.nombre ?? 'Sin título',
        start,
        end: endDate.toISOString(),
        backgroundColor: evento.tipo_evento?.color ?? '#888',
        extendedProps: {
          image: evento.imagen,
          day: evento.fecha_inicio,
          time: evento.hora_inicio,
          rawDescription: evento.descripcion,
          creator: evento.creador?.name ?? 'Desconocido',
          type: evento.tipo_evento?.nombre ?? 'N/A',
          users: evento.users ?? [],
          canManage: evento.can_manage ?? false,
        }
      };
    });

  // 2. Calcular horas mínimas y máximas, con fallback
  const calcularMinMaxHoras = (eventos) => {
    if (eventos.length === 0) return { start: 21600, end: 79200 }; // 6:00 a 22:00

    return eventos.reduce((acc, h) => {
      const startDate = new Date(h.start);
      const endDate = new Date(h.end);
      const start = startDate.getHours() * 3600; // minutos a 0
      const end = (endDate.getHours() + 1) * 3600; // fuerza al próximo en punto

      return {
        start: acc.start === undefined ? start : Math.min(acc.start, start),
        end: acc.end === undefined ? end : Math.max(acc.end, end),
      };
    }, {});
  };

  // 3. Utilidades
  const segundosAHora = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    return `${h}:${m}:00`;
  };

  const renderEventContent = (eventInfo) => {
    const isDayView = eventInfo.view.type === 'timeGridDay';
    const isWeekView = eventInfo.view.type === 'timeGridWeek';
    const isMonthView = eventInfo.view.type === 'dayGridMonth';

    return (
      <section
        onClick={() => setActiveEvent(eventInfo.event)}
        className={`flex flex-col w-full bg-custom-gray-default dark:bg-custom-blackSemi shadow-md shadow-custom-black/15 dark:shadow-custom-black/80 rounded-2xl p-2 items-start overflow-hidden text-ellipsis cursor-pointer hover:shadow-sm duration-300 ${isMobile && 'max-w-32'}`}
      >
        {isDayView ? (
          <>
            <div className='flex flex-row w-full'>
              {/* Nombre y color */}
              <div className='flex flex-row items-center'>
                <div className='flex flex-row items-center'>
                  <div className='mi-w-4 w-4 min-h-4 h-4 rounded-full mr-2' style={{ backgroundColor: eventInfo.event.backgroundColor }} />
                  <p
                    className="text-custom-black dark:text-custom-white font-bold text-nowrap"
                    style={{ color: eventInfo.event.backgroundColor }}
                  >
                    {eventInfo.event.title}
                  </p>
                </div>
              </div>

              {/* Fecha y hora */}
              <div className='flex flex-col gap-1 ml-auto text-custom-orange p-1'>
                <div className='flex flex-row items-center gap-1'>
                  <Icon name='Calendar' size='12' />
                  <p className="text-custom-black dark:text-custom-white text-xs">
                    {format(new Date(eventInfo.event.extendedProps.day), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
                <div className='flex flex-row items-center gap-1'>
                  <Icon name='Clock' size='12' />
                  <p className="text-custom-black dark:text-custom-white text-xs">{eventInfo.event.extendedProps.time}</p>
                </div>
              </div>
            </div>

            {/* Usuario creador */}
            <div className='flex flex-row items-center gap-1 mt-2 pb-1'>
              <Icon name='User' size='16' className='text-custom-orange' />
              <p className="text-custom-black dark:text-custom-white text-xs">{eventInfo.event.extendedProps.creator}</p>
            </div>
          </>
        ) : isWeekView || isMonthView || isMobile ? (
          <div
            className='flex flex-row w-full items-center'
          >
            <div
              className='w-4 h-4 min-w-4 min-h-4 rounded-full mr-2'
              style={{ backgroundColor: eventInfo.event.backgroundColor }}
            />
            <p className="text-custom-black dark:text-custom-white font-bold text-sm truncate whitespace-nowrap overflow-hidden">
              {eventInfo.event.title}
            </p>
          </div>
        ) : (
          <>
            <Icon name='AlertTriangle' size='16' />
            <p className="font-bold">Ha ocurrido un error</p>
          </>
        )}
      </section>
    );
  };

  const eventosTransformados = transformarEventos(events);
  const minMaxHours = calcularMinMaxHoras(eventosTransformados);

  const goToToday = () => calendarRef.current?.getApi().today();
  const goToPrev = () => calendarRef.current?.getApi().prev();
  const goToNext = () => calendarRef.current?.getApi().next();

  return (
    <>
      {!events && (
        <SkeletonHorario />
      )}

      {(visibleRange?.from && visibleRange?.to && isMobile) && (
        <div className="flex flex-row mb-2 items-center w-fit text-sm px-4 py-2 gap-4 rounded-full font-medium bg-custom-gray-default dark:bg-custom-blackSemi text-custom-black dark:text-custom-white">
          <button onClick={goToPrev} className="flex items-center justify-center w-6 h-6 mr-2 rounded-full hover:bg-custom-gray-light dark:hover:bg-custom-blackLight">
            <Icon name='ChevronLeft' size='24' />
          </button>
          <button onClick={goToToday} className="flex flex-row items-center">
            {type === 'day'
              ? format(new Date(visibleRange.from), 'd MMMM', { locale: es })
              : `${format(new Date(visibleRange.from), 'd MMMM', { locale: es })} - ${format(new Date(visibleRange.to), 'd MMMM', { locale: es })}`}
          </button>
          <button onClick={goToNext} className="flex items-center justify-center w-6 h-6 ml-2 rounded-full hover:bg-custom-gray-light dark:hover:bg-custom-blackLight">
            <Icon name='ChevronRight' size='24' />
          </button>
        </div>
      )}

      <section className={`${!events ? 'hidden' : ''}`}>
        <FullCalendar
          ref={calendarRef}
          showNonCurrentDates={true}
          dayMaxEventRows={true}
          locale="es"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={isMobile ? 'listWeek' : 'timeGridWeek'}
          headerToolbar={{
            left: `${isMobile ? '' : 'prev today next'}`,
            center: '',
            right: '',
          }}
          editable={false}
          selectable={false}
          events={eventosTransformados}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          allDaySlot={false}
          slotMinTime={segundosAHora(minMaxHours.start)}
          slotMaxTime={segundosAHora(minMaxHours.end)}
          scrollTime="00:00:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          firstDay={1}
          buttonText={{
            today: (visibleRange?.from && visibleRange?.to)
              ? type === 'day'
                ? format(new Date(visibleRange.from), 'd MMMM', { locale: es })
                : `${format(new Date(visibleRange.from), 'd MMMM', { locale: es })} - ${format(new Date(visibleRange.to), 'd MMMM', { locale: es })}`
              : '',
            month: 'Mes',
            week: 'Semana',
            list: 'Lista',
          }}
        />
      </section>

      <Dialog open={activeEvent !== null} onOpenChange={() => setActiveEvent(null)}>
        <DialogContent className='bg-custom-white dark:bg-custom-blackLight'>
          <DialogHeader>
            <DialogTitle className='flex flex-row'>
              <div
                className='w-4 h-4 min-w-4 min-h-4 rounded-full mr-2'
                style={{ backgroundColor: activeEvent?.backgroundColor }}
              />
              {activeEvent?.title}
            </DialogTitle>
            <DialogDescription className='hidden'>
              {activeEvent?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-row items-center gap-1 rounded-full px-2 py-1 bg-custom-gray-default dark:bg-custom-blackSemi">
              <Icon name='Calendar' size='16' className='text-custom-orange' />
              {(activeEvent?.extendedProps?.day)}
            </div>
            <div className="flex flex-row items-center gap-1 rounded-full px-2 py-1 bg-custom-gray-default dark:bg-custom-blackSemi">
              <Icon name='Clock' size='16' className='text-custom-orange' />
              {activeEvent?.extendedProps?.time}
            </div>
            <div
              className="flex flex-row items-center gap-1 rounded-full px-2 py-1 bg-custom-gray-default dark:bg-custom-blackSemi"
              style={{ backgroundColor: `${activeEvent?.backgroundColor}50` }}
            >
              <div className='mi-w-4 w-4 min-h-4 h-4 rounded-full' style={{ backgroundColor: activeEvent?.backgroundColor }} />
              {(activeEvent?.extendedProps?.type)}
            </div>
          </div>

          <div className="mt-4 text-sm">
            <div className='felx flex-col bg-custom-gray-default dark:bg-custom-blackSemi py-2 px-4 rounded-xl'>
              {(() => {
                try {
                  const raw = JSON.parse(activeEvent?.extendedProps?.rawDescription ?? '{}');
                  const first = Object.values(raw)?.[0]?.value?.[0]?.children?.[0]?.text;
                  return first ?? 'Sin descripción';
                } catch {
                  return 'Descripción no válida';
                }
              })()}
            </div>
          </div>

          <DialogFooter>
            <section className='flex flex-col w-full gap-1 overflow-hidden'>
              {activeEvent?.extendedProps?.creator && (
                <div className='flex flex-row w-full items-center gap-1'>
                  <Icon name='User' size='16' className='text-custom-orange' />
                  <p className="text-sm text-muted-foreground">Creador: {activeEvent.extendedProps.creator}</p>
                </div>
              )}
              {activeEvent?.extendedProps?.creator && (
                <div className='flex flex-row w-full items-center gap-1'>
                  <Icon name='Share2' size='16' className='text-custom-orange' />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="text-sm text-muted-foreground text-nowrap truncate">
                          Conpartido con: {activeEvent.extendedProps.users.slice(0, 3).map(u => u.name).join(', ')}
                          {activeEvent.extendedProps.users.length > 3 ? '...' : ''}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className='text-xs'>
                          {activeEvent.extendedProps.users.map(u => (
                            <div key={u.id}>{u.name}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </section>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EventCalendar
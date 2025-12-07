import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Calendario from '@/Components/OwnUi/Calendario'

import CreateUpdateDialog from "@/Blocks/Events/Partials/CreateUpdateDialog/CreateUpdateDialog";
import ViewEventDialog from "@/Blocks/Events/Partials/ViewEventDialog/ViewEventDialog";
import SearchEvents from '@/Pages/AllEvents/Partials/SearchEvents';
import EventFilters from '@/Pages/AllEvents/Partials/EventFilters';
import AllEventsSkeleton from '@/Pages/AllEvents/Partials/AllEventsSkeleton';

import useEvents from "@/hooks/useEvents";
import useEventDescription from "@/hooks/useEventDescription";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";
import { sortEvents, SORT_TYPES } from "@/utils/eventDateUtils";

import EventList from './Partials/EventList';
import EventCalendar from './Partials/EventCalendar';

import { Head } from '@inertiajs/react'
import { useState, useMemo } from 'react'
import { useSidebar } from "@/Components/ui/sidebar";
import Icon from '@/imports/LucideIcon';

function AllEvents() {
  const {
    isMobile
  } = useSidebar();
  // Custom hooks
  const { events, eventTypes, createEvent, updateEvent, deleteEvent, isLoading } = useEvents();
  const { extractTextFromDescription } = useEventDescription();
  const {
    dateRange,
    setDateRange,
    filteredEvents: dateFilteredEvents,
    clearDateFilter,
    hasDateFilter
  } = useDateRangeFilter(events);

  // States - UI
  const [section, setSection] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Función handleCreateEvent
  const handleCreateEvent = async (eventData) => {
    const result = await createEvent(eventData);
    if (result.success) {
      setIsCreateModalOpen(false);
    }
  };

  // Función handleUpdateEvent
  const handleUpdateEvent = async (eventData) => {
    const result = await updateEvent(eventData);
    if (result.success) {
      setIsCreateModalOpen(false);
      setSelectedEvent(null);
    }
  };
  // Función handleDeleteEvent
  const handleDeleteEvent = (eventId) => {
    deleteEvent(eventId);
  };

  // Función handleOpenEventDetails
  const handleOpenEventDetails = (event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  // Función handleEditEvent
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.fecha_inicio));
    setIsCreateModalOpen(true);
  };

  // Función para filtrar eventos por búsqueda de texto
  const searchInEvents = (events, searchTerm) => {
    if (!searchTerm) return events;

    const term = searchTerm.toLowerCase();
    return events.filter(event => {
      // Buscar en nombre
      if (event.nombre && event.nombre.toLowerCase().includes(term)) {
        return true;
      }

      // Buscar en descripción
      if (event.descripcion) {
        const descriptionText = extractTextFromDescription(event.descripcion);
        if (descriptionText && descriptionText.toLowerCase().includes(term)) {
          return true;
        }
      }

      return false;
    });
  };

  // Función filteredEvents mejorada
  // Filtra los eventos por tipo, término de búsqueda y fecha
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(dateFilteredEvents) || dateFilteredEvents.length === 0) {
      return [];
    }

    let result = dateFilteredEvents;

    // Filtrar por tipo de evento si hay uno seleccionado
    if (selectedEventType !== null) {
      result = result.filter(event => {
        const eventTypeId = event.tipo_evento_id || (event.tipo_evento && event.tipo_evento.id);
        return eventTypeId === selectedEventType;
      });
    }

    // Filtrar por término de búsqueda
    result = searchInEvents(result, searchTerm);

    // Ordenar los eventos por fecha y hora (más recientes primero)
    return sortEvents(result, SORT_TYPES.DATETIME_DESC);
  }, [dateFilteredEvents, selectedEventType, searchTerm, extractTextFromDescription]);

  const sectionButton = (type, text) => (
    <button
      onClick={() => setSection(type)}
      className={`${section === type && 'bg-custom-gray-default dark:bg-custom-blackLight'} py-2 px-4 rounded-md text-sm mr-4`}
    >
      {text}
    </button>
  )

  return (
    <>
      <Head title="Events" />

      {/* Mostrar skeleton mientras está cargando */}
      {isLoading ? (
        <AllEventsSkeleton />
      ) : (
        <div className='flex flex-col lg:flex-row justify-start w-full gap-4 lg:gap-16 p-4 lg:p-8'>
          {/* Calendario */}
          {section === 'list' &&
            <div className='w-full h-fit lg:w-2/5 border-none bg-custom-white dark:bg-custom-blackSemi rounded-2xl py-4 lg:py-8 px-2 lg:px-4'>
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
          }

          {/* Lista de Eventos */}
          <div className={`${section === 'list' ? 'w-full lg:w-3/5' : 'w-full'} border-none md:bg-custom-white md:dark:bg-custom-blackSemi rounded-2xl p-4 lg:p-8`}>

            {/* Modos de visualización */}
            <div className={`flex flex-row w-full ${isMobile ? 'justify-center mb-4' : 'justify-end'}`}>
              {/* Listado */}
              {sectionButton('list', 'Listado')}
              {/* Separador vertical */}
              <div className="w-px h-8 mr-4 bg-gray-200 dark:bg-custom-gray-semiDark"></div>
              {isMobile ? (
                <>
                  {sectionButton('day', 'Calendario')}
                </>
              ) : (
                <>
                  {/* Dia */}
                  {sectionButton('day', 'Día')}
                  {/* Semana */}
                  {sectionButton('week', 'Semana')}
                  {/* Mes */}
                  {sectionButton('month', 'Mes')}
                </>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Todos los Eventos</h2>

              {/* Indicador de filtros activos y botón para limpiar */}
              {(searchTerm || selectedEventType || hasDateFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedEventType(null);
                    clearDateFilter();
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Filtros y búsqueda */}
            <div className="mb-6 space-y-4">
              <h3 className="text-md font-medium mb-2 dark:text-white">Filtrar eventos</h3>

              {/* Buscador y filtros en la misma línea */}
              <div className="flex items-center gap-3">
                {/* EventFilters a la izquierda (incluye FilterEventType + botón Filtrar) */}
                <EventFilters
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  eventTypes={eventTypes}
                  selectedEventType={selectedEventType}
                  onEventTypeChange={setSelectedEventType}
                  hasDateFilter={hasDateFilter}
                  clearDateFilter={clearDateFilter}
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                />

                {/* Buscador de eventos a la derecha */}
                <div className="flex-1">
                  <SearchEvents
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>
              </div>
            </div>

            {/* Contenido de la sección */}
            {section === 'list' ? (
              /* Lista de eventos */
              <EventList
                filteredEvents={filteredEvents}
                handleOpenEventDetails={handleOpenEventDetails}
                extractTextFromDescription={extractTextFromDescription}
              />
            ) : section === 'day' || section === 'week' || section === 'month' ? (
              <EventCalendar
                type={section}
                events={filteredEvents}
              />
            ) : (
              <>
                <Icon name="AlertTriangle" size='16' />
                <p>Ha ocurrido un error</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Crear/Editar Dialog */}
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
    </>
  )
}

export default AllEvents

AllEvents.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
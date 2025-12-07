import { Skeleton } from "@/Components/ui/skeleton";

/**
 * AllEventsSkeleton Component - Muestra un skeleton loading específico para la página AllEvents
 * Simula la estructura real de la página con calendario, filtros y lista de eventos
 * 
 * @returns {JSX.Element}
 */
export default function AllEventsSkeleton() {
  
  // Componente skeleton para las tarjetas de eventos
  const EventCardSkeleton = () => (
    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
      {/* Lado izquierdo: círculo + contenido */}
      <div className="flex items-center space-x-3">
        {/* Círculo indicador */}
        <div className="m-4">
          <Skeleton className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="space-y-2">
          {/* Título */}
          <Skeleton className="h-4 w-32 bg-gray-300 dark:bg-gray-600" />
          {/* Descripción */}
          <Skeleton className="h-3 w-24 bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>
      
      {/* Lado derecho: fecha y hora */}
      <div className="space-y-2">
        {/* Fecha */}
        <div className="flex items-center">
          <Skeleton className="w-3 h-3 mr-1 bg-gray-300 dark:bg-gray-600" />
          <Skeleton className="h-3 w-16 bg-gray-300 dark:bg-gray-600" />
        </div>
        {/* Hora */}
        <div className="flex items-center">
          <Skeleton className="w-3 h-3 mr-1 bg-gray-300 dark:bg-gray-600" />
          <Skeleton className="h-3 w-12 bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>
    </div>
  );

  // Componente skeleton para filtros
  const FilterSkeleton = () => (
    <div className="space-y-3">
      {/* Título del filtro */}
      <Skeleton className="h-4 w-24 bg-gray-300 dark:bg-gray-600" />
      {/* Contenido del filtro */}
      <Skeleton className="h-8 w-full bg-gray-300 dark:bg-gray-600 rounded-lg" />
    </div>
  );

  // Componente skeleton para pills de tipo de evento
  const EventTypePillsSkeleton = () => (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton 
          key={index} 
          className="h-8 bg-gray-300 dark:bg-gray-600 rounded-full"
          style={{ width: `${Math.floor(Math.random() * 30) + 60}px` }}
        />
      ))}
    </div>
  );

  return (
    <div className='flex flex-col lg:flex-row justify-start w-full gap-4 lg:gap-16 p-4 lg:p-8'>
      {/* Calendario Skeleton */}
      <div className='w-full h-fit lg:w-2/5 border-none bg-custom-white dark:bg-custom-blackSemi rounded-2xl py-4 lg:py-8 px-2 lg:px-4'>
        <div className="space-y-4">
          {/* Header del calendario */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20 bg-gray-300 dark:bg-gray-600" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 bg-gray-300 dark:bg-gray-600" />
              <Skeleton className="h-8 w-8 bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
          
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-6 bg-gray-300 dark:bg-gray-600 mx-auto" />
            ))}
          </div>
          
          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-8 bg-gray-300 dark:bg-gray-600 mx-auto" />
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Eventos Skeleton */}
      <div className='w-full lg:w-3/5 border-none bg-custom-white dark:bg-custom-blackSemi rounded-2xl p-4 lg:p-8'>
        {/* Título y botón */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32 bg-gray-300 dark:bg-gray-600" />
          <Skeleton className="h-4 w-20 bg-gray-300 dark:bg-gray-600" />
        </div>
          {/* Filtros y búsqueda */}
        <div className="mb-6 space-y-4">
          <Skeleton className="h-5 w-24 bg-gray-300 dark:bg-gray-600" />          {/* Buscador y filtros en la misma línea */}
          <div className="flex items-center gap-3">
            {/* Botón Filtrar a la izquierda */}
            <Skeleton className="h-10 w-20 bg-gray-300 dark:bg-gray-600 rounded-full" />
            
            {/* Buscador a la derecha */}
            <div className="flex-1">
              <Skeleton className="h-10 w-full bg-gray-300 dark:bg-gray-600 rounded-lg" />
            </div>
          </div>
        </div>
        
        {/* Lista de eventos */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

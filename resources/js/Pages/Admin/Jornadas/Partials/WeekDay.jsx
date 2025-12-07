import GetModalidadIcon from "@/Components/App/Horarios/Utils/GetModalidadIcon";
import Icon from "@/imports/LucideIcon";
import { Skeleton } from "@/Components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

/**

 * Componente para renderizar un día laboral de la semana
 * 
 * @param {Object} props The props 
 * @returns 
 */
export default function WeekDay({ weekday, dayIndex = 0, isLoading = false }) {
  // Array con los nombres de los días de la semana
  const weekdayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];


  // Obtener el nombre del día según el índice
  const dayName = (weekday && weekday.weekday_name) ?
    weekday.weekday_name :
    (dayIndex >= 0 && dayIndex < weekdayNames.length) ?
      weekdayNames[dayIndex] :
      weekdayNames[0];

  // Si no hay datos, está cargando o no hay turno, mostrar versión con esqueletos
  const showSkeleton = isLoading || !weekday || !weekday.turno;

  // Destructura los datos del día si están disponibles
  const { esquema = {}, centro = {}, turno = {}, modalidad = {} } = weekday || {};

  return (
    <div className="flex">
      {showSkeleton ? (
        <>
          <Skeleton className="h-full min-h-full w-[10px] min-w-[10px] rounded-ss-xl rounded-es-xl" />

          <div className="flex flex-col flex-1 py-2 px-3 bg-custom-gray-default dark:bg-custom-blackSemi rounded-ee-xl rounded-se-xl gap-1
           max-w-[12rem] min-w-[12rem] overflow-hidden">
            <div className="flex font-bold">
              <span>{dayName}</span>
            </div>

            {/* Esqueleto para el horario */}
            <div className="flex flex-row justify-start gap-1 items-center">
              <Icon name="Clock" className="w-4 h-4" />
              <Skeleton className="h-4 w-full bg-custom-gray-semiLight" />
            </div>

            {/* Esqueleto para la modalidad */}
            <div className="flex flex-row flex-nowrap justify-start gap-1 items-center">
              <Skeleton className="h-4 w-full bg-custom-gray-semiLight" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="h-full min-h-full w-[10px] min-w-[10px] rounded-ss-xl rounded-es-xl"
            style={{ backgroundColor: turno?.color || '#ccc' }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex flex-col flex-1 py-2 px-3 bg-custom-gray-default dark:bg-custom-blackSemi rounded-ee-xl rounded-se-xl gap-1 max-w-[12rem] min-w-[12rem] overflow-hidden"
              >
                <div className="flex text-end font-bold">
                  {dayName}
                </div>
                <div className="flex flex-row justify-start gap-1 items-center text-nowrap">
                  <Icon name="Clock" className="w-4 h-4" />
                  {turno.horaInicio}
                  <Icon name="ArrowRight" className="w-3 h-3" />
                  {turno.horaFin}
                </div>
                <div className="flex flex-row flex-nowrap justify-start gap-1 items-center">
                  {modalidad ? (
                    <>
                      <div>
                        <GetModalidadIcon modalidad={modalidad?.name} className={'h-4 w-4'} />
                      </div>
                      <span className="text-nowrap">
                        {centro.nombre || 'Sin centro'}
                      </span>
                      -
                      <span className="text-ellipsis overflow-hidden text-nowrap font-medium">
                        {centro.empresa.nombre || 'Sin centro'}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">Sin modalidad asignada</span>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1.5">
                <section className="flex flex-row items-center gap-2 text-sm">
                  <div
                    className="inline-block min-w-4 w-4 min-h-4 h-4 rounded-sm"
                    style={{ backgroundColor: turno?.color || '#ccc' }}
                  />
                  <p>{turno?.nombre}</p>
                </section>
                <section className="flex flex-row items-center gap-2 text-sm">
                  <Icon name='Clock' size='16' className="text-custom-orange" />
                  {turno?.horaInicio} <Icon name="ArrowRight" className={"w-3"} /> {turno?.horaFin}
                </section>
                <span className="flex flex-row gap-2 text-sm">
                  <GetModalidadIcon modalidad={modalidad?.name} className={'h-4 w-4 text-custom-orange'} />
                  {modalidad?.name}
                </span>
                <span className="flex flex-row gap-2 text-sm">
                  <Icon name='Building2' size='16' className="text-custom-orange" />
                  {centro?.nombre || 'Sin centro'} - <span className="font-bold">{centro?.empresa?.nombre || 'Sin centro'}</span>
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}
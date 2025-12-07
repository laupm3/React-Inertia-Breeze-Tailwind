import GetModalidadIcon from "@/Components/App/Horarios/Utils/GetModalidadIcon";
import Icon from "@/imports/LucideIcon";
import { Skeleton } from "@/Components/ui/skeleton";

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

  // Destructura los datos del día si están disponibles
  const { esquema = {}, turno = {}, modalidad = {} } = weekday || {};

  const showSkeleton = Object.keys(esquema).length === 0;

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
          <div
            className="flex flex-col flex-1 py-2 px-3 bg-custom-gray-default dark:bg-custom-blackLight rounded-ee-xl rounded-se-xl gap-1 max-w-[12rem] min-w-[12rem] overflow-hidden"
          >
            <div className="flex text-end font-bold">
              {dayName}
            </div>
            <div className="flex flex-row justify-start gap-1 items-center text-nowrap">
              <Icon name="Clock" className="w-4 h-4" />
              {turno?.horaInicio}
              <Icon name="ArrowRight" className="w-4 h-4" />
              {turno?.horaFin}
            </div>

            <div className="flex flex-row flex-nowrap justify-start gap-1 items-center">
              {turno ? (
                <>
                  <div>
                    <GetModalidadIcon modalidad={modalidad?.name} className={'h-4 w-4'} />
                  </div>
                  <span className="text-nowrap">
                    {turno?.centro?.nombre || 'Sin centro'}
                  </span>
                  -
                  <span className="text-ellipsis overflow-hidden text-nowrap font-medium">
                    {turno?.centro?.empresa?.nombre || 'Sin centro'}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500">Sin modalidad asignada</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
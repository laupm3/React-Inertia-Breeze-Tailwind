import GetModalidadIcon from "@/Components/App/Horarios/Utils/GetModalidadIcon";
import Icon from "@/imports/LucideIcon";
import { CalendarClock } from "lucide-react";
import FichajePills from "@/Pages/Admin/Horarios/Components/FichajePills";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

/**
 * HorarioEmpleado
 * 
 * Componente que visualiza el detalle de un horario laboral de empleado.
 * Muestra información relativa al turno, modalidad, centro y horarios de trabajo.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.horario - Objeto que contiene los datos del horario
 * @param {Object} props.horario.centro - Información del centro de trabajo
 * @param {Object} props.horario.turno - Información del turno (incluye color)
 * @param {Object} props.horario.modalidad - Tipo de modalidad laboral
 * @param {string} props.horario.horarioInicio - Hora de inicio del turno
 * @param {string} props.horario.horarioFin - Hora de finalización del turno
 * 
 * @returns {JSX.Element} Tarjeta con el detalle del horario laboral
 * 
 * Estructura visual:
 * - Sección superior: Indicadores del estado del fichaje del empleado
 * - Sección inferior:
 *   - Barra lateral con el color del turno, indicativo para diferenciar turnos
 *   - Bloque de información con:
 *     - Horas de inicio y fin teórico del horario
 *     - Modalidad y nombre del centro
 */
export default function HorarioEmpleado({ horario }) {

    const {
        centro,
        turno,
        modalidad,
        horarioInicio,
        horarioFin
    } = horario;

    return (
        <TooltipProvider delayDuration={600}>
            <div className="grid grid-cols-1 gap-y-1">
                <div className="flex py-2 px-3 rounded-xl justify-between items-center gap-2 bg-custom-gray-default dark:bg-custom-blackSemi">
                    <CalendarClock className="w-4 h-4" />
                    <FichajePills horario={horario} />
                </div>
                <div className="flex bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl overflow-hidden">
                    <div
                        className="h-full min-h-full w-[10px] min-w-[10px] rounded-ss-xl rounded-es-xl"
                        style={{ backgroundColor: turno.color }}
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className="flex flex-col flex-1 py-2 px-3 rounded-ee-xl rounded-se-xl gap-1 max-w-[12rem] min-w-[12rem] overflow-hidden cursor-pointer"
                            >
                                <div className="flex flex-row justify-start gap-1 items-center text-nowrap">
                                    <Icon name="Clock" className="w-4 h-4" />
                                    {horarioInicio}
                                    <Icon name="ArrowRight" className="w-3 h-3" />
                                    {horarioFin}
                                </div>
                                <div className="flex flex-row flex-nowrap justify-start gap-1 items-center">
                                    <div>
                                        <GetModalidadIcon modalidad={modalidad.name} className={'h-4 w-4'} />
                                    </div>
                                    <span className="text-nowrap"> {centro.nombre} </span>
                                    <span> - </span>
                                    <span className="text-ellipsis overflow-hidden text-nowrap font-bold"> {centro.empresa.nombre} </span>
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="flex flex-col gap-1.5">
                                <section className="flex flex-row items-center gap-2 text-sm">
                                    <div
                                        className="inline-block min-w-4 w-4 min-h-4 h-4 rounded-sm"
                                        style={{ backgroundColor: turno.color }}
                                    />
                                    <p>{turno.nombre}</p>
                                </section>
                                <section className="flex flex-row items-center gap-2 text-sm">
                                    <Icon name='Clock' size='16' className="text-custom-orange" />
                                    {horarioInicio} <Icon name="ArrowRight" className={"w-3"} /> {horarioFin}
                                </section>
                                <span className="flex flex-row gap-2 text-sm">
                                    <GetModalidadIcon modalidad={modalidad.name} className={'h-4 w-4 text-custom-orange'} />
                                    {modalidad.name}
                                </span>
                                <span className="flex flex-row gap-2 text-sm">
                                    <Icon name='Building2' size='16' className="text-custom-orange" />
                                    {centro.nombre} - <span className="font-bold">{centro.empresa.nombre}</span>
                                </span>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}
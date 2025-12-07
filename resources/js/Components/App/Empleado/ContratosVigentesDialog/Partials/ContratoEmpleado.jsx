import WeekDay from "@/Pages/Admin/Jornadas/Partials/WeekDay";
import { Calendar } from "lucide-react";
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ContratoEmpleado({ contrato }) {

    return (
        <div className="border-4 border-custom-gray-default p-4 rounded-xl flex-1">
            <div>
                <div className="flex items-center gap-1 mb-2 text-base sm:text-md">
                    <span className="text-custom-orange font-bold">
                        {contrato.asignacion?.nombre || "Asignación no especificada"}
                    </span>
                    <span className="text-custom-blackLight dark:text-custom-white">
                        |
                    </span>
                    <span className="text-custom-blackLight dark:text-custom-white">
                        {contrato.asignacion?.n_expediente || "Nº Expediente no especificado"}
                    </span>
                </div>

                <div className="lg:grid lg:grid-cols-2 gap-5 space-y-3 lg:space-y-0">
                    <div className="bg-custom-gray-default p-6 rounded-xl">
                        <div className="mb-3">
                            <h3 className="text-custom-blackSemi font-bold">
                                Tipo de contrato
                            </h3>
                            <p className="text-custom-blackSemi">
                                {contrato.tipo_contrato?.nombre || contrato.tipoContrato?.nombre || "Tipo de contrato no especificado"}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-custom-blackSemi font-bold">
                                Antigüedad
                            </h3>
                            <p className="text-custom-blackSemi">
                                {calculateAntiguedad(contrato.fechaInicio)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-custom-gray-default p-5 rounded-xl">
                        <div className="mb-3">
                            <h3 className="text-custom-blackSemi font-bold">
                                Fecha de inicio
                            </h3>
                            <p className="text-custom-blackSemi flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(contrato.fechaInicio)}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-custom-blackSemi font-bold">
                                Fecha de finalización
                            </h3>
                            <p className="text-custom-blackSemi flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(contrato.fechaFin) || "En vigor"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información de jornada */}
            {contrato.jornada && (
                <div>
                    <h3 className="text-custom-blue dark:text-white font-bold my-2">
                        Jornadas
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {contrato.jornada.esquema
                            .map((weekday, index) => {
                                const weekdayData = prepareWeekdayData(weekday);
                                return weekdayData ? (
                                    <WeekDay
                                        key={index}
                                        weekday={weekdayData}
                                    />
                                ) : null;
                            })
                            .filter(Boolean)}
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * Calcula la antigüedad desde una fecha hasta hoy de manera elegante y localizada
 * 
 * @param {string|Date} fechaInicio - Fecha de inicio del contrato
 * @returns {string|null} - Texto formateado con la antigüedad
 */
function calculateAntiguedad(fechaInicio) {
    if (!fechaInicio) return null;

    try {
        const startDate = typeof fechaInicio === 'string' ? parseISO(fechaInicio) : fechaInicio;
        const today = new Date();

        return formatDistanceStrict(today, startDate, {
            locale: es,
            addSuffix: false,
            unit: 'day', // comenzar calculando desde la unidad más pequeña
            roundingMethod: 'floor' // redondear siempre hacia abajo para mayor precisión
        });
    } catch (error) {
        console.error("Error al calcular antigüedad:", error);
        return null;
    }
}

/**
 * Formatea una fecha en formato legible usando date-fns
 * 
 * @param {string|Date|null} dateString - Fecha a formatear
 * @param {string} [formatStr='dd/MM/yyyy'] - Formato deseado
 * @returns {string} Fecha formateada o mensaje alternativo
 */
const formatDate = (dateString, formatStr = 'dd/MM/yyyy') => {
    if (!dateString) return "En vigor";

    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

    try {
        return format(date, formatStr, {
            locale: es
        });
    } catch (error) {
        return typeof dateString === 'string' ? dateString : "Formato inválido";
    }
};


const prepareWeekdayData = (weekday) => {
    return {
        weekday_name: weekday.weekday_name,
        turno: {
            horaInicio: weekday.turno.hora_inicio || weekday.turno.horaInicio,
            horaFin: weekday.turno.hora_fin || weekday.turno.horaFin,
            color: weekday.turno.color,
        },
        modalidad: weekday.modalidad,
        centro: weekday.turno.centro,
    };
};
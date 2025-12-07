import ModalidadSelect from "@/Components/App/Turnos/ModalidadSelect";
import TurnoSelect from "@/Components/App/Turnos/TurnoSelect";

/**
 * 
 * @param {Object} props 
 * @param {Object} props.weekdayName Nombre del día de la semana
 * @param {Object} props.weekday Objeto con los datos del día de la semana
 * @param {Array} props.turnos Lista de turnos precargada
 * @param {Array} props.modalidades Lista de modalidades precargada
 * 
 * @returns {JSX.Element}
 */
export default function DayItem({ weekdayName, weekday, prevData, sincronizePrevData, turnos = [], modalidades = [] }) {

    const { weekday_number } = weekday;
    const { esquema } = prevData;

    const manageTurnoSelection = (turno) => {
        const validatedWeekDay = esquema.find((day) => day.weekday_number === weekday_number);

        // Si el día de la semana ya existe, vamos a actualizarlo con los nuevos valores
        if (validatedWeekDay) {
            validatedWeekDay.turno_id = (turno) ? turno.id : null;
            validatedWeekDay.turno = turno;
            
            // Si se deselecciona el turno, también limpiar la modalidad
            if (!turno) {
                validatedWeekDay.modalidad_id = null;
                validatedWeekDay.modalidad = null;
            }

            sincronizePrevData('esquema', [
                ...esquema.filter((day) => day.weekday_number !== weekday_number),
                validatedWeekDay
            ]);
            return;
        }

        sincronizePrevData('esquema', [
            ...esquema,
            {
                weekday_number,
                turno_id: (turno) ? turno.id : null,
                turno: turno,
                modalidad_id: null
            }
        ]);
    }

    const manageModalidadSelection = (modalidad) => {
        const validatedWeekDay = esquema.find((day) => day.weekday_number === weekday_number);

        // Si el día de la semana ya existe, vamos a actualizarlo con los nuevos valores
        if (validatedWeekDay) {
            validatedWeekDay.modalidad_id = (modalidad) ? modalidad.id : null;
            validatedWeekDay.modalidad = modalidad;

            sincronizePrevData('esquema', [
                ...esquema.filter((day) => day.weekday_number !== weekday_number),
                validatedWeekDay
            ]);
            return;
        }

        sincronizePrevData('esquema', [
            ...esquema,
            {
                weekday_number,
                turno_id: null,
                modalidad_id: (modalidad) ? modalidad.id : null,
                modalidad: modalidad
            }
        ]);
    }

    return (
        <tr className="">
            <td className=" p-2 font-medium">
                {weekdayName}
            </td>
            <td className=" p-2">
                <TurnoSelect
                    turnosData={turnos}
                    onSelect={manageTurnoSelection}
                    prevTurnoId={weekday.turno_id}
                />
            </td>
            <td className=" p-2">
                <div className="flex flex-col gap-1">
                    <ModalidadSelect
                        modalidadesData={modalidades}
                        onSelect={manageModalidadSelection}
                        prevModalidadId={weekday.modalidad_id}
                        disabled={!weekday.turno_id}
                    />
                    {weekday.turno_id && !weekday.modalidad_id && (
                        <span className="text-xs text-red-500">
                            Selecciona una modalidad
                        </span>
                    )}
                </div>
            </td>
        </tr>
    )
}
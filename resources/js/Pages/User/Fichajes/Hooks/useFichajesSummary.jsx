import { useDataHandler } from "../Context/DataHandlerContext";
import { useMemo } from "react";
import { differenceInMilliseconds, addDays } from "date-fns";

/**
 * Creates a valid Date object from a base date string and a time string.
 * This is crucial for correctly handling shifts that cross midnight.
 */
const createDateFromParts = (baseDateStr, timeStr) => {
    if (!baseDateStr || !timeStr) return null;
    const datePart = baseDateStr.split(' ')[0]; // Ensures we only get 'YYYY-MM-DD'
    return new Date(`${datePart}T${timeStr}`);
};

const calculateHoursForPeriod = (horarios) => {
    let totalMsFichaje = 0;
    let totalMsTeorico = 0;

    for (const horario of horarios) {
        const {
            fecha_inicio,
            horarioInicio,
            horarioFin,
            fichajeEntrada,
            fichajeSalida,
            descansosAdicionales
        } = horario;

        // --- Theoretical Hours Calculation ---
        let dHorarioInicio = createDateFromParts(fecha_inicio, horarioInicio);
        let dHorarioFin = createDateFromParts(fecha_inicio, horarioFin);
        if (dHorarioInicio && dHorarioFin && dHorarioFin < dHorarioInicio) {
            dHorarioFin = addDays(dHorarioFin, 1);
        }
        const msTeorico = (dHorarioInicio && dHorarioFin)
            ? differenceInMilliseconds(dHorarioFin, dHorarioInicio)
            : 0;
        totalMsTeorico += msTeorico;

        // --- Real Worked Time Calculation (taking breaks into account) ---
        let dFichajeEntrada = createDateFromParts(fecha_inicio, fichajeEntrada);
        let dFichajeSalida = createDateFromParts(fecha_inicio, fichajeSalida);
        if (dFichajeEntrada && dFichajeSalida && dFichajeSalida < dFichajeEntrada) {
            dFichajeSalida = addDays(dFichajeSalida, 1);
        }

        if (dFichajeEntrada && dFichajeSalida) {
            const allBreaks = (descansosAdicionales || [])
                .map(descanso => {
                    let start = createDateFromParts(fecha_inicio, descanso.descansoInicio);
                    let end = createDateFromParts(fecha_inicio, descanso.descansoFin);
                    if (start && end && end < start) end = addDays(end, 1);
                    return start && end ? { start, end } : null;
                })
                .filter(Boolean)
                .sort((a, b) => a.start - b.start);

            let lastPoint = dFichajeEntrada;
            let workedMs = 0;

            for (const br of allBreaks) {
                if (br.start > dFichajeSalida) break; // descanso fuera del rango
                if (br.start > lastPoint) {
                    workedMs += differenceInMilliseconds(br.start, lastPoint);
                }
                lastPoint = br.end > lastPoint ? br.end : lastPoint;
            }

            if (lastPoint < dFichajeSalida) {
                workedMs += differenceInMilliseconds(dFichajeSalida, lastPoint);
            }

            totalMsFichaje += workedMs;
        }
    }

    return { totalMsFichaje, totalMsTeorico };
};

const msToTime = (ms) => {
    if (isNaN(ms) || ms === null) return "00:00";
    const sign = ms < 0 ? "-" : "";
    const absMs = Math.abs(ms);
    const hours = Math.floor(absMs / 3600000);
    const minutes = Math.floor((absMs % 3600000) / 60000);
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export function useFichajesSummary() {
    const { data } = useDataHandler();

    const summary = useMemo(() => {
        const { totalMsFichaje, totalMsTeorico } = calculateHoursForPeriod(data || []);
        const balanceMs = totalMsFichaje - totalMsTeorico;

        const jornadaEfectuada = msToTime(totalMsFichaje);
        const jornadaTotal = msToTime(totalMsTeorico);
        
        const balanceTime = msToTime(balanceMs);
        const balanceHoras = balanceMs > 0 ? `+${balanceTime}` : balanceTime;

        return {
            jornadaEfectuada,
            jornadaTotal,
            balanceHoras
        };
    }, [data]);

    return summary;
}

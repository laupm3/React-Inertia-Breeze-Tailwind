
import { useState, useEffect } from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/Components/ui/tooltip';

const TimelineBar = ({ 
    fichajeEntrada, 
    fichajeSalida, 
    horarioInicio, 
    horarioFin, 
    descansoInicio, 
    descansoFin,
    descansos = [],
    mostrarTicks = false,
    segmentTooltipFormatter = (segment) => {
        const isWork = segment.label === 'Tiempo de trabajo' || segment.label === 'Tiempo trabajado';
        const isDelay = segment.label === 'Retraso';
        return (
            <div className="grid gap-1.5">
                <div className="font-semibold">{segment.label}</div>
                {segment.startTime && (
                    <div>
                        <span className="font-medium">{isWork ? 'Hora de entrada:' : isDelay ? 'Entrada prevista:' : 'Inicio:'}</span> {segment.startTime}
                    </div>
                )}
                {segment.endTime && (
                    <div>
                        <span className="font-medium">{isWork ? 'Hora de salida:' : isDelay ? 'Entrada real:' : 'Fin:'}</span> {segment.endTime}
                    </div>
                )}
                {segment.minutes && (
                    <div>
                        <span className="font-medium">Duración:</span> {segment.minutes} min
                    </div>
                )}
            </div>
        );
    },
    tickTooltipFormatter = (hour) => hour.time
}) => {
    // Estado para controlar tooltips táctiles
    const [openTooltip, setOpenTooltip] = useState(null);
    
    // Estado para forzar actualización cuando se inicia un descanso
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // Detectar si es dispositivo táctil de forma simple
    const isTouchDevice = () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    // Detectar cuando se inicia un descanso y forzar actualización
    useEffect(() => {
        if (descansoInicio && !descansoFin) {
            setUpdateTrigger(prev => prev + 1);
        }
    }, [descansoInicio, descansoFin]);

    const TOLERANCIA_MINUTOS = 15;

    // --- Turno nocturno: el inicio ocurre un día y la salida al siguiente ---
    const isNightShift = () => {
        if (horarioInicio && horarioFin) {
            const [startHour] = horarioInicio.split(':').map(Number);
            const [endHour]   = horarioFin.split(':').map(Number);
            // Caso 1: horario cruza medianoche (22:00 -> 06:00)
            if (startHour > endHour) return true;
            // Caso 2: horario empieza de madrugada (00-02) y la entrada real es la noche anterior (>=20h)
            if (startHour <= 2 && fichajeEntrada) {
                const [entryHour] = fichajeEntrada.split(':').map(Number);
                if (entryHour >= 20) return true;
            }
            // Caso 3: horario que termina a medianoche (20:00 -> 00:00, 21:00 -> 00:00, etc.)
            if (endHour === 0) return true;
        }
        return false;
    };

    const nightShift = isNightShift();

    // Hora que actúa como referencia para decidir si sumar 24h.
    //  - Si cruza medianoche: usar horarioInicio.
    //  - Si entrada es la noche anterior: usar fichajeEntrada.
    //  - Si termina a medianoche: usar horarioInicio.
    const anchorTime = nightShift
        ? ((() => {
            const [startHour] = (horarioInicio||'00:00').split(':').map(Number);
            const [endHour]   = (horarioFin||'00:00').split(':').map(Number);
            if (startHour > endHour) return horarioInicio; // caso clásico (22:00 -> 06:00)
            if (endHour === 0) return horarioInicio;       // caso termina a medianoche (20:00 -> 00:00)
            return fichajeEntrada || horarioInicio;        // caso entrada la noche anterior
        })())
        : null;

    // Convertir hora a minutos
    const timeToMinutes = (timeStr, isEndTime = false) => {
        if (!timeStr) return null;
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        let result = hours * 60 + minutes;
        
        if (nightShift && anchorTime) {
            const [anchorHours] = anchorTime.split(':').map(Number);
            
            // Caso especial: entrada anticipada en turno nocturno
            // Si es fichajeEntrada y es menor que el horario de inicio, no sumar 24h
            if (timeStr === fichajeEntrada && horarioInicio) {
                const [startHours] = horarioInicio.split(':').map(Number);
                if (hours < startHours) {
                    // Entrada anticipada: no sumar 24h, pertenece al mismo día
                    return result;
                }
            }
            
            // En turno nocturno, toda hora menor que la de referencia pertenece al día +1
            if (hours < anchorHours) {
                result += 24 * 60; // día siguiente
            }
        }
        else if (!nightShift && horarioInicio) {
            // Caso especial: turno que comienza de madrugada (00-06) pero el fichaje es la
            // noche anterior (20-23h). Detectamos diferencia >12h y restamos 24h para
            // situar esa hora en el "día previo" (minutos negativos).
            const [startH, startM] = horarioInicio.split(':').map(Number);
            const startMin = startH * 60 + startM;
            if (result - startMin > 12 * 60) {
                result -= 24 * 60;
            }
        }
        
        return result;
    };

    const minutesToHHMM = (minutes) => {
        const total = ((minutes % (24*60)) + (24*60)) % (24*60); // asegura positivo
        const hrs = Math.floor(total / 60);
        const mins = total % 60;
        return `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}`;
    };

    // Normalizar descansos: si se pasa el array 'descansos' úsalo, si no usa los props individuales
    const breaksArrayRaw = Array.isArray(descansos) && descansos.length
        ? descansos
        : (descansoInicio ? [{ inicio: descansoInicio, fin: descansoFin }] : []);



    // Convertir a minutos y ordenar
    const breaksArray = breaksArrayRaw.map(b => ({
        inicio: b.inicio || b.descanso_inicio || b.descansoInicio,
        fin:   b.fin   || b.descanso_fin   || b.descansoFin
    })).filter(b => b.inicio).map(b => ({
        inicioStr: b.inicio,
        finStr: b.fin,
        inicioMin: timeToMinutes(b.inicio),
        finMin: timeToMinutes(b.fin, true) // solo usar fin si existe, no actualizar constantemente
    })).sort((a,b)=> a.inicioMin - b.inicioMin);



    // 3) Build list of all minutes for scale
    const eventMinutesList = [
        timeToMinutes(fichajeEntrada),
        timeToMinutes(fichajeSalida, true),
        timeToMinutes(horarioInicio),
        timeToMinutes(horarioFin, true),
        ...breaksArray.flatMap(b => [b.inicioMin, b.finMin])
    ].filter(m=>m!==null);

    const minMinutesGlobal = eventMinutesList.length ? Math.min(...eventMinutesList) : 0;
    const maxMinutesGlobal = eventMinutesList.length ? Math.max(...eventMinutesList) : 0;

    // Convertir minutos a posición porcentual
    const minutesToPercentage = (minutes) => {
        if (minutes === null || maxMinutesGlobal === minMinutesGlobal) return 0;
        const total = maxMinutesGlobal - minMinutesGlobal;
        return Math.max(0, Math.min(100, ((minutes - minMinutesGlobal) / total) * 100));
    };

    // Convertir todas las horas a minutos primero
    const horarioInicioMin = timeToMinutes(horarioInicio);
    const horarioFinMin = timeToMinutes(horarioFin, true);
    const fichajeEntradaMin = timeToMinutes(fichajeEntrada);
    const fichajeSalidaMin = timeToMinutes(fichajeSalida, true);
    const descansoInicioMin = breaksArray.length ? breaksArray[0].inicioMin : null;
    const descansoFinMin = breaksArray.length ? breaksArray[breaksArray.length-1].finMin : null;
    const descansoFinEffective = breaksArray.length ? breaksArray[breaksArray.length-1].finStr : null;

    // Generar horas para mostrar
    const generateHours = () => {
        const hours = [];
        const timesToShow = [];
        
        // Si hay fichajes, mostrar solo fichajes. Si no hay fichajes, mostrar horarios planificados
        const hayFichajes = fichajeEntrada || fichajeSalida;
        
        if (hayFichajes) {
            // Mostrar solo horas reales fichadas
            if (fichajeEntrada) timesToShow.push({ time: fichajeEntrada, type: 'fichaje_entrada' });
            if (fichajeSalida) timesToShow.push({ time: fichajeSalida, type: 'fichaje_salida' });
        } else {
            // Sin fichajes, mostrar horarios planificados
            if (horarioInicio) timesToShow.push({ time: horarioInicio, type: 'horario_inicio' });
            if (horarioFin) timesToShow.push({ time: horarioFin, type: 'horario_fin' });
        }
        
        // Incluir todos los descansos y tiempo trabajado entre descansos (si existen)
        if (breaksArray.length) {
            breaksArray.forEach((br, idx) => {
                // Agregar hora de inicio del descanso
                timesToShow.push({ time: br.inicioStr, type: `descanso_inicio_${idx}` });
                
                // Agregar hora de fin del descanso (si existe)
                if (br.finStr) {
                    timesToShow.push({ time: br.finStr, type: `descanso_fin_${idx}` });
                } else {
                    // Si el descanso está en curso, agregar una hora estimada
                    const tiempoEstimado = horarioFinMin || (timeToMinutes(br.inicioStr) + 60);
                    const horaEstimada = minutesToHHMM(tiempoEstimado);
                    timesToShow.push({ time: horaEstimada, type: `descanso_fin_estimado_${idx}` });
                }
            });
        }
        else {
            if (descansoInicio) timesToShow.push({ time: descansoInicio, type: 'descanso_inicio' });
            if (descansoFinEffective) timesToShow.push({ time: descansoFinEffective, type: 'descanso_fin' });
            // Si hay descanso activo sin fin, agregar una hora estimada para mostrar el segmento
            if (descansoInicio && !descansoFinEffective) {
                const descansoInicioMin = timeToMinutes(descansoInicio);
                const tiempoEstimado = horarioFinMin || (descansoInicioMin + 60);
                const horaEstimada = minutesToHHMM(tiempoEstimado);
                timesToShow.push({ time: horaEstimada, type: 'descanso_fin_estimado' });
            }
        }
        
        // Convertir a minutos y agregar al array
        timesToShow.forEach(item => {
            const isEndType = item.type === 'fichaje_salida' || item.type === 'horario_fin' || item.type === 'descanso_fin';
            const minutes = timeToMinutes(item.time, isEndType);
            if (minutes !== null) {
                hours.push({ time: item.time, minutes, type: item.type });
            }
        });
        
        // Filtrar duplicados por minutos y ordenar
        return hours.filter((h, i, arr) => arr.findIndex(x => x.minutes === h.minutes) === i)
                   .sort((a, b) => a.minutes - b.minutes);
    };

    const segments = [];

    // 1. Horario planificado (solo si no hay fichajes)
    if (horarioInicioMin !== null && horarioFinMin !== null) {
        const noFichajes = !fichajeEntradaMin && !fichajeSalidaMin;
        
        if (noFichajes) {
            segments.push({
                left: minutesToPercentage(horarioInicioMin),
                width: minutesToPercentage(horarioFinMin) - minutesToPercentage(horarioInicioMin),
                color: 'bg-blue-300',
                label: 'Tiempo esperado de trabajo',
                startTime: horarioInicio,
                endTime: horarioFin,
                zIndex: 2
            });
        } else {
            segments.push({
                left: minutesToPercentage(horarioInicioMin),
                width: minutesToPercentage(horarioFinMin) - minutesToPercentage(horarioInicioMin),
                color: 'bg-blue-100',
                label: 'Horario planificado',
                startTime: horarioInicio,
                endTime: horarioFin,
                zIndex: 1
            });
        }
    }

    // 2. Fichajes
    if (fichajeEntradaMin !== null && fichajeSalidaMin !== null) {
        // Tiempo de trabajo con posibilidad de múltiples descansos
        // Crear segmentos de trabajo divididos por múltiples descansos
        let currentStartMin = fichajeEntradaMin;
        let currentStartStr = fichajeEntrada;

        breaksArray.forEach(br => {
            if (br.inicioMin > currentStartMin && br.inicioMin < fichajeSalidaMin) {
                segments.push({
                    left: minutesToPercentage(currentStartMin),
                    width: minutesToPercentage(br.inicioMin) - minutesToPercentage(currentStartMin),
                    color: 'bg-blue-500',
                    label: 'Tiempo trabajado',
                    startTime: currentStartStr,
                    endTime: br.inicioStr,
                    minutes: br.inicioMin - currentStartMin,
                    zIndex: 3
                });
            }

            // segmento de descanso
            if (br.finMin !== null) {
                // Descanso completado
                segments.push({
                    left: minutesToPercentage(br.inicioMin),
                    width: minutesToPercentage(br.finMin) - minutesToPercentage(br.inicioMin),
                    color: 'bg-yellow-400',
                    label: 'Descanso',
                    startTime: br.inicioStr,
                    endTime: br.finStr,
                    minutes: br.finMin - br.inicioMin,
                    zIndex: 2
                });
            } else {
                // Descanso en curso
                const tiempoEstimado = horarioFinMin || (br.inicioMin + 60); // 1 hora por defecto
                segments.push({
                    left: minutesToPercentage(br.inicioMin),
                    width: minutesToPercentage(tiempoEstimado) - minutesToPercentage(br.inicioMin),
                    color: 'bg-yellow-400',
                    label: 'Descanso en curso',
                    startTime: br.inicioStr,
                    endTime: 'en curso',
                    zIndex: 2
                });
            }

            if (br.finMin !== null) {
                currentStartMin = br.finMin;
                currentStartStr = br.finStr;
            } else {
                // Si el descanso está en curso, no continuar con más segmentos
                currentStartMin = fichajeSalidaMin;
                currentStartStr = fichajeSalida;
            }
        });

        if (fichajeSalidaMin > currentStartMin) {
            segments.push({
                left: minutesToPercentage(currentStartMin),
                width: minutesToPercentage(fichajeSalidaMin) - minutesToPercentage(currentStartMin),
                color: 'bg-blue-500',
                label: 'Tiempo trabajado',
                startTime: currentStartStr,
                endTime: fichajeSalida,
                minutes: fichajeSalidaMin - currentStartMin,
                zIndex: 3
            });
        }

        // Retraso
        if (horarioInicioMin !== null && fichajeEntradaMin > (horarioInicioMin + TOLERANCIA_MINUTOS)) {
            const delayMin = fichajeEntradaMin - horarioInicioMin;
            segments.push({
                left: minutesToPercentage(horarioInicioMin),
                width: minutesToPercentage(fichajeEntradaMin) - minutesToPercentage(horarioInicioMin),
                color: 'bg-red-500',
                label: 'Retraso',
                startTime: horarioInicio,
                endTime: fichajeEntrada,
                minutes: delayMin,
                zIndex: 4
            });
        }

        // Entrada anticipada
        if (horarioInicioMin !== null && fichajeEntradaMin < (horarioInicioMin - TOLERANCIA_MINUTOS)) {
            const extraLead = horarioInicioMin - fichajeEntradaMin;
            segments.push({
                left: minutesToPercentage(fichajeEntradaMin),
                width: minutesToPercentage(horarioInicioMin) - minutesToPercentage(fichajeEntradaMin),
                color: 'bg-green-500',
                label: 'Tiempo extra',
                startTime: fichajeEntrada,
                endTime: horarioInicio,
                minutes: extraLead,
                zIndex: 4
            });
        }

        // Salida anticipada
        if (horarioFinMin !== null && fichajeSalidaMin < (horarioFinMin - TOLERANCIA_MINUTOS)) {
            segments.push({
                left: minutesToPercentage(fichajeSalidaMin),
                width: minutesToPercentage(horarioFinMin) - minutesToPercentage(fichajeSalidaMin),
                color: 'bg-gray-300',
                label: 'No trabajado',
                startTime: fichajeSalida,
                endTime: horarioFin,
                minutes: horarioFinMin - fichajeSalidaMin,
                zIndex: 4
            });
        }

        // Tiempo extra al final
        if (horarioFinMin !== null && fichajeSalidaMin > (horarioFinMin + TOLERANCIA_MINUTOS)) {
            const extraTail = fichajeSalidaMin - horarioFinMin;
            segments.push({
                left: minutesToPercentage(horarioFinMin),
                width: minutesToPercentage(fichajeSalidaMin) - minutesToPercentage(horarioFinMin),
                color: 'bg-green-500',
                label: 'Tiempo extra',
                startTime: horarioFin,
                endTime: fichajeSalida,
                minutes: extraTail,
                zIndex: 4
            });
        }
    }
    else if (fichajeEntradaMin !== null) {
        // Solo entrada
        const tiempoHasta = descansoInicioMin || horarioFinMin;
        
        if (tiempoHasta && fichajeEntradaMin < tiempoHasta) {
            segments.push({
                left: minutesToPercentage(fichajeEntradaMin),
                width: minutesToPercentage(tiempoHasta) - minutesToPercentage(fichajeEntradaMin),
                color: 'bg-blue-500',
                label: 'Tiempo trabajado',
                startTime: fichajeEntrada,
                endTime: tiempoHasta === descansoInicioMin ? descansoInicio : horarioFin,
                minutes: (tiempoHasta - fichajeEntradaMin),
                zIndex: 3
            });
        }

        // Retraso
        if (horarioInicioMin !== null && fichajeEntradaMin > (horarioInicioMin + TOLERANCIA_MINUTOS)) {
            const delayMin = fichajeEntradaMin - horarioInicioMin;
            segments.push({
                left: minutesToPercentage(horarioInicioMin),
                width: minutesToPercentage(fichajeEntradaMin) - minutesToPercentage(horarioInicioMin),
                color: 'bg-red-500',
                label: 'Retraso',
                startTime: horarioInicio,
                endTime: fichajeEntrada,
                minutes: delayMin,
                zIndex: 4
            });
        }
        
        // Entrada anticipada
        if (horarioInicioMin !== null && fichajeEntradaMin < (horarioInicioMin - TOLERANCIA_MINUTOS)) {
            const extraLead = horarioInicioMin - fichajeEntradaMin;
            segments.push({
                left: minutesToPercentage(fichajeEntradaMin),
                width: minutesToPercentage(horarioInicioMin) - minutesToPercentage(fichajeEntradaMin),
                color: 'bg-green-500',
                label: 'Tiempo extra',
                startTime: fichajeEntrada,
                endTime: horarioInicio,
                minutes: extraLead,
                zIndex: 3
            });
        }

        // Tiempo esperado restante
        if (descansoFinMin !== null && horarioFinMin !== null && descansoFinMin < horarioFinMin) {
            segments.push({
                left: minutesToPercentage(descansoFinMin),
                width: minutesToPercentage(horarioFinMin) - minutesToPercentage(descansoFinMin),
                color: 'bg-blue-200',
                label: 'Tiempo esperado restante',
                startTime: descansoFinEffective,
                endTime: horarioFin,
                minutes: horarioFinMin - descansoFinMin,
                zIndex: 2
            });
        }

        // Mostrar descansos adicionales y tiempo trabajado entre descansos cuando solo hay entrada
        if (breaksArray.length > 0) {
            let previousBreakEnd = null;
            let previousBreakEndStr = null;

            breaksArray.forEach((br, index) => {
                // Mostrar tiempo trabajado entre descansos (solo si hay descanso anterior completado)
                if (previousBreakEnd !== null && br.inicioMin > previousBreakEnd) {
                    segments.push({
                        left: minutesToPercentage(previousBreakEnd),
                        width: minutesToPercentage(br.inicioMin) - minutesToPercentage(previousBreakEnd),
                        color: 'bg-blue-500',
                        label: 'Tiempo trabajado',
                        startTime: previousBreakEndStr,
                        endTime: br.inicioStr,
                        minutes: br.inicioMin - previousBreakEnd,
                        zIndex: 3
                    });
                }

                // Mostrar el descanso
                if (br.finMin !== null) {
                    // Descanso completado
                    segments.push({
                        left: minutesToPercentage(br.inicioMin),
                        width: minutesToPercentage(br.finMin) - minutesToPercentage(br.inicioMin),
                        color: 'bg-yellow-400',
                        label: 'Descanso',
                        startTime: br.inicioStr,
                        endTime: br.finStr,
                        minutes: br.finMin - br.inicioMin,
                        zIndex: 2
                    });
                    
                    // Guardar el fin de este descanso para el siguiente
                    previousBreakEnd = br.finMin;
                    previousBreakEndStr = br.finStr;
                } else {
                    // Descanso en curso
                    const tiempoEstimado = horarioFinMin || (br.inicioMin + 60);
                    segments.push({
                        left: minutesToPercentage(br.inicioMin),
                        width: minutesToPercentage(tiempoEstimado) - minutesToPercentage(br.inicioMin),
                        color: 'bg-yellow-400',
                        label: 'Descanso en curso',
                        startTime: br.inicioStr,
                        endTime: 'en curso',
                        zIndex: 2
                    });
                    
                    // Si el descanso está en curso, no continuar con más segmentos
                    previousBreakEnd = null;
                }
            });
        }
    }
    else if (fichajeSalidaMin !== null) {
        // Solo salida
        segments.push({
            left: Math.max(0, minutesToPercentage(fichajeSalidaMin) - 0.5),
            width: 1,
            color: 'bg-blue-600',
            label: 'Salida registrada',
            startTime: fichajeSalida,
            zIndex: 4
        });

        // Salida anticipada
        if (horarioFinMin !== null && fichajeSalidaMin < (horarioFinMin - TOLERANCIA_MINUTOS)) {
            segments.push({
                left: minutesToPercentage(fichajeSalidaMin),
                width: minutesToPercentage(horarioFinMin) - minutesToPercentage(fichajeSalidaMin),
                color: 'bg-gray-300',
                label: 'No trabajado',
                startTime: fichajeSalida,
                endTime: horarioFin,
                minutes: horarioFinMin - fichajeSalidaMin,
                zIndex: 3
            });
        }

        // Tiempo extra
        if (horarioFinMin !== null && fichajeSalidaMin > (horarioFinMin + TOLERANCIA_MINUTOS)) {
            const extraTail = fichajeSalidaMin - horarioFinMin;
            segments.push({
                left: minutesToPercentage(horarioFinMin),
                width: minutesToPercentage(fichajeSalidaMin) - minutesToPercentage(horarioFinMin),
                color: 'bg-green-500',
                label: 'Tiempo extra',
                startTime: horarioFin,
                endTime: fichajeSalida,
                minutes: extraTail,
                zIndex: 3
            });
        }
    }

    // 3. Descanso
    if (breaksArray.length === 0 && descansoInicioMin !== null) {
        const mostrarDescanso = 
            (fichajeEntradaMin && fichajeSalidaMin) ||
            (fichajeEntradaMin && !fichajeSalidaMin && fichajeEntradaMin <= descansoInicioMin) ||
            (!fichajeEntradaMin && !fichajeSalidaMin && horarioInicioMin);
            
        if (mostrarDescanso) {
            if (descansoFinMin !== null) {
                // Descanso completado
                const descansoDuration = descansoFinMin - descansoInicioMin;
                segments.push({
                    left: minutesToPercentage(descansoInicioMin),
                    width: minutesToPercentage(descansoFinMin) - minutesToPercentage(descansoInicioMin),
                    color: 'bg-yellow-300',
                    label: 'Descanso planificado',
                    startTime: descansoInicio,
                    endTime: descansoFinEffective || 'en curso',
                    minutes: descansoDuration,
                    zIndex: 3
                });
            } else {
                // Descanso activo (sin fin)
                const tiempoHasta = horarioFinMin || (descansoInicioMin + 60); // 1 hora por defecto
                segments.push({
                    left: minutesToPercentage(descansoInicioMin),
                    width: minutesToPercentage(tiempoHasta) - minutesToPercentage(descansoInicioMin),
                    color: 'bg-yellow-400',
                    label: 'Descanso en curso',
                    startTime: descansoInicio,
                    endTime: 'en curso',
                    zIndex: 3
                });
            }
        }
    }

    const hours = generateHours();

    return (
        <TooltipProvider>
        <div className="w-full md:w-[300px] lg:w-full md:overflow-x-auto">
            {/* Renderizar ticks solo si se solicita */}
            {mostrarTicks && (
                <div className="relative mb-2 h-4">
                    {hours.map((hour, idx) => (
                        <Tooltip key={idx} delayDuration={isTouchDevice() ? 0 : 100}>
                            <TooltipTrigger asChild>
                                <div
                                    className="absolute w-0.5 h-full bg-gray-400 cursor-pointer timeline-segment"
                                    style={{ left: `${minutesToPercentage(hour.minutes)}%` }}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="z-[120]">{tickTooltipFormatter(hour)}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            )}
            
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {segments.map((segment, index) => (
                    <Tooltip key={index} delayDuration={isTouchDevice() ? 0 : 100}>
                        <TooltipTrigger asChild>
                            <div
                                className={`absolute top-0 h-full ${segment.color} transition-all duration-300 cursor-pointer timeline-segment`}
                                style={{
                                    left: `${Math.max(0, segment.left)}%`,
                                    width: `${Math.max(0, segment.width)}%`,
                                    zIndex: segment.zIndex
                                }}
                            />
                        </TooltipTrigger>
                        <TooltipContent className="z-[120]">{segmentTooltipFormatter(segment)}</TooltipContent>
                    </Tooltip>
                ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    <span className="text-gray-600">Retraso</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-gray-600">Tiempo de trabajo</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                    <span className="text-gray-600">Descanso</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-gray-600">Tiempo extra</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                    <span className="text-gray-600">No trabajado</span>
                </div>
            </div>
        </div>
        </TooltipProvider>
    );
};

export default TimelineBar; 
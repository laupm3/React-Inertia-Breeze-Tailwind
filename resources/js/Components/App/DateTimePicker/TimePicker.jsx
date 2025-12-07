"use client";

import * as React from "react";
import { ClockIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { es } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button } from "@/Components/App/Buttons/Button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";

// Funciones helper internas para convertir entre string y Date
const timeStringToDate = (timeString) => {
    if (!timeString || timeString === '') return undefined;
    try {
        const [hours, minutes] = timeString.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return undefined;
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    } catch (error) {
        console.warn('Error converting time string to date:', error);
        return undefined;
    }
};

const dateToTimeString = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    try {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch (error) {
        console.warn('Error converting date to time string:', error);
        return '';
    }
};

export function TimePicker({
    value, // Puede ser un string "HH:mm" o un objeto Date
    onChange, // Callback que recibe el valor según outputFormat
    placeholder = "HH:mm",
    disabled = false,
    minuteStep = 5,
    format: timeFormat = "HH:mm",
    className,
    modal = false,
    outputFormat = 'date' // 'date' devuelve Date object, 'string' devuelve "HH:mm"
}) {
    // Normalizar el valor de entrada - convertir string a Date si es necesario
    const normalizeValue = (val) => {
        if (typeof val === 'string') {
            return timeStringToDate(val);
        }
        return val;
    };

    const [internalTime, setInternalTime] = React.useState(normalizeValue(value));
    const [isOpen, setIsOpen] = React.useState(false);

    // Estado controlado vs no controlado
    const currentTime = value !== undefined ? normalizeValue(value) : internalTime;

    // Memoizar arrays para performance
    const hours = React.useMemo(() =>
        Array.from({ length: 24 }, (_, i) => i),
        []
    );

    const minutes = React.useMemo(() =>
        Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep),
        [minuteStep]
    );

    // Handler para cambios de hora
    const handleTimeChange = React.useCallback((newTime) => {
        if (value === undefined) {
            setInternalTime(newTime);
        }
        
        // Convertir el output según el formato deseado
        const outputValue = outputFormat === 'string' ? dateToTimeString(newTime) : newTime;
        onChange?.(outputValue);
    }, [value, onChange, outputFormat]);

    // Handler para cambios de tiempo
    const handleTimeSelection = React.useCallback((
        type,
        selectedValue
    ) => {
        const numValue = parseInt(selectedValue, 10);

        // Validación de entrada
        if (isNaN(numValue)) return;
        if (type === "hour" && (numValue < 0 || numValue > 23)) return;
        if (type === "minute" && (numValue < 0 || numValue > 59)) return;

        if (currentTime && currentTime instanceof Date && !isNaN(currentTime.getTime())) {
            // Crear nueva instancia para inmutabilidad
            const newTime = new Date(currentTime.getTime());
            if (type === "hour") {
                newTime.setHours(numValue);
            } else if (type === "minute") {
                newTime.setMinutes(numValue);
            }
            handleTimeChange(newTime);
        } else {
            // Si no hay hora válida, crear una nueva con la fecha actual y hora seleccionada
            const newTime = new Date();
            newTime.setSeconds(0, 0); // Limpiar segundos y milisegundos
            if (type === "hour") {
                newTime.setHours(numValue);
                newTime.setMinutes(0); // Reset minutos si es primera selección
            } else if (type === "minute") {
                newTime.setMinutes(numValue);
                newTime.setHours(0); // Reset horas si es primera selección
            }
            handleTimeChange(newTime);
        }
    }, [currentTime, handleTimeChange]);

    // Sincronizar valor interno cuando cambia el valor externo
    React.useEffect(() => {
        if (value !== undefined) {
            setInternalTime(normalizeValue(value));
        }
    }, [value]);

    // Manejar teclas de escape
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOpen]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen} modal={modal}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start text-left font-normal p-2 bg-custom-gray-default dark:bg-custom-blackSemi border-none text-gray-800 dark:text-gray-200 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi",
                        !currentTime && "text-gray-500 dark:text-gray-500",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    disabled={disabled}
                    aria-label="Seleccionar hora"
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                >
                    <ClockIcon className="mr-2 h-4 w-4 flex-shrink-0 text-custom-orange" />
                    <span className="truncate">
                        {currentTime && currentTime instanceof Date && !isNaN(currentTime.getTime()) ? (
                            format(currentTime, timeFormat, { locale: es })
                        ) : (
                            placeholder
                        )}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker" align="start">
                <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                    {/* Horas */}
                    <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                            <div className="text-sm font-medium p-2 sm:hidden text-custom-blue dark:text-custom-white">Horas</div>
                            {hours.map((hour) => (
                                <Button
                                    key={hour}
                                    size="icon"
                                    variant={
                                        currentTime && currentTime instanceof Date && !isNaN(currentTime.getTime()) && currentTime.getHours() === hour
                                            ? "primary"
                                            : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square rounded-lg"
                                    onClick={() => handleTimeSelection("hour", hour.toString())}
                                    aria-label={`Seleccionar hora ${hour.toString().padStart(2, '0')}`}
                                >
                                    <span className="text-sm">
                                        {hour.toString().padStart(2, '0')}
                                    </span>
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                    </ScrollArea>

                    {/* Minutos */}
                    <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                            <div className="text-sm font-medium p-2 sm:hidden text-custom-blue dark:text-custom-white">Minutos</div>
                            {minutes.map((minute) => (
                                <Button
                                    key={minute}
                                    size="icon"
                                    variant={
                                        currentTime && currentTime instanceof Date && !isNaN(currentTime.getTime()) && currentTime.getMinutes() === minute
                                            ? "primary"
                                            : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square rounded-lg"
                                    onClick={() => handleTimeSelection("minute", minute.toString())}
                                    aria-label={`Seleccionar minuto ${minute.toString().padStart(2, '0')}`}
                                >
                                    <span className="text-sm">
                                        {minute.toString().padStart(2, '0')}
                                    </span>
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Export default para compatibilidad
export default TimePicker;

/*
Ejemplo de uso:

// Para trabajar con objetos Date:
<TimePicker
    value={dateValue}
    onChange={(date) => setDateValue(date)}
    outputFormat="date"
/>

// Para trabajar con strings "HH:mm":
<TimePicker
    value={timeString}
    onChange={(timeString) => setTimeString(timeString)}
    outputFormat="string"
/>

// También acepta string como valor de entrada incluso con outputFormat="date":
<TimePicker
    value="14:30"
    onChange={(date) => console.log(date)}
    outputFormat="date"
/>
*/

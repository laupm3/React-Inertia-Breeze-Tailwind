"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, Locale } from "date-fns";
import { es } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button } from "@/Components/App/Buttons/Button";
import { Calendar } from "@/Components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";

interface DateTimePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    minuteStep?: number;
    format?: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
    locale?: Locale;
    modal?: boolean; // Para compatibilidad con Popover
}

export function DateTimePicker24h({
    value,
    onChange,
    placeholder = "MM/DD/YYYY HH:mm",
    disabled = false,
    minuteStep = 5,
    format: dateFormat = "MM/dd/yyyy HH:mm",
    className,
    minDate,
    maxDate,
    locale = es, // ✅ Español por defecto,
    modal = false // Para compatibilidad con Popover
}: DateTimePickerProps) {
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);
    const [isOpen, setIsOpen] = React.useState(false);

    // Estado controlado vs no controlado
    const currentDate = value !== undefined ? value : internalDate;

    // Memoizar arrays para performance
    const hours = React.useMemo(() =>
        Array.from({ length: 24 }, (_, i) => i),
        []
    );

    const minutes = React.useMemo(() =>
        Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep),
        [minuteStep]
    );

    // Handler para cambios de fecha/hora
    const handleDateChange = React.useCallback((newDate: Date | undefined) => {
        if (value === undefined) {
            setInternalDate(newDate);
        }
        onChange?.(newDate);
    }, [value, onChange]);

    // Handler para selección de fecha del calendario
    const handleDateSelect = React.useCallback((selectedDate: Date | undefined) => {
        if (selectedDate) {
            if (currentDate) {
                // Preservar hora actual al cambiar fecha
                const newDate = new Date(selectedDate);
                newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
                handleDateChange(newDate);
            } else {
                // Si no hay fecha previa, usar la nueva fecha con hora 00:00
                handleDateChange(selectedDate);
            }
        }
    }, [currentDate, handleDateChange]);

    // Handler para cambios de tiempo
    const handleTimeChange = React.useCallback((
        type: "hour" | "minute",
        value: string
    ) => {
        const numValue = parseInt(value, 10);

        // Validación de entrada
        if (isNaN(numValue)) return;
        if (type === "hour" && (numValue < 0 || numValue > 23)) return;
        if (type === "minute" && (numValue < 0 || numValue > 59)) return;

        if (currentDate) {
            // Crear nueva instancia para inmutabilidad
            const newDate = new Date(currentDate.getTime());
            if (type === "hour") {
                newDate.setHours(numValue);
            } else if (type === "minute") {
                newDate.setMinutes(numValue);
            }
            handleDateChange(newDate);
        } else {
            // Si no hay fecha, crear una nueva con la fecha actual
            const newDate = new Date();
            newDate.setSeconds(0, 0); // Limpiar segundos y milisegundos
            if (type === "hour") {
                newDate.setHours(numValue);
            } else if (type === "minute") {
                newDate.setMinutes(numValue);
            }
            handleDateChange(newDate);
        }
    }, [currentDate, handleDateChange]);

    // Manejar teclas de escape
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
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
                        !currentDate && "text-gray-500 dark:text-gray-500",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    disabled={disabled}
                    aria-label="Seleccionar fecha y hora"
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentDate ? (
                        format(currentDate, dateFormat, { locale }) // ✅ Usar locale
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker" align="start">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={handleDateSelect}
                        locale={locale} // ✅ Pasar locale al Calendar
                        disabled={(date) => {
                            if (minDate && date < minDate) return true;
                            if (maxDate && date > maxDate) return true;
                            return false;
                        }}
                        initialFocus
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        {/* Horas */}
                        <ScrollArea
                            className="w-64 sm:w-auto"
                        >
                            <div className="flex sm:flex-col p-2">
                                <div className="text-sm font-medium p-2 sm:hidden text-custom-blue dark:text-custom-white">Horas</div>
                                {hours.map((hour) => (
                                    <Button
                                        key={hour}
                                        size="icon"
                                        variant={
                                            currentDate && currentDate.getHours() === hour
                                                ? "primary"
                                                : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square rounded-lg"
                                        onClick={() => handleTimeChange("hour", hour.toString())}
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
                                            currentDate && currentDate.getMinutes() === minute
                                                ? "primary"
                                                : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square rounded-lg"
                                        onClick={() => handleTimeChange("minute", minute.toString())}
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
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Exportar también una versión con props por defecto para compatibilidad
export const DateTimePicker = DateTimePicker24h;
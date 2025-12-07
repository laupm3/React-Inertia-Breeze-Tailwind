import * as React from "react";
import { addDays, format, startOfWeek, endOfWeek, differenceInMilliseconds, addMilliseconds } from "date-fns";
import { es } from "date-fns/locale";
import Icon from "@/imports/LucideIcon";
import { DateRange } from "react-day-picker";
import VACACIONES_COLOR_MAP from "@/Components/App/Pills/constants/VacacionesMapColor";

import { cn } from "@/lib/utils";
import { Button } from "@/Components/App/Buttons/Button";
import { Calendar } from "@/Components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface CustomDatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
    selectedRange?: DateRange | undefined;
    onRangeChange?: (dateRange: DateRange | undefined) => void;
    maxDurationMilliseconds?: number | null;
    disablePastDates?: boolean; // Nueva prop para deshabilitar días pasados
    permisoNombre?: string; // Nueva prop para el nombre del permiso
    permisoDuracionDias?: number; // Nueva prop para la duración del permiso en días
}

export function CustomDatePickerWithRange({
    className,
    selectedRange,
    onRangeChange,
    maxDurationMilliseconds,
    disablePastDates = false, 
    permisoNombre,
    permisoDuracionDias,
}: CustomDatePickerWithRangeProps) {
    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        if (selectedRange) {
            return selectedRange;
        }
        // No establecer fechas por defecto - dejar sin seleccionar
        return undefined;
    });
    const [adjustmentMessage, setAdjustmentMessage] = React.useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Sincronizar el estado interno si la prop selectedRange cambia desde el exterior
    React.useEffect(() => {
        if (selectedRange) {
            setDate(selectedRange);
        } else {
            // Si selectedRange se vuelve undefined, limpiar la selección
            setDate(undefined);
            // Notificar el cambio hacia arriba
            if (onRangeChange) {
                onRangeChange(undefined);
            }
        }
        // Solo limpiar el mensaje si viene de un reset externo (selectedRange = undefined)
        // No limpiar cuando selectedRange tiene valores (viene de un ajuste interno)
        if (!selectedRange) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setAdjustmentMessage(null);
        }
    }, [selectedRange, onRangeChange]);

    // Cleanup al desmontar el componente
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const manageSelection = (newRange: DateRange | undefined) => {
        let adjustedRange = newRange;
        let willShowMessage = false;

        // Validar que maxDurationMilliseconds sea un número positivo
        const validMaxDuration = typeof maxDurationMilliseconds === 'number' && maxDurationMilliseconds > 0 
                                ? maxDurationMilliseconds 
                                : null;

        if (newRange?.from && newRange?.to && validMaxDuration) {
            // Calcular días de manera simple: diferencia entre fechas + 1 día
            const fromDate = new Date(newRange.from);
            const toDate = new Date(newRange.to);
            
            // Normalizar fechas para comparación
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(0, 0, 0, 0);
            
            // Calcular días: diferencia + 1 (para incluir ambos días)
            const diffInMs = toDate.getTime() - fromDate.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
            
            // Convertir la duración máxima de milisegundos a días
            const maxDurationDays = Math.floor(validMaxDuration / (1000 * 60 * 60 * 24));
            
            if (diffInDays > maxDurationDays) {
                // Calcular la fecha de fin máxima: fecha inicio + (maxDurationDays - 1)
                const adjustedToDate = new Date(fromDate);
                adjustedToDate.setDate(adjustedToDate.getDate() + maxDurationDays - 1);
                
                adjustedRange = {
                    ...newRange,
                    to: adjustedToDate,
                };
                
                willShowMessage = true;
                
                // Limpiar timeout anterior solo si vamos a mostrar un nuevo mensaje
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                
                setAdjustmentMessage(`El rango se ha ajustado a la duración máxima de ${maxDurationDays} ${maxDurationDays === 1 ? 'día' : 'días'}.`);
                
                // Mantener el mensaje por más tiempo
                timeoutRef.current = setTimeout(() => {
                    setAdjustmentMessage(null);
                }, 5000); // 5 segundos
            }
        }
        
        // Solo limpiar el mensaje si no vamos a mostrar uno nuevo
        if (!willShowMessage) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setAdjustmentMessage(null);
        }

        setDate(adjustedRange);

        if (onRangeChange) {
            onRangeChange(adjustedRange);
        }
    };

    // Función para deshabilitar días
    const getDisabledDays = () => {
        const disabledConditions: Array<any> = [];

        if (disablePastDates) {
            // Deshabilitar todos los días anteriores al inicio del día de hoy
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            disabledConditions.push({ before: today });
        }

        // Validar que maxDurationMilliseconds sea un número positivo
        const validMaxDuration = typeof maxDurationMilliseconds === 'number' && maxDurationMilliseconds > 0 
                                ? maxDurationMilliseconds 
                                : null;

        if (date?.from && !date?.to && validMaxDuration) {
            // Calcular la fecha máxima de fin permitida usando días
            const fromDate = new Date(date.from);
            fromDate.setHours(0, 0, 0, 0);
            
            // Convertir la duración máxima de milisegundos a días
            const maxDurationDays = Math.floor(validMaxDuration / (1000 * 60 * 60 * 24));
            
            // Calcular la fecha máxima: fecha inicio + (maxDurationDays - 1)
            const maxEndDate = new Date(fromDate);
            maxEndDate.setDate(maxEndDate.getDate() + maxDurationDays - 1);
            
            // Deshabilitar fechas posteriores a la fecha máxima permitida desde 'from'
            // y también fechas anteriores a 'from' para evitar rangos inválidos al seleccionar 'to'.
            disabledConditions.push({ after: maxEndDate });
            disabledConditions.push({ before: date.from });
        } else if (!date?.from && validMaxDuration) {
            // Si no hay 'from' seleccionado, no podemos calcular 'after' basado en duración.
            // Se podría deshabilitar todos los días si se quisiera, pero no es el caso común.
        }
        
        return disabledConditions.length > 0 ? disabledConditions : undefined;
    };

    // Función para limpiar la selección de fechas
    const clearSelection = () => {
        setDate(undefined);
        if (onRangeChange) {
            onRangeChange(undefined);
        }
        // Limpiar el mensaje de ajuste si existe
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setAdjustmentMessage(null);
    };

    // Funciones para navegación rápida
    const goToNextYear = () => {
        const nextYear = new Date(currentMonth);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setCurrentMonth(nextYear);
    };

    const goToPrevYear = () => {
        const prevYear = new Date(currentMonth);
        prevYear.setFullYear(prevYear.getFullYear() - 1);
        setCurrentMonth(prevYear);
    };

    const goToNextMonth = () => {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentMonth(nextMonth);
    };

    const goToPrevMonth = () => {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentMonth(prevMonth);
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
    };

    const goToMonth = (monthIndex: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(monthIndex);
        setCurrentMonth(newDate);
    };

    const goToYear = (year: number) => {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
    };

    // Generar años para el selector (10 años hacia atrás y 10 hacia adelante)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    // Nombres de los meses
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className={cn("grid gap-2", className)}>
            {permisoNombre && (
                <div 
                    className="flex flex-col gap-3 p-4 mb-2 text-sm bg-blue-50 border border-blue-200 rounded-lg dark:bg-gray-800 dark:border-blue-600" 
                    role="alert"
                >
                    <div className="flex items-center gap-2">
                        <Icon name="Info" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} color="currentColor" />
                        <span className="text-blue-800 dark:text-blue-300 font-medium">Tipo de permiso:</span>
                        <div className={`
                            flex flex-row items-center w-fit gap-2 
                            ${(VACACIONES_COLOR_MAP as any)[permisoNombre]?.bg || 'bg-gray-500/30'} 
                            ${(VACACIONES_COLOR_MAP as any)[permisoNombre]?.text || 'text-gray-500'} 
                            text-xs rounded-full px-3 py-1
                        `}>
                            <div className={`${(VACACIONES_COLOR_MAP as any)[permisoNombre]?.point || 'bg-gray-500'} w-2 h-2 rounded-full`} />
                            <span className="font-bold">
                                {permisoNombre}
                            </span>
                        </div>
                    </div>
                    {permisoDuracionDias !== undefined && (
                        <div className="text-blue-700 dark:text-blue-400 text-xs">
                            <strong>Duración máxima:</strong> {permisoDuracionDias} {permisoDuracionDias === 1 ? 'día' : 'días'}
                        </div>
                    )}
                    <div className="text-blue-600 dark:text-blue-400 text-xs">
                        <strong>Instrucciones:</strong> Selecciona la fecha de inicio y el rango se ajustará automáticamente según la duración máxima permitida.
                    </div>
                </div>
            )}
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"ghost"}
                            className={cn(
                                "flex-1 justify-start gap-2 text-left font-normal rounded-full py-2 bg-custom-gray-default dark:bg-custom-blackSemi dark:text-custom-white text-custom-blue flex border-0 hover:bg-custom-gray-light dark:hover:bg-custom-gray-darker transition-colors",
                                !date && "text-custom-gray-dark dark:text-custom-gray-light"
                            )}
                        >
                            <Icon name="CalendarRange" className="w-5 h-5" color="#FD7E14" size={20} />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "dd LLL, y", { locale: es })} -{" "}
                                        {format(date.to, "dd LLL, y", { locale: es })}
                                    </>
                                ) : (
                                    format(date.from, "dd LLL, y", { locale: es })
                                )
                            ) : (
                                <span>Selecciona un rango de fechas</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker" align="start">
                        {adjustmentMessage && (
                            <p className="p-2 text-sm text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 border-b border-orange-200 dark:border-orange-800">
                                {adjustmentMessage}
                            </p>
                        )}
                        
                        {/* Controles de navegación rápida */}
                        <div className="flex items-center justify-between p-3 border-b border-custom-gray-light dark:border-custom-gray-darker bg-custom-gray-default/50 dark:bg-custom-blackSemi">
                            <div className="flex items-center gap-2">
                                <Select 
                                    value={currentMonth.getMonth().toString()}
                                    onValueChange={(value) => goToMonth(parseInt(value))}
                                >
                                    <SelectTrigger className="w-28 h-7 text-xs bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker text-custom-blue dark:text-custom-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker">
                                        {monthNames.map((month, index) => (
                                            <SelectItem 
                                                key={index} 
                                                value={index.toString()}
                                                className="text-custom-blue dark:text-custom-white hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi"
                                            >
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                
                                <Select 
                                    value={currentMonth.getFullYear().toString()}
                                    onValueChange={(value) => goToYear(parseInt(value))}
                                >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker text-custom-blue dark:text-custom-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker">
                                        {years.map((year) => (
                                            <SelectItem 
                                                key={year} 
                                                value={year.toString()}
                                                className="text-custom-blue dark:text-custom-white hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi"
                                            >
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                {/* Navegación por mes */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToPrevMonth}
                                    className="h-7 w-7 p-0 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-blue dark:text-custom-white"
                                    title="Mes anterior"
                                >
                                    <Icon name="ChevronLeft" className="w-3 h-3" size={12} color="currentColor" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToNextMonth}
                                    className="h-7 w-7 p-0 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-blue dark:text-custom-white"
                                    title="Mes siguiente"
                                >
                                    <Icon name="ChevronRight" className="w-3 h-3" size={12} color="currentColor" />
                                </Button>
                                
                                {/* Separador */}
                                <div className="w-px h-4 bg-custom-gray-light dark:bg-custom-gray-darker mx-1" />
                                
                                {/* Navegación por año */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToPrevYear}
                                    className="h-7 w-7 p-0 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-blue dark:text-custom-white"
                                    title="Año anterior"
                                >
                                    <Icon name="ChevronsLeft" className="w-3 h-3" size={12} color="currentColor" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToNextYear}
                                    className="h-7 w-7 p-0 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-blue dark:text-custom-white"
                                    title="Año siguiente"
                                >
                                    <Icon name="ChevronsRight" className="w-3 h-3" size={12} color="currentColor" />
                                </Button>
                                
                                {/* Separador */}
                                <div className="w-px h-4 bg-custom-gray-light dark:bg-custom-gray-darker mx-1" />
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToToday}
                                    className="h-7 px-2 text-xs hover:bg-custom-orange hover:text-white dark:hover:bg-custom-orange text-custom-blue dark:text-custom-white transition-colors"
                                    title="Ir a hoy"
                                >
                                    Hoy
                                </Button>
                                
                                {/* Separador */}
                                {date && <div className="w-px h-4 bg-custom-gray-light dark:bg-custom-gray-darker mx-1" />}
                                
                                {/* Botón para limpiar selección dentro del calendario */}
                                {date && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSelection}
                                        className="h-7 px-2 text-xs hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-red-600 dark:text-red-400 transition-colors"
                                        title="Limpiar selección"
                                    >
                                        <Icon name="X" className="w-3 h-3 mr-1" size={12} color="currentColor" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <Calendar
                            mode="range"
                            defaultMonth={currentMonth}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            selected={date}
                            onSelect={manageSelection}
                            numberOfMonths={2}
                            weekStartsOn={1}
                            disabled={getDisabledDays()}
                            showOutsideDays={true}
                            fixedWeeks={true}
                            locale={es}
                            className="bg-custom-white dark:bg-custom-blackLight"
                            classNames={{
                                nav_button: "hidden",
                                nav_button_previous: "hidden", 
                                nav_button_next: "hidden",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium text-custom-blue dark:text-custom-white",
                                head_row: "flex",
                                head_cell: "text-custom-gray-dark dark:text-custom-gray-light rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 text-center text-sm p-0 relative text-custom-blue dark:text-custom-white hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#FD7E14] dark:hover:text-[#FD7E14] focus-visible:bg-orange-50 dark:focus-visible:bg-orange-900/20 focus-visible:text-[#FD7E14] dark:focus-visible:text-[#FD7E14] rounded-md transition-colors",
                                day_selected: "bg-[#FD7E14] text-white hover:bg-[#e67112] hover:text-white focus:bg-[#FD7E14] focus:text-white font-medium [&.rdp-day_today]:bg-[#FD7E14] [&.rdp-day_today]:text-white [&.rdp-day_today]:border-0",
                                day_today: "bg-[#FD7E14]/20 dark:bg-[#FD7E14]/30 text-[#FD7E14] font-medium border border-[#FD7E14]/30 dark:border-[#FD7E14]/50",
                                day_outside: "text-custom-gray-dark dark:text-custom-gray-dark opacity-40",
                                day_disabled: "text-custom-gray-dark dark:text-custom-gray-dark opacity-60 hover:bg-transparent hover:text-custom-gray-dark dark:hover:text-custom-gray-dark cursor-not-allowed",
                                day_range_middle: "aria-selected:bg-custom-gray-default/60 dark:aria-selected:bg-custom-gray-darker/80 aria-selected:text-custom-blue dark:aria-selected:text-custom-white aria-selected:font-medium",
                                day_range_start: "day-range-start rounded-l-md bg-[#FD7E14] text-white hover:bg-[#e67112] [&.rdp-day_today]:bg-[#FD7E14] [&.rdp-day_today]:text-white [&.rdp-day_today]:border-0",
                                day_range_end: "day-range-end rounded-r-md bg-[#FD7E14] text-white hover:bg-[#e67112] [&.rdp-day_today]:bg-[#FD7E14] [&.rdp-day_today]:text-white [&.rdp-day_today]:border-0",
                            }}
                        />
                    </PopoverContent>
                </Popover>
                {date && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        className="rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-3 transition-colors"
                        title="Limpiar selección"
                    >
                        <Icon name="X" className="w-4 h-4" size={16} color="currentColor" />
                    </Button>
                )}
            </div>
        </div>
    );
}

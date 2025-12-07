import * as React from "react"
import { addDays, format, startOfWeek, endOfWeek } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Calendar } from "@/Components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"

// En lugar de usar Omit, usamos un nombre diferente para la prop
interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
    selectedRange?: DateRange | undefined;
    onRangeChange?: (dateRange: DateRange | undefined) => void;
}

export function DatePickerWithRange({
    className,
    selectedRange,
    onRangeChange,
}: DatePickerWithRangeProps) {
    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        if (selectedRange) {
            return selectedRange;
        }

        // Usar la semana actual si no hay rango seleccionado
        return {
            from: startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes
            to: endOfWeek(new Date(), { weekStartsOn: 1 }), // Domingo
        };
    });

    const manageSelection = (dateRange: DateRange | undefined) => {
        setDate(dateRange);

        if (!dateRange || !dateRange.from || !dateRange.to) {
            return;
        }

        if (onRangeChange) {
            onRangeChange(dateRange);
        }
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"ghost"}
                        className={cn(
                            "w-auto justify-center gap-2 text-left font-normal p-2 bg-custom-gray-default dark:bg-custom-blackSemi border-none text-gray-800 dark:text-gray-200 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi flex",
                            !date && "text-gray-500 dark:text-gray-500"
                        )}
                    >
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd LLL, y")} -{" "}
                                    {format(date.to, "dd LLL, y")}
                                </>
                            ) : (
                                format(date.from, "dd LLL, y")
                            )
                        ) : (
                            <span>Selecciona un rango de fechas</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={manageSelection}
                        numberOfMonths={2}
                        weekStartsOn={1}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
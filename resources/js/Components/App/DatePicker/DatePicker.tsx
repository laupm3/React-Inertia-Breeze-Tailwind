import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Calendar } from "@/Components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"

export function DatePicker({ 
    selectedDate, 
    onSelect, 
    className 
}: {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    className?: string;
}) {
    const [date, setDate] = useState<Date | undefined>(selectedDate)

    // Sincronizar el estado interno con el prop externo
    useEffect(() => {
        setDate(selectedDate);
    }, [selectedDate]);

    const manageSelection = (date: Date | undefined) => {
        setDate(date);

        if (onSelect) {
            onSelect(date);
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start gap-2 text-left font-normal h-10 px-3 bg-custom-gray-default dark:bg-custom-blackSemi border-none text-gray-800 dark:text-gray-200 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi",
                            !date && "text-muted-foreground dark:text-gray-500",
                            className
                        )}
                    >
                        <CalendarIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
                        <span className="truncate">
                            {date
                                ? format(date, "dd/MM/yyyy")
                                : "Selecciona una fecha"
                            }
                        </span>
                    </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-custom-white dark:bg-custom-blackLight border-custom-gray-light dark:border-custom-gray-darker" align="start">
                <Calendar
                    fromYear={1800}
                    toYear={2100}
                    mode="single"
                    selected={date}
                    captionLayout="dropdown-buttons"
                    onSelect={manageSelection}
                    initialFocus
                    weekStartsOn={1}
                    classNames={{
                        caption: "flex justify-center pt-1 relative items-center px-10",
                        caption_dropdowns: "flex justify-center gap-1",
                        nav_button_previous: "absolute left-1 top-1",
                        nav_button_next: "absolute right-1 top-1",
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}

// Export default para compatibilidad
export default DatePicker;
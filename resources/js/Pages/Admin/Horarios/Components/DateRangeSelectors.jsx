import { Button } from "@/Components/App/Buttons/Button";
import { DatePickerWithRange } from "@/Components/App/DatePicker/DatePickerWithRange";
import { MonthPicker } from "@/Components/App/DatePicker/MonthPicker";
import { useDataHandler } from "../Context/DataHandlerContext";
import { useState } from "react";

export default function DateRangeSelectors({ }) {
    const {
        selectedRange,
        setSelectedRange,
        monthSelected,
        manageMonthChange
    } = useDataHandler();

    const [viewType, setViewType] = useState('week');

    return (
        <div className='flex items-center flex-wrap gap-3'>
            {/* Selección tipo de vista */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                    onClick={() => setViewType('month')}
                    variant={(viewType === 'month') ? "secondary" : 'ghost'}
                    className={`rounded-lg ${(viewType === 'month') ? 'pointer-events-none' : ''}`}
                >
                    Mes
                </Button>

                <Button
                    onClick={() => setViewType('week')}
                    variant={(viewType === 'week') ? "secondary" : 'ghost'}
                    className={`rounded-lg ${(viewType === 'week') ? 'pointer-events-none' : ''}`}
                >
                    Semana
                </Button>
            </div>

            {/* Selección rango de fechas*/}
            <div className="flex items-center h-full gap-4 ml-6">
                {viewType === 'month' && (
                    <MonthPicker
                        currentMonth={monthSelected}
                        onMonthChange={manageMonthChange}
                    />
                )}
                {viewType === 'week' && (
                    <DatePickerWithRange
                        selectedRange={selectedRange}
                        onRangeChange={setSelectedRange}
                    />
                )}
            </div>
        </div>
    )
}
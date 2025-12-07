import { DatePickerWithRange } from "@/Components/App/DatePicker/DatePickerWithRange";
import { useDataHandler } from "../Context/DataHandlerContext";
import { Button } from "@/Components/ui/button";
import { MonthPicker } from "@/Components/App/DatePicker/MonthPicker";

export default function DateRangeSelectors({ }) {
    const {
        selectedRange,
        setSelectedRange,
        monthSelected,
        manageMonthChange,
        viewType,
        setViewType
    } = useDataHandler();

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
                        currentMonth={new Date(monthSelected.year, monthSelected.month)}
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
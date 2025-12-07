import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { useState } from "react";
import { Button } from "@/Components/App/Buttons/Button";
import DateRangeFilter from './DateRangeFilter';
import FilterEventType from './FilterEventType';

export default function EventFilters({ 
  dateRange, 
  onDateRangeChange, 
  eventTypes, 
  selectedEventType, 
  onEventTypeChange,
  hasDateFilter,
  clearDateFilter,
  searchTerm,
  onSearchTermChange
}) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const handleClearAllFilters = () => {
    onSearchTermChange('');
    onEventTypeChange(null);
    clearDateFilter();
    setIsFilterMenuOpen(false);
  };
  const hasActiveFilters = searchTerm || selectedEventType || hasDateFilter;

  return (
    <DropdownMenu open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full bg-transparent border-none hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {"Filtrar"} <Icon name="SlidersHorizontal" className="ml-1 w-5 text-custom-orange" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="start"
        className="bg-custom-gray-default dark:bg-custom-blackLight rounded-2xl"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >        <div className="flex flex-col gap-4 p-4 w-full min-w-[24rem] max-w-[24rem]">
          {/* Header con título y botón limpiar */}
          <div className="flex justify-between items-center w-full">
            <h4 className="text-lg font-bold dark:text-white">
              {"Filtros"}
            </h4>
            {hasActiveFilters && (
              <Button
                className="bg-transparent hover:bg-slate-200 dark:hover:bg-accent text-custom-blue dark:text-custom-white rounded-full text-sm"
                onClick={handleClearAllFilters}
              >
                {"Limpiar Filtros"}
              </Button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-4">
            {/* Filtro de tipo de evento */}
            <div>
              <h3 className="text-sm font-medium mb-2 dark:text-white">Filtrar por tipo</h3>
              <FilterEventType 
                eventTypes={eventTypes} 
                selectedType={selectedEventType} 
                onTypeChange={onEventTypeChange} 
              />
            </div>

            {/* Filtro por rango de fechas */}
            <div>
              <h3 className="text-sm font-medium mb-2 dark:text-white">Filtrar por fecha</h3>
              <DateRangeFilter 
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange}
              />
            </div>
          </div>
        </div>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import Icon from "@/imports/LucideIcon";
import { formatDateYMD } from "@/utils/eventDateUtils";
import { Button } from "@/Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover";
import { cn } from "@/lib/utils";

// Constantes para los tipos de filtro
const DATE_FILTER_TYPES = {
  BETWEEN: 'between',
  AFTER: 'after', 
  BEFORE: 'before',
  EXACT: 'exact'
};

const FILTER_TYPE_LABELS = {
  [DATE_FILTER_TYPES.BETWEEN]: 'Entre fechas',
  [DATE_FILTER_TYPES.AFTER]: 'Después de',
  [DATE_FILTER_TYPES.BEFORE]: 'Antes de',
  [DATE_FILTER_TYPES.EXACT]: 'Fecha exacta'
};

/**
 * Componente de filtro por rango de fechas para eventos
 * @param {Object} props - Props del componente
 * @param {Function} props.onDateRangeChange - Función que se ejecuta cuando cambia el rango de fechas
 * @param {Object} props.dateRange - Objeto con from y to para el rango actual
 */
const DateRangeFilter = ({ onDateRangeChange, dateRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState(DATE_FILTER_TYPES.BETWEEN);

  const handleFromDateChange = (e) => {
    const fromDate = e.target.value ? new Date(e.target.value) : null;
    
    if (filterType === DATE_FILTER_TYPES.EXACT || filterType === DATE_FILTER_TYPES.AFTER || filterType === DATE_FILTER_TYPES.BEFORE) {
      // Para fecha exacta, después de, o antes de, solo usar una fecha
      onDateRangeChange({
        from: fromDate,
        to: filterType === DATE_FILTER_TYPES.EXACT ? fromDate : null,
        filterType: filterType
      });
    } else {
      // Para rango entre fechas
      onDateRangeChange({
        from: fromDate,
        to: dateRange?.to || null,
        filterType: filterType
      });
    }
  };

  const handleToDateChange = (e) => {
    const toDate = e.target.value ? new Date(e.target.value) : null;
    onDateRangeChange({
      from: dateRange?.from || null,
      to: toDate,
      filterType: filterType
    });
  };

  const handleFilterTypeChange = (newFilterType) => {
    setFilterType(newFilterType);
    
    // Resetear las fechas al cambiar el tipo de filtro
    if (newFilterType === DATE_FILTER_TYPES.EXACT && dateRange?.from) {
      onDateRangeChange({
        from: dateRange.from,
        to: dateRange.from,
        filterType: newFilterType
      });
    } else if (newFilterType === DATE_FILTER_TYPES.AFTER || newFilterType === DATE_FILTER_TYPES.BEFORE) {
      onDateRangeChange({
        from: dateRange?.from || null,
        to: null,
        filterType: newFilterType
      });
    } else {
      onDateRangeChange({
        from: dateRange?.from || null,
        to: dateRange?.to || null,
        filterType: newFilterType
      });
    }
  };

  const clearFilter = () => {
    onDateRangeChange(null);
    setIsOpen(false);
    setFilterType(DATE_FILTER_TYPES.BETWEEN);
  };

  const applyFilter = () => {
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "Sin filtro de fecha";
    
    switch (dateRange.filterType || filterType) {
      case DATE_FILTER_TYPES.EXACT:
        return `Fecha exacta: ${format(dateRange.from, "PP", { locale: es })}`;
      case DATE_FILTER_TYPES.AFTER:
        return `Después de: ${format(dateRange.from, "PP", { locale: es })}`;
      case DATE_FILTER_TYPES.BEFORE:
        return `Antes de: ${format(dateRange.from, "PP", { locale: es })}`;
      case DATE_FILTER_TYPES.BETWEEN:
      default:
        if (!dateRange.to) return `Desde: ${format(dateRange.from, "PP", { locale: es })}`;
        return `${format(dateRange.from, "PP", { locale: es })} - ${format(dateRange.to, "PP", { locale: es })}`;
    }  };

  // Usar utilidad centralizada para formateo de fechas en inputs

  const isFilterActive = dateRange?.from;
  const shouldShowEndDate = filterType === DATE_FILTER_TYPES.BETWEEN;
  const shouldShowStartDate = filterType !== DATE_FILTER_TYPES.BEFORE;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex w-full p-2 min-h-10 h-auto items-center justify-between rounded-full bg-custom-gray-light dark:bg-custom-blackSemi text-custom-blackLight dark:text-custom-white border-0 gap-1 text-left font-normal",
                isFilterActive 
                  ? "text-custom-orange dark:text-custom-orange" 
                  : "text-muted-foreground dark:text-custom-gray-default"
              )}
            >
              <div className="font-medium flex gap-2 items-center text-sm">
                <div className="flex items-center justify-between">
                  <CalendarIcon 
                    className="h-4 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                  />
                </div>
                <span className={dateRange?.from ? "text-gray-900 dark:text-white" : "text-gray-500"}>
                  {formatDateRange()}
                </span>
              </div>
              <Icon 
                name="ChevronDown" 
                className={cn(
                  "transition-colors h-4 w-4",
                  isFilterActive
                    ? "text-custom-orange dark:text-custom-orange"
                    : "text-muted-foreground dark:text-custom-gray-default"
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4 dark:bg-custom-blackLight" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm dark:text-white">
                Filtrar por rango de fechas
              </h4>
              
              {/* Selector de tipo de filtro */}
              <div className="grid gap-2">
                <label className="text-xs dark:text-gray-300">
                  Tipo de filtro
                </label>
                <Select value={filterType} onValueChange={handleFilterTypeChange}>
                  <SelectTrigger className="dark:bg-custom-blackSemi dark:text-white bg-custom-gray-default rounded-full hover:bg-custom-gray-light focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-custom-blackLight">
                    {Object.entries(FILTER_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="dark:text-white dark:focus:bg-custom-blackSemi">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Inputs de fecha */}
              <div className={`grid gap-4 ${shouldShowEndDate ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {shouldShowStartDate && (
                  <div className="grid gap-2">
                    <label className="text-xs dark:text-gray-300">
                      {filterType === DATE_FILTER_TYPES.EXACT ? 'Fecha exacta' :
                       filterType === DATE_FILTER_TYPES.AFTER ? 'Después de' :
                       filterType === DATE_FILTER_TYPES.BEFORE ? 'Antes de' : 'Fecha desde'}
                    </label>
                    <div className="flex items-center dark:bg-custom-blackSemi dark:hover:bg-custom-gray-sidebar dark:text-white bg-custom-gray-default rounded-full hover:bg-custom-gray-light focus:ring-0 focus:ring-offset-0">
                      <Icon 
                        name="Calendar" 
                        className="text-custom-orange ml-4 h-4 w-4"
                      />
                      <input
                        type="date"
                        value={formatDateYMD(dateRange?.from)}
                        onChange={handleFromDateChange}
                        className="dark:text-white bg-transparent focus:ring-0 focus:ring-offset-0 border-0 rounded-full px-3 py-2 w-full"
                      />
                    </div>
                  </div>
                )}
                
                {shouldShowEndDate && (
                  <div className="grid gap-2">
                    <label className="text-xs dark:text-gray-300">
                      Fecha hasta
                    </label>
                    <div className="flex items-center dark:bg-custom-blackSemi dark:hover:bg-custom-gray-sidebar dark:text-white bg-custom-gray-default rounded-full hover:bg-custom-gray-light focus:ring-0 focus:ring-offset-0">
                      <Icon 
                        name="Calendar" 
                        className="text-custom-orange ml-4 h-4 w-4"
                      />
                      <input
                        type="date"
                        value={formatDateYMD(dateRange?.to)}
                        onChange={handleToDateChange}
                        className="dark:text-white bg-transparent focus:ring-0 focus:ring-offset-0 border-0 rounded-full px-3 py-2 w-full"
                      />
                    </div>
                  </div>
                )}

                {!shouldShowStartDate && (
                  <div className="grid gap-2">
                    <label className="text-xs dark:text-gray-300">
                      Antes de
                    </label>
                    <div className="flex items-center dark:bg-custom-blackSemi dark:hover:bg-custom-gray-sidebar dark:text-white bg-custom-gray-default rounded-full hover:bg-custom-gray-light focus:ring-0 focus:ring-offset-0">
                      <Icon 
                        name="Calendar" 
                        className="text-custom-orange ml-4 h-4 w-4"
                      />
                      <input
                        type="date"
                        value={formatDateYMD(dateRange?.from)}
                        onChange={handleFromDateChange}
                        className="dark:text-white bg-transparent focus:ring-0 focus:ring-offset-0 border-0 rounded-full px-3 py-2 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2 border-t dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilter}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Limpiar
                </Button>
                <Button
                  size="sm"
                  onClick={applyFilter}
                  disabled={!dateRange?.from}
                  className="bg-custom-orange text-white hover:bg-orange-600"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {dateRange?.from && (
          <button
            onClick={clearFilter}
            className="p-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Limpiar filtro de fecha"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;

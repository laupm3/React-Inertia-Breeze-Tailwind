import { useState, useEffect, useCallback, useMemo } from "react";
import { parseISO, isValid, isAfter, format } from 'date-fns';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/Components/ui/popover";
import { Button } from "@/Components/App/Buttons/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Calendar, XIcon } from "lucide-react";
import { DatePicker } from "@/Components/App/DatePicker/DatePicker";

// Hook personalizado para validación de fechas usando date-fns
function useDateInput(initialValue = "") {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState("");

    const validateAndSet = useCallback((inputValue) => {
        if (inputValue === "") {
            setValue(inputValue);
            setError("");
            return true;
        }

        try {
            const parsedDate = parseISO(inputValue);

            if (isValid(parsedDate)) {
                setValue(inputValue);
                setError("");
                return true;
            } else {
                setError("Fecha inválida");
                return false;
            }
        } catch (error) {
            setError("Formato de fecha inválido");
            return false;
        }
    }, []);

    const reset = useCallback(() => {
        setValue(initialValue);
        setError("");
    }, [initialValue]);

    return {
        value,
        error,
        setValue: validateAndSet,
        reset,
        dateValue: value !== "" && isValid(parseISO(value)) ? parseISO(value) : undefined
    };
}

// Tipos de filtro de fecha
const DATE_FILTER_TYPES = {
    BETWEEN: "between",
    AFTER: "after",
    BEFORE: "before",
    EXACT: "exact"
};

const DATE_FILTER_LABELS = {
    [DATE_FILTER_TYPES.BETWEEN]: "Entre fechas",
    [DATE_FILTER_TYPES.AFTER]: "Después de",
    [DATE_FILTER_TYPES.BEFORE]: "Antes de",
    [DATE_FILTER_TYPES.EXACT]: "Fecha exacta"
};

/**
 * Crea una firma única para los filtros de la tabla, excluyendo el filtro actual
 * @param {Object} table - La instancia de la tabla
 * @param {Object} column - La columna actual
 * @returns {String} - La firma de los filtros
 */
const createFilterSignature = (table, column) => {
    return table.getState()
        .columnFilters.filter(f => f.id !== column.id)
        .map(f => `${f.id}:${JSON.stringify(f.value)}`)
        .join('|');
};

export default function DateRangeFilterHeader({ column, debounceMs = 300 }) {

    const [open, setOpen] = useState(false);
    const [filterType, setFilterType] = useState(DATE_FILTER_TYPES.BETWEEN);

    // ✅ SIMPLIFICADO: Obtener valor actual del filtro directamente
    const currentFilterValue = column.getFilterValue();

    // Usar hooks personalizados para manejo de inputs de fecha
    const startDateInput = useDateInput("");
    const endDateInput = useDateInput("");

    // ✅ SIMPLIFICADO: Sincronizar con el valor del filtro
    useEffect(() => {
        if (currentFilterValue) {
            setFilterType(currentFilterValue.type || DATE_FILTER_TYPES.BETWEEN);
            startDateInput.setValue(currentFilterValue.startDate || "");
            endDateInput.setValue(currentFilterValue.endDate || "");
        } else {
            setFilterType(DATE_FILTER_TYPES.BETWEEN);
            startDateInput.reset();
            endDateInput.reset();
        }
    }, [currentFilterValue]);

    // Función para aplicar filtro
    const applyFilter = useCallback(() => {
        const startDate = startDateInput.dateValue;
        const endDate = endDateInput.dateValue;

        let isValid = false;
        let filterValue = null;

        switch (filterType) {
            case DATE_FILTER_TYPES.BETWEEN:
                if (startDate && endDate) {
                    if (!isAfter(startDate, endDate)) {
                        isValid = true;
                        filterValue = {
                            type: filterType,
                            startDate: startDateInput.value,
                            endDate: endDateInput.value
                        };
                    }
                }
                break;

            case DATE_FILTER_TYPES.AFTER:
                if (startDate) {
                    isValid = true;
                    filterValue = {
                        type: filterType,
                        startDate: startDateInput.value
                    };
                }
                break;

            case DATE_FILTER_TYPES.BEFORE:
                if (endDate) {
                    isValid = true;
                    filterValue = {
                        type: filterType,
                        endDate: endDateInput.value
                    };
                }
                break;

            case DATE_FILTER_TYPES.EXACT:
                if (startDate) {
                    isValid = true;
                    filterValue = {
                        type: filterType,
                        startDate: startDateInput.value
                    };
                }
                break;
        }

        if (isValid) {
            column.setFilterValue(filterValue);
        } else if (!startDate && !endDate) {
            column.setFilterValue(undefined);
        }

        setOpen(false);
    }, [filterType, startDateInput.dateValue, endDateInput.dateValue, startDateInput.value, endDateInput.value, column]);

    // Función para limpiar filtro
    const clearFilter = useCallback(() => {
        startDateInput.reset();
        endDateInput.reset();
        setFilterType(DATE_FILTER_TYPES.BETWEEN);
        column.setFilterValue(undefined);
        setOpen(false);
    }, [startDateInput, endDateInput, column]);

    // Función para limpiar filtro sin cerrar popover
    const quickClearFilter = useCallback(() => {
        startDateInput.reset();
        endDateInput.reset();
        setFilterType(DATE_FILTER_TYPES.BETWEEN);
        column.setFilterValue(undefined);
    }, [startDateInput, endDateInput, column]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            applyFilter();
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    }, [applyFilter]);

    // Verificar si el filtro está activo
    const isFilterActive = useMemo(() => {
        return !!currentFilterValue && (
            currentFilterValue.startDate ||
            currentFilterValue.endDate
        );
    }, [currentFilterValue]);

    // Verificar si hay errores de validación
    const hasValidationErrors = useMemo(() => {
        const hasInputErrors = startDateInput.error || endDateInput.error;
        const hasInvalidRange = filterType === DATE_FILTER_TYPES.BETWEEN &&
            startDateInput.dateValue &&
            endDateInput.dateValue &&
            isAfter(startDateInput.dateValue, endDateInput.dateValue);

        return hasInputErrors || hasInvalidRange;
    }, [filterType, startDateInput.error, endDateInput.error, startDateInput.dateValue, endDateInput.dateValue]);

    // Verificar si se puede aplicar el filtro
    const canApplyFilter = useMemo(() => {
        if (hasValidationErrors) return false;

        switch (filterType) {
            case DATE_FILTER_TYPES.BETWEEN:
                return startDateInput.dateValue && endDateInput.dateValue;
            case DATE_FILTER_TYPES.AFTER:
            case DATE_FILTER_TYPES.EXACT:
                return startDateInput.dateValue;
            case DATE_FILTER_TYPES.BEFORE:
                return endDateInput.dateValue;
            default:
                return false;
        }
    }, [filterType, hasValidationErrors, startDateInput.dateValue, endDateInput.dateValue]);

    // Early return si la columna no puede ser filtrada
    if (!column.getCanFilter()) {
        return null;
    }

    // Determinar qué campos mostrar
    const shouldShowStartDate = filterType !== DATE_FILTER_TYPES.BEFORE;
    const shouldShowEndDate = filterType === DATE_FILTER_TYPES.BETWEEN;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon"
                    title={isFilterActive ? "Filtro activo - Click para editar" : "Filtrar por fecha"}
                    aria-label="Filtrar por fecha"
                >
                    <div className="font-medium flex gap-2 items-center text-sm">
                        {isFilterActive && (
                            <div className="flex items-center justify-between">
                                <XIcon
                                    className="h-4 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        clearFilter();
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <Calendar
                        size={16}
                        className={`transition-colors ${isFilterActive
                            ? "text-orange-500"
                            : open
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-4 dark:bg-custom-blackLight" align="center">
                <div className="space-y-4">
                    <h4 className="font-medium text-sm dark:text-white">
                        Filtrar por fecha
                    </h4>

                    {/* Selector de tipo de filtro */}
                    <div className="grid gap-2">
                        <label className="text-xs dark:text-gray-300">
                            Tipo de filtro
                        </label>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="dark:bg-custom-blackSemi dark:text-white bg-custom-gray-default rounded-full hover:bg-custom-gray-light focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-custom-blackLight">
                                {Object.entries(DATE_FILTER_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value} className="dark:text-white dark:focus:bg-custom-blackSemi">
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Campos de fecha según el tipo seleccionado */}
                    <div className={`grid gap-3 ${shouldShowEndDate ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {shouldShowStartDate && (
                            <div className="grid gap-2">
                                <label htmlFor="start-date" className="text-xs dark:text-gray-300">
                                    {filterType === DATE_FILTER_TYPES.EXACT ? "Fecha" :
                                        filterType === DATE_FILTER_TYPES.AFTER ? "Después de" : "Fecha inicio"}
                                </label>
                                <DatePicker
                                    selectedDate={startDateInput.dateValue}
                                    onSelect={(date) => {
                                        const dateString = date ? format(date, 'yyyy-MM-dd') : '';
                                        startDateInput.setValue(dateString);
                                    }}
                                    className={`min-w-0 ${startDateInput.error ? "border-red-500" : ""}`}
                                />
                                {startDateInput.error && (
                                    <span id="start-error" className="text-xs text-red-500">
                                        {startDateInput.error}
                                    </span>
                                )}
                            </div>
                        )}

                        {shouldShowEndDate && (
                            <div className="grid gap-2">
                                <label htmlFor="end-date" className="text-xs dark:text-gray-300">
                                    Fecha fin
                                </label>
                                <DatePicker
                                    selectedDate={endDateInput.dateValue}
                                    onSelect={(date) => {
                                        const dateString = date ? format(date, 'yyyy-MM-dd') : '';
                                        endDateInput.setValue(dateString);
                                    }}
                                    className={`min-w-0 ${endDateInput.error ? "border-red-500" : ""}`}
                                />
                                {endDateInput.error && (
                                    <span id="end-error" className="text-xs text-red-500">
                                        {endDateInput.error}
                                    </span>
                                )}
                            </div>
                        )}

                        {filterType === DATE_FILTER_TYPES.BEFORE && (
                            <div className="grid gap-2">
                                <label htmlFor="before-date" className="text-xs dark:text-gray-300">
                                    Antes de
                                </label>
                                <DatePicker
                                    selectedDate={endDateInput.dateValue}
                                    onSelect={(date) => {
                                        const dateString = date ? format(date, 'yyyy-MM-dd') : '';
                                        endDateInput.setValue(dateString);
                                    }}
                                    className={`min-w-0 ${endDateInput.error ? "border-red-500" : ""}`}
                                />
                                {endDateInput.error && (
                                    <span id="before-error" className="text-xs text-red-500">
                                        {endDateInput.error}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Error de rango inválido */}
                    {filterType === DATE_FILTER_TYPES.BETWEEN &&
                        startDateInput.dateValue &&
                        endDateInput.dateValue &&
                        isAfter(startDateInput.dateValue, endDateInput.dateValue) && (
                            <div className="text-xs text-red-500">
                                La fecha de inicio no puede ser posterior a la fecha de fin
                            </div>
                        )}

                    <div className="flex justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={quickClearFilter}
                        >
                            Limpiar
                        </Button>
                        <Button
                            size="sm"
                            onClick={applyFilter}
                            disabled={!canApplyFilter}
                        >
                            Aplicar
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
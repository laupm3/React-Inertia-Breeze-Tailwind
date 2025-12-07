import { useState, useEffect, useCallback, useMemo } from "react";
import { useDataTable } from "../../../Context/DataTableContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/Components/ui/popover";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Filter } from "lucide-react";

// Hook personalizado para debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook personalizado para validación de números (acepta negativos y decimales)
function useNumericInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  const validateAndSet = useCallback((inputValue) => {
    // Patrón que acepta: números negativos, decimales, enteros
    // Ejemplos válidos: -123, 123.45, -0.5, 0, .5, -.5
    const pattern = /^-?\d*\.?\d*$/;

    if (pattern.test(inputValue) || inputValue === "") {
      setValue(inputValue);
      setError("");
      return true;
    } else {
      setError("Formato de número inválido");
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
    numericValue: value !== "" && !isNaN(Number(value)) ? Number(value) : undefined
  };
}

export default function RangeFilterHeader({ column, debounceMs = 300 }) {
  const [open, setOpen] = useState(false);
  const { table } = useDataTable();

  // Obtener el valor actual del filtro de manera memoizada
  const currentFilterValue = useMemo(() => column.getFilterValue(), [column]);

  // Usar hooks personalizados para manejo de inputs numéricos
  const minInput = useNumericInput("");
  const maxInput = useNumericInput("");

  // Valores con debounce para evitar aplicar filtros muy frecuentemente
  const debouncedMinValue = useDebounce(minInput.value, debounceMs);
  const debouncedMaxValue = useDebounce(maxInput.value, debounceMs);

  // Sincronizar con el valor del filtro cuando cambie externamente
  useEffect(() => {
    if (currentFilterValue) {
      minInput.setValue(String(currentFilterValue.min || ""));
      maxInput.setValue(String(currentFilterValue.max || ""));
    } else {
      minInput.reset();
      maxInput.reset();
    }
  }, [currentFilterValue]);

  // Funciones memoizadas para evitar re-renderizados
  const applyFilter = useCallback(() => {
    const min = minInput.numericValue;
    const max = maxInput.numericValue;

    // Validación de rango lógico
    if (min !== undefined && max !== undefined && min > max) {
      return; // No aplicar filtro si el rango es inválido
    }

    if (min !== undefined || max !== undefined) {
      column.setFilterValue({ min, max });
    } else {
      column.setFilterValue(undefined);
    }

    setOpen(false);
  }, [minInput.numericValue, maxInput.numericValue, column]);

  const clearFilter = useCallback(() => {
    minInput.reset();
    maxInput.reset();
    column.setFilterValue(undefined);
    setOpen(false);
  }, [minInput, maxInput, column]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      applyFilter();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }, [applyFilter]);

  // Verificar si el filtro está activo
  const isFilterActive = useMemo(() => !!currentFilterValue, [currentFilterValue]);

  // Verificar si hay errores de validación o rango inválido
  const hasValidationErrors = useMemo(() => {
    const hasInputErrors = minInput.error || maxInput.error;
    const hasInvalidRange = minInput.numericValue !== undefined &&
      maxInput.numericValue !== undefined &&
      minInput.numericValue > maxInput.numericValue;

    return hasInputErrors || hasInvalidRange;
  }, [minInput.error, maxInput.error, minInput.numericValue, maxInput.numericValue]);

  // Early return si la columna no puede ser filtrada
  if (!column.getCanFilter()) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`p-0 h-8 w-8 transition-colors ${isFilterActive
              ? "text-orange-500 hover:text-orange-600"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          title={isFilterActive ? "Filtro activo - Click para editar" : "Filtrar por rango"}
          aria-label="Filtrar por rango"
        >
          <Filter size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 dark:bg-custom-blackLight" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm dark:text-white">
            Filtrar por rango
          </h4>

          <div className="flex items-start space-x-2">
            <div className="grid gap-2 flex-1">
              <label htmlFor="min-value" className="text-xs dark:text-gray-300">
                Valor mínimo
              </label>
              <Input
                id="min-value"
                type="text"
                placeholder="Ej: -10.5"
                value={minInput.value}
                onChange={(e) => minInput.setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`dark:bg-custom-blackSemi dark:text-white ${minInput.error ? "border-red-500" : ""
                  }`}
                aria-describedby={minInput.error ? "min-error" : undefined}
              />
              {minInput.error && (
                <span id="min-error" className="text-xs text-red-500">
                  {minInput.error}
                </span>
              )}
            </div>

            <div className="grid gap-2 flex-1">
              <label htmlFor="max-value" className="text-xs dark:text-gray-300">
                Valor máximo
              </label>
              <Input
                id="max-value"
                type="text"
                placeholder="Ej: 100.25"
                value={maxInput.value}
                onChange={(e) => maxInput.setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`dark:bg-custom-blackSemi dark:text-white ${maxInput.error ? "border-red-500" : ""
                  }`}
                aria-describedby={maxInput.error ? "max-error" : undefined}
              />
              {maxInput.error && (
                <span id="max-error" className="text-xs text-red-500">
                  {maxInput.error}
                </span>
              )}
            </div>
          </div>

          {/* Error de rango inválido */}
          {minInput.numericValue !== undefined &&
            maxInput.numericValue !== undefined &&
            minInput.numericValue > maxInput.numericValue && (
              <div className="text-xs text-red-500">
                El valor mínimo no puede ser mayor que el máximo
              </div>
            )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilter}
              className="dark:bg-custom-blackSemi dark:text-white dark:hover:bg-custom-gray-semiDark"
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={applyFilter}
              disabled={hasValidationErrors}
              className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
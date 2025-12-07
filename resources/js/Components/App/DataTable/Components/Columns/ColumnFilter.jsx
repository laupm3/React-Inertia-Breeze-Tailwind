import { useMemo, useCallback } from "react";
import { useDataTable } from "../../Context/DataTableContext";
import { getNestedValue } from "../../Utils/getNestedValue";
import { MultiSelect } from "@/Components/App/Multiselect/multi-select";

export default function ColumnFilter({
  column,
  labelFn,
  valueFn,
  className,
}) {
  const { table } = useDataTable();

  const { columnDef, accessorFn } = column;
  const { cell, title } = columnDef;

  const { columnFilters } = table.getState();
  const currentFilterValues = useMemo(
    () => column.getFilterValue() || [], [column, columnFilters]);

  // Extract data processing to a separate memo
  const rows = useMemo(
    () => table.getPreFilteredRowModel().rows, [table]);

  // Función para normalizar valores en formato {value, label} -> Value es el valor único y por el cual se filtra, label es la parte visual
  const createRowsMap = (rows) => {
    // Si no hay valores, devolver array vacío
    if (!rows || rows.length === 0) {
      return [];
    }

    const optionsMap = new Map();

    return rows.reduce((map, row) => {

      const nestedRowValue = getNestedValue(row.original, column.id);

      if (!nestedRowValue) {
        return map;
      }

      const normalizeValue = valueFn ? nestedRowValue : row.original;
      const normalizeLabel = labelFn ? nestedRowValue : { row };

      if (!Array.isArray(nestedRowValue)) {
        const item = {
          value: (valueFn) ? valueFn(normalizeValue) : accessorFn(normalizeValue),
          label: (labelFn) ? labelFn(normalizeLabel) : cell(normalizeLabel)
        };

        if (!optionsMap.has(item.value)) {
          optionsMap.set(item.value, item);
        }
      } else {
        nestedRowValue.forEach((nestedItem) => {
          const item = {
            value: valueFn(nestedItem),
            label: labelFn(nestedItem),
          };

          if (!optionsMap.has(item.value)) {
            optionsMap.set(item.value, item);
          }
        });
      }

      return map;
    }, optionsMap);
  };

  /// Generate unique options with better dependencies
  const uniqueOptions = useMemo(() => {
    const rowsMap = createRowsMap(rows);

    return Array.from(rowsMap.values());
  }, [rows, cell, accessorFn]);

  // Update filter directly in the table
  const handleSelectionChange = useCallback((newValues) => {
    column?.setFilterValue(newValues.length > 0 ? newValues : undefined);
  }, [column]);

  return (
    <MultiSelect
      placeholder={title}
      column={column}
      options={uniqueOptions}
      onValueChange={handleSelectionChange}
      defaultValue={currentFilterValues}
      className={className + 'max-w-full'}
    />
  );
}
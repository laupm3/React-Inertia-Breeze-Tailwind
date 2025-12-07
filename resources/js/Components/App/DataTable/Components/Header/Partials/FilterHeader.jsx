import { useMemo, useCallback } from "react";
import { getNestedValue } from "../../../Utils/getNestedValue";
import { MultiSelect } from "../../Columns/Components/MultiSelect";
import { useDataTable } from "../../../Context/DataTableContext";

export default function FilterHeader({
    column,
    labelFn,
    valueFn,
    className,
}) {
    const { table } = useDataTable();

    // Crear una firma estable para los otros filtros
    const filtersSignature = useMemo(() => {
        return createFilterSignature(table, column)
    }, [table.getState().columnFilters, column.id]);

    const { columnDef, accessorFn } = column;
    const { cell } = columnDef;

    // Extract data processing to a separate memo, now dependent on filtersSignature
    const rows = useMemo(() => {
        return (filtersSignature) ? table.getFilteredRowModel().rows : table.getPreFilteredRowModel().rows
    }, [filtersSignature]);

    /// Generate unique options with better dependencies
    const uniqueOptions = useMemo(() => {
        const rowsMap = createRowsMap(rows, column, valueFn, labelFn, accessorFn, cell);

        return Array.from(rowsMap.values());
    }, [rows, cell, accessorFn, labelFn, valueFn]);

    // Update filter directly in the table
    const handleSelectionChange = useCallback((newValues) => {
        column?.setFilterValue(newValues.length > 0 ? newValues : undefined);
    }, [column]);

    return (
        column.getCanFilter() && (
            <MultiSelect
                column={column}
                options={uniqueOptions}
                onValueChange={handleSelectionChange}
                className={`
                    flex gap-0 items-center justify-center rounded-full bg-custom-gray-default hover:bg-custom-gray-semiLight dark:bg-custom-blackSemi dark:hover:bg-custom-blackLight
                    ${valueFn ? 'absolute bg-custom-white !border-2 max-w-[250px] justify-end px-4 hover:bg-custom-gray-default dark:bg-custom-blackSemi dark:hover:bg-custom-blackSemi' : `${!column.getFilterValue() && 'w-10 h-10'}`}
                    ${className}
                `}
            />
        )
    );
}

// Función para normalizar valores en formato {value, label} -> Value es el valor único y por el cual se filtra, label es la parte visual
const createRowsMap = (rows, column, valueFn, labelFn, accessorFn, cell) => {
    // Si no hay valores, devolver array vacío
    if (!rows || rows.length === 0) {
        return [];
    }

    const optionsMap = new Map();

    return rows.reduce((map, row) => {

        const nestedRowValue = getNestedValue(row.original, column.id) || row.original;

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
}
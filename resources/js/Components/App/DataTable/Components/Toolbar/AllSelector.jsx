import { useMemo, useCallback } from "react";
import { useDataTable } from "../../Context/DataTableContext";

export default function AllSelector({
  className = "",
  label = "Seleccionar todos",
}) {
  const { table } = useDataTable();

  // Extract current selection state con dependencias más específicas
  const selectionState = useMemo(() => {
    // Verificar que la tabla esté disponible
    if (!table) return { isAllSelected: false, isSomeSelected: false, isIndeterminate: false };
    
    const isAllSelected = table.getIsAllPageRowsSelected();
    const isSomeSelected = table.getIsSomePageRowsSelected();
    
    return {
      isAllSelected,
      isSomeSelected,
      isIndeterminate: isSomeSelected && !isAllSelected
    };
  }, [table?.getState().rowSelection, table]);

  // Extract data processing con verificaciones de seguridad
  const rowsData = useMemo(() => {
    // Verificar que la tabla esté disponible
    if (!table) return { totalRows: 0, filteredRows: 0, selectedRows: 0, selectedIds: [] };
    
    try {
      const rows = table.getPreFilteredRowModel()?.rows || [];
      const filteredRows = table.getFilteredRowModel()?.rows || [];
      const selectedRows = table.getFilteredSelectedRowModel()?.rows || [];
      
      return {
        totalRows: rows.length,
        filteredRows: filteredRows.length,
        selectedRows: selectedRows.length,
        selectedIds: selectedRows.map(row => row.id)
      };
    } catch (error) {
      console.warn('Error getting table data:', error);
      return { totalRows: 0, filteredRows: 0, selectedRows: 0, selectedIds: [] };
    }
  }, [table?.getState().rowSelection, table?.getState().columnFilters, table?.getState().globalFilter, table]);

  // Handle selection change con verificación de seguridad
  const handleSelectionChange = useCallback((checked) => {
    if (!table) return;
    
    try {
      table.toggleAllPageRowsSelected(checked);
    } catch (error) {
      console.warn('Error toggling selection:', error);
    }
  }, [table]);

  // Early return if no data or table - following ColumnFilter pattern
  if (!table || rowsData.filteredRows === 0) {
    return null;
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={selectionState.isAllSelected}
        ref={(input) => {
          if (input) {
            input.indeterminate = selectionState.isIndeterminate;
          }
        }}
        onChange={(e) => handleSelectionChange(e.target.checked)}
        className="w-4 h-4 text-custom-orange bg-gray-100 border-gray-300 rounded focus:ring-custom-orange dark:focus:ring-custom-orange dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
        {label}
      </span>
      <span className="text-xs text-custom-orange font-medium tabular-nums">
        ({rowsData.selectedRows}/{rowsData.filteredRows})
      </span>
    </div>
  );
}
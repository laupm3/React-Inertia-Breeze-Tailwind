import {
  TableBody as BaseTableBody,
  TableCell,
  TableRow
} from "@/Components/ui/table";
import { useSidebar } from "@/Components/ui/sidebar";

import { flexRender } from "@tanstack/react-table";

function TableBodyDesktop({ table }) {
  const {
    isMobile
  } = useSidebar();

  return (
    <BaseTableBody className="table-row-group">
      {table.getRowModel().rows.map((row) => {
        const visibleCells = row.getVisibleCells();
        const firstStickyId = visibleCells.find(cell => cell.column.id !== "select")?.column.id;

        return (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
          >
            {visibleCells.map((cell) => {
              const hasSelection = visibleCells.some(cell => cell.column.id === "select");
              const isSelectionCell = cell.column.id === "select";
              const isFirstSticky = cell.column.id === firstStickyId;
              const isActions = cell.column.id === "actions";

              const baseStickyClass = "z-10 bg-custom-white dark:bg-custom-blackLight !p-4";
              const innerFlexClass = `flex flex-col gap-1 w-full h-full ${isSelectionCell || isActions && "items-center"}`;

              const positionClass = isSelectionCell
                ? "sticky left-0 bg-custom-gray-default dark:bg-custom-blackSemi"
                : isFirstSticky
                  ? `sticky ${hasSelection ? "left-12" : "left-0"} bg-custom-gray-default dark:bg-custom-blackSemi`
                  : isActions
                    ? "sticky right-0"
                    : "";

              return (
                <TableCell key={cell.id} className={`${baseStickyClass} ${(!isMobile) && positionClass}`}>
                  <div className={innerFlexClass}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        );
      })}
    </BaseTableBody >
  )
}

export default TableBodyDesktop
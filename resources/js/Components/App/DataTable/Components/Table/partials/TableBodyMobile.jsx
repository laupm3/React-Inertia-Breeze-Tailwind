import {
  TableBody as BaseTableBody,
  TableRow,
  TableCell,
} from "@/Components/ui/table";

import { flexRender } from "@tanstack/react-table";

function TableBodyMobile({ table, columns, selectedCell, setSelectedCell }) {
  return (
    <BaseTableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell colSpan={columns.length} className="!p-0">
            {/* El `div` debe estar DENTRO del `td`, nunca fuera */}
            <div
              className="flex w-full cursor-pointer"
              onClick={() =>
                setSelectedCell((prev) => (prev === row.id ? null : row.id))
              }
            >
              <div className="flex w-full relative bg-custom-gray-light dark:bg-custom-blackSemi my-4 p-4 rounded-2xl transition-all duration-300">
                <div className="flex flex-col w-full">
                  {row.getVisibleCells().map((cell, index) => {
                    const id = cell.column.id;
                    const isSelect = id === "select";
                    const isActions = id === "actions";

                    const isFirstVisible =
                      !isSelect &&
                      !isActions &&
                      row
                        .getVisibleCells()
                        .findIndex(
                          (c) =>
                            c.column.id !== "select" &&
                            c.column.id !== "actions"
                        ) === index;

                    const isExpanded = selectedCell === row.id;

                    if (isSelect)
                      return (
                        <div
                          key={cell.id}
                          className="absolute top-2 right-12 w-8 h-8 flex items-center justify-center rounded-full z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      );

                    if (isActions)
                      return (
                        <div
                          key={cell.id}
                          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      );

                    if (isFirstVisible)
                      return (
                        <div
                          key={cell.id}
                          className="flex w-full flex-col gap-1"
                        >
                          <span className="text-sm font-semibold text-muted-foreground">
                            {cell.column.columnDef.title}:
                          </span>
                          <span className="flex w-full bg-custom-gray-default dark:bg-custom-blackLight py-2 px-4 rounded-xl">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </span>
                        </div>
                      );

                    return (
                      <div
                        key={cell.id}
                        className={`flex flex-col gap-1 transition-all duration-300 ${isExpanded
                            ? "max-h-96 opacity-100 overflow-y-auto mt-2"
                            : "max-h-0 opacity-0"
                          } overflow-hidden`}
                      >
                        <span className="text-sm font-semibold text-muted-foreground pt-4">
                          {cell.column.columnDef.title}:
                        </span>
                        <span className="flex bg-custom-gray-default dark:bg-custom-blackLight py-2 px-4 rounded-xl">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </BaseTableBody>
  );
}

export default TableBodyMobile;

import { Checkbox } from "@/Components/App/Checkbox/Checkbox";

export const rowSelectionColumn = {
    id: 'select',
    header: ({ table }) => {
        return (
            <div className="flex items-center justify-center gap-2">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
                <div className="md:hidden">Seleccionar todos</div>
            </div>
        );
    },
    cell: ({ row }) => (
        <div className="flex items-center justify-center">
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        </div>
    ),
    enableSorting: false,
    enableHiding: false,
}
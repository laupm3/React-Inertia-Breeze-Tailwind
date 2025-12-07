import { ArrowUpDown } from "lucide-react";
import { Button } from "@/Components/ui/button";
import Checkbox from "@/Components/Checkbox";
import { SheetTableCenters } from "@/Components/Centers/SheetTableCenters";

// Definición de las columnas
export const columnsCenters = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="border-custom-orange border-2"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="border-custom-orange border-2"
            />
        ),
    },
    {
        accessorKey: "center", // Este es el nombre de la columna "center"
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Center Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span>{row.original.center?.name || "N/A"}</span>,  // Muestra el nombre del centro
        filterFn: (row, columnId, filterValue) => {
            // Filtra por nombre del centro
            const centerName = row.original.center?.name.toLowerCase();
            return centerName && centerName.includes(filterValue.toLowerCase());
        },
    },
    {
        accessorKey: "ubication",
        header: "Ubication",
        cell: ({ row }) => <span>{row.original.ubication || "N/A"}</span>,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <SheetTableCenters
                centerName={row.original.center.name}
                center={row.original.center}
                user={row.original.user}
                jetstream={row.original.jetstream}
            />
        ),
    },
];


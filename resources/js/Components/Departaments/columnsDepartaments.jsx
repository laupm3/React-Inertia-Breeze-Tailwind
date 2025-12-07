import { ArrowUpDown } from "lucide-react";
import { Button } from "@/Components/ui/button";
import Checkbox from "@/Components/Checkbox";
import { SheetTableDepartaments } from "@/Components/Departaments/SheetTableDepartaments";

// Definición de las columnas
export const columnsDepartaments = [
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
        accessorKey: "departament", // Este es el nombre de la columna "departament"
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Departament Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span>{row.original.departament?.name || "N/A"}</span>,  // Muestra el nombre del centro
        filterFn: (row, columnId, filterValue) => {
            // Filtra por nombre del centro
            const departamentName = row.original.departament?.name.toLowerCase();
            return departamentName && departamentName.includes(filterValue.toLowerCase());
        },
    },
    {
        accessorKey: "User",
        header: "Users",
        cell: ({ row }) => <span>{row.original.Users || "N/A"}</span>,
    },
    {
        accessorKey: "Manager",
        header: "Manager",
        cell: ({ row }) => <span>{row.original.Manager || "N/A"}</span>,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <SheetTableDepartaments
                departamentName={row.original.departament.name}
                departament={row.original.departament}
                user={row.original.user}
                jetstream={row.original.jetstream}
            />
        ),
    },
];


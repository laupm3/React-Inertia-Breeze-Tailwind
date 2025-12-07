import { Button } from "@/Components/ui/button";
import { SheetTable } from "@/Pages/Admin/Empresas/Partials/SheetTable";
import Dialog from "@/Pages/Admin/Empresas/Partials/CreateUpdateDialog";
import Checkbox from "@/Components/Checkbox";
import { ArrowUpDown } from "lucide-react";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import { router } from "@inertiajs/react";

// Función para renderizar el header del checkbox
const renderCheckboxHeader = (table, t) => (
    <Checkbox
        checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t("datatable.selectAll")}
        className="border-custom-orange border-2"
    />
);

// Función para renderizar el checkbox de cada fila
const renderCheckboxCell = (row, t) => (
    <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t("datatable.selectRow")}
        className="border-custom-orange border-2"
    />
);

// Función para renderizar el header con botón de ordenamiento
const renderSortableHeader = (column, label) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
);

// Función para renderizar la celda del nombre con avatar
const renderNameCell = (row) => (
    <div className="flex items-center gap-2">
        <span>
            {row.original.nombre}
        </span>
    </div>
);

const manageDelete = async (id) => {
    router.delete(route('admin.empresas.destroy', { id }));
}

/**
 * Componente para las acciones de la fila, contiene un botón que funciona como trigger para abrir el SheetTable
 * 
 * @param {*} row - La fila de la tabla 
 * @returns {JSX.Element} Componente RowActions
 */
const RowActions = ({ row }) => {
    const [isOpenSheetTable, setIsOpenSheetTable] = useState(false);
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [isDestructiveModalOpen, setIsDestructiveModalOpen] = useState(false);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="btn">
                    <Ellipsis className="w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-custom-blackSemi">
                <DropdownMenuItem onSelect={() => setIsOpenSheetTable(true)}>
                    <Icon name="Info" className="w-4 mr-2" /> Información
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsOpenDialog(true)}>
                    <Icon name="SquarePen" className="w-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
                    onSelect={() => setIsDestructiveModalOpen(true)}
                >
                    <Icon name="X" className="w-4 mr-2" /> Eliminar
                </DropdownMenuItem>
                {/* Add more DropdownMenuItem as needed */}
            </DropdownMenuContent>
            {isOpenSheetTable && (
                <SheetTable
                    key={`sheetTable-${row.original.id}`}
                    dataId={row.original.id}
                    open={isOpenSheetTable}
                    onOpenChange={() => setIsOpenSheetTable(!isOpenSheetTable)}
                />
            )}
            {isOpenDialog && (
                <Dialog
                    key={`dialog-${row.original.id}`}
                    dataId={row.original.id}
                    open={isOpenDialog}
                    onOpenChange={() => setIsOpenDialog(!isOpenDialog)}
                />
            )}
            {isDestructiveModalOpen && (
                <DecisionModal
                    title='¿Estás seguro de que quieres eliminar esta empresa?'
                    content='Esta acción no se puede deshacer. Todos los datos relacionados con esta empresa se eliminarán.'
                    open={isDestructiveModalOpen}
                    onOpenChange={() => setIsDestructiveModalOpen(!isDestructiveModalOpen)}
                    action={() => manageDelete(row.original.id)}
                    variant="destructive"
                    icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
                />
            )}
        </DropdownMenu>
    );
};

/**
 * @description devuelve el contenido sin acentos para un filtrado correcto
 * @param {*} str
 */
const removeAccents = (str) => {
    const accentsMap = {
        á: "a",
        é: "e",
        í: "i",
        ó: "o",
        ú: "u",
        Á: "A",
        É: "E",
        Í: "I",
        Ó: "O",
        Ú: "U",
    };
    return str
        .split("")
        .map((char) => accentsMap[char] || char)
        .join("");
};

/**
 * Columnas de la tabla de usuarios, con las propiedades de cada columna
 */
export const columns = (t) => [
    {
        id: "select",
        header: ({ table }) => renderCheckboxHeader(table, t),
        cell: ({ row }) => renderCheckboxCell(row, t),
    },
    {
        accessorKey: "nombre",
        header: ({ column }) => renderSortableHeader(column, t('datatable.nombre')),
        cell: ({ row }) => renderNameCell(row),
        accessorFn: (row) => removeAccents(row.nombre)
    },
    {
        accessorKey: "SIGLAS",
        header: ({ column }) => renderSortableHeader(column, "SIGLAS"),
        cell: ({ row }) => <span>{row.original.siglas}</span>,
        accessorFn: (row) => removeAccents(row.siglas)
    },
    {
        accessorKey: "CIF",
        header: ({ column }) => (column, "CIF"),
        cell: ({ row }) => <span>{row.original.cif}</span>,
        accessorFn: (row) => row.cif
    },
    {
        accessorKey: "direccion",
        header: ({ column }) => (column, t('tables.direccion')),
        cell: ({ row }) => (
            <span className="whitespace-nowrap">
                {row.original.direccion.full_address}
            </span>
        ),
        accessorFn: (row) => removeAccents(row.direccion.full_address)
    },
    {
        accessorKey: "email",
        header: ({ column }) => (column, "Email"),
        cell: ({ row }) => <span>{row.original.email}</span>,
        accessorFn: (row) => row.email
    },
    {
        accessorKey: "telefono",
        header: ({ column }) => (column, t('tables.telefono')),
        cell: ({ row }) => <span>{row.original.telefono}</span>,
        accessorFn: (row) => row.telefono
    },
    {
        accessorKey: "representante",
        header: ({ column }) => renderSortableHeader(column, "Representante"),
        cell: ({ row }) => <EmpleadoAvatar empleado={row.original.representante} />,
        filterFn: (row, columnId, filteredValues) => {
            const representanteValue = row.original.representante.id || row.original.representante;
            return filteredValues.includes(representanteValue);
        },
        accessorFn: (row) => removeAccents(row.representante.nombre)
    },
    {
        accessorKey: "adjunto",
        header: ({ column }) => renderSortableHeader(column, "Adjuntos"),
        cell: ({ row }) => <EmpleadoAvatar empleado={row.original.adjunto} />,
        filterFn: (row, columnId, filteredValues) => {
            const adjuntoValue = row.original.adjunto.id || row.original.adjunto;
            return filteredValues.includes(adjuntoValue);
        },
        accessorFn: (row) => removeAccents(row.adjunto.nombre)
    },
    {
        accessorKey: "centros",
        header: ({ column }) => renderSortableHeader(column, "Center"),
        isHidden: true,
        enableHiding: false,
        filterFn: (row, columnId, filteredValues) => {
            const centros = row.original.centros || [];
            return centros.some(centros => filteredValues.includes(centros.id));
        }
    },
    {
        id: "actions",
        header: t('datatable.acciones'),
        cell: ({ row }) => <RowActions row={row} />,
    },
];


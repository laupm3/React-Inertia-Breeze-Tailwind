import { Button } from "@/Components/ui/button";
import Checkbox from "@/Components/Checkbox";

import { ArrowUpDown } from "lucide-react";
import { Ellipsis } from "lucide-react";
import { useState } from "react";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import Dialog from "@/Pages/Admin/Turnos/Partials/CreateUpdateDialog";
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

const manageDelete = async (id) => {
    router.delete(route('admin.turnos.destroy', { id }));
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
                    title='¿Estás seguro de que quieres eliminar este turno?'
                    content='Esta acción no se puede deshacer. Todos los datos relacionados con este turno se eliminarán. Esto podría afectar a las jornadas laborales de los empleados.'
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
        header: ({ column }) => renderSortableHeader(column, 'Nombre'),
        cell: ({ row }) =>
            <div className="flex gap-2 justify-start items-center">
                <div
                    className='w-5 h-5 rounded-md mr-2'
                    style={{ backgroundColor: row.original.color }}
                />
                {row.original.nombre}
            </div>,
        accessorFn: (row) => removeAccents(row.nombre)
    },
    {
        accessorKey: "horario",
        header: ({ column }) => renderSortableHeader(column, "Horario"),
        cell: ({ row }) =>
            <span>
                {row.original.horaInicio} - {row.original.horaFin}
            </span>,
        accessorFn: (row) => removeAccents(`${row.horaInicio} - ${row.horaFin}`),
    },
    {
        accessorKey: "descanso",
        header: ({ column }) => renderSortableHeader(column, 'Descanso'),
        cell: ({ row }) =>
            <span>
                {`${(row.original.descansoInicio)
                    ? `${row.original.descansoInicio} - ${row.original.descansoFin}`
                    : ''
                    }`}

            </span>,
        accessorFn: (row) => removeAccents(`${row.descansoInicio} - ${row.descansoFin}`)
    },
    {
        accessorKey: "centro",
        header: ({ column }) => renderSortableHeader(column, "Center"),
        cell: ({ row }) => <span>{row.original.centro.nombre}</span>,
        filterFn: (row, columnId, filteredValues) => {
            const centro = row.original.centro || [];
            return filteredValues.includes(centro.id);
        },
        accessorFn: (row) => removeAccents(row.centro.nombre)
    },
    {
        accessorKey: "descripcion",
        header: ({ column }) => renderSortableHeader(column, 'Descripción'),
        cell: ({ row }) =>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span className="text-nowrap overflow-hidden max-w-[20rem] text-ellipsis block">
                            {row.original.descripcion}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{row.original.descripcion}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>,
        accessorFn: (row) => removeAccents(row.descripcion)
    },
    {
        id: "actions",
        header: t('datatable.acciones'),
        cell: ({ row }) => <RowActions row={row} />,
    },
];


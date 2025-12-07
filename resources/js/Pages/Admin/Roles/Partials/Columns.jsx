import { Button } from "@/Components/ui/button";
import { SheetTable } from "@/Pages/Admin/Roles/Partials/SheetTable";
import CreateUpdateDialog from "@/Pages/Admin/Roles/Partials/CreateUpdateDialog";
import Checkbox from "@/Components/Checkbox";
import { ArrowUpDown } from "lucide-react";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
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
    aria-label={t('datatable.selectAll')}
    className="border-custom-orange border-2"
  />
);

// Función para renderizar el checkbox de cada fila
const renderCheckboxCell = (row, t) => (
  <Checkbox
    checked={row.getIsSelected()}
    onCheckedChange={(value) => row.toggleSelected(!!value)}
    aria-label={t('datatable.selectRow')}
    className="border-custom-orange border-2"
  />
);

// Función para renderizar el header con botón de ordenamiento
const renderSortableHeader = (column, label) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="flex flex-start items-center !px-0"
  >
    {label}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

// Función para renderizar la celda del nombre 
const renderNameCell = (row) => (
  <div className="flex items-center gap-2">
    <span>{row.original.name}</span>
  </div>
);

// Función para renderizar la celda de la descripcion
const renderDescripcionCell = (row) => (
  <div className="flex items-center gap-2">
    {row.original.description === null ? 'Sin Descripcion' : <span>{row.original.description}</span>}
  </div>
);

// Función para manejar la eliminación
const manageDelete = async (id) => {
  router.delete(route('admin.roles.destroy', { id }));
}

// Función para renderizar las acciones de cada fila
const RowActions = ({ row }) => {
  const [isOpenSheetTable, setIsOpenSheetTable] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isDestructiveModalOpen, setIsDestructiveModalOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn w-full flex justify-center items-center">
          <Ellipsis className="w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dark:bg-custom-blackSemi">
        <DropdownMenuItem onSelect={() => setIsOpenSheetTable(true)}>
          <Icon name="Info" className="w-4 mr-2" /> Información de rol
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setIsOpenDialog(true)}>
          <Icon name="SquarePen" className="w-4 mr-2" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
          onSelect={() => setIsDestructiveModalOpen(true)}
        >
          <Icon name="X" className="w-4 mr-2" /> Eliminar rol
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
        <CreateUpdateDialog
          key={`dialog-${row.original.id}`}
          dataId={row.original.id}
          data={row.original}
          open={isOpenDialog}
          onOpenChange={() => setIsOpenDialog(!isOpenDialog)}
        />
      )}
      {isDestructiveModalOpen && (
        <DecisionModal
          title='¿Estás seguro de que quieres eliminar este rol?'
          content='Esta acción no se puede deshacer. Todos los datos relacionados con este rol se eliminarán.'
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
 * Columnas de la tabla de roles, con las propiedades de cada columna
 */
export const columns = (t) => [
  {
    id: "select",
    header: ({ table }) => renderCheckboxHeader(table, t),
    cell: ({ row }) => renderCheckboxCell(row, t),
  },
  {
    accessorKey: "name",
    header: ({ column }) => renderSortableHeader(column, t('datatable.nombre')),
    cell: ({ row }) => renderNameCell(row),
    accessorFn: (row) => removeAccents(row.name),
  },
  {
    accessorKey: "Description",
    header: ({ column }) => (column, t('tables.descripcion')),
    cell: ({ row }) => renderDescripcionCell(row),
    accessorFn: (row) => removeAccents(row.description)
  },
  {
    accessorKey: "users",
    header: ({ column }) => renderSortableHeader(column, t('tables.users')),
    cell: ({ row }) => <span>{row.original.users_count}</span>,
    accessorFn: (row) => row.users_count
  },
  {
    accessorKey: "permissions",
    header: ({ column }) => renderSortableHeader(column, t('tables.permissions')),
    cell: ({ row }) => <span>{row.original.permissions_count}</span>,
    accessorFn: (row) => row.permissions_count
  },
  {
    id: "actions",
    header: <div className="flex justify-center">{t('datatable.acciones')}</div>,
    cell: ({ row }) => <RowActions row={row} />,
  },
];

import { Button } from "@/Components/ui/button";
import SheetTable from "@/Pages/Admin/Centros/Partials/SheetTable";
import Checkbox from "@/Components/Checkbox";
import { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/Components/ui/dropdown-menu";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_CENTRO_COLOR_MAP from "@/Components/App/Pills/constants/StatusCentroMapColor";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import CreateUpdateDialog from "@/Pages/Admin/Centros/Partials/CreateUpdateDialog";
import { router } from "@inertiajs/react";
import Icon from "@/imports/LucideIcon";

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
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  >
    {label}
     <Icon name="ArrowUpDown" className="w-4 h-4 ml-2" />
  </Button>
);

// Función para renderizar la celda del nombre
const renderNameCell = (row) => (
  <div className="flex items-center gap-2">
    <span>{row.original.nombre}</span>
  </div>
);

const manageDelete = async (id) => {
  router.delete(route('admin.centros.destroy', { id }));
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
          <Icon name="Ellipsis" className="w-4" />
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
        <CreateUpdateDialog
          key={`dialog-${row.original.id}`}
          dataId={row.original.id}
          open={isOpenDialog}
          onOpenChange={() => setIsOpenDialog(!isOpenDialog)}
        />
      )}
      {isDestructiveModalOpen && (
        <DecisionModal
          title='¿Estás seguro de que quieres eliminar este centro?'
          content='Esta acción no se puede deshacer. Todos los datos relacionados con este centro se eliminarán.'
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
 * Columnas de la tabla de Centros, con las propiedades de cada columna
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
    accessorKey: "empresa",
    header: ({ column }) => renderSortableHeader(column, t('tables.empresa')),
    cell: ({ row }) => <span>{row.original.empresa.siglas}</span>,
    filterFn: (row, columnId, filteredValues) => {
      const empresaValue = row.original.empresa.id || row.original.empresa;
      return filteredValues.includes(empresaValue);
    },
    accessorFn: (row) => removeAccents(row.empresa.nombre)
  },
  {
    accessorKey: "Direccion",
    header: ({ column }) => (column, t('tables.direccion')),
    cell: ({ row }) => <span>{row.original.direccion.full_address}</span>
  },
  {
    accessorKey: "telefono",
    header:t('tables.telefono'),
    cell: ({ row }) => <span>{row.original.telefono}</span>,
  },
  {
    accessorKey: "responsable",
    isHidden: true,
    enableHiding: false,
    filterFn: (row, columnId, filteredValues) => {
      const responsableValue = row.original.responsable?.id || row.original.responsable;
      return filteredValues.includes(responsableValue);
    },
  },
  {
    accessorKey: "coordinador",
    isHidden: true,
    enableHiding: false,
    filterFn: (row, columnId, filteredValues) => {
      const coordinadorValue = row.original.coordinador?.id || row.original.coordinador;
      return filteredValues.includes(coordinadorValue);
    },
  },
  {
    accessorKey: "estado",
    header: ({ column }) => renderSortableHeader(column, t('tables.estado')),
    cell: ({ row }) => <>
      <Pill
        identifier={row.original.estado.nombre}
        children={row.original.estado.nombre}
        mapColor={STATUS_CENTRO_COLOR_MAP}
        size="text-xs"
        textClassName="font-medium"
      />
    </>,
    filterFn: (row, columnId, filteredValues) => {
      const estadoValue = row.original.estado?.id || row.original.estado;
      return filteredValues.includes(estadoValue);
    },
    accessorFn: (row) => row.estado.id
  },
  {
    id: "actions",
    header: t('datatable.acciones'),
    cell: ({ row }) => <RowActions row={row} />,
  },
];
import { Button } from "@/Components/ui/button";
import { SheetTable } from "@/Pages/Admin/Departamentos/Partials/SheetTable";
import Checkbox from "@/Components/Checkbox";
import { useState } from "react";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import CreateUpdateDialog from "@/Pages/Admin/Departamentos/Partials/CreateUpdateDialog";
import { router } from "@inertiajs/react";


// Función para renderizar el header del checkbox
const renderCheckboxHeader = (table, t) => (
  <div className="flex justify-center">
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label={t('datatable.selectAll')}
      className="border-custom-orange border-2"
    />
  </div>
);

// Función para renderizar el checkbox de cada fila
const renderCheckboxCell = (row, t) => (
  <div className="flex justify-center">
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label={t('datatable.selectRow')}
      className="border-custom-orange border-2"
    />
  </div>
);

// Función para renderizar el header con botón de ordenamiento
const renderSortableHeader = (column, label) => (
  <div className="flex justify-center">
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="w-full justify-center"
    >
      {label}
      <Icon name="ArrowUpDown" className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

// Función para renderizar la celda del nombre 
const renderNameCell = (row) => (
  <div className="text-left">
    <span className="font-bold">{row.original.nombre}</span>
    <span>{row.original.parentDepartment?.nombre ? ` (${row.original.parentDepartment.nombre})` : ""}</span>
  </div>
);

const manageDelete = async (id) => {
  router.delete(route('admin.departamentos.destroy', { id }));
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
    accessorKey: "users",
    header: ({ column }) => renderSortableHeader(column, t('tables.numeroContratosVigentes')),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.contratosVigentes?.length || 0}
      </div>
    ),
    accessorFn: (row) => row.contratosVigentes?.length || 0
  },
  {
    accessorKey: "manager",
    header: ({ column }) => renderSortableHeader(column, t('datatable.manager')),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <EmpleadoAvatar empleado={row.original.manager} />
      </div>
    ),
    filterFn: ({ original: { manager } }, columnId, filteredValues) => {
      if (!manager) return false;
      return filteredValues.includes(manager.id);
    },
    accessorFn: (row) => removeAccents(row.manager?.nombreCompleto)
  },
  {
    accessorKey: "centros",
    isHidden: true,
    enableHiding: false,
    header: "Centros",
    cell: ({ row }) => (
      <div className="text-center">
        <span>{row.original.centros.map(centro => centro.nombre).join(', ')}</span>
      </div>
    ),
    filterFn: ({ original: { centros } }, columnId, filteredValues) => {
      if (!centros) return false;
      return centros.some(centro => filteredValues.includes(centro.id));
    },
  },
  {
    accessorKey: "adjunto",
    header: ({ column }) => renderSortableHeader(column, "Adjunto"),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <EmpleadoAvatar empleado={row.original.adjunto} />
      </div>
    ),
    filterFn: ({ original: { adjunto } }, columnId, filteredValues) => {
      if (!adjunto) return false;
      return filteredValues.includes(adjunto.id);
    },
    accessorFn: (row) => removeAccents(row.adjunto?.nombreCompleto)
  },
  {
    id: "actions",
    header: ({ column }) => (column, t('datatable.acciones')),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RowActions row={row} />
      </div>
    ),
  },
];
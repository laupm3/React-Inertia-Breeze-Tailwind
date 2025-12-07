import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { useTranslation } from 'react-i18next';
import { useState } from "react";
import RenderDinamicFilter from "@/Components/App/RenderDinamicFilter";

import CreateUpdateDialog from "@/Pages/Admin/Turnos/Partials/CreateUpdateDialog";
import { Link } from "@inertiajs/react";

/**
 * Componente que renderiza la barra de herramientas de la tabla, contiene los filtros y buscadores
 * 
 * @returns {JSX.Element}
 */
export default function TableToolbar({ table }) {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false); // Estado para controlar la apertura del menú
  const [isOpenCreateUpdateDialog, setIsOpenCreateUpdateDialog] = useState(false); // Estado para controlar la apertura del diálogo
  const [FilterColumnSearchOpen, setFilterColumnSearchOpen] = useState(false); // Estado para control
  const [selectedCentros, setSelectedCentros] = useState([]); // Estado para los centro seleccionados
  const [isVisibleFiltros, setIsVisibleFiltros] = useState(false);

  const { t } = useTranslation(['datatable']);

  // Función para restablecer los valores del filtro a los predefinidos
  const resetFilterValues = () => {
    setSelectedCentros([]);
    setFilterColumnSearchOpen(false);
  };

  const [delayTimer, setDelayTimer] = useState(null);
  /**
   * Maneja el cambio en el filtro de la tabla. Establece el filtro global de la tabla con el nuevo valor.
   * 
   * @param {Object} event - El evento de cambio del input.
   * @param {Object} event.target - El elemento que disparó el evento.
   * @param {string} event.target.value - El nuevo valor del filtro.
   */
  const handleFilterChange = (e) => {
      const value = e.target.value;
      setFilter(value);

      if (delayTimer) {
          clearTimeout(delayTimer);
      }

      setDelayTimer(
          setTimeout(() => {
              table.setGlobalFilter(value);
          }, 500)
      );
  };

  const renderTitle = () => (
    <span className="absolute top-24 bg-custom-white dark:bg-custom-blackLight text-custom-blue dark:text-custom-white font-bold border-none text-lg px-2 capitalize">
      Turnos
    </span>
  );

  const renderMainButtons = () => (
    <div className="flex gap-4">
      <Button
        onClick={() => setIsOpenCreateUpdateDialog(!isOpenCreateUpdateDialog)}
        variant="outline"
        className="rounded-full bg-custom-orange hover:bg-custom-blue dark:hover:bg-custom-white dark:text-custom-black text-white hover:text-white flex items-center"
      >
        <span className="hidden sm:inline">Crear Turno</span>
        <Icon name="Plus" className="w-4 ml-2" />
      </Button>
      {isOpenCreateUpdateDialog && (
        <CreateUpdateDialog
          open={isOpenCreateUpdateDialog}
          onOpenChange={setIsOpenCreateUpdateDialog}
        />
      )}
    </div>
  );

  /**
   * Renderiza el buscador de la tabla
   * 
   * @returns {JSX.Element}
   */
  const renderSearchInput = () => (
    <div className="w-full sm:max-w-sm">
      <div className="relative">
        <Icon name="Search" className="dark:text-custom-white text-custom-gray-dark w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <Input
          placeholder={'Buscar...'}
          value={filter}
          onChange={handleFilterChange}
          className="pl-10 rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
        />
      </div>
    </div>
  );

  /**
   * Renderiza el dropdown para seleccionar las columnas a mostrar
   * 
   * @returns {JSX.Element}
   */
  const renderDropdownMenu = () => (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-full bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-accent focus:border-none"
        >
          {t('tables.columnas')} <Icon name="ChevronDown" className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-custom-gray-default dark:bg-custom-blackLight"
        onCloseAutoFocus={(e) => e.preventDefault()} // Evita que el menú se cierre automáticamente
      >
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              onSelect={(e) => e.preventDefault()} // Previene que el menú se cierre al seleccionar
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  /**
   * Renderiza el dropdown con el valor seleccionado visible en el botón
   * 
   * @returns {JSX.Element}
   */
  const renderDropdown = (label, items, isChecked, onChange, selectedLabel) => {
    const [selectedItem, setSelectedItem] = useState(selectedLabel);
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="rounded-full bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-accent focus:border-none"
          >
            {selectedItem ? `${label}: ${selectedItem}` : label}
            <Icon name="ChevronDown" className="w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-custom-gray-default dark:bg-custom-blackLight"
        >
          {items.map((item) => (
            <DropdownMenuCheckboxItem
              key={item}
              className={`capitalize focus:bg-custom-gray-semiLight ${selectedItem === item ? "bg-custom-gray-dark text-white" : ""}`}
              checked={item === selectedItem} // Directly compare item with selectedItem
              onCheckedChange={(value) => {
                setSelectedItem(value ? item : null);
                onChange(item, value);
              }}
            >
              {item}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  /**
   * Renderiza el dropdown para seleccionar el número de elementos por página
   * 
   * @returns {JSX.Element}
   */
  const renderPerPageDropdown = () => {
    const perPageOptions = [10, 20, 30, 40, 50, 100];
    const pageSize = table.pageSize || 10; // Si no hay un tamaño de página, establece 10 como predeterminado
    return renderDropdown(
      `${t('tables.paginador')}`,
      perPageOptions,
      (item) => pageSize === item, // This is not used anymore
      (item, value) => table.setPageSize(value ? item : 10),
      pageSize // Pasar el tamaño de la página actual
    );
  };

  /**
 * Renderiza el Dropdown para seleccionar los filtros de busqueda
 * 
 * @returns {JSX.Element}
 */
  const renderFilterMenu = () => (
    <DropdownMenu open={FilterColumnSearchOpen} onOpenChange={setFilterColumnSearchOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full bg-hidden border-none"
          onClick={(e) => setIsVisibleFiltros(!isVisibleFiltros)}
        >
          {t('tables.filtro')} <Icon name="SlidersHorizontal" className="ml-1 w-5 text-custom-orange" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-custom-gray-default dark:bg-custom-blackLight rounded-2xl"
        onCloseAutoFocus={(e) => e.preventDefault()} // Evita que el menú se cierre automáticamente
      >

        <div className="flex flex-col gap-2 p-2 w-full min-w-[20rem] max-w-[20rem]">
          <div className="flex justify-between items-center w-full">
            <h4 className="text-lg font-bold">
              {t('tables.columnas')}
            </h4>
            <Button
              className="bg-transparent hover:bg-slate-200 dark:hover:bg-accent text-custom-blue dark:text-custom-white rounded-full"
              onClick={resetFilterValues}
            >
              {t('tables.borrarfiltro')}
            </Button>
          </div>
          <div className="flex flex-col gap-y-3">
            {/* Centro */}
            <RenderDinamicFilter
              key={`centros-filter`}
              table={table}
              columnKey="centro"
              placeholder={t('tables.centros')}
              getLabel={(centro) => centro.nombre}
              selectedValues={selectedCentros}
              setSelectedValues={setSelectedCentros}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="grid ">
      {renderTitle()}
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-center m-2 gap-4">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto ">
          <Link
            href={route('admin.jornadas.index')}
            variant="secondary"
            className='inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 dark:hover:bg-gray-400 font-semibold rounded-full py-2 px-4 bg-custom-gray-light dark:bg-custom-gray-dark hover:bg-custom-gray-dark text-custom-blackLight hover:text-custom-white dark:text-custom-white duration-300 w-fit'>
            Jornadas
            <Icon name="ArrowUpRight" className="w-4 ml-2" />
          </Link>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
          {renderFilterMenu()}
          {renderSearchInput()}
          {renderDropdownMenu()}
          {renderPerPageDropdown()}
          {renderMainButtons()}
        </div>
      </div>
    </div>
  );
}


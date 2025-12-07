import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { useTranslation } from 'react-i18next';
import { t } from "i18next";
import CreateUpdateDialog from "@/Pages/Admin/Roles/Partials/CreateUpdateDialog";

/**
 * Componente que renderiza la barra de herramientas de la tabla, contiene los filtros y buscadores
 * 
 * @returns {JSX.Element}
 */
export default function TableToolbar({ table }) {
  const [filter, setFilter] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [open, setOpen] = useState(false); // Estado para controlar la apertura del menú
  const { t } = useTranslation(['datatable']);

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
      {t('tables.roles')}
    </span>
  );

  const renderMainButtons = () => (
    <div className="flex gap-4">
      <Button
        onClick={() => setIsOpenDialog(!isOpenDialog)}
        variant="outline"
        className="rounded-full bg-custom-orange hover:bg-custom-blue dark:hover:bg-custom-white dark:text-custom-black text-white hover:text-white flex items-center"
      >
        <span className="hidden sm:inline">{t('tables.añadirrol')}</span>
        <Icon name="Plus" className="w-4 ml-2" />
      </Button>
      {isOpenDialog && (
        <CreateUpdateDialog
          open={isOpenDialog}
          onOpenChange={setIsOpenDialog}
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
          placeholder={t('tables.buscador')}
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
          {t('tables.columnas')}  <Icon name="ChevronDown" className="w-4" />
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

  return (
    <div className="grid">
      {renderTitle()}
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-center m-2 gap-4">

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
          
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
          {renderSearchInput()}
          {renderDropdownMenu()}
          {renderPerPageDropdown()}
          {renderMainButtons()}
        </div>

      </div>
    </div>
  );
}

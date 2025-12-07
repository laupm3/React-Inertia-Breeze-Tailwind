import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuSeparator } from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo, useCallback } from "react";
import RenderDinamicFilter from "@/Components/App/RenderDinamicFilter";
import axios from "axios";
import { Calendar } from "@/Components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { toast } from "sonner";
import { useNotifications } from '@/hooks/useNotifications';

/**
 * @typedef {Object} TableToolbarProps
 * @property {Object} table - Instancia de la tabla que contiene métodos y estado
 * @property {number} unreadCount - Número de notificaciones no leídas
 * @property {() => Promise<void>} onMarkAllAsRead - Función para marcar todas las notificaciones como leídas
 */

/**
 * @typedef {Object} ReadStatusOption
 * @property {string} value - Valor del estado de lectura ("read" | "unread")
 * @property {string} label - Etiqueta para mostrar en la UI
 */

/**
 * Componente que renderiza la barra de herramientas de la tabla de notificaciones.
 * Incluye filtros, búsqueda y opciones de visualización.
 * 
 * @param {TableToolbarProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente TableToolbar
 */
export default function TableToolbar({ table, unreadCount, onMarkAllAsRead }) {
    const [filter, setFilter] = useState("");
    const [open, setOpen] = useState(false);
    const [filterColumnSearchOpen, setFilterColumnSearchOpen] = useState(false);
    const [selectedReadStatus, setSelectedReadStatus] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [notificationTypes, setNotificationTypes] = useState([]);
    const [selectedActions, setSelectedActions] = useState([]);
    const [actionTypes, setActionTypes] = useState([]);
    const [selectedSenders, setSelectedSenders] = useState([]);
    const [senders, setSenders] = useState([]);
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null
    });

    const { t } = useTranslation(['datatable']);

    // Obtenemos funciones adicionales del hook
    const { markAsRead, markAsUnread, refreshNotifications } = useNotifications();

    // Mover activeFilters aquí, antes de renderFilterMenu
    const activeFilters = useMemo(() => {
        return [
            ...selectedReadStatus,
            ...selectedTypes,
            ...selectedActions,
            ...selectedSenders,
            ...(dateRange.from && dateRange.to ? ['date-range'] : [])
        ].length;
    }, [selectedReadStatus, selectedTypes, selectedActions, selectedSenders, dateRange]);

    /**
     * Opciones memoizadas para el filtro de estado de lectura
     * @type {ReadStatusOption[]}
     */
    const readStatusOptions = useMemo(() => [
        { 
            value: "unread", 
            label: t('notifications.status.unread', 'No leídas'),
            icon: "Mail"
        },
        { 
            value: "read", 
            label: t('notifications.status.read', 'Leídas'),
            icon: "MailOpen"
        }
    ], [t]);

    // Memoizamos las opciones de paginación
    const perPageOptions = useMemo(() => [10, 20, 30, 40, 50, 100], []);

    /**
     * Maneja el cambio en el filtro de búsqueda global de la tabla
     * 
     * @param {Object} event - Evento del input
     * @param {string} event.target.value - Valor del input de búsqueda
     */
    const handleFilterChange = useCallback(({ target: { value } }) => {
        setFilter(value);
        table.setGlobalFilter(String(value));
    }, [table]);

    /**
     * Resetea todos los valores de filtrado a su estado inicial
     */
    const resetFilterValues = useCallback(() => {
        setSelectedReadStatus([]);
        setSelectedTypes([]);
        setSelectedActions([]);
        setSelectedSenders([]);
        setDateRange({ from: null, to: null });
        
        const columns = [
            "read_status",
            "notifiable_model",
            "action_model",
            "sender_id",
            "sent_at"
        ];
        
        columns.forEach(columnId => {
            const column = table.getColumn(columnId);
            if (column) column.setFilterValue(null);
        });
    }, [table]);

    /**
     * Maneja el cambio en el filtro de estado de lectura
     * 
     * @param {Array<string>} values - Valores seleccionados en el filtro
     */
    const handleReadStatusChange = useCallback((values) => {
        setSelectedReadStatus(values);
    }, []);

    /**
     * Renderiza el componente de búsqueda
     * 
     * @returns {JSX.Element} Input de búsqueda con icono
     */
    const renderSearchInput = useCallback(() => (
        <div className="w-full sm:max-w-sm">
            <div className="relative">
                <Icon name="Search" className="dark:text-custom-white text-custom-gray-dark w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                    placeholder={`${t('datatable.search')}...`}
                    value={filter}
                    onChange={handleFilterChange}
                    className="pl-10 rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                />
            </div>
        </div>
    ), [filter, handleFilterChange, t]);

    /**
     * Renderiza el menú desplegable para seleccionar columnas visibles
     * 
     * @returns {JSX.Element} Dropdown de selección de columnas
     */
    const renderDropdownMenu = useCallback(() => (
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
                onCloseAutoFocus={(e) => e.preventDefault()}
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
                            onSelect={(e) => e.preventDefault()}
                        >
                            {column.id}
                        </DropdownMenuCheckboxItem>
                    ))}
            </DropdownMenuContent>
        </DropdownMenu>
    ), [open, table, t]);

    /**
     * Renderiza un menú desplegable genérico
     * 
     * @param {string} label - Etiqueta del dropdown
     * @param {Array<any>} items - Elementos a mostrar en el dropdown
     * @param {Function} isChecked - Función para determinar si un item está seleccionado
     * @param {Function} onChange - Función que se ejecuta al cambiar la selección
     * @param {any} selectedLabel - Etiqueta seleccionada actualmente
     * @returns {JSX.Element} Componente DropdownMenu
     */
    const renderDropdown = (label, items, isChecked, onChange, selectedLabel) => {
        const [selectedItem, setSelectedItem] = useState(selectedLabel || null);

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        className="rounded-full bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-accent focus:border-none"
                    >
                        {selectedItem ? `${label}: ${selectedItem}` : label} {/* Muestra la selección */}
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
                            className={`capitalize focus:bg-custom-gray-semiLight ${selectedItem === item ? "bg-custom-gray-dark text-white" : ""
                                }`}
                            checked={isChecked(item)}
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
    const renderPerPageDropdown = useCallback(() => {
        return renderDropdown(
            t('tables.paginador'),
            perPageOptions,
            (item) => table.pageSize === item,
            (item, value) => table.setPageSize(value ? item : 10),
            table.pageSize
        );
    }, [table.pageSize, t, perPageOptions]);

    /**
     * Renderiza el menú de filtros con sus opciones y estados
     * 
     * @returns {JSX.Element} Menú de filtros
     */
    const renderFilterMenu = useMemo(() => (
        <DropdownMenu open={filterColumnSearchOpen} onOpenChange={setFilterColumnSearchOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                    variant="outline"
                    className="rounded-full bg-hidden border-none"
                >
                    Filtros
                    {activeFilters > 0 && (
                        <span className="ml-1 min-w-[20px] h-[20px] inline-flex items-center justify-center bg-custom-orange text-white rounded-full text-xs">
                            {activeFilters}
                        </span>
                    )}
                    <Icon name="SlidersHorizontal" className="ml-1 w-5 text-custom-orange" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                align="start"
                className="bg-custom-white dark:bg-custom-blackLight rounded-2xl p-4"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <div className="flex flex-col gap-4 w-full min-w-[20rem] max-w-[20rem]">
                    {/* Encabezado de Filtros */}
                    <div className="flex justify-between items-center w-full">
                        <h4 className="text-lg font-bold text-custom-blue dark:text-custom-white">
                            Filtros
                        </h4>
                        {activeFilters > 0 && (
                            <Button
                                className="bg-transparent hover:bg-slate-200 dark:hover:bg-accent text-custom-blue dark:text-custom-white rounded-full"
                                onClick={resetFilterValues}
                            >
                                Borrar Filtros
                            </Button>
                        )}
                    </div>
                    
                    {/* Filtro de Estado de lectura */}
                    <div className="">
                        <RenderDinamicFilter
                            table={table}
                            columnKey="read_status"
                            placeholder="Estado de lectura"
                            selectedValues={selectedReadStatus}
                            setSelectedValues={handleReadStatusChange}
                            uniqueOptions={readStatusOptions}
                        />
                    </div>

                    {/* Filtro de tipo de notificación */}
                    <div className="">
                        <RenderDinamicFilter
                            table={table}
                            columnKey="notifiable_model"
                            placeholder="Tipo de notificación"
                            selectedValues={selectedTypes}
                            setSelectedValues={setSelectedTypes}
                            uniqueOptions={notificationTypes}
                        />
                    </div>

                    {/* Filtro de tipo de acción */}
                    <div className="">
                        <RenderDinamicFilter
                            table={table}
                            columnKey="action_model"
                            placeholder="Tipo de acción"
                            selectedValues={selectedActions}
                            setSelectedValues={setSelectedActions}
                            uniqueOptions={actionTypes}
                        />
                    </div>

                    {/* Filtro de remitente */}
                    <div className="">
                        <RenderDinamicFilter
                            table={table}
                            columnKey="sender_id"
                            placeholder="Filtrar por remitente"
                            selectedValues={selectedSenders}
                            setSelectedValues={(values) => {
                                setSelectedSenders(values);
                                const column = table.getColumn("sender_id");
                                if (column) {
                                    column.setFilterValue(values);
                                }
                            }}
                            uniqueOptions={senders}
                            searchable={true}
                        />
                    </div>

                    {/* Filtro de rango de fechas */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative">
                                <button 
                                    className="w-full flex items-center justify-between rounded-full bg-custom-white dark:bg-custom-blackSemi border-2 px-3 py-2 text-sm text-custom-gray-darker dark:text-custom-white hover:bg-custom-gray-default dark:hover:bg-custom-blackLight"
                                >
                                    {dateRange.from && dateRange.to
                                        ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                                        : "Rango de fechas"}
                                    <Icon name="ChevronDown" className="w-4 h-4 opacity-50" />
                                </button>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent 
                            className="w-auto p-4 bg-custom-white dark:bg-custom-blackLight border-none shadow-lg rounded-xl" 
                            align="start"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-custom-gray-darker dark:text-custom-white">
                                        Seleccionar rango de fechas
                                    </span>
                                    {dateRange.from && dateRange.to && (
                                        <button
                                            onClick={() => {
                                                setDateRange({ from: null, to: null });
                                                const column = table.getColumn("sent_at");
                                                if (column) column.setFilterValue(null);
                                            }}
                                            className="text-xs text-custom-orange hover:text-custom-orange/80"
                                        >
                                            Limpiar selección
                                        </button>
                                    )}
                                </div>
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range) => {
                                        setDateRange(range || { from: null, to: null });
                                        const column = table.getColumn("sent_at");
                                        if (column) {
                                            column.setFilterValue(range?.from && range?.to ? range : null);
                                        }
                                    }}
                                    numberOfMonths={2}
                                    locale={es}
                                    className="rounded-lg border-none"
                                    initialFocus
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                </DropdownMenuContent>
            </DropdownMenu>
    ), [
        filterColumnSearchOpen,
        activeFilters,
        resetFilterValues,
        selectedReadStatus,
        readStatusOptions,
        handleReadStatusChange,
        selectedTypes,
        notificationTypes,
        selectedActions,
        actionTypes,
        selectedSenders,
        senders,
        dateRange
    ]);

    // Efecto para manejar el filtrado
    useEffect(() => {
        const column = table.getColumn("read_status");
        if (column) {
            column.setFilterValue(selectedReadStatus);
        }
    }, [selectedReadStatus, table]);

    // Añadir efecto para cargar los tipos
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await axios.get('/api/v1/admin/notifications/types');
                setNotificationTypes(response.data.types);
            } catch (error) {
                console.error('Error fetching notification types:', error);
            }
        };

        fetchTypes();
    }, []);

    // Añadir el efecto para cargar los tipos de acción
    useEffect(() => {
        const fetchActionTypes = async () => {
            try {
                const response = await axios.get('/api/v1/admin/notifications/actions');
                setActionTypes(response.data.actions);
            } catch (error) {
                console.error('Error fetching action types:', error);
            }
        };

        fetchActionTypes();
    }, []);

    // Añadir el efecto para cargar los remitentes
    useEffect(() => {
        const fetchSenders = async () => {
            try {
                const response = await axios.get('/api/v1/admin/notifications/senders');
                setSenders(response.data.senders);
            } catch (error) {
                console.error('Error fetching senders:', error);
            }
        };

        fetchSenders();
    }, []);

    // Añadir efecto para manejar el filtrado de acciones
    useEffect(() => {
        const column = table.getColumn("action_model");
        if (column) {
            column.setFilterValue(selectedActions);
        }
    }, [selectedActions, table]);

    // Añadir efecto para manejar el filtrado de remitentes
    useEffect(() => {
        const column = table.getColumn("sender_id");
        if (column) {
            column.setFilterValue(selectedSenders);
        }
    }, [selectedSenders, table]);

    // Añadir efecto para el filtrado por fechas
    useEffect(() => {
        const column = table.getColumn("sent_at");
        if (column) {
            column.setFilterValue(dateRange.from && dateRange.to ? dateRange : null);
        }
    }, [dateRange, table]);

    // Obtener las filas seleccionadas
    const selectedRows = table.getSelectedRowModel().rows;
    const hasSelectedRows = selectedRows.length > 0;

    /**
     * Marca como leídas todas las notificaciones seleccionadas
     */
    const handleMarkSelectedAsRead = async () => {
        if (!hasSelectedRows) return;

        try {
            // Obtenemos los IDs de las filas seleccionadas para procesarlas
            const selectedRowIds = selectedRows.map(row => row.original.id);
            const unreadNotifications = selectedRows.filter(row => !row.original.is_read);
            const unreadCount = unreadNotifications.length;
            
            if (unreadCount === 0) {
                toast.info("Todas las notificaciones seleccionadas ya están marcadas como leídas");
                table.resetRowSelection();
                return;
            }

            // Usamos Promise.all para manejar múltiples solicitudes en paralelo
            await Promise.all(
                unreadNotifications.map(async (row) => {
                    // Usamos markAsRead del hook para mantener el estado actualizado
                    await markAsRead(row.original.id);
                })
            );

            // Mostramos notificación de éxito con el número correcto
            toast.success(`${unreadCount} notificaciones marcadas como leídas`);
            
            // Limpiamos selección después de actualizar la UI
            table.resetRowSelection();
            
            // Actualizamos la lista de notificaciones desde el servidor
            await refreshNotifications();
            
            // Refrescamos el estado de la tabla con los nuevos datos
            table.resetRowSelection();
            table.resetGlobalFilter();
        } catch (error) {
            toast.error('Error al marcar las notificaciones como leídas');
            console.error(error);
        }
    };

    /**
     * Marca como no leídas todas las notificaciones seleccionadas
     */
    const handleMarkSelectedAsUnread = async () => {
        if (!hasSelectedRows) return;

        try {
            // Contamos cuántas notificaciones ya leídas hay
            const readNotifications = selectedRows.filter(row => row.original.is_read);
            const readCount = readNotifications.length;
            
            if (readCount === 0) {
                toast.info("Todas las notificaciones seleccionadas ya están marcadas como no leídas");
                table.resetRowSelection();
                return;
            }

            await Promise.all(
                readNotifications.map(async (row) => {
                    // Usamos markAsUnread del hook para mantener el estado actualizado
                    await markAsUnread(row.original.id);
                })
            );

            // Mostramos notificación de éxito con el número correcto
            toast.success(`${readCount} notificaciones marcadas como no leídas`);
            
            // Limpiamos selección después de actualizar la UI
            table.resetRowSelection();
            
            // Actualizamos la lista de notificaciones desde el servidor
            await refreshNotifications();
            
            // Refrescamos el estado de la tabla con los nuevos datos
            table.resetRowSelection();
            table.resetGlobalFilter();
        } catch (error) {
            toast.error('Error al marcar las notificaciones como no leídas');
            console.error(error);
        }
    };

    /**
     * Renderiza los botones para marcar notificaciones como leídas/no leídas directamente en la barra
     * @returns {JSX.Element} Botones de acciones
     */
    const renderDirectActionButtons = () => {
        if (!hasSelectedRows) return null;

        // Calculamos cuántas notificaciones leídas/no leídas hay en la selección
        const readCount = selectedRows.filter(row => row.original.is_read).length;
        const unreadCount = selectedRows.length - readCount;

        return (
            <div className="flex items-center gap-2">
                <Button
                    onClick={handleMarkSelectedAsRead}
                    className="bg-custom-white dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-accent border-custom-orange border text-custom-orange rounded-full flex items-center gap-1"
                    size="sm"
                    disabled={unreadCount === 0}
                    title={unreadCount > 0 ? `Marcar ${unreadCount} como leídas` : "Todas las seleccionadas ya están leídas"}
                >
                    <Icon name="MailOpen" className="w-4 h-4" />
                    <span>Leídas {unreadCount > 0 ? `(${unreadCount})` : ""}</span>
                </Button>
                <Button
                    onClick={handleMarkSelectedAsUnread}
                    className="bg-custom-white dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-accent border-custom-orange border text-custom-orange rounded-full flex items-center gap-1"
                    size="sm"
                    disabled={readCount === 0}
                    title={readCount > 0 ? `Marcar ${readCount} como no leídas` : "Todas las seleccionadas ya están no leídas"}
                >
                    <Icon name="Mail" className="w-4 h-4" />
                    <span>No leídas {readCount > 0 ? `(${readCount})` : ""}</span>
                </Button>
                <Button
                    onClick={() => table.resetRowSelection()}
                    className="bg-transparent hover:bg-custom-gray-light dark:hover:bg-accent text-custom-gray-darker dark:text-custom-gray-light rounded-full"
                    size="sm"
                    variant="ghost"
                    title="Cancelar selección"
                >
                    <Icon name="X" className="w-4 h-4" />
                </Button>
            </div>
        );
    };

    /**
     * Renderiza el título de la tabla de notificaciones
     * 
     * @returns {JSX.Element}
     */
    const renderTitle = useCallback(() => (
        <span className="absolute top-24 bg-custom-white dark:bg-custom-blackLight text-custom-blue dark:text-custom-white font-bold border-none text-lg px-2 capitalize">
            Notificaciones
        </span>
    ), []);

    return (
        <div className="grid">
            {renderTitle()}
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center m-2 gap-4">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                    {hasSelectedRows ? (
                        <>
                            <span className="text-custom-gray-darker dark:text-custom-white text-sm">
                                {selectedRows.length} seleccionadas
                            </span>
                            {renderDirectActionButtons()}
                        </>
                    ) : renderFilterMenu}
                    {!hasSelectedRows && unreadCount > 0 && (
                        <button 
                            onClick={onMarkAllAsRead}
                            className="text-xs text-custom-orange hover:text-custom-gray-darker dark:hover:text-custom-gray-light"
                        >
                            {t('notifications.actions.markAllAsRead', 'Marcar todas como leídas')}
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                    {renderSearchInput()}
                    {renderDropdownMenu()}
                    {renderPerPageDropdown()}
                </div>
            </div>
        </div>
    );
}

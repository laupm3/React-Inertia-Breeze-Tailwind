import {
    useContext,
    createContext,
    useState,
    useMemo,
    useEffect,
} from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getFacetedRowModel,
} from '@tanstack/react-table';
import { getFilterColumns } from "../Utils/getFilterColumns";
import { getHiddenColumns } from "../Utils/getHiddenColumns";

/**
 * Contexto para manejar el estado global del datatable
 * @type {React.Context}
 */
const DataTableContext = createContext();

/**
 * Proveedor de contexto para la sección del datatable
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @param {Array} props.columnsDef - Definición de columnas para la tabla
 * @param {Array} props.data - Datos a mostrar en la tabla
 * @returns {JSX.Element} Proveedor del contexto con sus valores
 */
export const DataTableContextProvider = ({
    children,
    columnsDef,
    data: records = [],
    initialState = {},
    config = {},
    debug = false,
    viewContext = null, // Contexto de vista opcional,
    customToolbar = null, // Componente Toolbar personalizado opcional
    entity = 'empleados', // Entidad para exportación
    onDataRefresh = null, // Función para refrescar datos después de importaciones
}) => {

    const data = useMemo(() => records, [records]);

    const totalRows = useMemo(() => data.length, [data]);

    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: totalRows   //default page size
    });
    const pageSizeOptions = [10, 20, 30, 40, 50, 100, 250, 500, 1000];

    const filterColumns = useMemo(() => getFilterColumns(columnsDef), [columnsDef]);
    const columnsHidden = useMemo(() => getHiddenColumns(columnsDef), [columnsDef]);

    const [columnVisibility, setColumnVisibility] = useState({
        ...filterColumns,
        ...columnsHidden, // Mantener las columnas ocultas
        ...initialState.columnVisibility, // Mantener la visibilidad de las columnas iniciales
    });

    // Llamar al hook useReactTable directamente
    const table = useReactTable({
        data,
        columns: columnsDef,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        enableFilters: true,
        enableColumnFilters: true,
        state: {
            pagination,
            ...initialState,
            columnVisibility
        },
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        ...config,
    });

    return (
        <DataTableContext.Provider value={{
            data,
            columns: columnsDef,
            table,
            pageSizeOptions,
            debug,
            filterColumns,
            totalRows,
            setGlobalFilter: table.setGlobalFilter,
            viewContext,
            customToolbar,
            entity,
            onDataRefresh,
        }}>
            {children}
        </DataTableContext.Provider>
    );
};

/**
 * Hook personalizado para acceder al contexto de la tabla
 * 
 * @throws {Error} Si se usa fuera del DataTableContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
export function useDataTable() {
    const context = useContext(DataTableContext);
    if (!context) {
        throw new Error('useDataTable debe usarse dentro de DataTableContextProvider');
    }
    return context;
} 
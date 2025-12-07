import DataTableSkeleton from '@/Components/App/Skeletons/DataTableSkeleton';
import { useColumns } from '../Hooks/useColumns';
import { DataTable } from '@/Components/App/DataTable/Partials/DataTable';
import { DataTableContextProvider } from '@/Components/App/DataTable/Context/DataTableContext';
import { useDataHandler } from '../Context/DataHandlerContext';
import BlockCard from '@/Components/OwnUi/BlockCard';
import { useMemo } from 'react';

/**
 * Portal unificado del DataTable que usa el contexto unificado
 */
export default function DataTablePortal({ }) {

    const {
        data,
        loading,
        handleCreateView,
        handleUpdateView,
        handleSheetView,
        handleDeleteView,
        handleDropdownAction
    } = useDataHandler();

    const columns = useColumns();

    // Debug: verificar los datos que llegan


    // Crear un contexto de vista compatible con el DataTable existente
    const viewContext = useMemo(() => ({
        handleCreateUpdateView: (model) => model ? handleUpdateView(model) : handleCreateView(),
        handleSheetView: (model) => handleSheetView(model),
        handleDestroyView: (model) => handleDeleteView(model),
        handleDropdownMenu: handleDropdownAction
    }), [handleCreateView, handleUpdateView, handleSheetView, handleDeleteView, handleDropdownAction]);

    // Solo crear un nuevo key cuando la longitud de datos cambie (no el contenido completo)
    const dataId = useMemo(() =>
        `data-${data?.length || 0}`,
        [data?.length]
    );

    if (loading) {
        return <DataTableSkeleton rows={10} columns={6} />
    }

    return (

        <DataTableContextProvider
            key={dataId}
            data={data}
            columnsDef={columns}
            debug={false}
            config={
                {
                    getRowId: (row) => row.id,
                }
            }
            initialState={{
            }}
            viewContext={viewContext}
        >
            <BlockCard title={'Gestión de Vacaciones'}>
                <DataTable />
            </BlockCard>
        </DataTableContextProvider >
    )
}
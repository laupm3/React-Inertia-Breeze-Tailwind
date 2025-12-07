import DataTableSkeleton from '@/Components/App/Skeletons/DataTableSkeleton';
import { useColumns } from '../Hooks/useColumns';
import { DataTable } from '@/Components/App/DataTable/Partials/DataTable';
import { DataTableContextProvider } from '@/Components/App/DataTable/Context/DataTableContext';
import { useDataHandler } from '../Context/DataHandlerContext';
import BlockCard from '@/Components/OwnUi/BlockCard';
import { useView } from '../Context/ViewContext';
import { useMemo } from 'react';

export default function DataTablePortal({ }) {

    const {
        data,
        loading,
        updateData,
        fetchData,
        deleteItem
    } = useDataHandler();

    const viewContext = useView();

    const columns = useColumns(updateData, deleteItem);

    // Añadir un identificador único que cambie cuando los datos cambien
    const dataId = useMemo(() =>
        `data-${data?.length || 0}-${Date.now()}`,
        [data]
    );

    if (loading) {
        return <DataTableSkeleton rows={10} columns={6} />
    }

    return (

        <DataTableContextProvider
            data={data.filter(row => row && row.id)}
            columnsDef={columns}
            debug={false}
            entity="contratos"
            onDataRefresh={fetchData}
            config={{
                getRowId: (row) => row?.id ?? '',
            }}
            initialState={{}}
            viewContext={viewContext}
        >
            <BlockCard title={'Contratos'}>
                <DataTable />
            </BlockCard>
        </DataTableContextProvider >
    )
}

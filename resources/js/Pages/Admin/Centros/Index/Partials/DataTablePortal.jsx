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
        fetchData
    } = useDataHandler();

    const viewContext = useView();

    const columns = useColumns();

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
            key={dataId}
            data={data}
            columnsDef={columns}
            debug={false}
            entity="centros"
            onDataRefresh={fetchData}
            config={
                {
                    getRowId: (row) => row.id,
                }
            }
            initialState={{
            }}
            viewContext={viewContext}
        >
            <BlockCard title={'Centros Administración'} className="w-full h-full">
                <DataTable />
            </BlockCard>
        </DataTableContextProvider >
    )
}
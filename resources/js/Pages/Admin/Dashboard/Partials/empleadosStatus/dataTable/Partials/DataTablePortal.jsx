import DataTableSkeleton from '@/Components/App/Skeletons/DataTableSkeleton';
import { useColumns } from '../Hooks/useColumns';
import { DataTable } from '@/Components/App/DataTable/Partials/DataTable';
import { DataTableContextProvider } from '@/Components/App/DataTable/Context/DataTableContext';
import { useDataHandler } from '../Context/DataHandlerContext';
import BlockCard from '@/Components/OwnUi/BlockCard';
import { useView } from '../Context/ViewContext';
import { useMemo } from 'react';

export default function DataTablePortal({ content, filter }) {

    const {
        data,
        loading
    } = useDataHandler();

    const viewContext = useView();

    const columns = useColumns({ content, filter });

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
            config={
                {
                    getRowId: (row) => row.id,
                }
            }
            initialState={{
            }}
            viewContext={viewContext}
        >
            <DataTable hideHeader simplified />
        </DataTableContextProvider >
    )
}
import { useEffect, useMemo, useState } from 'react';
import DataTableSkeleton from '@/Components/App/Skeletons/DataTableSkeleton';
import { useColumns } from '../Hooks/useColumns';
import { DataTable } from '@/Components/App/DataTable/Partials/DataTable';
import { DataTableContextProvider } from '@/Components/App/DataTable/Context/DataTableContext';
import { useDataHandler } from '../Context/DataHandlerContext';
import BlockCard from '@/Components/OwnUi/BlockCard';
import { useView } from '../Context/ViewContext';
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";

export default function DataTablePortal({ }) {
    const { data, loading } = useDataHandler();
    const viewContext = useView();
    const columns = useColumns();

    const [filteredData, setFilteredData] = useState(data);
    const [centroId, setCentroId] = useState(null);

    useEffect(() => {
        if (!centroId) {
            setFilteredData(data);
        } else {
            const centroIdNum = Number(centroId);
            const nueva = data.filter(turno => Number(turno.centro?.id) === centroIdNum);
            setFilteredData(nueva);
        }
    }, [data, centroId]);

    const handleCentroChange = (value) => {
        setCentroId(value);
    };

    const dataId = useMemo(() => `data-${data?.length || 0}`, [data?.length]);

    if (loading) {
        return <DataTableSkeleton rows={10} columns={6} />
    }

    return (
        <DataTableContextProvider
            key={dataId}
            data={filteredData.length > 0 ? filteredData : data}
            columnsDef={columns}
            debug={false}
            config={{ getRowId: (row) => row.id }}
            viewContext={viewContext}
        >
            <BlockCard title={'Turnos'}>
                <DataTable filteredData={filteredData}>
                    {/* redireccion */}
                    <Button
                        variant="secondary"
                        onClick={() => window.location.href = route('admin.jornadas.index')}
                        className='mr-4'
                    >
                        Jornadas
                        <Icon name="ArrowUpRight" className="w-4 ml-1" />

                    </Button>
                    {/* selector de centro */}
                    <FetchSelect
                        fetchRoute='api.v1.admin.centros.index'
                        responseParameter='centros'
                        value={centroId}
                        onValueChange={handleCentroChange}
                        disabled={false}
                        className='w-[250px]'
                        placeholder='Selecciona centro...'
                    />
                </DataTable>
            </BlockCard>
        </DataTableContextProvider>
    );
}

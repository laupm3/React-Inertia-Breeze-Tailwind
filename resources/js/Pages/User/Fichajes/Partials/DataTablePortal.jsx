import DataTableSkeleton from '@/Components/App/Skeletons/DataTableSkeleton';
import { useColumns } from '../Hooks/useColumns';
import { DataTable } from '@/Components/App/DataTable/Partials/DataTable';
import { DataTableContextProvider } from '@/Components/App/DataTable/Context/DataTableContext';
import { useDataHandler } from '../Context/DataHandlerContext';
import BlockCard from '@/Components/OwnUi/BlockCard';
import { useMemo, useState } from 'react';
import Toolbar from './Toolbar';
import JustificanteUploadDialog from '../Components/JustificanteUploadDialog';


export default function DataTablePortal({ }) {

    const {
        data,
        loading,
        setData,
        hasActiveBreaks
    } = useDataHandler();

    // Estado para el dialog de justificantes
    const [justificanteDialog, setJustificanteDialog] = useState({
        isOpen: false,
        fichajeData: null
    });

    // Función para abrir el dialog
    const handleOpenJustificanteDialog = (fichajeData) => {
        setJustificanteDialog({
            isOpen: true,
            fichajeData: fichajeData
        });
    };

    // Función para cerrar el dialog
    const handleCloseJustificanteDialog = () => {
        setJustificanteDialog({
            isOpen: false,
            fichajeData: null
        });
    };

    // Función para manejar el upload
    const handleUploadJustificante = async (fichajeId, files, motivo) => {
        console.log('Uploading justificante for fichaje:', fichajeId);
        console.log('Files:', files);
        console.log('Motivo:', motivo);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Actualizar los datos localmente para simular que se subió el archivo/motivo
        const updatedData = data.map(fichaje => {
            if (fichaje.id === fichajeId) {
                // Preparar datos del justificante
                let justificanteData = {
                    id: Date.now(),
                    uploaded_at: new Date().toISOString()
                };

                // Si hay archivos, usar el primer archivo
                if (files && files.length > 0) {
                    justificanteData.file_name = files[0].name;
                    justificanteData.type = 'file';
                }

                // Si hay motivo, incluirlo
                if (motivo && motivo.trim() !== '') {
                    justificanteData.motivo = motivo.trim();
                    justificanteData.type = files && files.length > 0 ? 'file_and_text' : 'text_only';
                }

                return {
                    ...fichaje,
                    justificante: justificanteData
                };
            }
            return fichaje;
        });
        
        // Actualizar el estado con los nuevos datos
        setData(updatedData);
        
        console.log('Upload completed successfully');
    };

    const columns = useColumns(handleOpenJustificanteDialog);

    // Añadir un identificador único que cambie cuando los datos cambien
    const dataId = useMemo(() => {
        const hasActive = hasActiveBreaks();
        return `data-${data?.length || 0}-${hasActive ? 'active' : 'inactive'}-${Date.now()}`;
    }, [data, hasActiveBreaks]);

    if (loading) {
        return <DataTableSkeleton rows={10} columns={6} />
    }

    return (
        <>
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
                customToolbar={Toolbar} 
            >
                <BlockCard title={'Fichajes'}>
                    <DataTable />
                </BlockCard>
            </DataTableContextProvider >

            {/* Dialog de upload de justificantes */}
            <JustificanteUploadDialog
                isOpen={justificanteDialog.isOpen}
                onClose={handleCloseJustificanteDialog}
                fichajeData={justificanteDialog.fichajeData}
                onUpload={handleUploadJustificante}
            />
        </>
    )
}
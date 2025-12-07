import { useDataHandler } from "../Context/DataHandlerContext";
import CreateUpdateViewComponent from '@/Components/App/SolicitudPermiso/CreateUpdateDialog/CreateUpdateDialog';

/**
 * Vista unificada para crear/actualizar que usa el contexto unificado
 * 
 * @returns {JSX.Element}
 */
export default function CreateUpdateView() {
    const { viewStates, closeAllViews } = useDataHandler();

    const { open, model } = viewStates.createUpdate;

    return (
        <CreateUpdateViewComponent
            model={model}
            open={open}
            onOpenChange={() => {
                closeAllViews();
            }}
        />
    );
}
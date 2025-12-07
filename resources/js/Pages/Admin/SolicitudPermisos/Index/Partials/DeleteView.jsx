import { useDataHandler } from "../Context/DataHandlerContext";
import DeleteViewComponent from '@/Components/App/SolicitudPermiso/DeleteDialog/DeleteDialog';

/**
 * Vista unificada para eliminar que usa el contexto unificado
 * 
 * @returns {JSX.Element}
 */
export default function DeleteView() {

    const { viewStates, handleDeleteView, handleDelete, closeAllViews } = useDataHandler();

    const { open, model } = viewStates.delete;

    if (!model) {
        return null;
    }

    const handleDeleteAction = async (id) => {
        await handleDelete(model);
    };

    const handleCloseModal = () => {
        closeAllViews();
    };

    return (
        <DeleteViewComponent
            model={model}
            open={open}
            onOpenChange={handleCloseModal}
            onDelete={handleDeleteAction}
        />
    );
}
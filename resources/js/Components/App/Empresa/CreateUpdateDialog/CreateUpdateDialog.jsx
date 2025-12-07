import { Dialog } from "@/Components/ui/dialog";
import DialogPortal from "./Components/DialogPortal";
import { DialogDataContextProvider } from "./Context/DialogDataContext";
import { memo } from "react";

/**
 * Componente de diálogo para crear o actualizar registros.
 * 
 * Este componente muestra un diálogo modal que contiene un formulario
 * para crear un nuevo registro o actualizar uno existente. Utiliza un sistema
 * de contexto para gestionar el estado del formulario y las operaciones de API.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Estado de visibilidad del diálogo
 * @param {Function} props.onOpenChange - Función para cambiar el estado de visibilidad
 * @param {Object|null} [props.model=null] - Modelo de centro existente para modo de edición
 * @param {Function|null} [props.onSaveData=null] - Callback que se ejecuta después de guardar exitosamente
 * @returns {JSX.Element} Componente de diálogo para gestionar centros
 */
const CreateUpdateDialog = memo(function CreateUpdateDialog({
    open,
    onOpenChange,
    model = null,
    onSaveData = null
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogDataContextProvider
                model={model}
                onSaveData={onSaveData}
                onOpenChange={onOpenChange}
                modelAlias="empresa"
                dataKey="empresa"
            >
                <DialogPortal />
            </DialogDataContextProvider>
        </Dialog>
    );
});

export default CreateUpdateDialog;
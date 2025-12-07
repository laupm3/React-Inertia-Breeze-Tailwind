import { Dialog } from "@/Components/ui/dialog";
import DialogPortal from "./Components/DialogPortal";
import { memo } from "react";

/**
 * Componente de diálogo unificado para crear o actualizar solicitudes de permisos.
 * 
 * Ahora usa directamente el contexto unificado sin necesidad del DialogDataContextProvider
 * ya que toda la lógica está centralizada en DataHandlerContext
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Estado de visibilidad del diálogo
 * @param {Function} props.onOpenChange - Función para cambiar el estado de visibilidad
 * @param {Object|null} [props.model=null] - Modelo de solicitud existente para modo de edición
 * @param {Function|null} [props.onSaveData=null] - Callback que se ejecuta después de guardar exitosamente (ya no necesario)
 * @returns {JSX.Element} Componente de diálogo para gestionar solicitudes de permisos
 */
const CreateUpdateDialog = memo(function CreateUpdateDialog({
    open,
    onOpenChange,
    model = null,
    onSaveData = null // Mantener por compatibilidad pero ya no es necesario
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogPortal 
                model={model}
                onOpenChange={onOpenChange}
            />
        </Dialog>
    );
});

export default CreateUpdateDialog;

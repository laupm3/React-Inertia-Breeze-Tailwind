import { Dialog } from "@/Components/ui/dialog";
import DialogPortal from "./Components/DialogPortal";
import { DataHandlerContextProvider } from "./Context/DataHandlerContext";

/**
 * Componente que muestra un diálogo con la información de contratos vigentes de un empleado.
 * 
 * Utiliza un Dialog para mostrar una vista detallada de los contratos vigentes
 * del empleado, incluyendo información sobre jornadas, asignaciones y fechas.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Estado de visibilidad del diálogo
 * @param {Function} props.onOpenChange - Función para cambiar el estado de visibilidad
 * @param {number|string} props.model - ID del empleado a consultar
 * @returns {JSX.Element} Diálogo con información de contratos
 */
export default function ContratosVigentesDialog({ open, onOpenChange, model }) {

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DataHandlerContextProvider
                model={model}
                onOpenChange={onOpenChange}
            >
                <DialogPortal />
            </DataHandlerContextProvider>
        </Dialog>
    );
}
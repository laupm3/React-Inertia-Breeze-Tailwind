import Icon from "@/imports/LucideIcon";
import DecisionModal from "../../Modals/DecisionModal";
import { toast } from "sonner";

/**
 * DeleteDialog component - Allow to delete a solicitud de permiso
 * 
 * @param {Object} props The props of the component
 * @param {Object} props.open The state of the dialog
 * @param {Function} props.onOpenChange The function to change the state of the dialog
 * @param {Function} props.model The model to be deleted
 * @param {Function} props.onDelete The function to execute after the entity is deleted
 * 
 * @returns {JSX.Element} 
 */
export default function DeleteDialog({ open, onOpenChange, model, onDelete }) {

    const handleDelete = async () => {
        try {
            if (onDelete) {
                await onDelete(model.id || model);
            }
        } catch (error) {
            console.error('Error al eliminar solicitud:', error);
            toast.error('Error al eliminar la solicitud de permiso');
        }
    }

    return (
        <DecisionModal
            title='¿Estás seguro de que quieres eliminar esta solicitud de permiso?'
            content='Esta acción no se puede deshacer. La solicitud de permiso se eliminará definitivamente.'
            open={open}
            onOpenChange={onOpenChange}
            action={handleDelete}
            variant="destructive"
            icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
        />
    )
}

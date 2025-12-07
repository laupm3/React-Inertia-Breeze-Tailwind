import Icon from "@/imports/LucideIcon";
import DecisionModal from "../../Modals/DecisionModal";
import axios from 'axios';
import useApiEndpoints from "../Hooks/useApiEndpoints";
import { toast } from "sonner";

/**
 * DeleteDialog component - Allow to delete an entity
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
    const endpoints = useApiEndpoints(model);
    console.log('endpoints :>> ', endpoints);

    const handleDelete = async () => {
        console.log('handleDelete :>> ', endpoints.delete);
        try {
            const response = await axios.delete(endpoints.delete);

            if (response.status === 200) {
                if (onDelete) {
                    onDelete(model);
                }

                toast.success('Registro eliminado correctamente');
            }
        } catch (error) {
            console.error('error :>> ', error);
            toast.error('Error al eliminar el registro');
        }
    }

    return (
        <DecisionModal
            title='¿Estás seguro de que quieres eliminar este usuario?'
            content='Esta acción no se puede deshacer. Todos los datos relacionados con este usuario se eliminarán.'
            open={open}
            onOpenChange={onOpenChange}
            action={handleDelete}
            variant="destructive"
            icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
        />
    )
}


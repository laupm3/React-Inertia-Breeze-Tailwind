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

    const handleDelete = async () => {
        try {
            const response = await axios.delete(endpoints.delete);

            // Aceptar tanto 200 OK como 204 No Content como éxito
            if (response.status === 200 || response.status === 204) {
                if (onDelete) {
                    onDelete(model.id);
                }

                toast.success('Registro eliminado correctamente');
            } else {
                // Opcional: manejar otros códigos de estado si es necesario
                toast.error('Ocurrió un problema al eliminar el registro');
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


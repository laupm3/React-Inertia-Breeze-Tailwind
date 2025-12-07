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
            const response = await axios.delete(endpoints.delete, {
                data: { horarios: model }
            });

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
            title={
                model?.length > 1
                    ? `¿Estás seguro de que quieres eliminar ${model?.length} horarios?`
                    : `¿Estás seguro de que quieres eliminar este horario?`
            }
            content={`Esta acción no se puede deshacer. Todos los datos relacionados con ${model?.length > 1 ? 'estos ' + model?.length + ' horarios' : 'el horario'} se eliminarán.`}
            open={open}
            onOpenChange={onOpenChange}
            action={handleDelete}
            variant="destructive"
            icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
        />
    )
}


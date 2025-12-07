import DeleteDialog from "@/Components/App/Empleado/DeleteDialog/DeleteDialog";
import { useView } from "../Context/ViewContext";
import { useDataHandler } from "../Context/DataHandlerContext";

/**
 * Dialog component - Allow to delete an entity
 * 
 * @returns {JSX.Element}
 */
export default function DeleteView() {

    const { destroyView, handleDestroyView } = useView();

    const { open, model } = destroyView;

    const { deleteItem } = useDataHandler();

    if (!model) {
        return null;
    }

    return (
        <DeleteDialog
            model={model}
            open={open}
            onOpenChange={() => handleDestroyView(model)}
            onDelete={deleteItem}
        />
    );
}
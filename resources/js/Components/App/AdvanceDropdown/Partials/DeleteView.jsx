import { useDataHandler } from "../Context/DataHandlerContext";
import { useView } from "../Context/ViewContext";

/**
 * Dialog component - Allow to delete an entity
 * 
 * @returns {JSX.Element}
 */
export default function DeleteView() {
    const { 
        destroyView, 
        handleDestroyView,
        enableDestroyView,
        DeleteViewComponent
    } = useView();
    const { deleteItem } = useDataHandler();

    const { open, model } = destroyView;

    if (!model) {
        return null;
    }

    if (!enableDestroyView) {
        return null;
    }

    return (
        <DeleteViewComponent
            model={model}
            open={open}
            onOpenChange={() => handleDestroyView(model)}
            onDelete={deleteItem}
        />
    );
}
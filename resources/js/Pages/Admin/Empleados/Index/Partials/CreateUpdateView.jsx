import { useDataHandler } from "../Context/DataHandlerContext";
import { useView } from "../Context/ViewContext";
import CreateUpdateDialog from "@/Components/App/Empleado/CreateUpdateDialog/CreateUpdateDialog";

/**
 * Dialog component - Allow to create a new entity or update an existing one
 * 
 * @param {Object} props The props of the component
 * @param {Object} props.entityId The id of the selected entity
 * @param {Object} props.open The state of the dialog
 * @param {Function} props.onOpenChange The function to change the state of the dialog
 * 
 * @returns {JSX.Element}
 */
export default function CreateUpdateView() {

    const { createUpdateView, handleCreateUpdateView } = useView();
    const { updateData } = useDataHandler();

    const { open, model } = createUpdateView;

    return (
        <CreateUpdateDialog
            model={model}
            open={open}
            onOpenChange={() => handleCreateUpdateView(model)}
            onSaveData={updateData}
        />
    );
}